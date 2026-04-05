import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, ArrowLeft, X, LogOut, User, Users, Package, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';
import UserManagement from './UserManagement';
import Analytics from './Analytics';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const productCategoryOptions = ['Salt Water Fish', 'Fresh Water Fish', 'Supplies'];
    const getInitialTab = () => {
        const saved = localStorage.getItem('adminActiveTab') || 'dashboard';
        return saved === 'deleted-products' ? 'products' : saved;
    };
    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [productsView, setProductsView] = useState('active');
    const [products, setProducts] = useState([]);
    const [deletedProducts, setDeletedProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productSortOrder, setProductSortOrder] = useState('newest');
    const [deletedProductSearch, setDeletedProductSearch] = useState('');
    const [deletedProductSortOrder, setDeletedProductSortOrder] = useState('a-z');
    const [lowStockSearch, setLowStockSearch] = useState('');
    const [orders, setOrders] = useState([]);
    const [userLogs, setUserLogs] = useState([]);
    const [orderLogs, setOrderLogs] = useState([]);
    const [userLogSearch, setUserLogSearch] = useState('');
    const [orderLogSearch, setOrderLogSearch] = useState('');
    const [orderLogStatusFilter, setOrderLogStatusFilter] = useState('all');
    const [logsLoading, setLogsLoading] = useState(false);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [cancellationRequests, setCancellationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [restoreMode, setRestoreMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        lowStockThreshold: 5,
        imageUrl: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    const [bestSellers, setBestSellers] = useState([]);
    const [analyticsPeriod, setAnalyticsPeriod] = useState('weekly');
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'dashboard') fetchBestSellers(analyticsPeriod);
    }, [activeTab, analyticsPeriod]);

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
    const profileImageStorageKey = userId ? `adminProfileImage:${userId}` : 'adminProfileImage';
    const [profileImagePreview, setProfileImagePreview] = useState(localStorage.getItem(profileImageStorageKey) || user?.profile_image_url || user?.id_image_url || '');

    const [websiteBgFile, setWebsiteBgFile] = useState(null);
    const [websiteBgUrl, setWebsiteBgUrl] = useState('');
    const [websiteBgLoading, setWebsiteBgLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/logout', {
                userId,
                sessionLogId: localStorage.getItem('sessionLogId'),
                sessionToken: localStorage.getItem('sessionToken')
            });
        } catch (error) {
            console.error('Logout log error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionLogId');
        localStorage.removeItem('sessionToken');
        navigate('/');
    };

    const displayProducts = useMemo(() => {
        const grouped = new Map();

        (products || []).forEach((product) => {
            const key = `${String(product.name || '').trim().toLowerCase()}|${String(product.category || '').trim().toLowerCase()}|${Number(product.price || 0).toFixed(2)}`;
            if (!grouped.has(key)) {
                grouped.set(key, { ...product, stock: Number(product.stock || 0) });
            } else {
                const existing = grouped.get(key);
                existing.stock = Number(existing.stock || 0) + Number(product.stock || 0);
                if (!existing.image_url && product.image_url) {
                    existing.image_url = product.image_url;
                }
            }
        });

        return Array.from(grouped.values());
    }, [products]);

    const visibleProducts = useMemo(() => {
        const searchTerm = productSearch.trim().toLowerCase();
        const filtered = displayProducts.filter((product) => {
            if (!searchTerm) {
                return true;
            }

            return (
                String(product.name || '').toLowerCase().includes(searchTerm) ||
                String(product.category || '').toLowerCase().includes(searchTerm)
            );
        });

        return [...filtered].sort((left, right) => {
            if (productSortOrder === 'a-z') {
                return String(left.name || '').localeCompare(String(right.name || ''));
            }

            if (productSortOrder === 'z-a') {
                return String(right.name || '').localeCompare(String(left.name || ''));
            }

            const leftTime = new Date(left.created_at || 0).getTime();
            const rightTime = new Date(right.created_at || 0).getTime();

            if (productSortOrder === 'oldest') {
                return leftTime - rightTime;
            }

            return rightTime - leftTime;
        });
    }, [displayProducts, productSearch, productSortOrder]);

    const visibleDeletedProducts = useMemo(() => {
        const searchTerm = deletedProductSearch.trim().toLowerCase();
        const filtered = deletedProducts.filter((product) => {
            if (!searchTerm) {
                return true;
            }

            return (
                String(product.name || '').toLowerCase().includes(searchTerm) ||
                String(product.category || '').toLowerCase().includes(searchTerm)
            );
        });

        return [...filtered].sort((left, right) => {
            if (deletedProductSortOrder === 'z-a') {
                return String(right.name || '').localeCompare(String(left.name || ''));
            }

            return String(left.name || '').localeCompare(String(right.name || ''));
        });
    }, [deletedProducts, deletedProductSearch, deletedProductSortOrder]);

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

    const fetchDeletedProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/deleted-products', {
                params: { userId }
            });
            setDeletedProducts(response.data || []);
        } catch (error) {
            setDeletedProducts([]);
            Swal.fire('Error', 'Failed to fetch deleted products', 'error');
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

    const fetchUserLogs = async () => {
        setLogsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user-logs', {
                params: { userId }
            });
            setUserLogs(response.data?.logs || []);
        } catch (error) {
            setUserLogs([]);
            Swal.fire('Error', 'Failed to fetch user logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchOrderLogs = async () => {
        setLogsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/admin/order-logs', {
                params: { userId }
            });
            setOrderLogs(response.data?.logs || []);
        } catch (error) {
            setOrderLogs([]);
            Swal.fire('Error', 'Failed to fetch order logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    };

    const fetchLowStockProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            const sortedByStock = (response.data || [])
                .filter((product) => Number(product.is_deleted || 0) === 0)
                .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
            setLowStockProducts(sortedByStock);
        } catch (error) {
            setLowStockProducts([]);
            Swal.fire('Error', 'Failed to fetch low stock products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const lowStockAlertCount = useMemo(() => {
        return (lowStockProducts || []).filter(
            (product) => Number(product.stock || 0) <= 20
        ).length;
    }, [lowStockProducts]);

    const visibleLowStockProducts = useMemo(() => {
        const searchTerm = lowStockSearch.trim().toLowerCase();

        const filtered = (lowStockProducts || []).filter((product) => {
            if (Number(product.stock || 0) > 20) {
                return false;
            }

            if (!searchTerm) {
                return true;
            }

            return (
                String(product.name || '').toLowerCase().includes(searchTerm) ||
                String(product.category || '').toLowerCase().includes(searchTerm)
            );
        });

        return [...filtered].sort((left, right) => {
            const stockComparison = Number(left.stock || 0) - Number(right.stock || 0);
            if (stockComparison !== 0) {
                return stockComparison;
            }

            return String(left.name || '').localeCompare(String(right.name || ''));
        });
    }, [lowStockProducts, lowStockSearch]);

    const visibleUserLogs = useMemo(() => {
        const searchTerm = userLogSearch.trim().toLowerCase();

        if (!searchTerm) {
            return userLogs;
        }

        return (userLogs || []).filter((log) => {
            const loginAt = log.login_at ? new Date(log.login_at) : null;
            const logoutAt = log.logout_at ? new Date(log.logout_at) : null;

            const searchable = [
                String(log.full_name || ''),
                String(log.email || ''),
                String(log.role_name || ''),
                loginAt ? loginAt.toLocaleDateString() : '',
                loginAt ? loginAt.toLocaleTimeString() : '',
                loginAt ? loginAt.toLocaleString() : '',
                logoutAt ? logoutAt.toLocaleDateString() : '',
                logoutAt ? logoutAt.toLocaleTimeString() : '',
                logoutAt ? logoutAt.toLocaleString() : '',
                loginAt ? loginAt.toISOString() : '',
                logoutAt ? logoutAt.toISOString() : ''
            ].join(' ').toLowerCase();

            return searchable.includes(searchTerm);
        });
    }, [userLogs, userLogSearch]);

    const visibleOrderLogs = useMemo(() => {
        const searchTerm = orderLogSearch.trim().toLowerCase();

        return (orderLogs || []).filter((log) => {
            const status = String(log.final_status || 'Paid').toLowerCase();
            if (orderLogStatusFilter !== 'all' && status !== orderLogStatusFilter) {
                return false;
            }

            if (!searchTerm) {
                return true;
            }

            const createdAt = log.order_created_at ? new Date(log.order_created_at) : null;
            const updatedAt = log.order_updated_at ? new Date(log.order_updated_at) : null;

            const searchable = [
                String(log.order_id || ''),
                String(log.customer_name || ''),
                String(log.customer_email || ''),
                String(log.role_name || ''),
                String(log.final_status || 'Paid'),
                createdAt ? createdAt.toLocaleDateString() : '',
                createdAt ? createdAt.toLocaleTimeString() : '',
                createdAt ? createdAt.toLocaleString() : '',
                updatedAt ? updatedAt.toLocaleDateString() : '',
                updatedAt ? updatedAt.toLocaleTimeString() : '',
                updatedAt ? updatedAt.toLocaleString() : '',
                createdAt ? createdAt.toISOString() : '',
                updatedAt ? updatedAt.toISOString() : ''
            ].join(' ').toLowerCase();

            return searchable.includes(searchTerm);
        });
    }, [orderLogs, orderLogSearch, orderLogStatusFilter]);

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
                setProfileImagePreview(res.data.profile_image_url || res.data.id_image_url || localStorage.getItem(profileImageStorageKey) || '');
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
            localStorage.setItem(profileImageStorageKey, uploadedImageUrl || '');
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
        } else if (activeTab === 'user-logs') {
            fetchUserLogs();
        } else if (activeTab === 'order-logs') {
            fetchOrderLogs();
        }
    }, [activeTab]);

    useEffect(() => {
        fetchLowStockProducts();
    }, []);

    useEffect(() => {
        if (activeTab === 'products' && productsView === 'deleted') {
            fetchDeletedProducts();
        }
    }, [activeTab, productsView]);


    const fetchCancellationRequests = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/cancellation-requests?userId=${userId}`);
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

    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^\d.]/g, '');
        const parts = value.split('.');
        const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : value;
        setFormData(prev => ({ ...prev, price: normalized }));
    };

    const handleStockChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, stock: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            stock: '',
            lowStockThreshold: 5,
            imageUrl: '',
        });
        setImagePreview('');
        setEditingId(null);
        setRestoreMode(false);
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
            if (restoreMode && editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}/restore`, {
                    userId,
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                    imageUrl: formData.imageUrl
                });
                Swal.fire({
                    title: 'Success!',
                    text: 'Product restored successfully',
                    icon: 'success',
                    timer: 1500,
                    confirmButtonColor: '#2563eb'
                });
            } else if (editingId) {
                await axios.put(`http://localhost:5000/api/products/${editingId}`, {
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                    imageUrl: formData.imageUrl,
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
                    category: formData.category,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
                    imageUrl: formData.imageUrl,
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
            fetchDeletedProducts();
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
            category: product.category,
            price: product.price,
            stock: product.stock,
            lowStockThreshold: product.low_stock_threshold || 5,
            imageUrl: product.image_url,
        });
        setImagePreview(product.image_url);
        setEditingId(product.product_id);
        setRestoreMode(false);
        setShowModal(true);
    };

    const openRestoreEditModal = (product) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            price: product.price,
            stock: product.stock,
            lowStockThreshold: product.low_stock_threshold || 5,
            imageUrl: product.image_url || ''
        });
        setImagePreview(product.image_url || '');
        setEditingId(product.product_id);
        setRestoreMode(true);
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
                            <button className="admin-header-icon-btn" onClick={() => navigate('/worker-dashboard')} title="Worker Tools">
                                <Package size={38} />
                                <div className="admin-header-icon-label">Worker Tools</div>
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
                <button className={`tab-button tab-button-with-badge ${activeTab === 'low-stock' ? 'active' : ''}`} onClick={() => setActiveTab('low-stock')}>
                    Low Stock Alerts
                    {lowStockAlertCount > 0 && (
                        <span className="tab-alert-badge">{lowStockAlertCount > 99 ? '99+' : lowStockAlertCount}</span>
                    )}
                </button>
                <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Order Management</button>
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
                        <h2>{productsView === 'active' ? '🐟 Products' : '🗑️ Deleted Products'}</h2>
                        <div className="products-header-actions">
                            {productsView === 'active' && (
                                <>
                                    <div className="products-filter-bar">
                                        <input
                                            type="text"
                                            className="products-search-input"
                                            placeholder="Search name or category"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                        <select
                                            className="products-sort-select"
                                            value={productSortOrder}
                                            onChange={(e) => setProductSortOrder(e.target.value)}
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                            <option value="a-z">A-Z</option>
                                            <option value="z-a">Z-A</option>
                                        </select>
                                    </div>
                                    <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>Add Product</button>
                                </>
                            )}
                            {productsView === 'deleted' && (
                                <div className="products-filter-bar">
                                    <input
                                        type="text"
                                        className="products-search-input"
                                        placeholder="Search name or category"
                                        value={deletedProductSearch}
                                        onChange={(e) => setDeletedProductSearch(e.target.value)}
                                    />
                                    <select
                                        className="products-sort-select"
                                        value={deletedProductSortOrder}
                                        onChange={(e) => setDeletedProductSortOrder(e.target.value)}
                                    >
                                        <option value="a-z">A-Z</option>
                                        <option value="z-a">Z-A</option>
                                    </select>
                                </div>
                            )}
                            <div className="products-view-tabs">
                                <button
                                    type="button"
                                    className={`products-view-tab ${productsView === 'active' ? 'active' : ''}`}
                                    onClick={() => setProductsView('active')}
                                >
                                    Products
                                </button>
                                <button
                                    type="button"
                                    className={`products-view-tab ${productsView === 'deleted' ? 'active' : ''}`}
                                    onClick={() => setProductsView('deleted')}
                                >
                                    Deleted Products
                                </button>
                            </div>
                        </div>
                    </div>
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
                                {(productsView === 'active' ? visibleProducts.length : visibleDeletedProducts.length) === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            {productsView === 'active' ? 'No matching products found' : 'No matching deleted products found'}
                                        </td>
                                    </tr>
                                ) : (
                                    (productsView === 'active' ? visibleProducts : visibleDeletedProducts).map(product => (
                                        <tr key={product.product_id}>
                                            <td>
                                                <div className="product-cell">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="product-thumb"
                                                        />
                                                    ) : (
                                                        <div className="product-thumb product-thumb-fallback">No Img</div>
                                                    )}
                                                    <span className="product-name">{product.name}</span>
                                                </div>
                                            </td>
                                            <td>{product.category}</td>
                                            <td>₱{Number(product.price).toFixed(2)}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                {productsView === 'active' ? (
                                                    <>
                                                        <button className="btn-icon edit" onClick={() => handleEdit(product)} title="Edit"><Edit2 size={16} /></button>
                                                        <button className="btn-icon delete" onClick={() => handleDelete(product.product_id)} title="Delete"><Trash2 size={16} /></button>
                                                    </>
                                                ) : (
                                                    <button className="btn-restore" onClick={() => openRestoreEditModal(product)}>
                                                        Edit & Restore
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {showModal && (
                        <div className="modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>{restoreMode ? 'Edit & Restore Product' : editingId ? 'Edit Product' : 'Add Product'}</h3>
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
                                            <select name="category" value={formData.category} onChange={handleInputChange} required>
                                                <option value="" disabled>Select category</option>
                                                {productCategoryOptions.map((categoryOption) => (
                                                    <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
                                                ))}
                                                {formData.category && !productCategoryOptions.includes(formData.category) && (
                                                    <option value={formData.category}>{formData.category}</option>
                                                )}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Price</label>
                                            <div className="money-input-wrap">
                                                <span className="money-prefix">₱</span>
                                                <input type="text" inputMode="decimal" name="price" value={formData.price} onChange={handlePriceChange} required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Stock</label>
                                            <input type="text" inputMode="numeric" name="stock" value={formData.stock} onChange={handleStockChange} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Product Image</label>
                                        <input type="file" accept="image/*" className="file-input" onChange={handleImageUpload} disabled={uploading} />
                                        {uploading && <div className="upload-status">Uploading image...</div>}
                                    </div>
                                    <div className="form-group">
                                        <label>Image URL</label>
                                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="Image URL will appear here after upload" />
                                    </div>
                                    {(imagePreview || formData.imageUrl) && (
                                        <div className="image-preview-container">
                                            <label>Preview</label>
                                            <img className="image-preview" src={imagePreview || formData.imageUrl} alt="Product preview" />
                                        </div>
                                    )}
                                    <div className="modal-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary">{restoreMode ? 'Restore Product' : editingId ? 'Update' : 'Add'}</button>
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
                        <div className="products-filter-bar" style={{ marginTop: 12 }}>
                            <input
                                type="text"
                                className="products-search-input"
                                placeholder="Search user, role, login date/time, or logout date/time"
                                value={userLogSearch}
                                onChange={(e) => setUserLogSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    {logsLoading ? (
                        <div className="logs-empty">Loading user logs...</div>
                    ) : visibleUserLogs.length === 0 ? (
                        <div className="logs-empty">No user logs found.</div>
                    ) : (
                        <div className="logs-table-container">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Login Date</th>
                                        <th>Login Time</th>
                                        <th>Logout Date</th>
                                        <th>Logout Time</th>
                                        <th>Login Success</th>
                                        <th>IP Address</th>
                                        <th>User Agent</th>
                                        <th>Session Token</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleUserLogs.map((log) => {
                                        const loginAt = log.login_at ? new Date(log.login_at) : null;
                                        const logoutAt = log.logout_at ? new Date(log.logout_at) : null;
                                        return (
                                            <tr key={`${log.user_id}-${log.login_at || ''}-${log.logout_at || ''}`}>
                                                <td>
                                                    <div className="customer-info">
                                                        <div className="customer-name">{log.full_name || 'N/A'}</div>
                                                        <div className="customer-email">{log.email}</div>
                                                    </div>
                                                </td>
                                                <td>{String(log.role_name || '').toUpperCase()}</td>
                                                <td>{loginAt ? loginAt.toLocaleDateString() : '-'}</td>
                                                <td>{loginAt ? loginAt.toLocaleTimeString() : '-'}</td>
                                                <td>{logoutAt ? logoutAt.toLocaleDateString() : '-'}</td>
                                                <td>{logoutAt ? logoutAt.toLocaleTimeString() : 'Active Session'}</td>
                                                <td>{Number(log.login_success) === 1 ? 'Yes' : 'No'}</td>
                                                <td>{log.ip_address || '-'}</td>
                                                <td title={log.user_agent || ''} style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.user_agent || '-'}</td>
                                                <td title={log.session_token || ''} style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.session_token || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Order Logs Tab */}
            {activeTab === 'order-logs' && (
                <div className="admin-content">
                    <div className="section-header">
                        <h2>📦 Order Logs</h2>
                        <div className="products-filter-bar" style={{ marginTop: 12 }}>
                            <input
                                type="text"
                                className="products-search-input"
                                placeholder="Search user, role, order date/time, or status"
                                value={orderLogSearch}
                                onChange={(e) => setOrderLogSearch(e.target.value)}
                            />
                            <select
                                className="products-sort-select"
                                value={orderLogStatusFilter}
                                onChange={(e) => setOrderLogStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    {logsLoading ? (
                        <div className="logs-empty">Loading order logs...</div>
                    ) : visibleOrderLogs.length === 0 ? (
                        <div className="logs-empty">No order logs found.</div>
                    ) : (
                        <div className="logs-table-container">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Item Count</th>
                                        <th>Created Date</th>
                                        <th>Created Time</th>
                                        <th>Updated Date</th>
                                        <th>Updated Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleOrderLogs.map((log) => {
                                        const createdAt = new Date(log.order_created_at);
                                        const updatedAt = new Date(log.order_updated_at);
                                        const finalStatus = String(log.final_status || 'Paid');
                                        return (
                                            <tr key={log.order_id}>
                                                <td>#{log.order_id}</td>
                                                <td>
                                                    <div className="customer-info">
                                                        <div className="customer-name">{log.customer_name}</div>
                                                        <div className="customer-email">{log.customer_email}</div>
                                                    </div>
                                                </td>
                                                <td>₱{Number(log.total_amount || 0).toFixed(2)}</td>
                                                <td>
                                                    <span className={`order-status ${String(finalStatus).toLowerCase()}`}>{finalStatus}</span>
                                                </td>
                                                <td>{Number(log.items_count || 0)}</td>
                                                <td>{createdAt.toLocaleDateString()}</td>
                                                <td>{createdAt.toLocaleTimeString()}</td>
                                                <td>{updatedAt.toLocaleDateString()}</td>
                                                <td>{updatedAt.toLocaleTimeString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                        <p>Only active products with 20 stock or below, sorted from lowest to highest, are shown here</p>
                    </div>

                    <div className="products-filter-bar low-stock-filter-bar">
                        <input
                            type="text"
                            className="products-search-input"
                            placeholder="Search name or category"
                            value={lowStockSearch}
                            onChange={(e) => setLowStockSearch(e.target.value)}
                        />
                    </div>

                    {/* Low Stock Products Table */}
                    <div className="products-table-container">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Current Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLowStockProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="empty-state">No active products found</td>
                                    </tr>
                                ) : (
                                    visibleLowStockProducts.map(product => (
                                        <tr key={product.product_id}>
                                            <td>
                                                <div className="product-cell">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="product-thumb"
                                                        />
                                                    ) : (
                                                        <div className="product-thumb product-thumb-fallback">No Img</div>
                                                    )}
                                                    <span className="product-name">{product.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stock-count-wrap">
                                                    <span className="stock-count-number">
                                                        {Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0}
                                                    </span>
                                                    <span className="stock-badge out-of-stock">Low Stock</span>
                                                </div>
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
