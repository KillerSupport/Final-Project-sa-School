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

    // ✅ Safe user parsing
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

    // ================= LOGOUT =================
    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/logout');
        } catch {}
        localStorage.removeItem('user');
        navigate('/');
    };

    // ================= FETCH =================
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
            setProducts([]); // ✅ prevent crash
        } finally {
            setLoading(false);
        }
    };

    // ================= CART =================
    const handleAddToCart = async (product) => {
        if (!userId) {
            Swal.fire('Login Required', 'Please login first', 'warning');
            navigate('/');
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

    // ================= PROFILE =================
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
        setProfileEdit(prev => ({ ...prev, [name]: value }));
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

    // ================= PASSWORD =================
    const handlePasswordEditChange = (e) => {
        const { name, value } = e.target;
        setPasswordEdit(prev => ({ ...prev, [name]: value }));
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

    // ================= UI =================
    return (
        <div className="catalog-container">

            {/* HEADER */}
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

            {/* PRODUCTS */}
            <div className="product-grid">
                {loading ? (
                    <p>Loading...</p>
                ) : products.length === 0 ? (
                    <p>No products found</p>
                ) : (
                    products.map(product => (
                        <div key={product.product_id} className="product-card">
                            <img
                                src={product.image_url || 'https://via.placeholder.com/200'}
                                alt={product.name}
                                onClick={() => navigate(`/product/${product.product_id}`)}
                            />

                            <h3>{product.name}</h3>
                            <p>₱{Number(product.price || 0).toFixed(2)}</p>
                            <p>Stock: {product.stock}</p>

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
                                <>
                                    <button onClick={() => navigate(`/product/${product.product_id}`)}>View</button>
                                    <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* PROFILE MODAL */}
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                        <h3>Edit Profile</h3>

                        {profileLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <form onSubmit={handleProfileSave}>
                                    <input name="first_name" value={profileEdit.first_name || ''} onChange={handleProfileEditChange} placeholder="First Name" />
                                    <input name="last_name" value={profileEdit.last_name || ''} onChange={handleProfileEditChange} placeholder="Last Name" />
                                    <input name="email" value={profileEdit.email || ''} onChange={handleProfileEditChange} placeholder="Email" />

                                    <button type="submit">Save</button>
                                </form>

                                <h4>Change Password</h4>

                                <form onSubmit={handlePasswordSave}>
                                    <input type="password" name="oldPassword" placeholder="Old Password" onChange={handlePasswordEditChange} />
                                    <input type="password" name="newPassword" placeholder="New Password" onChange={handlePasswordEditChange} />
                                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handlePasswordEditChange} />

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