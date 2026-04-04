import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ProductCatalog.css';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.user_id || null;
    const userRole = user?.role_name || null;

    const [profileEdit, setProfileEdit] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        birthday: '',
        gender: '',
        contact_number: '',
        address: '',
        email: ''
    });

    const [passwordEdit, setPasswordEdit] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/logout');
        } catch {}
        localStorage.removeItem('user');
        navigate('/');
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, selectedCategory, minPrice, maxPrice, sortBy, sortOrder, inStockOnly]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search,
                category: selectedCategory,
                minPrice,
                maxPrice,
                sortBy,
                sortOrder,
                inStock: inStockOnly ? 'true' : undefined
            };

            const res = await axios.get('http://localhost:5000/api/products/search', { params });
            setProducts(res.data || []);
        } catch (err) {
            console.error(err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        if (!userId) {
            Swal.fire('Login Required', 'Please login first', 'warning');
            navigate('/');
            return;
        }

        if (product.is_deleted || Number(product.stock || 0) <= 0) {
            Swal.fire('Unavailable', 'This product is not available for purchase.', 'info');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/cart', {
                userId,
                productId: product.product_id,
                quantity: 1
            });

            Swal.fire('Success', `${product.name} added to cart`, 'success');
        } catch {
            Swal.fire('Error', 'Failed to add to cart', 'error');
        }
    };

    const openProfileModal = async () => {
        if (!userId) return;

        setShowProfileModal(true);
        setProfileLoading(true);

        try {
            const res = await axios.get(`http://localhost:5000/api/user-profile/${userId}`);
            setProfileEdit(res.data || {});
        } catch {
            Swal.fire('Error', 'Failed to load profile', 'error');
            setShowProfileModal(false);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleProfileEditChange = (e) => {
        const { name, value } = e.target;
        setProfileEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileLoading(true);

        try {
            await axios.put(`http://localhost:5000/api/account/${userId}`, profileEdit);
            Swal.fire('Success', 'Profile updated', 'success');
            setShowProfileModal(false);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordEditChange = (e) => {
        const { name, value } = e.target;
        setPasswordEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();

        if (passwordEdit.newPassword !== passwordEdit.confirmPassword) {
            Swal.fire('Error', 'Passwords do not match', 'error');
            return;
        }

        setPasswordLoading(true);

        try {
            await axios.put(`http://localhost:5000/api/account/${userId}/password`, {
                oldPassword: passwordEdit.oldPassword,
                newPassword: passwordEdit.newPassword
            });

            Swal.fire('Success', 'Password changed', 'success');
            setShowProfileModal(false);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="catalog-container">
            <div className="catalog-header">
                <h1>TongTong Fish Culture</h1>

                <div>
                    <button onClick={openProfileModal}>👤</button>

                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => {
                                    localStorage.setItem('adminActiveTab', 'products');
                                    navigate('/admin-dashboard');
                                }}
                            >
                                ➕
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('adminActiveTab', 'dashboard');
                                    navigate('/admin-dashboard');
                                }}
                            >
                                🛠️
                            </button>
                        </>
                    )}

                    {userRole === 'client' && (
                        <>
                            <button onClick={() => navigate('/cart')}>🛒</button>
                            <button onClick={() => navigate('/order-history')}>📦</button>
                        </>
                    )}

                    <button onClick={handleLogout}>🚪</button>
                </div>
            </div>

            <div className="product-grid">
                {loading ? (
                    <p>Loading...</p>
                ) : products.length === 0 ? (
                    <p>No products found</p>
                ) : (
                    products.map((product) => {
                        const isDiscontinued = Boolean(product.is_deleted);
                        const isOutOfStock = !isDiscontinued && Number(product.stock || 0) <= 0;
                        const cardClassName = [
                            'product-card',
                            isDiscontinued ? 'discontinued' : '',
                            isOutOfStock ? 'out-of-stock' : ''
                        ]
                            .filter(Boolean)
                            .join(' ');
                        const stockLabel = isDiscontinued
                            ? 'Discontinued'
                            : isOutOfStock
                              ? 'Out of stock'
                              : `${product.stock} in stock`;
                        const badgeClassName = isDiscontinued
                            ? 'deleted'
                            : isOutOfStock
                              ? 'empty'
                              : 'available';

                        return (
                            <div key={product.product_id} className={cardClassName}>
                                <div className="product-image" onClick={() => navigate(`/product/${product.product_id}`)}>
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/200'}
                                        alt={product.name}
                                    />
                                    <span className={`stock-badge ${badgeClassName}`}>{stockLabel}</span>
                                </div>

                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <div className="category">{product.category}</div>
                                    <div className="description">
                                        {isDiscontinued
                                            ? 'This product has been discontinued.'
                                            : product.description || 'No description available.'}
                                    </div>

                                    <div className="product-footer">
                                        <div className="price">₱{Number(product.price || 0).toFixed(2)}</div>
                                        <div className="stock-info">
                                            <span className={`stock-badge ${badgeClassName}`}>{stockLabel}</span>
                                        </div>
                                    </div>

                                    <div className="product-actions">
                                        <button
                                            className="btn-details"
                                            onClick={() => navigate(`/product/${product.product_id}`)}
                                        >
                                            View
                                        </button>

                                        {userRole === 'admin' ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem('adminActiveTab', 'products');
                                                        navigate('/admin-dashboard');
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem('adminActiveTab', 'products');
                                                        navigate('/admin-dashboard');
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="btn-cart"
                                                onClick={() => handleAddToCart(product)}
                                                disabled={isDiscontinued || isOutOfStock}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Profile</h3>

                        {profileLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <form onSubmit={handleProfileSave}>
                                    <input
                                        name="first_name"
                                        value={profileEdit.first_name || ''}
                                        onChange={handleProfileEditChange}
                                        placeholder="First Name"
                                    />
                                    <input
                                        name="last_name"
                                        value={profileEdit.last_name || ''}
                                        onChange={handleProfileEditChange}
                                        placeholder="Last Name"
                                    />
                                    <input
                                        name="email"
                                        value={profileEdit.email || ''}
                                        onChange={handleProfileEditChange}
                                        placeholder="Email"
                                    />

                                    <button type="submit">Save</button>
                                </form>

                                <h4>Change Password</h4>

                                <form onSubmit={handlePasswordSave}>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        placeholder="Old Password"
                                        onChange={handlePasswordEditChange}
                                    />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="New Password"
                                        onChange={handlePasswordEditChange}
                                    />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        onChange={handlePasswordEditChange}
                                    />

                                    <button type="submit">
                                        {passwordLoading ? 'Saving...' : 'Change Password'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
