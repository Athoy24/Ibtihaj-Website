import React from 'react';
import Link from 'next/link';
import { CheckCircle2, PhoneCall, Package, Truck, ArrowLeft, ClipboardList } from 'lucide-react';
import './order-confirmation.css';

export const metadata = {
    title: 'Order Confirmation - Ibtihaj',
};

export default function OrderConfirmation() {
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
