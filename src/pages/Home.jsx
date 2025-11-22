import React from 'react';
import Hero from '../components/Home/Hero';
import TrustBadges from '../components/Home/TrustBadges';
import ProductSection from '../components/Home/ProductSection';
import Reviews from '../components/Home/Reviews';
import BrandStory from '../components/Home/BrandStory';

const Home = () => {
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
