import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('ibtihaj_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        localStorage.setItem('ibtihaj_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, size, price) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id && item.size === size);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id && item.size === size
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, size, price, quantity: 1, cartId: `${product.id}-${size}` }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, change) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.cartId === cartId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setCouponCode('');
        setDiscount(0);
        setCouponError('');
    };

    const applyCoupon = (code) => {
        setCouponError('');
        const upperCode = code.toUpperCase();

        if (upperCode === 'SAVE10') {
            setCouponCode(upperCode);
            // Discount will be calculated in cartTotal
        } else if (upperCode === 'WELCOME50') {
            setCouponCode(upperCode);
        } else {
            setCouponError('Invalid coupon code');
            setCouponCode('');
            setDiscount(0);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setDiscount(0);
        setCouponError('');
    };

    const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    let calculatedDiscount = 0;
    if (couponCode === 'SAVE10') {
        calculatedDiscount = Math.round(cartSubtotal * 0.1);
    } else if (couponCode === 'WELCOME50') {
        calculatedDiscount = 50;
    }

    // Ensure discount doesn't exceed subtotal
    if (calculatedDiscount > cartSubtotal) {
        calculatedDiscount = cartSubtotal;
    }

    const cartTotal = cartSubtotal - calculatedDiscount;
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartTotal,
            cartCount,
            couponCode,
            discount: calculatedDiscount,
            couponError,
            applyCoupon,
            removeCoupon,
            cartSubtotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
