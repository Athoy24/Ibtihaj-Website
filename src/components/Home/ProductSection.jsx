import React, { useState } from 'react';
import { MessageCircle, Phone, ClipboardList } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductSection.css';
import signature200gImg from '../../assets/200 gm Packaging.png';
import signature500gImg from '../../assets/500 gm Packaging.png';
import greenteaImg from '../../assets/Green Tea packaging.png';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState(Object.keys(product.variants)[0]);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        if (product.isOutOfStock) return;
        addToCart(
            { id: product.id, name: product.name, image: product.variants[selectedSize].image },
            selectedSize,
            product.variants[selectedSize].price,
            quantity
        );
    };

    return (
        <div className={`product-card ${product.isOutOfStock ? 'is-out-of-stock' : ''}`}>
            {/* Gallery / Image Container */}
            <div className="product-card-gallery">
                <div className="main-image-container">
                    {product.isBestSeller && !product.isOutOfStock && (
                        <div className="badge-best-seller">
                            <span>✨ Best Seller ✨</span>
                        </div>
                    )}
                    {product.isOutOfStock && (
                        <div className="badge-out-of-stock">
                            <span>Stocked Out</span>
                        </div>
                    )}
                    <img
                        src={product.variants[selectedSize].image}
                        alt={product.name}
                        className="main-image max-h-[250px] w-auto mx-auto object-contain"
                    />
                </div>
            </div>

            {/* Info and Purchase Controls */}
            <div className="product-card-info">
                <h3 className="product-card-title">{product.name}</h3>

                <div className="price-container justify-center">
                    {product.isOutOfStock ? (
                        <span className="out-of-stock-text">Stocked Out</span>
                    ) : (
                        <>
                            {product.variants[selectedSize].originalPrice && (
                                <span className="original-price">৳ {product.variants[selectedSize].originalPrice}</span>
                            )}
                            <span className="product-price">৳ {product.variants[selectedSize].price}</span>
                        </>
                    )}
                </div>

                <ul className="product-features">
                    {product.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                    ))}
                </ul>

                {product.isOutOfStock ? (
                    <div className="action-row justify-center mt-4">
                        <button className="out-of-stock-btn" disabled>
                            Stocked Out
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="size-selector">
                            <span className="label">Select Size</span>
                            <div className="size-options justify-center">
                                {Object.keys(product.variants).map(size => (
                                    <button
                                        key={size}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="action-row justify-center">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                                Add To Cart
                            </button>
                        </div>
                    </>
                )}

                <div className="direct-order-buttons">
                    <a href="https://m.me/Ibtihaj.store" target="_blank" rel="noopener noreferrer" className="btn btn-messenger">
                        <MessageCircle size={15} />
                        Order on Messenger
                    </a>
                    <a href="tel:01635545377" className="btn btn-call">
                        <Phone size={15} />
                        Call to Order
                    </a>
                </div>
            </div>
        </div>
    );
};

const ProductSection = () => {
    const [activeAccordion, setActiveAccordion] = useState(null);

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const products = [
        {
            id: 'signature-flush',
            name: 'Ibtihaj Signature Flush Tea',
            description: 'Experience the exquisite taste of our Signature Flush Black Tea, a premium tea harvested during the first flush of the spring season in Sylhet, Bangladesh. This delicate tea offers a floral aroma and a complex flavor profile with notes of malt, briskness, and a hint of astringency. Its bright, coppery liquor is a delight to the senses, making it the perfect tea for any occasion. Enjoy it plain or with a splash of milk and sugar.',
            isBestSeller: true,
            features: [
                '🌸 Handpicked premium first-flush black tea',
                '🍃 Exquisite floral aroma & complex flavor profile',
                '🌳 Sourced from top quality gardens of Sreemangal'
            ],
            variants: {
                '200g': { price: 159, originalPrice: 199, image: signature200gImg.src },
                '500g': { price: 399, originalPrice: 499, image: signature500gImg.src }
            }
        },
        {
            id: 'green-tea',
            name: 'Ibtihaj Premium Green Tea',
            isOutOfStock: true,
            description: 'Refresh your senses with our organic Green Tea, rich in antioxidants and pure flavor. Handcrafted to preserve the highest quality of tea nutrients, it delivers a smooth taste and natural energy boost throughout your day.',
            isBestSeller: false,
            features: [
                '🍵 100% Organic green tea leaves',
                '💪 Rich in antioxidants & natural nutrients',
                '✨ Mild, smooth, and refreshingly clean taste'
            ],
            variants: {
                '100g': { price: 275, originalPrice: 300, image: greenteaImg.src },
                '250g': { price: 599, originalPrice: 650, image: greenteaImg.src }
            }
        }
    ];

    return (
        <section className="product-section section-padding" id="shop">
            <div className="container">
                {/* 2-Column Responsive Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Shared Product Information & Preservation Accordions */}
                <div className="shared-accordions max-w-4xl mx-auto">
                    <h3 className="shared-accordions-title">
                        <ClipboardList size={20} />
                        Product Information & Delivery
                    </h3>
                    <div className="accordions">
                        <div className="accordion-item">
                            <button className="accordion-header" onClick={() => toggleAccordion(0)}>
                                Product Details: Ibtihaj Signature Flush Tea
                                <span className="accordion-icon">{activeAccordion === 0 ? '−' : '+'}</span>
                            </button>
                            {activeAccordion === 0 && (
                                <div className="accordion-content">
                                    <p>{products[0].description}</p>
                                </div>
                            )}
                        </div>
                        <div className="accordion-item">
                            <button className="accordion-header" onClick={() => toggleAccordion(1)}>
                                Product Details: Ibtihaj Premium Green Tea
                                <span className="accordion-icon">{activeAccordion === 1 ? '−' : '+'}</span>
                            </button>
                            {activeAccordion === 1 && (
                                <div className="accordion-content">
                                    <p>{products[1].description}</p>
                                </div>
                            )}
                        </div>
                        <div className="accordion-item">
                            <button className="accordion-header" onClick={() => toggleAccordion(2)}>
                                Preservation & Delivery Guidelines
                                <span className="accordion-icon">{activeAccordion === 2 ? '−' : '+'}</span>
                            </button>
                            {activeAccordion === 2 && (
                                <div className="accordion-content">
                                    <p>Store in a cool, dry place in an airtight container to keep the aroma intact. Free shipping inside Bangladesh for orders exceeding ৳1000. Delivery time: 2-3 business days.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductSection;
