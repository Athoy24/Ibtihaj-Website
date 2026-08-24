import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { calculateServerTotals } from '@/lib/catalog';
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

        const body = await req.json();
        const { customer, items, honeypot } = body;

        // Bot Control (Honeypot)
        if (honeypot || (customer && customer[HONEYPOT_FIELD])) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
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

            // Telegram as Primary (Non-blocking)
            try {
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
                    console.error('Telegram integration failed:', telegramRes.statusText);
                }
            } catch (err) {
                console.error('Telegram integration error:', err);
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

            const response = NextResponse.json({ success: true, orderId });
            response.headers.set('Cache-Control', 'no-store');
            return response;

        } catch (error) {
            console.error('Order processing error:', error);
            return NextResponse.json({ error: 'Order processing failed. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
        }

    } catch (error) {
        console.error('API generic error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}
