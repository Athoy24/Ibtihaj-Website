import React from 'react';
import CheckoutForm from '@/components/Checkout/CheckoutForm';

export const metadata = {
    title: 'Checkout - Ibtihaj',
};

const Checkout = () => {
    return (
        <div className="checkout-page">
            <CheckoutForm />
        </div>
    );
};

export default Checkout;
