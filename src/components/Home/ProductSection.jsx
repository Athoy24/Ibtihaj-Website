import React, { useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductSection.css';
import signature200gImg from '../../assets/200 gm Packaging.png';
import signature500gImg from '../../assets/500 gm Packaging.png';
import greenteaImg from '../../assets/Green Tea packaging.png';

const ProductDisplay = ({ product }) => {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState(Object.keys(product.variants)[0]);
    const [quantity, setQuantity] = useState(1);
    const [activeAccordion, setActiveAccordion] = useState(null);

    const handleAddToCart = () => {
        addToCart(
            { id: product.id, name: product.name, image: product.variants[selectedSize].image },
            selectedSize,
            product.variants[selectedSize].price,
            quantity
        );
    };

    const toggleAccordion = (index) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    const accordionData = [
        { title: 'Product Details', content: product.description },
        { title: 'Preservation', content: 'Free shipping on orders over ৳1000. Standard delivery 2-3 business days.' }
    ];

    return (
        <div className="container product-container">
            {/* Left Column: Images */}
            <div className="product-gallery">
                <div className="main-image-container">
                    {product.isBestSeller && (
                        <div className="badge-best-seller">
                            <span>✨ Best Seller ✨</span>
                        </div>
                    )}
                    <img
                        src={product.variants[selectedSize].image}
                        alt={product.name}
                        className="main-image"
                    />
                </div>
                <div className="thumbnail-list">
                    {product.images.map((img, idx) => (
                        <div key={idx} className="thumbnail-item">
                            <img src={img} alt={`View ${idx + 1}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="product-details">
                <h1 className="product-title">{product.name}</h1>
                <p className="product-price">৳ {product.variants[selectedSize].price}</p>

                <div className="size-selector">
                    <span className="label">Sizes</span>
                    <div className="size-options">
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

                <div className="action-row">
                    <div className="quantity-selector">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                        Add To Cart
                    </button>
                </div>

                <div className="accordions">
                    {accordionData.map((item, index) => (
                        <div key={index} className="accordion-item">
                            <button
                                className="accordion-header"
                                onClick={() => toggleAccordion(index)}
                            >
                                {item.title}
                                <span className="accordion-icon">
                                    {activeAccordion === index ? '−' : '+'}
                                </span>
                            </button>
                            {activeAccordion === index && (
                                <div className="accordion-content">
                                    <p>{item.content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="direct-order-buttons">
                    <a href="https://m.me/Ibtihaj.store" target="_blank" rel="noopener noreferrer" className="btn btn-messenger">
                        <MessageCircle size={15} />
                        Order Now on Messenger
                    </a>
                    <a href="tel:01635545377" className="btn btn-call">
                        <Phone size={15} />
                        Call to Order: 01635545377
                    </a>
                </div>
            </div>
        </div>
    );
};

const ProductSection = () => {
    const products = [
        {
            id: 'signature-flush',
            name: 'Ibtihaj Signature Flush Tea',
            description: 'Experience the exquisite taste of our Signature Flush Black Tea, a premium tea harvested during the first flush of the spring season in Sylhet, Bangladesh. This delicate tea offers a floral aroma and a complex flavor profile with notes of malt, briskness, and a hint of astringency. Its bright, coppery liquor is a delight to the senses, making it the perfect tea for any occasion. Enjoy it plain or with a splash of milk and sugar.',
            isBestSeller: true,
            variants: {
                '200g': { price: 200, image: signature200gImg },
                '500g': { price: 450, image: signature500gImg }
            },
            images: [
                'https://placehold.co/600x800/8B3A3A/ffffff?text=Front+View',
                'https://placehold.co/600x800/8B3A3A/ffffff?text=Side+View',
                'https://placehold.co/600x800/8B3A3A/ffffff?text=Detail+View'
            ]
        },
        {
            id: 'green-tea',
            name: 'Ibtihaj Premium Green Tea',
            description: 'Refresh your senses with our organic Green Tea, rich in antioxidants and pure flavor.',
            isBestSeller: false,
            variants: {
                '100g': { price: 150, image: greenteaImg },
                '250g': { price: 350, image: greenteaImg }
            },
            images: [
                'https://placehold.co/600x800/4CAF50/ffffff?text=Green+Tea+Front',
                'https://placehold.co/600x800/4CAF50/ffffff?text=Green+Tea+Cup',
                'https://placehold.co/600x800/4CAF50/ffffff?text=Green+Tea+Leaves'
            ]
        }
    ];

    return (
        <section className="product-section section-padding" id="shop">
            {products.map((product, index) => (
                <div key={product.id} className={index > 0 ? 'product-separator' : ''}>
                    <ProductDisplay product={product} />
                </div>
            ))}
        </section>
    );
};

export default ProductSection;
