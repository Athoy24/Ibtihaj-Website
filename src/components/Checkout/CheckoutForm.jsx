"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { trackMetaEvent } from '@/lib/metaEvents';
import { Trash2, Plus, Minus } from 'lucide-react';

import './CheckoutForm.css';

const BANGLADESH_DISTRICTS = [
    "Dhaka", "Sylhet", "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra",
    "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chittagong", "Chuadanga", "Comilla",
    "Cox's Bazar", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
    "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
    "Khulna", "Kishorganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
    "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
    "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali",
    "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
    "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Tangail",
    "Thakurgaon"
];

// Client calculation just for UI. Server does authoritative calculation.
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
    const { cartItems, cartTotal, cartSubtotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [idempotencyKey, setIdempotencyKey] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        district: '',
        address: '',
        instructions: '',
        website: '' // Honeypot field
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIdempotencyKey(crypto.randomUUID());
        if (cartItems.length > 0) {
            trackMetaEvent('InitiateCheckout', {
                content_category: 'Tea',
                num_items: cartItems.length,
                value: cartTotal,
                currency: 'BDT'
            });
        }
    }, [cartItems.length, cartTotal]);

    const cartWeightKg = calculateCartWeightInKg(cartItems);
    const deliveryFeeInfo = calculateDeliveryFee(formData.district, cartWeightKg);
    const grandTotal = cartTotal + deliveryFeeInfo.totalFee;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setApiError(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim() || formData.fullName.length < 2) newErrors.fullName = 'Full Name is required';
        const emailTrimmed = formData.email.trim();
        if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrimmed)) {
            newErrors.email = 'Enter a valid email address, or leave this field blank.';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone Number is required';
        } else if (!/^(?:\+8801|8801|01)\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'Enter a valid Bangladesh mobile number: +8801XXXXXXXXX, 8801XXXXXXXXX, or 01XXXXXXXXX.';
        }
        if (!formData.district.trim() || !BANGLADESH_DISTRICTS.includes(formData.district)) newErrors.district = 'Valid District is required';
        if (!formData.address.trim() || formData.address.length < 5) newErrors.address = 'Detailed Street Address is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);
        
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (cartItems.length === 0 || !formData.district.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: formData,
                    items: cartItems.map(i => ({ id: i.id, size: i.size, quantity: i.quantity })), // Do NOT send client totals/prices
                    idempotencyKey,
                    honeypot: formData.website
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                setApiError(errData.error || 'Failed to place order.');
                setIsSubmitting(false);
                return;
            }

            const data = await response.json();

            // Track purchase
            trackMetaEvent('Purchase', {
                value: grandTotal,
                currency: 'BDT',
                content_type: 'product',
                num_items: cartItems.length,
                order_id: data.orderId
            }, {
                em: formData.email,
                ph: formData.phone,
                fn: formData.fullName
            }, data.orderId);

            clearCart();
            // Redirect without any sensitive tokens in the URL
            router.push('/order-confirmation');
            
        } catch (error) {
            console.error('Submission error:', error);
            setApiError('A network error occurred. Please try again.');
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

    const isPlaceOrderDisabled = isSubmitting || !formData.district.trim() || cartItems.length === 0;

    return (
        <div className="checkout-container">
            <h1 className="page-title">Complete Your Order</h1>

            <form className="checkout-form-container" onSubmit={handleSubmit} method="POST">
                <div className="checkout-grid">
                    {/* Left Column: Shipping & Contact Form */}
                    <div className="checkout-form-section">
                        <h3>Shipping & Contact Details</h3>

                        {apiError && (
                            <div className="alert alert-error" role="alert" aria-live="assertive">
                                {apiError}
                            </div>
                        )}

                        {/* Honeypot field (hidden from view) */}
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <label htmlFor="website">Website (Leave blank)</label>
                            <input
                                id="website"
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                tabIndex="-1"
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                id="fullName"
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                                aria-invalid={!!errors.fullName}
                                className={errors.fullName ? 'error' : ''}
                            />
                            {errors.fullName && <span className="error-msg" role="alert">{errors.fullName}</span>}
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
                                    required
                                    autoComplete="tel"
                                    aria-invalid={!!errors.phone}
                                    aria-describedby={errors.phone ? "phone-error" : undefined}
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span id="phone-error" className="error-msg" role="alert">{errors.phone}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address (Optional)</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="example@mail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span id="email-error" className="error-msg" role="alert">{errors.email}</span>}
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
                                    required
                                    autoComplete="address-level1"
                                    aria-invalid={!!errors.district}
                                    className={errors.district ? 'error' : ''}
                                >
                                    <option value="">-- Select District --</option>
                                    {BANGLADESH_DISTRICTS.map((dist) => (
                                        <option key={dist} value={dist}>
                                            {dist}
                                        </option>
                                    ))}
                                </select>
                                {errors.district && <span className="error-msg" role="alert">{errors.district}</span>}
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
                                    required
                                    autoComplete="street-address"
                                    aria-invalid={!!errors.address}
                                    className={errors.address ? 'error' : ''}
                                />
                                {errors.address && <span className="error-msg" role="alert">{errors.address}</span>}
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
                                        <span className="item-meta">{item.size}</span>
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

                            <div className="summary-row shipping-row">
                                <span>Shipping Fee</span>
                                <span>
                                    {!deliveryFeeInfo.isCalculated ? (
                                        <em className="text-muted">Select district</em>
                                    ) : (
                                        `৳ ${deliveryFeeInfo.totalFee}`
                                    )}
                                </span>
                            </div>

                            <div className="summary-row total">
                                <span>Grand Total</span>
                                <span>
                                    {!deliveryFeeInfo.isCalculated ? (
                                        <em className="text-muted">Pending</em>
                                    ) : (
                                        `৳ ${grandTotal}`
                                    )}
                                </span>
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
                            disabled={isPlaceOrderDisabled}
                        >
                            {isSubmitting ? 'Processing Order...' : (!deliveryFeeInfo.isCalculated ? 'Select district to continue' : `Place Order (৳${grandTotal})`)}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutForm;
