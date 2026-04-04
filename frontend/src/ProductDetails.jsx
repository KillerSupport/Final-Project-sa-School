import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    
    const userId = JSON.parse(localStorage.getItem('user'))?.user_id || null;

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Product not found',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            navigate('/catalog');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!userId) {
            Swal.fire({
                title: 'Please Login',
                text: 'You need to login to add items to cart',
                icon: 'warning',
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#2563eb'
            }).then(() => navigate('/'));
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/cart', {
                userId,
                productId: product.product_id,
                quantity
            });

            Swal.fire({
                title: 'Success!',
                text: `${quantity} × ${product.name} added to cart`,
                icon: 'success',
                confirmButtonColor: '#2563eb',
                timer: 1500
            });

            setQuantity(1);
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to add to cart',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (!product) {
        return <div className="loading-container">Product not found</div>;
    }

    const isDiscontinued = Boolean(product.is_deleted);
    const isOutOfStock = !isDiscontinued && Number(product.stock || 0) <= 0;
    const isUnavailable = isDiscontinued || isOutOfStock;
    const availabilityLabel = isDiscontinued ? 'Discontinued' : isOutOfStock ? 'Out of stock' : `${product.stock} in stock`;

    return (
        <div className="product-details-container">
            <button 
                className="back-button"
                onClick={() => navigate('/catalog')}
            >
                <ArrowLeft size={20} />
                Back to Catalog
            </button>

            <div className="details-content">
                <div className="image-section">
                    <img 
                        src={product.image_url || 'https://via.placeholder.com/500'} 
                        alt={product.name}
                        className={`product-main-image ${isUnavailable ? 'is-unavailable' : ''}`}
                    />
                    {isUnavailable && (
                        <div className={`out-of-stock-overlay ${isDiscontinued ? 'discontinued' : ''}`}>
                            {availabilityLabel.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="info-section">
                    <div className="category-badge">{product.category}</div>
                    
                    <h1>{product.name}</h1>
                    
                    <div className="rating">
                        <span className="stars">★★★★★ (0 reviews)</span>
                    </div>

                    <div className="price-section">
                        <span className="price">₱{product.price}</span>
                        <span className="stock-info">
                            {!isUnavailable ? (
                                <span className="in-stock">✓ {product.stock} in stock</span>
                            ) : (
                                <span className={isDiscontinued ? 'discontinued' : 'out-of-stock'}>{availabilityLabel}</span>
                            )}
                        </span>
                    </div>

                    <div className="description-section">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    {product.pet_care_content && !isDiscontinued && (
                        <div className="pet-care-section">
                            <h3>🐠 Pet Care Guide</h3>
                            <div className="pet-care-content">
                                {product.pet_care_content.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="specifications">
                        <h3>Specifications</h3>
                        <ul>
                            <li><strong>Type:</strong> Pet Fish</li>
                            <li><strong>Category:</strong> {product.category}</li>
                            <li><strong>Availability:</strong> {availabilityLabel}</li>
                        </ul>
                    </div>

                    <div className="purchase-section">
                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <div className="quantity-controls">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={18} />
                                </button>
                                <input 
                                    type="number" 
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max={isUnavailable ? 1 : product.stock}
                                    disabled={isUnavailable}
                                />
                                <button 
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={isUnavailable || quantity >= product.stock}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <button 
                            className="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={isUnavailable}
                        >
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                    </div>

                    <div className="additional-info">
                        <div className="info-item">
                            <span className="label">🚚 Free Shipping</span>
                            <span className="value">On orders ₱1000 and above</span>
                        </div>
                        <div className="info-item">
                            <span className="label">🔄 Easy Returns</span>
                            <span className="value">30-day return policy</span>
                        </div>
                        <div className="info-item">
                            <span className="label">🏪 Store Payment</span>
                            <span className="value">Pay and claim your order at the store</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
