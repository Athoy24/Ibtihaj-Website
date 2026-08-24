import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Reviews.css';

const Reviews = () => {
    const containerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const totalReviews = 10;

    const handleNext = React.useCallback(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
        const gap = 24;

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        }
    }, []);

    const handlePrev = React.useCallback(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
        const gap = 24;

        if (container.scrollLeft <= 10) {
            container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
        }
    }, []);

    // Gentle auto-scroll interval
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            handleNext();
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused, handleNext]);

    return (
        <section className="reviews-section section-padding" id="reviews">
            <div className="container">
                <div className="section-header text-center">
                    <h2>What Our Customers Are Saying</h2>
                    <p>Join thousands of satisfied tea lovers</p>
                </div>

                <div
                    className="reviews-carousel-wrapper"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                    aria-roledescription="carousel"
                    aria-label="Customer Reviews"
                >
                    <button
                        type="button"
                        className="carousel-btn prev-btn bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white text-gray-800"
                        onClick={handlePrev}
                        aria-label="Previous review"
                    >
                        <ChevronLeft size={24} aria-hidden="true" />
                    </button>

                    <div
                        ref={containerRef}
                        className="overflow-x-auto flex gap-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                    >
                        {Array.from({ length: totalReviews }, (_, index) => index + 1).map((reviewNumber) => (
                            <div
                                key={reviewNumber}
                                className="flex-none w-[320px] sm:w-[360px] snap-center rounded-2xl overflow-hidden shadow-sm"
                            >
                                <img
                                    src={`/images/reviews/review-${reviewNumber}.webp`}
                                    alt={`Customer Review ${reviewNumber}`}
                                    className="w-full h-auto object-contain"
                                    loading="lazy"
                                    decoding="async"
                                    width="360"
                                    height="480"
                                    style={{ aspectRatio: '360/480' }}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="carousel-btn next-btn bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white text-gray-800"
                        onClick={handleNext}
                        aria-label="Next review"
                    >
                        <ChevronRight size={24} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Reviews;
