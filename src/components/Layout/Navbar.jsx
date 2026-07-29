"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const { cartCount, setIsCartOpen } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return (
        <nav className={`navbar ${scrolled || isMobileMenuOpen ? 'scrolled' : ''}`}>
            <div className="container navbar-container">
                <Link href="/" className="navbar-logo">
                    <img src="/logo.png" alt="Ibtihaj" className="logo-image" />
                </Link>

                <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link href="/#shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                    <Link href="/#reviews" onClick={() => setIsMobileMenuOpen(false)}>Reviews</Link>
                    <Link href="/#story" onClick={() => setIsMobileMenuOpen(false)}>Our Story</Link>
                    <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
                </div>

                <div className="navbar-actions">
                    <button
                        className="cart-btn"
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Open Cart"
                    >
                        <ShoppingCart size={24} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>

                    <Link href="/" className="btn btn-primary order-btn hidden-mobile">
                        Order Now
                    </Link>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
