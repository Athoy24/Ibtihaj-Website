"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { trackMetaEvent } from '@/lib/metaEvents';
import { Trash2, Plus, Minus } from 'lucide-react';

import './CheckoutForm.css';

const BANGLADESH_DISTRICTS = [
    "Dhaka",
    "Sylhet",
    "Bagerhat",
    "Bandarban",
    "Barguna",
    "Barisal",
    "Bhola",
    "Bogra",
    "Brahmanbaria",
    "Chandpur",
    "Chapainawabganj",
    "Chittagong",
    "Chuadanga",
    "Comilla",
    "Cox's Bazar",
    "Dinajpur",
    "Faridpur",
    "Feni",
    "Gaibandha",
    "Gazipur",
    "Gopalganj",
    "Habiganj",
    "Jamalpur",
    "Jessore",
    "Jhalokati",
    "Jhenaidah",
    "Joypurhat",
    "Khagrachhari",
    "Khulna",
    "Kishorganj",
    "Kurigram",
    "Kushtia",
    "Lakshmipur",
    "Lalmonirhat",
    "Madaripur",
    "Magura",
    "Manikganj",
    "Meherpur",
    "Moulvibazar",
    "Munshiganj",
    "Mymensingh",
    "Naogaon",
    "Narail",
    "Narayanganj",
    "Narsingdi",
    "Natore",
    "Netrokona",
    "Nilphamari",
    "Noakhali",
    "Pabna",
    "Panchagarh",
    "Patuakhali",
    "Pirojpur",
    "Rajbari",
    "Rajshahi",
    "Rangamati",
    "Rangpur",
    "Satkhira",
    "Shariatpur",
    "Sherpur",
    "Sirajganj",
    "Sunamganj",
    "Tangail",
    "Thakurgaon"
];

// Helper: Calculate total cart weight in kg
const calculateCartWeightInKg = (items) => {
    let totalGrams = 0;
    items.forEach(item => {
        const sizeStr = (item.size || '').toLowerCase().trim();
        const qty = item.quantity || 1;

        let itemGrams = 0;
        const kgMatch = sizeStr.match(/([\d.]+)\s*kg/);
        const gMatch = sizeStr.match(/([\d.]+)\s*(g|gm|gram|grams)/);

        if (kgMatch) {
            itemGrams = parseFloat(kgMatch[1]) * 1000;
        } else if (gMatch) {
            itemGrams = parseFloat(gMatch[1]);
        } else {
            const numMatch = sizeStr.match(/([\d.]+)/);
            if (numMatch) {
                const val = parseFloat(numMatch[1]);
                itemGrams = val > 10 ? val : val * 1000;
            } else {
                itemGrams = 250;
            }
        }
        totalGrams += itemGrams * qty;
    });
    return totalGrams / 1000;
};

// Helper: Calculate delivery fee based on district & weight in kg
const calculateDeliveryFee = (district, weightKg) => {
    if (!district || !district.trim()) {
        return { totalFee: 0, baseFee: 0, extraFee: 0, weightKg, extraKg: 0, isCalculated: false };
    }

    const normDistrict = district.trim().toLowerCase();
    const isDhakaOrSylhet = normDistrict.includes('dhaka') || normDistrict.includes('sylhet');
    const baseFee = isDhakaOrSylhet ? 80 : 135;

    let extraKg = 0;
    let extraFee = 0;
    if (weightKg > 1) {
        extraKg = Math.ceil(weightKg - 1);
        extraFee = extraKg * 20;
    }

    return {
        totalFee: baseFee + extraFee,
        baseFee,
        extraFee,
        weightKg,
        extraKg,
        isDhakaOrSylhet,
        isCalculated: true
    };
};

const CheckoutForm = () => {
    const { cartItems, cartTotal, cartSubtotal, discount, updateQuantity, removeFromCart, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        district: '',
        address: '',
        instructions: ''
    });

    const [errors, setErrors] = useState({});

    // Track InitiateCheckout on page mount
    useEffect(() => {
        if (cartItems.length > 0) {
            trackMetaEvent('InitiateCheckout', {
                content_category: 'Tea',
                num_items: cartItems.length,
                value: cartTotal,
                currency: 'BDT'
            });
        }
    }, []);

    const cartWeightKg = calculateCartWeightInKg(cartItems);
    const deliveryFeeInfo = calculateDeliveryFee(formData.district, cartWeightKg);
    const grandTotal = cartTotal + deliveryFeeInfo.totalFee;

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
        if (!formData.district.trim()) newErrors.district = 'Please select or enter your District';
        if (!formData.address.trim()) newErrors.address = 'Street Address is required';
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

        const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

        const orderDetails = {
            orderId,
            date: new Date().toLocaleDateString(),
            customer: formData,
            items: cartItems,
            subtotal: cartSubtotal,
            discount,
            deliveryFee: deliveryFeeInfo.totalFee,
            total: grandTotal,
            weightKg: cartWeightKg,
            status: 'Pending'
        };

        // Format Message for Telegram/WhatsApp
        const itemsList = cartItems
            .map(item => `- ${item.name} (${item.size}) x ${item.quantity}: ৳${item.price * item.quantity}`)
            .join('\n');

        const message = `
📦 *New Order Received!*
🆔 Order ID: \`${orderId}\`
📅 Date: ${orderDetails.date}

👤 *Customer Details:*
Name: ${formData.fullName}
Phone: ${formData.phone}
Email: ${formData.email}
District: ${formData.district}
Address: ${formData.address}

🛒 *Order Items:*
${itemsList}

⚖️ *Total Weight:* ${cartWeightKg.toFixed(2)} kg
🚚 *Delivery Fee:* ৳${deliveryFeeInfo.totalFee} (${deliveryFeeInfo.isDhakaOrSylhet ? 'Inside Dhaka/Sylhet' : 'Outside Dhaka/Sylhet'}${deliveryFeeInfo.extraKg > 0 ? ` + ৳${deliveryFeeInfo.extraFee} extra weight` : ''})
💰 *Grand Total:* ৳${grandTotal}

📝 *Instructions:*
${formData.instructions || 'None'}
        `.trim();

        try {
            // Send Meta Pixel & CAPI Purchase Event
            trackMetaEvent('Purchase', {
                value: grandTotal,
                currency: 'BDT',
                content_type: 'product',
                num_items: cartItems.length,
                order_id: orderId
            }, {
                em: formData.email,
                ph: formData.phone,
                fn: formData.fullName
            }, orderId);

            const promises = [];

            // Telegram API
            const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
            const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
                const telegramPromise = fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'Markdown'
                    }),
                }).then(res => {
                    if (!res.ok) throw new Error('Telegram API failed');
                    console.log('Order sent to Telegram successfully');
                }).catch(err => console.error('Telegram Error:', err));
                promises.push(telegramPromise);
            }

            // Google Sheets Integration
            const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;
            if (sheetUrl) {
                const sheetData = {
                    orderId,
                    date: orderDetails.date,
                    customerName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email,
                    district: formData.district,
                    address: formData.address,
                    itemsSummary: cartItems.map(item => `${item.name} (${item.size}) x ${item.quantity}`).join(', '),
                    weightKg: cartWeightKg.toFixed(2),
                    subtotal: cartSubtotal,
                    deliveryFee: deliveryFeeInfo.totalFee,
                    total: grandTotal
                };

                const sheetPromise = fetch(sheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sheetData)
                }).then(() => {
                    console.log('Order sent to Google Sheets successfully');
                }).catch(err => console.error('Google Sheet Error:', err));
                promises.push(sheetPromise);
            }

            await Promise.race([
                Promise.allSettled(promises),
                new Promise(resolve => setTimeout(resolve, 4000))
            ]);

            clearCart();
            router.push('/order-confirmation');

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
                <button onClick={() => router.push('/')} className="btn btn-primary mt-4">
                    Return to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h1 className="page-title">Complete Your Order</h1>

            <form className="checkout-form-container" onSubmit={handleSubmit}>
                <div className="checkout-grid">
                    {/* Left Column: Shipping & Contact Form */}
                    <div className="checkout-form-section">
                        <h3>Shipping & Contact Details</h3>

                        <div className="form-group">
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={errors.fullName ? 'error' : ''}
                            />
                            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    placeholder="01XXXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-msg">{errors.phone}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="example@mail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-msg">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="district">District *</label>
                                <select
                                    id="district"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    className={errors.district ? 'error' : ''}
                                >
                                    <option value="">-- Select District --</option>
                                    {BANGLADESH_DISTRICTS.map((dist) => (
                                        <option key={dist} value={dist}>
                                            {dist}
                                        </option>
                                    ))}
                                </select>
                                {errors.district && <span className="error-msg">{errors.district}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Street Address / Area *</label>
                                <input
                                    id="address"
                                    type="text"
                                    name="address"
                                    placeholder="House, Road, Thana/Upazila"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={errors.address ? 'error' : ''}
                                />
                                {errors.address && <span className="error-msg">{errors.address}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="instructions">Special Delivery Instructions (Optional)</label>
                            <textarea
                                id="instructions"
                                name="instructions"
                                placeholder="Any specific note for the delivery agent..."
                                value={formData.instructions}
                                onChange={handleChange}
                                rows="2"
                            />
                        </div>
                    </div>

                    {/* Right Column: Order Summary & Place Order */}
                    <div className="checkout-summary-card">
                        <h3>Order Summary</h3>

                        <div className="summary-items">
                            {cartItems.map(item => (
                                <div key={item.cartId} className="summary-item">
                                    <div className="item-info">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-meta">{item.size} × ৳{item.price}</span>
                                    </div>
                                    <div className="item-controls">
                                        <div className="qty-buttons">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.cartId, -1)}
                                                className="qty-btn"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="qty-val">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.cartId, 1)}
                                                className="qty-btn"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <span className="item-total">৳ {item.price * item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="remove-item-btn"
                                            title="Remove item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>৳ {cartSubtotal}</span>
                            </div>

                            {discount > 0 && (
                                <div className="summary-row discount">
                                    <span>Discount</span>
                                    <span>- ৳ {discount}</span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>Cart Weight</span>
                                <span>{cartWeightKg.toFixed(2)} kg</span>
                            </div>

                            <div className="summary-row shipping-row">
                                <span>Shipping Fee</span>
                                <span>
                                    {!deliveryFeeInfo.isCalculated ? (
                                        <em className="text-muted">Select District</em>
                                    ) : (
                                        `৳ ${deliveryFeeInfo.totalFee}`
                                    )}
                                </span>
                            </div>

                            {deliveryFeeInfo.isCalculated && (
                                <div className="shipping-note">
                                    {deliveryFeeInfo.isDhakaOrSylhet ? 'Inside Dhaka/Sylhet (৳80 base)' : 'Outside Dhaka/Sylhet (৳135 base)'}
                                    {deliveryFeeInfo.extraKg > 0 && ` + ৳${deliveryFeeInfo.extraFee} (+${deliveryFeeInfo.extraKg}kg extra weight)`}
                                </div>
                            )}

                            <div className="summary-row total">
                                <span>Grand Total</span>
                                <span>৳ {grandTotal}</span>
                            </div>
                        </div>

                        <div className="payment-method">
                            <div className="payment-option selected">
                                <input type="radio" id="cod" checked readOnly />
                                <label htmlFor="cod">Cash on Delivery (Pay upon delivery)</label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-accent place-order-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing Order...' : `Place Order (৳${grandTotal})`}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;
