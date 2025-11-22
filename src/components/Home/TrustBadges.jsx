import React from 'react';
import { Truck, CheckCircle, ShieldCheck, Banknote } from 'lucide-react';
import './TrustBadges.css';

const TrustBadges = () => {
    const badges = [
        {
            icon: <Banknote size={32} />,
            title: "Cash on Delivery",
            desc: "Pay when you receive"
        },
        {
            icon: <Truck size={32} />,
            title: "Home Delivery",
            desc: "Fast shipping nationwide"
        },
        {
            icon: <CheckCircle size={32} />,
            title: "100% Authentic",
            desc: "Certified premium quality"
        },
        {
            icon: <ShieldCheck size={32} />,
            title: "Money Back",
            desc: "100% satisfaction guaranteed"
        }
    ];

    return (
        <section className="trust-badges">
            <div className="container badges-container">
                {badges.map((badge, index) => (
                    <div key={index} className="badge-item">
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-text">
                            <h4>{badge.title}</h4>
                            <p>{badge.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TrustBadges;
