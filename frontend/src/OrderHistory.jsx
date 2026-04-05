import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowLeft, ChevronDown, User, LogOut } from 'lucide-react';
import './OrderHistory.css';
import Swal from 'sweetalert2';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.user_id;
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileEdit, setProfileEdit] = useState({
        first_name: '', middle_name: '', last_name: '', suffix: '', birthday: '', gender: '', contact_number: '', address: '', email: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordEdit, setPasswordEdit] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // --- LOGOUT HANDLER ---
    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/logout', {
                userId,
                sessionLogId: localStorage.getItem('sessionLogId'),
                sessionToken: localStorage.getItem('sessionToken')
            });
        } catch {}
        localStorage.removeItem('user');
        localStorage.removeItem('sessionLogId');
        localStorage.removeItem('sessionToken');
        navigate('/');
    };

    // --- PROFILE MODAL HANDLERS ---
    const openProfileEditModal = async () => {
        setProfileLoading(true);
        setShowProfileEditModal(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/user-profile/${userId}`);
            setProfileEdit({
                first_name: res.data.first_name || '',
                middle_name: res.data.middle_name || '',
                last_name: res.data.last_name || '',
                suffix: res.data.suffix || '',
                birthday: res.data.birthday || '',
                gender: res.data.gender || '',
                contact_number: res.data.contact_number || '',
                address: res.data.address || '',
                email: res.data.email || ''
            });
        } catch (err) {
            Swal.fire('Error', 'Failed to load profile', 'error');
            setShowProfileEditModal(false);
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
            setShowProfileEditModal(false);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    // --- PASSWORD MODAL HANDLERS ---
    const openPasswordModal = () => {
        setPasswordEdit({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(true);
    };

    const handlePasswordEditChange = (e) => {
        const { name, value } = e.target;
        setPasswordEdit(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (passwordEdit.newPassword !== passwordEdit.confirmPassword) {
            Swal.fire('Error', 'New passwords do not match', 'error');
            return;
        }
        setPasswordLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/account/${userId}/password`, {
                oldPassword: passwordEdit.oldPassword,
                newPassword: passwordEdit.newPassword
            });
            Swal.fire('Success', 'Password changed', 'success');
            setShowPasswordModal(false);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchOrders();
        fetchUserProfile();
    }, [userId]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/orders?user_id=${userId}`);
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
            setUserProfile(res.data);
        } catch (err) {
            console.error('Error fetching user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewReceipt = () => {
        window.open(`http://localhost:5000/api/orders/${orderId}/receipt`, '_blank');
    };

    const handleFileChange = (e) => {
        setIdImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!idImage && !userProfile?.id_image_url) {
            Swal.fire({
                title: 'ID Required',
                text: 'Please upload your ID for verification',
                icon: 'warning',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('idImage', idImage);
            formData.append('userId', userId);
            formData.append('isSenior', isSenior);
            formData.append('isPwd', isPwd);

            const res = await axios.post('http://localhost:5000/api/upload-id', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.fire({
                title: 'Success',
                text: 'ID uploaded. Awaiting admin verification for discount eligibility.',
                icon: 'success',
                confirmButtonColor: '#2563eb'
            });

            onUpdate();
            onClose();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to update profile',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setUploading(false);
        }
    };

    const ProfileModal = ({ userProfile, onClose, onUpdate }) => {
        const [isSenior, setIsSenior] = useState(userProfile?.is_senior || false);
        const [isPwd, setIsPwd] = useState(userProfile?.is_pwd || false);
        const [idImage, setIdImage] = useState(null);
        const [uploading, setUploading] = useState(false);

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.user_id;

        const handleFileChange = (e) => {
            setIdImage(e.target.files[0]);
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!idImage && !userProfile?.id_image_url) {
                Swal.fire({
                    title: 'ID Required',
                    text: 'Please upload your ID for verification',
                    icon: 'warning',
                    confirmButtonColor: '#2563eb'
                });
                return;
            }

            setUploading(true);

            try {
                const formData = new FormData();
                formData.append('idImage', idImage);
                formData.append('userId', userId);
                formData.append('isSenior', isSenior);
                formData.append('isPwd', isPwd);

                const res = await axios.post('http://localhost:5000/api/upload-id', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                Swal.fire({
                    title: 'Success',
                    text: 'ID uploaded. Awaiting admin verification for discount eligibility.',
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                });

                onUpdate();
                onClose();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update profile',
                    icon: 'error',
                    confirmButtonColor: '#2563eb'
                });
            } finally {
                setUploading(false);
            }
        };

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Edit Profile & Upload ID</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isSenior}
                                    onChange={(e) => setIsSenior(e.target.checked)}
                                />
                                I am a Senior Citizen (5% discount)
                            </label>
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isPwd}
                                    onChange={(e) => setIsPwd(e.target.checked)}
                                />
                                I am a Person With Disability (PWD) (5% discount)
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Upload ID for Verification:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!userProfile?.id_image_url}
                            />
                            {userProfile?.id_image_url && (
                                <p className="current-id">Current ID uploaded</p>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn-cancel">
                                Cancel
                            </button>
                            <button type="submit" disabled={uploading} className="btn-submit">
                                {uploading ? 'Uploading...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="order-history-header" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                <button className="btn-icon" title="Edit Profile" onClick={openProfileEditModal}><User size={20} /></button>
                <button className="btn-icon" title="Change Password" onClick={openPasswordModal}><span role="img" aria-label="password">🔒</span></button>
                <button className="btn-icon" title="Logout" onClick={handleLogout}><LogOut size={20} /></button>
            </div>
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div>
                    {orders.map(order => (
                        <div key={order.order_id} className="order-item">
                            <div
                                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                            >
                                <div className="order-info">
                                    <div className="order-title">
                                        <span className="order-id">Order #{order.order_id}</span>
                                        <span 
                                            className="order-status"
                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <p className="order-date">{formatDate(order.created_at)}</p>
                                </div>

                                <div className="order-summary-info">
                                    <div className="summary-item">
                                        <span className="label">Total:</span>
                                        <span className="amount">₱{order.total_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="label">Shipping:</span>
                                        <span className="address">{order.shipping_address}</span>
                                    </div>
                                </div>

                                <ChevronDown 
                                    size={24}
                                    className={`expand-icon ${expandedOrder === order.order_id ? 'expanded' : ''}`}
                                />
                            </div>

                            {expandedOrder === order.order_id && (
                                <OrderDetails orderId={order.order_id} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Profile Edit Modal */}
            {showProfileEditModal && (
                <div className="modal-overlay" onClick={() => setShowProfileEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-button" onClick={() => setShowProfileEditModal(false)}>×</button>
                        </div>
                        {profileLoading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <>
                            <form onSubmit={handleProfileSave} className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" name="first_name" value={profileEdit.first_name} onChange={handleProfileEditChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Middle Name</label>
                                        <input type="text" name="middle_name" value={profileEdit.middle_name} onChange={handleProfileEditChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" name="last_name" value={profileEdit.last_name} onChange={handleProfileEditChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Suffix</label>
                                        <input type="text" name="suffix" value={profileEdit.suffix} onChange={handleProfileEditChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Birthday</label>
                                        <input type="date" name="birthday" value={profileEdit.birthday} onChange={handleProfileEditChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select name="gender" value={profileEdit.gender} onChange={handleProfileEditChange}>
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Number</label>
                                        <input type="text" name="contact_number" value={profileEdit.contact_number} onChange={handleProfileEditChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Address</label>
                                        <input type="text" name="address" value={profileEdit.address} onChange={handleProfileEditChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={profileEdit.email} onChange={handleProfileEditChange} required />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowProfileEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={profileLoading}>Save</button>
                                </div>
                            </form>
                            {/* Change Password Section */}
                            <div className="password-section">
                                <h4>Change Password</h4>
                                <form onSubmit={handlePasswordSave} className="password-form">
                                    <div className="form-group">
                                        <label>Old Password</label>
                                        <input type="password" name="oldPassword" value={passwordEdit.oldPassword} onChange={handlePasswordEditChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input type="password" name="newPassword" value={passwordEdit.newPassword} onChange={handlePasswordEditChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input type="password" name="confirmPassword" value={passwordEdit.confirmPassword} onChange={handlePasswordEditChange} />
                                    </div>
                                    <button type="submit" className="save-btn" disabled={passwordLoading}>{passwordLoading ? 'Saving...' : 'Change Password'}</button>
                                </form>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Change Password</h3>
                            <button className="close-button" onClick={() => setShowPasswordModal(false)}>×</button>
                        </div>
                        <form onSubmit={handlePasswordSave} className="profile-form">
                            <div className="form-group">
                                <label>Old Password</label>
                                <input type="password" name="oldPassword" value={passwordEdit.oldPassword} onChange={handlePasswordEditChange} required />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" name="newPassword" value={passwordEdit.newPassword} onChange={handlePasswordEditChange} required />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" name="confirmPassword" value={passwordEdit.confirmPassword} onChange={handlePasswordEditChange} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={passwordLoading}>Change Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrderDetails = ({ orderId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.user_id;

    useEffect(() => {
        fetchOrderItems();
    }, [orderId]);

    const fetchOrderItems = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/${orderId}/items`);
            setItems(res.data);
        } catch (err) {
            console.error('Error fetching order items:', err);
        } finally {
            setLoading(false);
        }
    };

    const viewReceipt = () => {
        window.open(`http://localhost:5000/api/orders/${orderId}/receipt`, '_blank');
    };

    const downloadInvoicePdf = () => {
        if (!userId) return;
        window.open(`http://localhost:5000/api/orders/${orderId}/invoice-pdf?userId=${userId}`, '_blank');
    };

    if (loading) {
        return <div className="loading-details">Loading order details...</div>;
    }

    return (
        <div className="order-details">
            <div className="details-header">
                <h3>Order Items</h3>
                <button 
                    className="btn-view-receipt"
                    onClick={viewReceipt}
                >
                    View Receipt
                </button>
                <button
                    className="btn-view-receipt"
                    onClick={downloadInvoicePdf}
                >
                    Download Invoice PDF
                </button>
            </div>
            
            <div className="items-list">
                {items.map(item => (
                    <div key={item.order_item_id} className="detail-item">
                        <img 
                            src={item.image_url || 'https://via.placeholder.com/60'} 
                            alt={item.name}
                            className="item-image"
                        />
                        <div className="item-details">
                            <h4>{item.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-pricing">
                            <span className="price">₱{item.price.toFixed(2)}</span>
                            <span className="total">Total: ₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
