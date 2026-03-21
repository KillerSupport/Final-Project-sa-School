import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, Clock, ArrowLeft, ShieldCheck, ShieldAlert, Eye, EyeOff, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [strength, setStrength] = useState({ label: '', color: '', score: 0 });
    const [requirements, setRequirements] = useState({
        length: false, upper: false, lower: false, number: false
    });
    
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(60); 
    const [isTimedOut, setIsTimedOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (isOtpSent && timer > 0) {
            setIsTimedOut(false);
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0 && isOtpSent) {
            setIsTimedOut(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isOtpSent, timer]);

    const handlePasswordChange = (val) => {
        setNewPassword(val);
        const reqs = {
            length: val.length >= 8,
            upper: /[A-Z]/.test(val),
            lower: /[a-z]/.test(val),
            number: /[0-9]/.test(val)
        };
        setRequirements(reqs);
        const score = Object.values(reqs).filter(Boolean).length;

        if (val.length === 0) setStrength({ label: '', color: '', score: 0 });
        else if (score <= 1) setStrength({ label: 'Weak', color: '#ff4d4d', score: 1 });
        else if (score <= 3) setStrength({ label: 'Medium', color: '#ffa500', score: 2 });
        else setStrength({ label: 'Strong', color: '#22c55e', score: 4 });
    };

    const handleSendOTP = async () => {
        if (!email) return Swal.fire('Error', 'Please enter your email', 'error');
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const res = await axios.post('http://localhost:5000/api/send-otp', { email: normalizedEmail });
            if (res.status === 200) {
                setIsOtpSent(true); 
                setTimer(60);
                setIsTimedOut(false);
                setOtp(''); 
                Swal.fire({ icon: 'success', title: 'Sent!', text: 'OTP has been sent to your email.' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Account Not Found', text: 'Email is not registered.' });
        }
    };

    const handleVerifyOTP = async () => {
        if (!isOtpSent) return Swal.fire('Notice', 'Please click Send OTP first.', 'info');
        if (isTimedOut) return Swal.fire('Error', 'OTP timed out. Please resend.', 'error');
        if (!otp) return Swal.fire('Error', 'Please enter the OTP code.', 'error');
        
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const res = await axios.post('http://localhost:5000/api/verify-otp', { email: normalizedEmail, otp });
            if (res.status === 200) setStep(2);
        } catch (error) {
            Swal.fire('Error', 'Wrong or Expired OTP', 'error');
        }
    };

    const handleReset = async () => {
        if (Object.values(requirements).includes(false)) {
            return Swal.fire('Security', 'Please meet all password requirements', 'warning');
        }
        if (newPassword !== confirmPassword) return Swal.fire('Error', 'Passwords mismatch', 'error');
        
        const normalizedEmail = email.trim().toLowerCase();
        try {
            const res = await axios.post('http://localhost:5000/api/reset-password', { 
                email: normalizedEmail,
                otp: otp,
                newPassword 
            });
            if (res.status === 200) {
                Swal.fire('Success', 'Password updated!', 'success');
                navigate('/');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'OTP timed out or invalid.', 'error');
        }
    };

    return (
        <div className="auth-page-bg">
            <div className="auth-glass-card">
                <div className="auth-branding">
                    <h1 className="recovery-side-text">Account Recovery</h1>
                </div>
                
                <div className="recovery-form-container">
                    <h2 className="main-recovery-title">
                        {step === 1 ? "Forgot your Password?" : "Reset Password"}
                    </h2>

                    <div className="central-column-stack">
                        {step === 1 ? (
                            <div className="step-content fade-in">
                                <div className={`input-field-wrapper ${isOtpSent ? 'disabled-input-gray' : ''}`}>
                                    <Mail size={18} className="field-icon-main" />
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        className="centered-input" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        disabled={isOtpSent}
                                    />
                                </div>

                                <button 
                                    className="blue-action-btn" 
                                    onClick={handleSendOTP}
                                    disabled={isOtpSent}
                                    style={isOtpSent ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                                >
                                    Send OTP
                                </button>

                                {isOtpSent && (
                                    <div className="otp-sent-area">
                                        <div className={`timer-badge ${isTimedOut ? 'timeout-text' : ''}`}>
                                            <Clock size={16} />
                                            <span>
                                                {isTimedOut ? 'OTP timed out, click Resend OTP button' : `Code expires in ${timer}s`}
                                            </span>
                                        </div>
                                        
                                        <div className="input-field-wrapper">
                                            <KeyRound size={18} className="field-icon-main" />
                                            <input 
                                                type="text" 
                                                placeholder="Enter OTP" 
                                                className="centered-input" 
                                                value={otp} 
                                                onChange={(e) => setOtp(e.target.value)} 
                                                maxLength={4} 
                                            />
                                        </div>

                                        <button className="blue-action-btn" onClick={handleVerifyOTP}>
                                            Verify OTP
                                        </button>

                                        <div className="resend-container">
                                            <span className="resend-text">Didn't get an OTP? </span>
                                            <button className="resend-link-btn" onClick={handleSendOTP}>
                                                <RotateCcw size={14} /> <b><u>Resend</u></b>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="step-content fade-in">
                                <div className="input-field-wrapper">
                                    <Lock size={18} className="field-icon-main" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="New Password" 
                                        value={newPassword} 
                                        onChange={(e) => handlePasswordChange(e.target.value)} 
                                        className="centered-input" 
                                    />
                                    <div className="eye-icon-recovery" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                {newPassword && (
                                    <div className="strength-container">
                                        <div className="strength-label" style={{ color: strength.color }}>
                                            {strength.score === 4 ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                            {strength.label} Password
                                        </div>
                                        <div className="strength-bar-bg">
                                            <div className="strength-bar-fill" style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }}></div>
                                        </div>
                                        
                                        <div className="requirements-grid">
                                            <div className={`req-item ${requirements.length ? 'met' : ''}`}>
                                                {requirements.length ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                <span>8+ characters</span>
                                            </div>
                                            <div className={`req-item ${requirements.upper ? 'met' : ''}`}>
                                                {requirements.upper ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                <span>Uppercase</span>
                                            </div>
                                            <div className={`req-item ${requirements.lower ? 'met' : ''}`}>
                                                {requirements.lower ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                <span>Lowercase</span>
                                            </div>
                                            <div className={`req-item ${requirements.number ? 'met' : ''}`}>
                                                {requirements.number ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                <span>Number</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="input-field-wrapper">
                                    <Lock size={18} className="field-icon-main" />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder="Confirm Password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        className="centered-input" 
                                    />
                                    <div className="eye-icon-recovery" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                                <button className="blue-action-btn" onClick={handleReset}>Confirm Reset</button>
                            </div>
                        )}

                        <Link to="/" className="back-to-login">
                            <ArrowLeft size={16} />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;