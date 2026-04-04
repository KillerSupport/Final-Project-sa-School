import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Edit2, CheckCircle, XCircle, Users, ShieldCheck } from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [roles, setRoles] = useState([]);
    const [search, setSearch] = useState('');
    const [verificationSearch, setVerificationSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [verificationLoading, setVerificationLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('roles');
    const [roleFilter, setRoleFilter] = useState('client');

    const user = JSON.parse(localStorage.getItem('user'));
    const adminUserId = user?.user_id;

    const normalizeRoleName = (roleName) => {
        if (roleName === 'moderator') return 'worker';
        if (roleName === 'customer') return 'client';
        return roleName;
    };

    useEffect(() => {
        fetchRoles();
        fetchUsers();
        fetchVerificationRequests();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/roles');
            setRoles(res.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            
            const res = await axios.get('http://localhost:5000/api/users', { params });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to load users',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchVerificationRequests = async () => {
        setVerificationLoading(true);
        try {
            const params = { userId: adminUserId };
            if (verificationSearch) params.search = verificationSearch;
            
            const res = await axios.get('http://localhost:5000/api/admin/verification-requests', { params });
            setVerificationRequests(res.data);
        } catch (err) {
            console.error('Error fetching verification requests:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to load verification requests',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setVerificationLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search) {
                fetchUsers();
            } else {
                fetchUsers();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (verificationSearch) {
                fetchVerificationRequests();
            } else {
                fetchVerificationRequests();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [verificationSearch]);

    const handleEditRole = (user) => {
        setEditingUserId(user.user_id);
        setSelectedRole(user.role_name);
        setShowModal(true);
    };

    const handleSaveRole = async () => {
        if (!selectedRole) {
            Swal.fire({
                title: 'Error',
                text: 'Please select a role',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
            return;
        }

        try {
            const selectedRoleObj = roles.find(r => normalizeRoleName(r.role_name) === selectedRole);
            
            await axios.put(`http://localhost:5000/api/users/${editingUserId}/role`, {
                newRoleId: selectedRoleObj.role_id,
                adminUserId
            });

            Swal.fire({
                title: 'Success!',
                text: 'User role updated successfully',
                icon: 'success',
                timer: 1500,
                confirmButtonColor: '#2563eb'
            });

            setShowModal(false);
            setEditingUserId(null);
            fetchUsers();
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'Failed to update user role',
                icon: 'error',
                confirmButtonColor: '#2563eb'
            });
        }
    };

    const handleVerifySenior = async (userId, approve) => {
        const action = approve ? 'approve' : 'reject';
        const confirmText = approve ? 
            'Are you sure you want to approve this user as a Senior Citizen?' : 
            'Are you sure you want to reject this Senior Citizen verification?';

        const result = await Swal.fire({
            title: 'Confirm Action',
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: approve ? '#10b981' : '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: approve ? 'Approve' : 'Reject'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/admin/verify-senior/${userId}`, {
                    approve,
                    adminUserId
                });

                Swal.fire({
                    title: 'Success!',
                    text: `Senior Citizen verification ${action}d successfully`,
                    icon: 'success',
                    timer: 1500,
                    confirmButtonColor: '#2563eb'
                });

                fetchUsers();
                fetchVerificationRequests();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.message || `Failed to ${action} Senior Citizen verification`,
                    icon: 'error',
                    confirmButtonColor: '#2563eb'
                });
            }
        }
    };

    const handleVerifyPwd = async (userId, approve) => {
        const action = approve ? 'approve' : 'reject';
        const confirmText = approve ? 
            'Are you sure you want to approve this user as PWD?' : 
            'Are you sure you want to reject this PWD verification?';

        const result = await Swal.fire({
            title: 'Confirm Action',
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: approve ? '#10b981' : '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: approve ? 'Approve' : 'Reject'
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/admin/verify-pwd/${userId}`, {
                    approve,
                    adminUserId
                });

                Swal.fire({
                    title: 'Success!',
                    text: `PWD verification ${action}d successfully`,
                    icon: 'success',
                    timer: 1500,
                    confirmButtonColor: '#2563eb'
                });

                fetchUsers();
                fetchVerificationRequests();
            } catch (err) {
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.message || `Failed to ${action} PWD verification`,
                    icon: 'error',
                    confirmButtonColor: '#2563eb'
                });
            }
        }
    };

    const getRoleBadgeColor = (roleName) => {
        switch(normalizeRoleName(roleName)) {
            case 'admin':
                return '#dc2626'; // Red
            case 'worker':
                return '#f59e0b'; // Amber
            case 'client':
                return '#10b981'; // Green
            default:
                return '#6b7280'; // Gray
        }
    };

    const filteredUsers = users.filter((u) => {
        if (u.user_id === adminUserId) return false;
        const normalized = normalizeRoleName(u.role_name);
        return normalized === roleFilter;
    });

    const isClientRoleView = roleFilter === 'client';

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="user-management">
            <div className="user-management-header">
                <h2>Admin Panel</h2>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'roles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('roles')}
                >
                    <Users size={18} />
                    User Roles
                </button>
                <button
                    className={`tab-button ${activeTab === 'verification' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verification')}
                >
                    <ShieldCheck size={18} />
                    Verification Requests
                </button>
            </div>

            {/* User Roles Tab */}
            {activeTab === 'roles' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h3>Manage User Roles</h3>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="role-filter-tabs" role="tablist" aria-label="Filter users by role">
                            <button
                                type="button"
                                className={`role-filter-tab ${roleFilter === 'client' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('client')}
                            >
                                Client
                            </button>
                            <button
                                type="button"
                                className={`role-filter-tab ${roleFilter === 'worker' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('worker')}
                            >
                                Worker
                            </button>
                            <button
                                type="button"
                                className={`role-filter-tab ${roleFilter === 'admin' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('admin')}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="no-users">
                            <p>No users found</p>
                        </div>
                    ) : (
                        <div className={`users-table ${isClientRoleView ? 'client-role-view' : 'non-client-role-view'}`}>
                            <div className="table-header">
                                <div className="col-name">Name</div>
                                <div className="col-email">Email</div>
                                <div className="col-contact">Contact</div>
                                <div className="col-role">Current Role</div>
                                <div className="col-verified">Verified</div>
                                {isClientRoleView && <div className="col-senior">Senior Citizen</div>}
                                {isClientRoleView && <div className="col-pwd">PWD</div>}
                                <div className="col-joined">Joined</div>
                                <div className="col-actions">Actions</div>
                            </div>

                            {filteredUsers.map(user => (
                                <div key={user.user_id} className="table-row">
                                    <div className="col-name">
                                        <strong>{user.first_name} {user.last_name}</strong>
                                    </div>
                                    <div className="col-email">{user.email}</div>
                                    <div className="col-contact">{user.contact_number || 'N/A'}</div>
                                    <div className="col-role">
                                        <span 
                                            className="role-badge"
                                            style={{ backgroundColor: getRoleBadgeColor(user.role_name) }}
                                        >
                                            {normalizeRoleName(user.role_name)}
                                        </span>
                                    </div>
                                    <div className="col-verified">
                                        {user.is_verified ? (
                                            <CheckCircle size={20} className="verified" title="Verified" />
                                        ) : (
                                            <XCircle size={20} className="unverified" title="Not Verified" />
                                        )}
                                    </div>
                                    {isClientRoleView && (
                                        <div className="col-senior">
                                            {user.is_senior !== 1 ? (
                                                <span>N/A</span>
                                            ) : user.senior_verified === 1 ? (
                                                <CheckCircle size={20} className="verified" title="Senior Citizen Verified" />
                                            ) : user.senior_verified === 0 ? (
                                                <div className="verification-actions">
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleVerifySenior(user.user_id, true)}
                                                        title="Approve Senior Citizen"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => handleVerifySenior(user.user_id, false)}
                                                        title="Reject Senior Citizen"
                                                    >
                                                        ✗
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="pending">Pending</span>
                                            )}
                                        </div>
                                    )}
                                    {isClientRoleView && (
                                        <div className="col-pwd">
                                            {user.is_pwd !== 1 ? (
                                                <span>N/A</span>
                                            ) : user.pwd_verified === 1 ? (
                                                <CheckCircle size={20} className="verified" title="PWD Verified" />
                                            ) : user.pwd_verified === 0 ? (
                                                <div className="verification-actions">
                                                    <button
                                                        className="btn-approve"
                                                        onClick={() => handleVerifyPwd(user.user_id, true)}
                                                        title="Approve PWD"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => handleVerifyPwd(user.user_id, false)}
                                                        title="Reject PWD"
                                                    >
                                                        ✗
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="pending">Pending</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="col-joined">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="col-actions">
                                        <button
                                            className="btn-edit-role"
                                            onClick={() => handleEditRole(user)}
                                            title="Edit role"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Verification Requests Tab */}
            {activeTab === 'verification' && (
                <div className="tab-content">
                    <div className="tab-header">
                        <h3>Pending Verification Requests</h3>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={verificationSearch}
                                onChange={(e) => setVerificationSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {verificationLoading ? (
                        <div className="loading">Loading verification requests...</div>
                    ) : verificationRequests.length === 0 ? (
                        <div className="no-users">
                            <p>No pending verification requests</p>
                        </div>
                    ) : (
                        <div className="users-table verification-table">
                            <div className="table-header">
                                <div className="col-name">Name</div>
                                <div className="col-email">Email</div>
                                <div className="col-contact">Contact</div>
                                <div className="col-request-type">Request Type</div>
                                <div className="col-uploaded">ID Uploaded</div>
                                <div className="col-actions">Actions</div>
                            </div>

                            {verificationRequests.map(request => (
                                <div key={`${request.user_id}-${request.request_type}`} className="table-row">
                                    <div className="col-name">
                                        <strong>{request.first_name} {request.last_name}</strong>
                                    </div>
                                    <div className="col-email">{request.email}</div>
                                    <div className="col-contact">{request.contact_number || 'N/A'}</div>
                                    <div className="col-request-type">
                                        <span className={`request-badge ${request.request_type}`}>
                                            {request.request_type === 'senior' ? 'Senior Citizen' : 'PWD'}
                                        </span>
                                    </div>
                                    <div className="col-uploaded">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="col-actions">
                                        <button
                                            className="btn-approve"
                                            onClick={() => request.request_type === 'senior' ? 
                                                handleVerifySenior(request.user_id, true) : 
                                                handleVerifyPwd(request.user_id, true)}
                                            title={`Approve ${request.request_type === 'senior' ? 'Senior Citizen' : 'PWD'} verification`}
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() => request.request_type === 'senior' ? 
                                                handleVerifySenior(request.user_id, false) : 
                                                handleVerifyPwd(request.user_id, false)}
                                            title={`Reject ${request.request_type === 'senior' ? 'Senior Citizen' : 'PWD'} verification`}
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal for changing role */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Change User Role</h3>
                            <button 
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="form-group">
                                <label>Select New Role:</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="role-select"
                                >
                                    <option value="">-- Select Role --</option>
                                    {roles.map(role => (
                                        <option key={role.role_id} value={normalizeRoleName(role.role_name)}>
                                            {normalizeRoleName(role.role_name).charAt(0).toUpperCase() + normalizeRoleName(role.role_name).slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="role-description">
                                {selectedRole === 'admin' && (
                                    <div className="description">
                                        <strong>Admin</strong>
                                        <ul>
                                            <li>✓ Full system access</li>
                                            <li>✓ Can manage products (create, edit, delete)</li>
                                            <li>✓ Can manage orders</li>
                                            <li>✓ Can manage user roles</li>
                                        </ul>
                                    </div>
                                )}
                                {selectedRole === 'worker' && (
                                    <div className="description">
                                        <strong>Worker</strong>
                                        <ul>
                                            <li>✓ Can manage products (create, edit, delete)</li>
                                            <li>✓ Can manage order status</li>
                                            <li>✗ Cannot manage user roles</li>
                                        </ul>
                                    </div>
                                )}
                                {selectedRole === 'customer' && (
                                    <div className="description">
                                        <strong>Customer</strong>
                                        <ul>
                                            <li>✓ Can browse products</li>
                                            <li>✓ Can purchase items</li>
                                            <li>✓ Can view order history</li>
                                            <li>✗ No admin access</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleSaveRole}
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
