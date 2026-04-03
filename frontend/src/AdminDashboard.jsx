import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, ArrowLeft, X, LogOut, User, Users, Package, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';
import UserManagement from './UserManagement';
import Analytics from './Analytics';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    // Tab state persistence
    const getInitialTab = () => localStorage.getItem('adminActiveTab') || 'dashboard';
    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [cancellationRequests, setCancellationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        petCareContent: '',
        category: '',
        price: '',
        stock: '',
        lowStockThreshold: 5,
        imageUrl: '',
        compatibility: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    // Persist tab on change
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    // Analytics state
    const [bestSellers, setBestSellers] = useState([]);
    const [analyticsPeriod, setAnalyticsPeriod] = useState('weekly');
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Fetch best sellers
    const fetchBestSellers = async (period = 'weekly') => {
        setAnalyticsLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/analytics/best-sellers?period=${period}`);
            setBestSellers(res.data.bestSellers || []);
        } catch (err) {
            setBestSellers([]);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Fetch on mount and when period changes
    useEffect(() => {
        if (activeTab === 'dashboard') fetchBestSellers(analyticsPeriod);
    }, [activeTab, analyticsPeriod]);

    // Fetch current background on tab open
    useEffect(() => {
        if (activeTab === 'website-settings') {
            axios.get('http://localhost:5000/api/background-settings/backgroundImage')
                .then(res => setWebsiteBgUrl(res.data.settingValue || ''))
                .catch(() => setWebsiteBgUrl(''));
        }
    }, [activeTab]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileEdit, setProfileEdit] = useState({ first_name: '', last_name: '', email: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordEdit, setPasswordEdit] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.user_id;
    const userRole = user?.role_name || 'Admin';
    const adminName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Admin';
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(localStorage.getItem('adminProfileImage') || user?.profile_image_url || '');

    // Website background state
    const [websiteBgFile, setWebsiteBgFile] = useState(null);
    const [websiteBgUrl, setWebsiteBgUrl] = useState('');
    const [websiteBgLoading, setWebsiteBgLoading] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            setProducts(response.data || []);
        } catch (error) {
            setProducts([]);
            Swal.fire('Error', 'Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/orders', { params: { userId } });
            setOrders(response.data || []);
        } catch (error) {
            setOrders([]);
            Swal.fire('Error', 'Failed to fetch orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStockProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/low-stock-products');
            setLowStockProducts(response.data || []);
        } catch (error) {
            setLowStockProducts([]);
            Swal.fire('Error', 'Failed to fetch low stock products', 'error');
        } finally {
            setLoading(false);
        }
    };


    // Load admin info into profile modal
    const openProfileModal = async () => {
        if (user && user.user_id) {
            setProfileLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/user-profile/${user.user_id}`);
                setProfileEdit({
                    first_name: res.data.first_name || '',
                    last_name: res.data.last_name || '',
                    email: res.data.email || ''
                });
                setProfileImagePreview(res.data.profile_image_url || res.data.id_image_url || localStorage.getItem('adminProfileImage') || '');
            } catch (err) {
                Swal.fire('Error', 'Failed to load profile info', 'error');
            } finally {
                setProfileLoading(false);
                setShowProfileModal(true);
            }
        } else {
            setShowProfileModal(true);
        }
    };

    // Save profile info
    const handleProfileSave = async (e) => {
        e.preventDefault();

        const confirmResult = await Swal.fire({
            title: 'Save changes?',
            text: 'Your profile updates will be applied.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2563eb'
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        setProfileLoading(true);
        try {
            let uploadedImageUrl = profileImagePreview;
            if (profileImageFile) {
                const imageForm = new FormData();
                imageForm.append('image', profileImageFile);
                const uploadRes = await axios.post('http://localhost:5000/api/upload-image', imageForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.imageUrl;
            }

            await axios.put(`http://localhost:5000/api/account/${user.user_id}`, {
                first_name: profileEdit.first_name,
                last_name: profileEdit.last_name,
                email: profileEdit.email,
                id_image_url: uploadedImageUrl
            });

            if (passwordEdit.oldPassword || passwordEdit.newPassword || passwordEdit.confirmPassword) {
                if (!passwordEdit.oldPassword || !passwordEdit.newPassword || !passwordEdit.confirmPassword) {
                    throw new Error('Please complete all password fields.');
                }
                if (passwordEdit.newPassword !== passwordEdit.confirmPassword) {
                    throw new Error('New passwords do not match');
                }
                setPasswordLoading(true);
                await axios.put(`http://localhost:5000/api/account/${user.user_id}/password`, {
                    oldPassword: passwordEdit.oldPassword,
                    newPassword: passwordEdit.newPassword
                });
                setPasswordLoading(false);
            }

            Swal.fire('Success', 'Profile updated!', 'success');
            setShowProfileModal(false);
            const updatedUser = { ...user, ...profileEdit, id_image_url: uploadedImageUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            localStorage.setItem('adminProfileImage', uploadedImageUrl || '');
            setProfileImageFile(null);
            setPasswordEdit({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch data when respective tab is active
        if (activeTab === 'products') {
            fetchProducts();
        } else if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'low-stock') {
            fetchLowStockProducts();
        } else if (activeTab === 'cancellations') {
            fetchCancellationRequests();
        }
    }, [activeTab]);


    const fetchCancellationRequests = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/cancellation-requests');
            setCancellationRequests(response.data);
        } catch (error) {
            console.error('Error fetching cancellation requests:', error);
            Swal.fire('Error', 'Failed to fetch cancellation requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            petCareContent: '',
            category: '',
            price: '',
            stock: '',
            lowStockThreshold: 5,
            imageUrl: '',
            compatibility: '',
            careDifficulty: 'beginner',
            lifespan: '',
            diet: ''
        });
        setImagePreview('');
        setEditingId(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formDataForUpload = new FormData();
            formDataForUpload.append('image', file);

            const res = await axios.post('http://localhost:5000/api/upload-image', formDataForUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
            setImagePreview(res.data.imageUrl);
            Swal.fire({
                title: 'Success!',
                text: 'Image uploaded successfully',
                icon: 'success',
                timer: 1500,
                confirmButtonColor: '#2563eb'
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to upload image',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.category || !formData.price || !formData.stock) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all required fields',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, {
                    name: formData.name,
                    description: formData.description,
                    petCareContent: formData.petCareContent,
                    category: formData.category,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                    imageUrl: formData.imageUrl,
                    compatibility: formData.compatibility,
                    careDifficulty: formData.careDifficulty,
                    lifespan: formData.lifespan,
                    diet: formData.diet,
                    userId
                });
                Swal.fire({
                    title: 'Success!',
                    text: 'Product updated successfully',
                    icon: 'success',
                    timer: 1500,
                    confirmButtonColor: '#2563eb'
                });
            } else {
                await axios.post('http://localhost:5000/api/products', {
                    name: formData.name,
                    description: formData.description,
                    petCareContent: formData.petCareContent,
                    category: formData.category,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                    imageUrl: formData.imageUrl,
                    compatibility: formData.compatibility,
                    careDifficulty: formData.careDifficulty,
                    lifespan: formData.lifespan,
                    diet: formData.diet,
                    userId
                });
                Swal.fire({
                    title: 'Success!',
                    text: 'Product created successfully',
                    icon: 'success',
                    timer: 1500,
                    confirmButtonColor: '#2563eb'
                });
            }

            resetForm();
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'Failed to save product',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            petCareContent: product.pet_care_content || '',
            category: product.category,
            price: product.price,
            stock: product.stock,
            lowStockThreshold: product.low_stock_threshold || 5,
            imageUrl: product.image_url,
            compatibility: product.compatibility || '',
            careDifficulty: product.care_difficulty || 'beginner',
            lifespan: product.lifespan || '',
            diet: product.diet || ''
        });
        setImagePreview(product.image_url);
        setEditingId(product.product_id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Confirm Delete',
            text: 'Are you sure you want to delete this product?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:5000/api/products/${id}`, {
                        data: { userId }
                    });
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Product has been deleted',
                        icon: 'success',
                        timer: 1500,
                        confirmButtonColor: '#2563eb'
                    });
                    fetchProducts();
                } catch (err) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to delete product',
                        icon: 'error',
                        confirmButtonColor: '#2563eb'
                    });
                }
            }
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
                status: newStatus
            });
            Swal.fire({
                title: 'Updated!',
                text: `Order status changed to ${newStatus}`,
                icon: 'success',
                timer: 1500,
                confirmButtonColor: '#2563eb'
            });
            fetchOrders();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to update order status',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const handleCancellationAction = async (requestId, action) => {
        try {
            await axios.put(`http://localhost:5000/api/cancellation-requests/${requestId}`, {
                status: action
            });
            Swal.fire({
                title: 'Updated!',
                text: `Cancellation request ${action}`,
                icon: 'success',
                timer: 1500,
                confirmButtonColor: '#2563eb'
            });
            fetchCancellationRequests();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: `Failed to ${action} cancellation request`,
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    if (loading && (activeTab === 'products' || activeTab === 'orders' || activeTab === 'low-stock' || activeTab === 'cancellations')) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="admin-header improved-admin-header">
                <div className="admin-header-flex">
                    <div className="admin-header-left">
                        <div className="admin-avatar-lg">
                            {profileImagePreview ? (
                                <img src={profileImagePreview} alt="Admin" className="admin-avatar-image" />
                            ) : (
                                <span>{(user && user.first_name) ? user.first_name[0].toUpperCase() : 'A'}</span>
                            )}
                        </div>
                        <div className="admin-header-name-role">
                            <div className="admin-header-name">{adminName || 'Admin'}</div>
                            <div className="admin-header-role">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</div>
                        </div>
                    </div>
                    <div className="admin-header-center">
                        <h1 className="admin-header-title">TongTong Ornamental Fish Pet Store</h1>
                    </div>
                    <div className="admin-header-right">
                        <div className="admin-header-icon-group">
                            <button className="admin-header-icon-btn" onClick={openProfileModal} title="Profile">
                                <User size={38} />
                                <div className="admin-header-icon-label">Profile</div>
                            </button>
                            <button className="admin-header-icon-btn" onClick={handleLogout} title="Logout">
                                <LogOut size={38} />
                                <div className="admin-header-icon-label">Logout</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-button" onClick={() => setShowProfileModal(false)}><X size={24} /></button>
                        </div>
                        {profileLoading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <form className="profile-form" onSubmit={handleProfileSave}>
                                <div className="form-group">
                                    <label>Profile Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setProfileImageFile(file || null);
                                            if (file) {
                                                setProfileImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    {profileImagePreview && (
                                        <img src={profileImagePreview} alt="Profile Preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="first_name" value={profileEdit.first_name} onChange={e => setProfileEdit({ ...profileEdit, first_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="last_name" value={profileEdit.last_name} onChange={e => setProfileEdit({ ...profileEdit, last_name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={profileEdit.email} onChange={e => setProfileEdit({ ...profileEdit, email: e.target.value })} required />
                                </div>

                                <div className="form-group">
                                    <label>Old Password</label>
                                    <div className="password-visibility-wrap">
                                        <input
                                            type={showOldPassword ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={passwordEdit.oldPassword}
                                            onChange={e => setPasswordEdit({ ...passwordEdit, oldPassword: e.target.value })}
                                        />
                                        <button type="button" className="password-visibility-btn" onClick={() => setShowOldPassword(v => !v)}>
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="password-visibility-wrap">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordEdit.newPassword}
                                            onChange={e => setPasswordEdit({ ...passwordEdit, newPassword: e.target.value })}
                                        />
                                        <button type="button" className="password-visibility-btn" onClick={() => setShowNewPassword(v => !v)}>
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <div className="password-visibility-wrap">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordEdit.confirmPassword}
                                            onChange={e => setPasswordEdit({ ...passwordEdit, confirmPassword: e.target.value })}
                                        />
                                        <button type="button" className="password-visibility-btn" onClick={() => setShowConfirmPassword(v => !v)}>
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={profileLoading || passwordLoading}>Save</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}



            {/* Tab Navigation */}
            <div className="tabs-container">
                <button className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                <button className={`tab-button ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
                <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Order Management</button>
                <button className={`tab-button ${activeTab === 'low-stock' ? 'active' : ''}`} onClick={() => setActiveTab('low-stock')}>Low Stock Alerts</button>
                <button className={`tab-button ${activeTab === 'cancellations' ? 'active' : ''}`} onClick={() => setActiveTab('cancellations')}>Cancellation Requests</button>
                <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics & Reports</button>
                <button className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>User Management</button>
            </div>

            {/* Modern Dashboard Cards (Figma-inspired) */}
            {activeTab === 'dashboard' && (
                <div className="admin-content">
                    <div className="dashboard-cards-grid">
                        <div className="dashboard-card" onClick={() => setActiveTab('website-settings')}>
                            <Settings size={48} />
                            <div className="dashboard-card-title">Manage Website</div>
                            <div className="dashboard-card-desc">Edit theme, background, and site settings</div>
                        </div>
                        <div className="dashboard-card" onClick={() => setActiveTab('low-stock')}>
                            <Package size={48} />
                            <div className="dashboard-card-title">Low Stock Alerts</div>
                            <div className="dashboard-card-desc">View products that need restocking</div>
                        </div>
                        <div className="dashboard-card" onClick={() => setActiveTab('user-logs')}>
                            <Users size={48} />
                            <div className="dashboard-card-title">User Logs</div>
                            <div className="dashboard-card-desc">View user activity logs</div>
                        </div>
                        <div className="dashboard-card" onClick={() => setActiveTab('order-logs')}>
                            <BarChart3 size={48} />
                            <div className="dashboard-card-title">Order Logs</div>
                            <div className="dashboard-card-desc">View order history logs</div>
                        </div>
                    </div>
                </div>
            )}




            {/* Products Tab */}
            {activeTab === 'products' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>🐟 Products</h2>
                        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>Add Product</button>
                    </div>
                    {/* Products Table */}
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">No products found</td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.product_id}>
                                            <td>{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>₱{product.price}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <button className="btn-icon edit" onClick={() => handleEdit(product)} title="Edit"><Edit2 size={16} /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(product.product_id)} title="Delete"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Add/Edit Product Modal */}
                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
                                    <button className="close-button" onClick={() => setShowModal(false)}><X size={24} /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="product-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Price</label>
                                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Stock</label>
                                            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Manage Website Tab */}
            {activeTab === 'website-settings' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>🌐 Manage Website</h2>
                    </div>
                    <div style={{maxWidth: 420, margin: '0 auto'}}>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!websiteBgFile) return;
                            setWebsiteBgLoading(true);
                            try {
                                const formData = new FormData();
                                formData.append('image', websiteBgFile);
                                const uploadRes = await axios.post('http://localhost:5000/api/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                const imageUrl = uploadRes.data.imageUrl;
                                await axios.put('http://localhost:5000/api/background-settings/backgroundImage', { settingValue: imageUrl });
                                Swal.fire('Success', 'Background updated!', 'success');
                                setWebsiteBgUrl(imageUrl);
                            } catch (err) {
                                Swal.fire('Error', 'Failed to update background', 'error');
                            } finally {
                                setWebsiteBgLoading(false);
                            }
                        }}>
                            <div className="form-group">
                                <label>Upload Background Image</label>
                                <input type="file" accept="image/*" onChange={e => setWebsiteBgFile(e.target.files[0])} />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary" disabled={websiteBgLoading}>Save Background</button>
                            </div>
                        </form>
                        {websiteBgUrl && (
                            <div style={{marginTop: 18, textAlign: 'center'}}>
                                <div style={{fontSize: 14, color: '#555'}}>Current Background:</div>
                                <img src={websiteBgUrl} alt="Current Background" style={{maxWidth: '100%', maxHeight: 180, borderRadius: 8, marginTop: 6}} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* User Logs Tab */}
            {activeTab === 'user-logs' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>📝 User Logs</h2>
                    </div>
                    <div style={{padding: '24px 0', textAlign: 'center', color: '#555'}}>User activity logs will be shown here.</div>
                </div>
            )}

            {/* Order Logs Tab */}
            {activeTab === 'order-logs' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>📦 Order Logs</h2>
                    </div>
                    <div style={{padding: '24px 0', textAlign: 'center', color: '#555'}}>Order history logs will be shown here.</div>
                </div>
            )}
            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>📋 Orders</h2>
                        <p>Manage customer orders and update their status</p>
                    </div>
                    {/* Orders Table */}
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.order_id}>
                                        <td>#{order.order_id}</td>
                                        <td>
                                            <div className="customer-info">
                                                <div className="customer-name">
                                                    {order.first_name} {order.last_name}
                                                </div>
                                                <div className="customer-email">{order.email}</div>
                                            </div>
                                        </td>
                                        <td>₱{order.total_amount.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge status-${order.status}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {orders.length === 0 && (
                        <div className="no-data">
                            <p>No orders found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Low Stock Tab */}
            {activeTab === 'low-stock' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>⚠️ Low Stock Alerts</h2>
                        <p>Products that need restocking</p>
                    </div>

                    {/* Low Stock Products Table */}
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Low Stock Threshold</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">No low stock products</td>
                                    </tr>
                                ) : (
                                    lowStockProducts.map(product => (
                                        <tr key={product.product_id}>
                                            <td className="product-name">{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>
                                                <span className="stock-badge low-stock">
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>{product.low_stock_threshold || 5}</td>
                                            <td>
                                                <span className="status-badge status-warning">
                                                    Low Stock
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <button
                                                    className="btn-icon edit"
                                                    onClick={() => handleEdit(product)}
                                                    title="Update stock"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cancellation Requests Tab */}
            {activeTab === 'cancellations' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>🚫 Cancellation Requests</h2>
                        <p>Review and approve/deny order cancellation requests</p>
                    </div>

                    {/* Cancellation Requests Table */}
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Request ID</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Request Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cancellationRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-state">No cancellation requests</td>
                                    </tr>
                                ) : (
                                    cancellationRequests.map(request => (
                                        <tr key={request.request_id}>
                                            <td>#{request.request_id}</td>
                                            <td>#{request.order_id}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="customer-name">
                                                        {request.first_name} {request.last_name}
                                                    </div>
                                                    <div className="customer-email">{request.email}</div>
                                                </div>
                                            </td>
                                            <td>{request.reason}</td>
                                            <td>
                                                <span className={`status-badge status-${request.status}`}>
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                            <td className="actions">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-icon approve"
                                                            onClick={() => handleCancellationAction(request.request_id, 'approved')}
                                                            title="Approve cancellation"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            className="btn-icon reject"
                                                            onClick={() => handleCancellationAction(request.request_id, 'denied')}
                                                            title="Deny cancellation"
                                                        >
                                                            ✗
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="admin-content">
                    <Analytics />
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="admin-content">
                    <UserManagement />
                </div>
            )}
        </div>
    );
}
export default AdminDashboard;
