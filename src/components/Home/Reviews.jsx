import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import './Reviews.css';

const Reviews = () => {
    const reviews = [
        {
            quote: "Amazing flavour, Thank you Ibtihaj.",
            name: "Farzana Nishe",
            title: "Manager, Fiber at Home LTD",
            rating: 5
        },
        {
            quote: "Great liquor and fragrance to keep my mood fresh all the day long !!!",
            name: "MD. Raisul Islam Rabbi",
            title: "Senior Officer, WOORI Bank Bangladesh",
            rating: 5
        },
        {
            quote: "This product offers great quality tea with an attractive aroma. Highly recommended. Best quality I have ever had.",
            name: "Anup Aich",
            title: "Assistant Engineer, DPDC",
            rating: 5
        },
        {
            quote: "The flavour is very pleasant, brilliantly executed and incredibly refreshing. In terms of quality, I think you won't find any better tea than this in Bangladesh.",
            name: "Foysal Ahmed",
            title: "TSO, IFIC BANK",
            rating: 5
        },
        {
            quote: "ইবতিহাজ এর চা টা বেশ ভাল লেগেছে। চা পাতা কম লাগে আর খেতেও ভাল ইনশাল্লাহ। আল্লাহ তোমাদের ব্রান্ডকে ভালভাবে এগিয়ে নিয়ে যাক।",
            name: "Mahbubur Rahman Chowdhury",
            title: "Chevron Bangladesh",
            rating: 5
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % reviews.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isPaused, reviews.length]);

    return (
        <section className="reviews-section section-padding" id="reviews">
            <div className="container">
                <div className="section-header text-center">
                    <h2>What Our Customers Are Saying</h2>
                    <p>Join thousands of satisfied tea lovers</p>
                </div>

                <div
                    className="reviews-carousel"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className="review-card fade-in" key={activeIndex}>
                        <div className="stars">
                            {[...Array(reviews[activeIndex].rating)].map((_, i) => (
                                <Star key={i} size={20} fill="#D4AF37" color="#D4AF37" />
                            ))}
                        </div>
                        <blockquote className="review-quote">
                            "{reviews[activeIndex].quote}"
                        </blockquote>
                        <div className="review-author">
                            <h4>{reviews[activeIndex].name}</h4>
                            <p>{reviews[activeIndex].title}</p>
                        </div>
                    </div>

                    <div className="carousel-dots">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Go to review ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Reviews;
