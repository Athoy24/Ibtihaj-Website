import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

import './CheckoutForm.css';

const CheckoutForm = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        instructions: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal Code is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        // Generate Order ID
        const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        // Prepare Order Details
        const orderDetails = {
            orderId,
            date: new Date().toLocaleDateString(),
            customer: formData,
            items: cartItems,
            total: cartTotal,
            status: 'Pending'
        };

        // Format Message for Telegram/WhatsApp
        const itemsList = cartItems.map(item => `- ${item.name} (${item.size}) x ${item.quantity}: ৳${item.price * item.quantity}`).join('\n');

        const message = `
📦 *New Order Received!*
🆔 Order ID: \`${orderId}\`
📅 Date: ${orderDetails.date}

👤 *Customer Details:*
Name: ${formData.fullName}
Phone: ${formData.phone}
Email: ${formData.email}
Address: ${formData.address}, ${formData.city}, ${formData.postalCode}

🛒 *Order Items:*
${itemsList}

💰 *Total Amount:* ৳${cartTotal}

📝 *Instructions:*
${formData.instructions || 'None'}
        `.trim();

        try {
            // 1. Try sending to Telegram
            const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
            const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'Markdown'
                    }),
                });

                if (!response.ok) {
                    throw new Error('Telegram API failed');
                }
                console.log('Order sent to Telegram successfully');
            } else {
                console.warn('Telegram credentials missing, skipping auto-send.');
            }

            // 2. Send to Google Sheets (Excel)
            const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
            if (sheetUrl) {
                const sheetData = {
                    orderId,
                    date: orderDetails.date,
                    customer: formData,
                    itemsSummary: cartItems.map(item => `${item.name} (${item.size}) x ${item.quantity}`).join(', '),
                    total: cartTotal
                };

                await fetch(sheetUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Important for Google Apps Script
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sheetData)
                });
                console.log('Order sent to Google Sheets successfully');
            } else {
                console.warn('Google Sheet URL missing, skipping sheet save.');
            }

            // 2. Clear Cart and Redirect
            clearCart();
            // Pass the message to confirmation page in case we want to send via WhatsApp there
            navigate('/order-confirmation', { state: { order: orderDetails, message } });

        } catch (error) {
            console.error('Failed to process order:', error);
            alert('There was an issue placing your order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="empty-checkout text-center section-padding">
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Return to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container container section-padding">
            <h1 className="page-title">Complete Your Order</h1>

            <div className="checkout-grid">
                <div className="checkout-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-items">
                        {cartItems.map(item => (
                            <div key={item.cartId} className="summary-item">
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-meta">{item.size} x {item.quantity}</span>
                                </div>
                                <span className="item-total">৳ {item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-totals">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>৳ {cartTotal}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>৳ {cartTotal}</span>
                        </div>
                    </div>
                </div>

                <form className="checkout-form" onSubmit={handleSubmit}>
                    <h3>Shipping Details</h3>

                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={errors.fullName ? 'error' : ''}
                        />
                        {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-msg">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-msg">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Street Address *</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={errors.address ? 'error' : ''}
                        />
                        {errors.address && <span className="error-msg">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={errors.city ? 'error' : ''}
                            />
                            {errors.city && <span className="error-msg">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <label>Postal Code *</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className={errors.postalCode ? 'error' : ''}
                            />
                            {errors.postalCode && <span className="error-msg">{errors.postalCode}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Special Instructions (Optional)</label>
                        <textarea
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="payment-method">
                        <h3>Payment Method</h3>
                        <div className="payment-option selected">
                            <input type="radio" checked readOnly />
                            <label>Cash on Delivery (Pay when you receive)</label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-accent place-order-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;
