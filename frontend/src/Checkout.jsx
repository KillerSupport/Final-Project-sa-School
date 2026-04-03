import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CreditCard, MapPin, ArrowLeft } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, subtotal, discountedSubtotal, discountAmount, discountRate, shippingFee, tax, total } = location.state || {};
    
    const user = JSON.parse(localStorage.getItem('user'));
    const [formData, setFormData] = useState({
        firstName: user?.first_name || '',
        lastName: user?.last_name || '',
        email: user?.email || '',
        phone: user?.contact_number || '',
        address: user?.address || '',
        city: '',
        postalCode: '',
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });
    const [loading, setLoading] = useState(false);

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="checkout-container">
                <div className="error-message">
                    <p>No items to checkout. <button onClick={() => navigate('/catalog')}>Go to catalog</button></p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all required fields',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a valid email',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return false;
        }

        // Validate card details
        if (!formData.cardNumber || formData.cardNumber.length < 13) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a valid card number',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return false;
        }

        if (!formData.cvv || formData.cvv.length < 3) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a valid CVV',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/orders', {
                userId: user.user_id,
                items: cartItems,
                totalAmount: total,
                shippingAddress: `${formData.address}, ${formData.city} ${formData.postalCode}`
            });

            if (response.data.orderId) {
                Swal.fire({
                    title: 'Order Successful!',
                    text: `Order #${response.data.orderId} has been placed`,
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                }).then(() => {
                    navigate('/order-history');
                });
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'Failed to place order',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <button 
                className="back-button"
                onClick={() => navigate('/cart')}
            >
                <ArrowLeft size={20} />
                Back to Cart
            </button>

            <h1 className="page-title">Checkout</h1>

            <div className="checkout-content">
                {/* Form Section */}
                <form className="checkout-form" onSubmit={handleSubmit}>
                    {/* Shipping Information */}
                    <section className="form-section">
                        <h2><MapPin size={20} /> Shipping Information</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input 
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input 
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group full">
                            <label>Address *</label>
                            <input 
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City *</label>
                                <input 
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Postal Code</label>
                                <input 
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Payment Information */}
                    <section className="form-section">
                        <h2><CreditCard size={20} /> Payment Information</h2>
                        
                        <div className="form-group full">
                            <label>Cardholder Name *</label>
                            <input 
                                type="text"
                                name="cardholderName"
                                value={formData.cardholderName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group full">
                            <label>Card Number *</label>
                            <input 
                                type="text"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={formData.cardNumber}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\s/g, '');
                                    value = value.replace(/(\d{4})/g, '$1 ').trim();
                                    setFormData(prev => ({ ...prev, cardNumber: value }));
                                }}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Expiry Date *</label>
                                <div className="expiry-inputs">
                                    <input 
                                        type="text"
                                        name="expiryMonth"
                                        placeholder="MM"
                                        maxLength="2"
                                        value={formData.expiryMonth}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <span>/</span>
                                    <input 
                                        type="text"
                                        name="expiryYear"
                                        placeholder="YY"
                                        maxLength="2"
                                        value={formData.expiryYear}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>CVV *</label>
                                <input 
                                    type="text"
                                    name="cvv"
                                    placeholder="123"
                                    maxLength="4"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <button 
                        type="submit" 
                        className="btn-place-order"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </form>

                {/* Order Summary */}
                <aside className="order-summary">
                    <h2>Order Summary</h2>

                    <div className="summary-items">
                        {cartItems.map((item, idx) => (
                            <div key={idx} className="summary-item">
                                <div className="item-info">
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-qty">Qty: {item.quantity}</span>
                                </div>
                                <span className="item-total">₱{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="summary-breakdown">
                        <div className="breakdown-row">
                            <span>Subtotal:</span>
                            <span>₱{subtotal.toFixed(2)}</span>
                        </div>
                        {discountRate > 0 && (
                            <div className="breakdown-row discount">
                                <span>Discount ({(discountRate * 100).toFixed(0)}%):</span>
                                <span>-₱{discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="breakdown-row">
                            <span>Discounted Subtotal:</span>
                            <span>₱{discountedSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="breakdown-row">
                            <span>Shipping:</span>
                            <span>{shippingFee === 0 ? 'FREE' : `₱${shippingFee.toFixed(2)}`}</span>
                        </div>
                        <div className="breakdown-row">
                            <span>Tax:</span>
                            <span>₱{tax.toFixed(2)}</span>
                        </div>
                        <div className="breakdown-row total">
                            <span>Total:</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Checkout;
