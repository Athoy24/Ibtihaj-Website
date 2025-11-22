import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartSidebar.css';

const CartSidebar = () => {
    const {
        isCartOpen,
        setIsCartOpen,
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();

    const navigate = useNavigate();

    if (!isCartOpen) return null;

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <div className="cart-overlay">
            <div className="cart-sidebar slide-in">
                <div className="cart-header">
                    <h3>Your Cart ({cartItems.length})</h3>
                    <button onClick={() => setIsCartOpen(false)} className="close-cart">
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty</p>
                            <button onClick={() => setIsCartOpen(false)} className="btn btn-primary">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.cartId} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-img" />
                                <div className="cart-item-details">
                                    <h4>{item.name}</h4>
                                    <p className="item-size">Size: {item.size}</p>
                                    <p className="item-price">৳ {item.price}</p>

                                    <div className="quantity-controls">
                                        <button onClick={() => updateQuantity(item.cartId, -1)}>
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartId, 1)}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="remove-item"
                                    onClick={() => removeFromCart(item.cartId)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-subtotal">
                            <span>Subtotal:</span>
                            <span className="amount">৳ {cartTotal}</span>
                        </div>
                        <button onClick={handleCheckout} className="btn btn-primary checkout-btn">
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;
