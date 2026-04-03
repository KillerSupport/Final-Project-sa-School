import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import './Login.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const normalizedEmail = email.trim().toLowerCase();

        try {
            const res = await axios.post('http://localhost:5000/api/login', { 
                email: normalizedEmail, 
                password 
            });
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            Swal.fire({
                title: 'Welcome Back!',
                text: 'Login Successful',
                icon: 'success',
                confirmButtonColor: '#2563eb',
                timer: 1500
            });

            const roleName = (res.data?.user?.role_name || '').toLowerCase();
            if (roleName === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/catalog');
            }
        } catch (err) {
            if (err.response && err.response.status === 403) {
                Swal.fire({
                    title: 'Verify Account',
                    text: 'Your account is not yet verified.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Verify Now',
                    confirmButtonColor: '#2563eb',
                }).then((result) => {
                    if (result.isConfirmed) navigate('/verify', { state: { email: normalizedEmail } });
                });
            } else {
                Swal.fire({
                    title: 'Invalid Access',
                    text: 'Check your email/password. Note: Passwords are case-sensitive.',
                    icon: 'error',
                    confirmButtonColor: '#2563eb'
                });
            }
        }
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-glass-card">
                <div className="auth-branding">
                    <h1>Welcome to TongTong Fish Culture</h1>
                </div>
                <div className="auth-form-container">
                    <h2>Login</h2>
                    
                    <label className="auth-label">Email:</label>
                    <input 
                        type="email" 
                        className="auth-input" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{marginBottom: '15px'}} 
                    />

                    <label className="auth-label">Password:</label>
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="auth-input" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </div>
                    </div>

                    {/* RESTORED: Forgot Password Link */}
                    <div className="forgot-link-container">
                        <span className="forgot-link">
                            Forgot Password? <span className="link-span" onClick={() => navigate('/forgot-password')}>Click Here</span>
                        </span>
                    </div>

                    <div className="button-container">
                        <button className="auth-button" onClick={handleLogin}>Log In</button>
                        <p className="auth-footer-text">
                            No Account Yet? <span className="link-span" onClick={() => navigate('/signup')}>Signup Now</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;