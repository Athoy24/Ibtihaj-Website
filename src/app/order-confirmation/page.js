import React from 'react';
import Link from 'next/link';
import { CheckCircle2, PhoneCall, Package, Truck, ArrowLeft, ClipboardList } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import './order-confirmation.css';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Order Confirmation - Ibtihaj',
};

export default async function OrderConfirmation() {
    const cookieStore = await cookies();
    const token = cookieStore.get('order_confirmation_context');
    
    if (!token) {
        redirect('/checkout');
    }

    let payload;
    try {
        const decoded = Buffer.from(token.value, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        payload = parsed.payload;
        const signature = parsed.signature;

        const secret = process.env.ORDER_SECRET || 'fallback_secret_do_not_use_in_prod';
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(payload));
        const expectedSignature = hmac.digest('hex');

        // Constant time signature comparison
        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
            throw new Error('Invalid signature');
        }

        if (payload.purpose !== 'order-confirmation') {
            throw new Error('Invalid purpose');
        }
        if (Date.now() > payload.expiresAt) {
            throw new Error('Cookie expired');
        }
    } catch (err) {
        console.error('Invalid confirmation cookie:', err);
        redirect('/checkout');
    }

    return (
        <div className="confirmation-page-wrapper">
            <div className="confirmation-card">
                <div className="success-icon-container">
                    <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                
                <h1>Welcome to the Ibtihaj Family! 🍃</h1>
                
                <p className="confirmation-subtitle">
                    <strong>Thank you for your order!</strong> Our sales team will be in contact with you soon to finalize your delivery.
                </p>

                <div className="order-summary-box mb-6 p-4 bg-gray-50 rounded-lg text-left">
                    <h3 className="font-semibold text-lg border-b pb-2 mb-3">Order Details</h3>
                    <p><strong>Order ID:</strong> {payload.orderId}</p>
                    <p><strong>Items Ordered:</strong> {payload.summary.itemCount}</p>
                    <p><strong>Grand Total:</strong> ৳ {payload.summary.total}</p>
                </div>

                <div className="timeline-section">
                    <h2 className="timeline-title">
                        <ClipboardList size={20} />
                        What Happens Next
                    </h2>
                    
                    <div className="timeline-list">
                        <div className="timeline-item">
                            <div className="timeline-dot">
                                <PhoneCall size={18} />
                            </div>
                            <div className="timeline-content">
                                <h3 className="timeline-step-title">Step 1: Order Verification</h3>
                                <p className="timeline-step-desc">We will call or message you shortly to confirm your details.</p>
                            </div>
                        </div>

                        <div className="timeline-item">
                            <div className="timeline-dot">
                                <Package size={18} />
                            </div>
                            <div className="timeline-content">
                                <h3 className="timeline-step-title">Step 2: Fresh Packing</h3>
                                <p className="timeline-step-desc">Your Signature First Flush bundle is securely prepared and packed.</p>
                            </div>
                        </div>

                        <div className="timeline-item">
                            <div className="timeline-dot">
                                <Truck size={18} />
                            </div>
                            <div className="timeline-content">
                                <h3 className="timeline-step-title">Step 3: Express Delivery</h3>
                                <p className="timeline-step-desc">Dispatched straight to your doorstep via courier with Cash on Delivery.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="btn-container">
                    <Link href="/" className="btn-back-shop">
                        <ArrowLeft size={18} />
                        Back to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
}
