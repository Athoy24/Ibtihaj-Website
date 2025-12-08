import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import TrustBadges from '../components/Home/TrustBadges';
import ProductSection from '../components/Home/ProductSection';
import Reviews from '../components/Home/Reviews';
import BrandStory from '../components/Home/BrandStory';

const Home = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    return (
        <div className="home-page">
            <Hero />
            <TrustBadges />
            <ProductSection />
            <Reviews />
            <BrandStory />
        </div>
    );
};

export default Home;
