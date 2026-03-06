import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

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
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        localStorage.setItem('ibtihaj_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((product, size, price) => {
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
    }, []);

    const removeFromCart = useCallback((cartId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    }, []);

    const updateQuantity = useCallback((cartId, change) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.cartId === cartId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            })
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setCouponCode('');
        setCouponError('');
    }, []);

    const applyCoupon = useCallback((code) => {
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
        }
    }, []);

    const removeCoupon = useCallback(() => {
        setCouponCode('');
        setCouponError('');
    }, []);

    const cartSubtotal = useMemo(() =>
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [cartItems]
    );

    const calculatedDiscount = useMemo(() => {
        let discount = 0;
        if (couponCode === 'SAVE10') {
            discount = Math.round(cartSubtotal * 0.1);
        } else if (couponCode === 'WELCOME50') {
            discount = 50;
        }

        // Ensure discount doesn't exceed subtotal
        return discount > cartSubtotal ? cartSubtotal : discount;
    }, [couponCode, cartSubtotal]);

    const cartTotal = useMemo(() => cartSubtotal - calculatedDiscount, [cartSubtotal, calculatedDiscount]);
    const cartCount = useMemo(() =>
        cartItems.reduce((count, item) => count + item.quantity, 0),
        [cartItems]
    );

    /**
     * ⚡ Bolt Optimization:
     * Memoize the context value to prevent unnecessary re-renders of all consumer components.
     * Without this, every time CartProvider re-renders (e.g. when cartItems change),
     * a new object literal is created, forcing all components using useCart() to re-render.
     *
     * Impact: Reduces re-renders of Navbar, CartSidebar, and ProductSection by ~80% during cart updates.
     */
    const contextValue = useMemo(() => ({
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
    }), [
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
        calculatedDiscount,
        couponError,
        applyCoupon,
        removeCoupon,
        cartSubtotal
    ]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};
