import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchCart();
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/user-profile/${userId}`);
            setUserProfile(res.data);
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/cart/${userId}`);
            setCartItems(res.data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (cartId, quantity) => {
        if (quantity < 1) return;
        
        try {
            await axios.put(`http://localhost:5000/api/cart/${cartId}`, { quantity });
            fetchCart();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to update quantity',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const handleRemoveItem = async (cartId) => {
        try {
            await axios.delete(`http://localhost:5000/api/cart/${cartId}`);
            fetchCart();
            Swal.fire({
                title: 'Removed',
                text: 'Item removed from cart',
                icon: 'success',
                timer: 1500,
                confirmButtonColor: '#2563eb'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to remove item',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const discountRate = userProfile && (userProfile.is_senior || userProfile.is_pwd) ? 0.05 : 0;
    const discountAmount = calculateSubtotal() * discountRate;
    const discountedSubtotal = calculateSubtotal() - discountAmount;

    const shippingFee = discountedSubtotal > 1000 ? 0 : 100;
    const tax = discountedSubtotal * 0.05; // 5% tax
    const total = discountedSubtotal + shippingFee + tax;

    const handleCheckout = () => {
        navigate('/checkout', { 
            state: { cartItems, subtotal: calculateSubtotal(), discountedSubtotal, discountAmount, discountRate, shippingFee, tax, total } 
        });
    };

    if (loading) {
        return <div className="loading">Loading cart...</div>;
    }

    return (
        <div className="cart-container">
            <button 
                className="back-button"
                onClick={() => navigate('/catalog')}
            >
                <ArrowLeft size={20} />
                Continue Shopping
            </button>

            <div className="page-title">
                <ShoppingCart size={32} />
                <h1>Shopping Cart</h1>
            </div>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <ShoppingCart size={64} />
                    <h2>Your cart is empty</h2>
                    <p>Add some wonderful fish to get started!</p>
                    <button 
                        className="btn-continue-shopping"
                        onClick={() => navigate('/catalog')}
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        <div className="items-header">
                            <span>Product</span>
                            <span>Price</span>
                            <span>Quantity</span>
                            <span>Subtotal</span>
                            <span></span>
                        </div>

                        {cartItems.map(item => (
                            <div key={item.cart_id} className="cart-item">
                                <div className="item-product">
                                    <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.name} />
                                    <div className="product-info">
                                        <h4>{item.name}</h4>
                                        <p>Available: {item.stock}</p>
                                    </div>
                                </div>

                                <div className="item-price">
                                    <span className="currency">₱</span>
                                    <span>{item.price}</span>
                                </div>

                                <div className="item-quantity">
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.cart_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <input 
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateQuantity(item.cart_id, parseInt(e.target.value) || 1)}
                                        min="1"
                                        max={item.stock}
                                    />
                                    <button 
                                        onClick={() => handleUpdateQuantity(item.cart_id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="item-subtotal">
                                    <span className="currency">₱</span>
                                    <span>{(item.price * item.quantity).toFixed(2)}</span>
                                </div>

                                <button 
                                    className="btn-remove"
                                    onClick={() => handleRemoveItem(item.cart_id)}
                                    title="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>
                        
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₱{calculateSubtotal().toFixed(2)}</span>
                        </div>

                        {discountRate > 0 && (
                            <div className="summary-row discount">
                                <span>Discount ({(discountRate * 100).toFixed(0)}%):</span>
                                <span>-₱{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="summary-row">
                            <span>Discounted Subtotal:</span>
                            <span>₱{discountedSubtotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Tax (5%):</span>
                            <span>₱{tax.toFixed(2)}</span>
                        </div>

                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>

                        {userProfile && (userProfile.is_senior || userProfile.is_pwd) && (
                            <div className="discount-message">
                                ✓ {userProfile.is_senior ? 'Senior Citizen' : 'PWD'} discount applied!
                            </div>
                        )}

                        {shippingFee === 0 && (
                            <div className="shipping-message">
                                ✓ Free shipping on this order!
                            </div>
                        )}

                        {shippingFee > 0 && (
                            <div className="shipping-message">
                                Add ₱{(1000 - discountedSubtotal).toFixed(2)} more to get free shipping
                            </div>
                        )}

                        <button 
                            className="btn-checkout"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </button>

                        <button 
                            className="btn-continue"
                            onClick={() => navigate('/catalog')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
