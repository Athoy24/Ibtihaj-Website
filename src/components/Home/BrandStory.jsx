import React from 'react';
import './BrandStory.css';

const BrandStory = () => {
    return (
        <section className="brand-story section-padding" id="story">
            <div className="container">
                <div className="story-content">
                    <div className="story-block">
                        <h2>Our Passion, Your Perfect Cup</h2>
                        <p>
                            At Ibtihaj, we believe that every cup of tea tells a story. Our journey began with a simple vision:
                            to bring the finest black tea from Bangladesh's most prestigious gardens to tea lovers around the world.
                            We spend years sourcing the perfect single-origin leaves from the finest gardens, ensuring every batch
                            meets our exacting standards.
                        </p>
                    </div>

                    <div className="story-divider"></div>

                    <div className="story-block">
                        <h2>Tired of Ordinary Tea? Taste the Difference.</h2>
                        <p>
                            Most black teas are mass-produced, resulting in a bitter, flat taste. Ibtihaj is different.
                            We use only the finest signature flush leaves, hand-picked at their peak. The result is a tea with
                            exceptional flavor, rich aroma, and a smooth finish that makes every sip special. Once you taste Ibtihaj,
                            you'll never go back to ordinary tea.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandStory;
