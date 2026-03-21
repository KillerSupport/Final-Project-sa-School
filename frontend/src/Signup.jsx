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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState({ length: false, upper: false, lower: false, number: false });
    const [strength, setStrength] = useState({ label: '', color: '', score: 0 });

    const formatBirthday = (value) => {
        let val = value.replace(/\D/g, ''); 
        if (val.length >= 2) {
            let month = parseInt(val.slice(0, 2));
            if (month > 12) month = 12;
            if (month === 0 && val.length === 2) month = 1;
            val = month.toString().padStart(2, '0') + val.slice(2);
        }
        if (val.length >= 4) {
            let day = parseInt(val.slice(2, 4));
            if (day > 31) day = 31;
            if (day === 0 && val.length === 4) day = 1;
            val = val.slice(0, 2) + day.toString().padStart(2, '0') + val.slice(4);
        }
        if (val.length <= 2) return val;
        if (val.length <= 4) return `${val.slice(0, 2)} / ${val.slice(2)}`;
        return `${val.slice(0, 2)} / ${val.slice(2, 4)} / ${val.slice(4, 8)}`;
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        if (name === 'contact') value = value.replace(/\D/g, ''); 
        if (name === 'birthday') value = formatBirthday(value);
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
                        <div className="input-group col-5"><label>Birthday *</label><input type="text" name="birthday" value={formData.birthday} placeholder="MM / DD / YYYY" maxLength={14} onChange={handleInputChange} /></div>
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