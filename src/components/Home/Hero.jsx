import React from 'react';
import './Hero.css';

const Hero = () => {
    const scrollToShop = () => {
        const shopSection = document.getElementById('shop');
        if (shopSection) {
            shopSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-content">
                <h1 className="hero-title">The Tea that Tells the Tale of Bangladesh.</h1>
                <p className="hero-subtitle">
                    Handpicked from the warmest harvest to bring out the purest flavor and aroma.
                    Every sip tells a story of our land, our people, and our heritage.
                </p>
                <button onClick={scrollToShop} className="btn btn-accent hero-btn">
                    Shop Our Signature Tea
                </button>
            </div>
        </section>
    );
};

export default Hero;
