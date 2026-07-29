import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Reviews.css';

const Reviews = () => {
    const containerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const totalReviews = 10;

    // Initialize scroll position to the middle set on mount
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
        const gap = 24; // gap-6 is 1.5rem (24px)
        const midOffset = totalReviews * (cardWidth + gap);
        
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = midOffset;
        container.style.scrollBehavior = 'smooth';
    }, []);

    // Gentle auto-scroll interval
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
            const gap = 24;
            
            container.scrollBy({
                left: cardWidth + gap,
                behavior: 'smooth'
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused]);

    // Handle seamless wrapping when scroll reaches boundary zones
    const handleScroll = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
        const gap = 24;
        const singleSetWidth = totalReviews * (cardWidth + gap);

        // Scroll past the middle set into the third set -> snap back to middle set
        if (container.scrollLeft >= singleSetWidth * 2) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft -= singleSetWidth;
            container.style.scrollBehavior = 'smooth';
        }
        // Scroll past the middle set into the first set -> snap forward to middle set
        else if (container.scrollLeft <= singleSetWidth - (cardWidth + gap)) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft += singleSetWidth;
            container.style.scrollBehavior = 'smooth';
        }
    };

    const handlePrev = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
        const gap = 24;
        const singleSetWidth = totalReviews * (cardWidth + gap);

        // Pre-snap if close to the boundary to ensure smooth animation
        if (container.scrollLeft <= singleSetWidth - (cardWidth + gap)) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft += singleSetWidth;
        }

        setTimeout(() => {
            container.scrollBy({
                left: -(cardWidth + gap),
                behavior: 'smooth'
            });
        }, 10);
    };

    const handleNext = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const cardWidth = container.querySelector('.snap-center')?.clientWidth || 320;
        const gap = 24;

        container.scrollBy({
            left: cardWidth + gap,
            behavior: 'smooth'
        });
    };

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
                >
                    <button 
                        className="carousel-btn prev-btn bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white text-gray-800" 
                        onClick={handlePrev}
                        aria-label="Previous review"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        ref={containerRef}
                        className="overflow-x-auto flex gap-6 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                        onScroll={handleScroll}
                    >
                        {[...Array(totalReviews * 3)].map((_, index) => {
                            const reviewNumber = (index % totalReviews) + 1;
                            return (
                                <div
                                    key={index}
                                    className="flex-none w-[320px] sm:w-[360px] snap-center rounded-2xl overflow-hidden shadow-sm"
                                >
                                    <img
                                        src={`/images/reviews/review-${reviewNumber}.png`}
                                        alt={`Customer Review ${reviewNumber}`}
                                        className="w-full h-auto object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        className="carousel-btn next-btn bg-white/80 backdrop-blur rounded-full shadow-md hover:bg-white text-gray-800" 
                        onClick={handleNext}
                        aria-label="Next review"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Reviews;
