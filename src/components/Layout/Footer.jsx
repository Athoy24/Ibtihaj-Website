import React from 'react';
import { Facebook, Instagram, Phone, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container footer-container">
                <div className="footer-brand">
                    <h3 className="footer-logo">Ibtihaj</h3>
                    <p className="footer-tagline">Premium Tea from Bangladesh</p>
                </div>

                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links-list">
                        <a href="https://www.facebook.com/Ibtihaj.store" target="_blank" rel="noopener noreferrer" className="social-link">
                            <Facebook size={20} />
                            <span>Facebook</span>
                        </a>
                        <a href="https://www.instagram.com/ibtihajtea" target="_blank" rel="noopener noreferrer" className="social-link">
                            <Instagram size={20} />
                            <span>Instagram</span>
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <div className="contact-links-list">
                        <a href="tel:01635545377" className="contact-link">
                            <Phone size={20} />
                            <span>Call: 01635545377</span>
                        </a>
                        <a href="https://wa.me/8801635545377" target="_blank" rel="noopener noreferrer" className="contact-link">
                            <MessageCircle size={20} />
                            <span>WhatsApp: 01635545377</span>
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 Ibtihaj. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
