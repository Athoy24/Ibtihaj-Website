import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { calculateServerTotals } from '@/lib/catalog';
import { kvSetNX, kvSet, kvIncr, kvExpire } from '@/lib/kv';
import { headers } from 'next/headers';

// Optional: honeypot config
const HONEYPOT_FIELD = 'website';

export async function POST(req) {
    try {
        const reqHeaders = await headers();
        const origin = reqHeaders.get('origin');
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
        if (allowedOrigins.length > 0 && origin && !allowedOrigins.includes(origin)) {
            return NextResponse.json({ error: 'Origin not allowed' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
        }

        const clientIp = reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || reqHeaders.get('x-real-ip') || '127.0.0.1';
        const rlKey = `rate_limit:${clientIp}`;
        const currentRequests = await kvIncr(rlKey);
        if (currentRequests === 1) {
            await kvExpire(rlKey, 60); // 60 seconds TTL
        }
        if (currentRequests > 5) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
        }


        const body = await req.json();
        const { customer, items, idempotencyKey, honeypot } = body;

        // Bot Control (Honeypot)
        if (honeypot || (customer && customer[HONEYPOT_FIELD])) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        if (!idempotencyKey) {
            return NextResponse.json({ error: 'Missing idempotency key' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        if (!customer || !items) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        const totals = calculateServerTotals(items, customer.district);
        if (!totals.isValid) {
            return NextResponse.json({ error: totals.errorMsg }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        // Validate customer fields (length, format)
        if (!customer.fullName || customer.fullName.length < 2 || customer.fullName.length > 100) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }
        if (!customer.phone || !/^(?:\+8801|8801|01)\d{9}$/.test(customer.phone.trim())) {
            return NextResponse.json({ error: 'Invalid phone format for Bangladesh' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }
        const emailTrimmed = customer.email ? customer.email.trim() : '';
        if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrimmed)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }
        customer.email = emailTrimmed || undefined;
        if (!customer.address || customer.address.length < 5 || customer.address.length > 200) {
            return NextResponse.json({ error: 'Invalid address' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
        }

        // Normalize payload hash to prevent same-key/different-payload attacks
        const payloadString = JSON.stringify({
            fullName: customer.fullName.trim(),
            phone: customer.phone.trim(),
            items: totals.validItems.map(i => `${i.id}-${i.size}-${i.quantity}`),
            total: totals.grandTotal
        });
        const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');
        const redisKey = `order:idemp:${idempotencyKey}`;
        
        // Atomic create-if-absent (PENDING state)
        const isNew = await kvSetNX(redisKey, JSON.stringify({ state: 'PENDING', hash: payloadHash }), 600);
        if (!isNew) {
            // Key already exists, this is a retry or duplicate
            const existingRaw = await import('@/lib/kv').then(m => m.kvGet(redisKey));
            if (existingRaw) {
                const existing = JSON.parse(existingRaw);
                if (existing.hash !== payloadHash) {
                    return NextResponse.json({ error: 'Conflict: idempotency key reused with different payload' }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
                }
                if (existing.state === 'PENDING') {
                    return NextResponse.json({ error: 'Order is currently processing, please wait.' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
                }
                if (existing.state === 'FAILED') {
                    return NextResponse.json({ error: 'Previous attempt failed. Please use a new checkout session.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
                }
                if (existing.state === 'SUCCEEDED') {
                    // Return original safe result without repeating services, issue a fresh cookie
                    return issueConfirmationResponse(existing.orderId, totals.grandTotal, totals.validItems.length);
                }
            }
        }

        const orderId = `ORD-${crypto.randomUUID()}`;

        try {
            const itemsList = totals.validItems
                .map(item => `- ${item.name} (${item.size}) x ${item.quantity}: ৳${item.price * item.quantity}`)
                .join('\n');

            const message = `
📦 *New Order Received!*
🆔 Order ID: \`${orderId}\`
📅 Date: ${new Date().toLocaleDateString()}

👤 *Customer Details:*
Name: ${customer.fullName}
Phone: ${customer.phone}
Email: ${customer.email}
District: ${customer.district}
Address: ${customer.address}

🛒 *Order Items:*
${itemsList}

⚖️ *Total Weight:* ${totals.totalWeightKg.toFixed(2)} kg
🚚 *Delivery Fee:* ৳${totals.deliveryFee}
💰 *Grand Total:* ৳${totals.grandTotal}

📝 *Instructions:*
${customer.instructions || 'None'}
            `.trim();

            const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

            if (!botToken || !chatId) {
                throw new Error('Server configuration error');
            }

            // Telegram as Primary
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s bounded timeout
            
            const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!telegramRes.ok) {
                throw new Error('Primary system failed');
            }

            // Google Sheets as Secondary (do not await rejection to fail order)
            const sheetUrl = process.env.GOOGLE_SHEET_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
            if (sheetUrl) {
                const sheetData = {
                    orderId,
                    date: new Date().toLocaleDateString(),
                    customerName: customer.fullName,
                    phone: customer.phone,
                    email: customer.email,
                    district: customer.district,
                    address: customer.address,
                    itemsSummary: totals.validItems.map(item => `${item.name} (${item.size}) x ${item.quantity}`).join(', '),
                    weightKg: totals.totalWeightKg.toFixed(2),
                    subtotal: totals.subtotal,
                    deliveryFee: totals.deliveryFee,
                    total: totals.grandTotal
                };

                const sheetController = new AbortController();
                const sheetTimeoutId = setTimeout(() => sheetController.abort(), 5000);
                fetch(sheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sheetData),
                    signal: sheetController.signal
                }).catch(err => {
                    console.error('Google Sheets secondary integration failed:', err);
                    // Silent catch, partial failure recovery
                }).finally(() => clearTimeout(sheetTimeoutId));
            }

            // Update KV to SUCCEEDED
            await kvSet(redisKey, JSON.stringify({ state: 'SUCCEEDED', hash: payloadHash, orderId }), 86400);

            return issueConfirmationResponse(orderId, totals.grandTotal, totals.validItems.length);

        } catch (error) {
            console.error('Order processing error:', error);
            await kvSet(redisKey, JSON.stringify({ state: 'FAILED', hash: payloadHash }), 300);
            return NextResponse.json({ error: 'Order processing failed. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
        }

    } catch (error) {
        console.error('API generic error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}

function issueConfirmationResponse(orderId, grandTotal, itemCount) {
    const payloadObj = {
        orderId,
        summary: { total: grandTotal, itemCount },
        issuedAt: Date.now(),
        expiresAt: Date.now() + 300 * 1000, // 5 mins
        purpose: "order-confirmation",
        nonce: crypto.randomBytes(16).toString('hex')
    };

    const secret = process.env.ORDER_SECRET || 'fallback_secret_do_not_use_in_prod';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payloadObj));
    const signature = hmac.digest('hex');

    const cookieValue = Buffer.from(JSON.stringify({ payload: payloadObj, signature })).toString('base64');

    const response = NextResponse.json({ success: true, orderId });
    response.headers.set('Cache-Control', 'no-store');
    
    // Set strict confirmation cookie
    response.cookies.set({
        name: 'order_confirmation_context',
        value: cookieValue,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 300
    });

    return response;
}
