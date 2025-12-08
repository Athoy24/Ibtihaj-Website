import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const { cartCount, setIsCartOpen } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src="/logo.png" alt="Ibtihaj" className="logo-image" />
                </Link>

                <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/#shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                    <Link to="/#reviews" onClick={() => setIsMobileMenuOpen(false)}>Reviews</Link>
                    <Link to="/#story" onClick={() => setIsMobileMenuOpen(false)}>Our Story</Link>
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

                    <Link to="/" className="btn btn-primary order-btn hidden-mobile">
                        Order Now
                    </Link>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
