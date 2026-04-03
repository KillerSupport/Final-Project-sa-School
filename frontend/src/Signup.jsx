import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2'; 
import axios from 'axios';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '', suffix: '', gender: '',
        birthday: '', contact: '', address: '', email: '', password: '', confirmPassword: ''
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState({ length: false, upper: false, lower: false, number: false });
    const [strength, setStrength] = useState({ label: '', color: '', score: 0 });


    // Helper to get min/max date for 18+ years old
    const getMaxBirthday = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return today.toISOString().split('T')[0];
    };
    const getMinBirthday = () => {
        // Optional: set a reasonable min, e.g. 100 years ago
        const min = new Date();
        min.setFullYear(min.getFullYear() - 100);
        return min.toISOString().split('T')[0];
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'contact') value = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (val) => {
        setFormData(prev => ({ ...prev, password: val }));
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

    const handleSignup = async () => {
        const { firstName, lastName, birthday, contact, address, email, password, confirmPassword } = formData;
        if (!firstName || !lastName || !birthday || !contact || !address || !email || !password) {
            return Swal.fire('Missing Details', 'Please fill out all required fields (*)', 'warning');
        }
        // Validate birthday is within allowed range
        const minDate = getMinBirthday();
        const maxDate = getMaxBirthday();
        if (birthday < minDate || birthday > maxDate) {
            return Swal.fire('Invalid Birthday', `You must be at least 18 years old to sign up.`, 'error');
        }
        const allMet = Object.values(requirements).every(Boolean);
        if (!allMet) {
            return Swal.fire('Weak Password', 'Please meet all password requirements.', 'error');
        }
        if (password !== confirmPassword) {
            return Swal.fire('Error', 'Passwords do not match.', 'error');
        }
        try {
            const normalizedEmail = email.toLowerCase().trim();
            await axios.post('http://localhost:5000/api/signup', { 
                ...formData, 
                email: normalizedEmail 
            });
            Swal.fire('Success', 'Account created! Check your email for OTP.', 'success').then(() => {
                navigate('/verify', { state: { email: normalizedEmail } });
            });
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Registration failed', 'error');
        }
    };

    return (
        <div className="signup-page-container">
            <div className="auth-glass-card narrow-signup">
                <div className="signup-main-form">
                    <h2 className="form-header">Signup</h2>
                    <div className="signup-grid">
                        <div className="input-group col-4"><label>First Name *</label><input type="text" name="firstName" placeholder="First Name" onChange={handleInputChange} required /></div>
                        <div className="input-group col-2"><label>Middle Name</label><input type="text" name="middleName" placeholder="Middle Name" onChange={handleInputChange} /></div>
                        <div className="input-group col-4"><label>Last Name *</label><input type="text" name="lastName" placeholder="Last Name" onChange={handleInputChange} required /></div>
                        <div className="input-group col-2"><label>Suffix</label><input type="text" name="suffix" placeholder="Jr." onChange={handleInputChange} /></div>
                        <div className="input-group col-5 birthday-group">
                            <label>Birthday *</label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                min={getMinBirthday()}
                                max={getMaxBirthday()}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="input-group col-2"><label>Gender</label><input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleInputChange} /></div>
                        <div className="input-group col-5"><label>Contact *</label><input type="text" name="contact" value={formData.contact} placeholder="09..." maxLength={11} onChange={handleInputChange} /></div>
                        <div className="input-group col-12"><label>Address *</label><input type="text" name="address" placeholder="Barangay, City, Province" onChange={handleInputChange} /></div>
                        <div className="input-group col-12"><label>Email *</label><input type="email" name="email" placeholder="email@gmail.com" onChange={handleInputChange} /></div>

                        <div className="input-group col-12">
                            <label>Password *</label>
                            <div className="pass-input-container">
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" onChange={(e) => handlePasswordChange(e.target.value)} />
                                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</span>
                            </div>
                            
                            {/* Password Strength & Requirements Section */}
                            {formData.password && (
                                <div className="strength-feedback-compact">
                                    <div className="bar-bg">
                                        <div className="bar-fill" style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }}></div>
                                    </div>
                                    <div className="req-grid">
                                        <div className={requirements.length ? "met" : ""}>8+ Chars</div>
                                        <div className={requirements.upper ? "met" : ""}>Uppercase</div>
                                        <div className={requirements.lower ? "met" : ""}>Lowercase</div>
                                        <div className={requirements.number ? "met" : ""}>Number</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="input-group col-12">
                            <label>Confirm Password *</label>
                            <div className="pass-input-container">
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" onChange={handleInputChange} />
                                <span className="eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</span>
                            </div>
                        </div>
                    </div>
                    <div className="signup-footer-compact">
                        <button className="signup-btn-small" onClick={handleSignup}>Sign Up</button>
                        <div className="back-link-small" onClick={() => navigate('/')}><ArrowLeft size={14} /> Back to Login</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Signup;