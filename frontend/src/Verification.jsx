import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Clock, RotateCcw, ShieldCheck, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import './Verification.css';

const Verification = () => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60);
    const [isTimedOut, setIsTimedOut] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Retrieve email passed from Signup.jsx state
    const email = location.state?.email || "";

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setIsTimedOut(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        if (!otp) return Swal.fire('Error', 'Please enter the 4-digit code', 'error');
        if (isTimedOut) return Swal.fire('Expired', 'OTP has timed out. Please resend.', 'error');

        try {
            // Using your local backend port 5000
            const res = await axios.post('http://localhost:5000/api/verify-account', { 
                email: email.trim().toLowerCase(), 
                otp 
            });
            
            if (res.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Account Verified!',
                    text: 'You can now log in to your account.',
                    confirmButtonColor: '#007bff'
                });
                navigate('/'); // Redirect to Login
            }
        } catch (err) {
            Swal.fire('Invalid Code', 'The OTP you entered is incorrect or has expired.', 'error');
        }
    };

    const handleResend = async () => {
        try {
            await axios.post('http://localhost:5000/api/resend-otp', { email });
            setTimer(60);
            setIsTimedOut(false);
            setOtp('');
            Swal.fire('Sent!', 'A new code has been sent to your email.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Could not resend OTP. Please try again later.', 'error');
        }
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-glass-card">
                <div className="auth-branding">
                    <h1 className="recovery-side-text">Identity Verification</h1>
                </div>

                <div className="recovery-form-container">
                    <h2 className="main-recovery-title">Verify Your Account</h2>
                    
                    <div className="central-column-stack">
                        <p className="verify-instruction-text">
                            We sent a 4-digit code to <br/>
                            <strong>{email || "your email"}</strong>
                        </p>

                        <div className={`timer-badge ${isTimedOut ? 'timeout-text' : ''}`}>
                            <Clock size={16} />
                            <span>
                                {isTimedOut ? 'Code Expired' : `Expires in ${timer}s`}
                            </span>
                        </div>

                        <div className="input-field-wrapper">
                            <KeyRound size={18} className="field-icon-main" />
                            <input 
                                type="text" 
                                placeholder="0000" 
                                className="centered-input verify-otp-input" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={4}
                            />
                        </div>

                        <button className="blue-action-btn" onClick={handleVerify}>
                            <ShieldCheck size={18} style={{marginRight: '8px'}} />
                            Verify Account
                        </button>

                        <div className="resend-container">
                            <span className="resend-text">Didn't get the code? </span>
                            <button className="resend-link-btn" onClick={handleResend}>
                                <RotateCcw size={14} /> <b><u>Resend</u></b>
                            </button>
                        </div>

                        <button className="back-to-login-btn" onClick={() => navigate('/')}>
                            <ArrowLeft size={16} /> Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verification;