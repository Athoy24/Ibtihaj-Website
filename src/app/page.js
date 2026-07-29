"use client";

import React, { useEffect } from 'react';
// import { useLocation } from 'react-router-dom'; // REMOVED
import Hero from '@/components/Home/Hero';
import TrustBadges from '@/components/Home/TrustBadges';
import ProductSection from '@/components/Home/ProductSection';
import Reviews from '@/components/Home/Reviews';
import BrandStory from '@/components/Home/BrandStory';

const Home = () => {
    // const { hash } = useLocation(); // REMOVED

    useEffect(() => {
        // Handle hash scrolling if needed, or rely on standard anchor behavior
        if (window.location.hash) {
            const element = document.getElementById(window.location.hash.replace('#', ''));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

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
