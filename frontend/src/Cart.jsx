import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Trash2, Plus, Minus, ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState('/isda_bg.png');
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
        fetchBackground();
    }, [userId]);

    const fetchBackground = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/background-settings');
            const setting = Array.isArray(res.data)
                ? res.data.find((item) => item.setting_name === 'client_background')
                : null;
            setBackgroundImageUrl(setting?.setting_value || '/isda_bg.png');
        } catch {
            setBackgroundImageUrl('/isda_bg.png');
        }
    };

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

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const hasApprovedDiscount = userProfile && (
        (Number(userProfile.is_senior) === 1 && Number(userProfile.senior_verified) === 1) ||
        (Number(userProfile.is_pwd) === 1 && Number(userProfile.pwd_verified) === 1)
    );
    const discountRate = hasApprovedDiscount ? 0.05 : 0;
    const discountAmount = calculateSubtotal() * discountRate;
    const discountedSubtotal = calculateSubtotal() - discountAmount;

    const shippingFee = 0;
    const tax = 0;
    const total = discountedSubtotal + shippingFee;

    const handleCheckout = () => {
        navigate('/checkout', { 
            state: { cartItems, subtotal: calculateSubtotal(), discountedSubtotal, discountAmount, discountRate, shippingFee, tax, total } 
        });
    };

    if (loading) {
        return <div className="loading">Loading cart...</div>;
    }

    return (
        <div
            className="cart-container"
            style={{ backgroundImage: `linear-gradient(rgba(11, 31, 42, 0.32), rgba(11, 31, 42, 0.32)), url('${backgroundImageUrl}')` }}
        >
            <div className="cart-header glass-panel">
                <div className="cart-header-left">
                    <button
                        className="back-button"
                        onClick={() => navigate('/catalog')}
                        type="button"
                    >
                        <ArrowLeft size={20} />
                        Back to Catalog
                    </button>
                </div>

                <h1>Shopping Cart</h1>

                <div className="cart-header-right">
                    <button
                        className="order-info-button"
                        onClick={() => navigate('/order-info')}
                        type="button"
                        title="Order Info"
                    >
                        <Package size={20} />
                    </button>
                </div>
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
                <div className="cart-checkout-panel modern-cart-panel">
                    <div className="cart-meta-row">
                        <span>You have {cartItems.length} product{cartItems.length > 1 ? 's' : ''} in your cart</span>
                        <span>In-store payment only</span>
                    </div>

                    <div className="cart-items modern-cart-items">
                        <div className="items-header modern-items-header">
                            <span>Product</span>
                            <span>Price</span>
                            <span>Quantity</span>
                            <span>Total</span>
                        </div>

                        {cartItems.map(item => (
                            <div key={item.cart_id} className="cart-item modern-cart-item">
                                <div className="item-product modern-item-product">
                                    <img src={item.image_url || 'https://via.placeholder.com/80'} alt={item.name} />
                                    <div className="product-info">
                                        <h4>{item.name}</h4>
                                        <p>Category: {item.category || 'General'}</p>
                                        <p>Price: ₱{Number(item.price).toFixed(2)}</p>
                                        <p className="stock-note">● In Stock ({item.stock} Pcs)</p>
                                    </div>
                                    <button
                                        className="btn-remove compact-remove"
                                        onClick={() => handleRemoveItem(item.cart_id)}
                                        title="Remove item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="item-price modern-item-price">₱{Number(item.price).toFixed(2)}</div>

                                <div className="item-quantity modern-item-quantity">
                                    <button
                                        onClick={() => handleUpdateQuantity(item.cart_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateQuantity(item.cart_id, parseInt(e.target.value, 10) || 1)}
                                        min="1"
                                        max={item.stock}
                                    />
                                    <button
                                        onClick={() => handleUpdateQuantity(item.cart_id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="item-subtotal modern-item-total">₱{(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="modern-cart-footer">
                        <div className="modern-cart-totals">
                            <div className="subtotal-main">Sub Total: ₱{discountedSubtotal.toFixed(2)}</div>
                            <div className="subtotal-note">Final subtotal</div>
                            {discountRate > 0 && (
                                <div className="footer-mini-note">Discount ({(discountRate * 100).toFixed(0)}%): -₱{discountAmount.toFixed(2)}</div>
                            )}
                            <div className="footer-total">Total: ₱{total.toFixed(2)}</div>
                        </div>

                        <div className="modern-cart-actions">
                            <button
                                className="btn-continue modern-btn-continue"
                                onClick={() => navigate('/catalog')}
                            >
                                Continue Shopping
                            </button>

                            <button
                                className="btn-checkout modern-btn-checkout"
                                onClick={handleCheckout}
                            >
                                Go to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
