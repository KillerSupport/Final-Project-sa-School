const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", 
    database: "db_project",
    charset: 'utf8mb4' 
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL Database.");
});

// --- 2. EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'tongtongornamental@gmail.com', pass: 'ylxh naks qqwv txod' }
});

// --- 3. SIGNUP ROUTE ---
app.post('/api/signup', (req, res) => {
    const { firstName, middleName, lastName, suffix, gender, birthday, contact, address, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    // Improved date handling
    const dateParts = birthday.split(' / '); 
    const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; 

    db.query("SELECT * FROM user_accounts WHERE email = ? AND is_deleted = 0", [normalizedEmail], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length > 0) return res.status(400).json({ message: "Email already exists" });

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        const sql = `INSERT INTO user_accounts 
            (first_name, middle_name, last_name, suffix, gender, email, password, birthday, address, contact_number, is_verified, otp, otp_expires_at, is_deleted) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`;

        db.query(sql, [firstName, middleName, lastName, suffix, gender, normalizedEmail, password, formattedDate, address, contact, otpCode, expiresAt], (insErr) => {
            if (insErr) return res.status(500).json({ message: "Registration failed" });

            transporter.sendMail({
                from: '"TongTong Fish Culture"',
                to: normalizedEmail,
                subject: 'Verify Your Account',
                text: `Your verification code is: ${otpCode}`
            });
            res.json({ message: "OTP sent!" });
        });
    });
});

// --- 4. VERIFY ACCOUNT (New route for Verification.jsx) ---
app.post('/api/verify-account', (req, res) => {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    const sql = "SELECT * FROM user_accounts WHERE email = ? AND otp = ? AND otp_expires_at > NOW() AND is_deleted = 0";
    
    db.query(sql, [normalizedEmail, otp], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (result.length > 0) {
            // Mark as verified and clear OTP
            db.query("UPDATE user_accounts SET is_verified = 1, otp = NULL, otp_expires_at = NULL WHERE email = ?", [normalizedEmail], (updErr) => {
                if (updErr) return res.status(500).json({ message: "Update error" });
                res.json({ message: "Account verified successfully!" });
            });
        } else {
            res.status(400).json({ message: "Invalid or Expired OTP" });
        }
    });
});

// --- 5. RESEND OTP (New route for Verification.jsx) ---
app.post('/api/resend-otp', (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

    db.query("UPDATE user_accounts SET otp = ?, otp_expires_at = ? WHERE email = ? AND is_deleted = 0", 
    [otpCode, expiresAt, normalizedEmail], (err, result) => {
        if (err || result.affectedRows === 0) return res.status(404).json({ message: "Account not found" });

        transporter.sendMail({
            from: '"TongTong Fish Culture"',
            to: normalizedEmail,
            subject: 'New Verification Code',
            text: `Your new code is: ${otpCode}`
        });
        res.json({ message: "New OTP sent" });
    });
});

// --- 6. LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const sql = "SELECT * FROM user_accounts WHERE email = ? AND password = ? AND is_deleted = 0";
    
    db.query(sql, [normalizedEmail, password], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.length > 0) {
            if (result[0].is_verified === 0) return res.status(403).json({ message: "Unverified" });
            res.json({ message: "Success", user: result[0] });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

// --- 7. FORGOT PASSWORD: SEND OTP ---
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); 

    // Temporarily set is_verified to 0 during the reset process for security
    db.query("UPDATE user_accounts SET otp = ?, otp_expires_at = ?, is_verified = 0 WHERE email = ? AND is_deleted = 0", 
    [otpCode, expiresAt, normalizedEmail], (err, result) => {
        if (err || result.affectedRows === 0) return res.status(404).json({ message: "Email not found" });

        transporter.sendMail({
            from: '"TongTong Fish Culture"',
            to: normalizedEmail,
            subject: 'Password Reset Code',
            text: `Recovery code: ${otpCode}`
        });
        res.json({ message: "OTP sent" });
    });
});

// --- 8. FORGOT PASSWORD: VERIFY OTP (Step 1 of ForgotPassword.jsx) ---
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    const sql = "SELECT * FROM user_accounts WHERE email = ? AND otp = ? AND otp_expires_at > NOW() AND is_deleted = 0";
    
    db.query(sql, [normalizedEmail, otp], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length > 0) {
            // Set is_verified to 1 temporarily so the Reset route knows this session is valid
            db.query("UPDATE user_accounts SET is_verified = 1 WHERE email = ?", [normalizedEmail], () => {
                res.json({ message: "Verified!" });
            });
        } else {
            res.status(400).json({ message: "Invalid or Expired OTP" });
        }
    });
});

// --- 9. RESET PASSWORD ---
app.post('/api/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if they just verified their OTP (is_verified = 1)
    db.query("SELECT * FROM user_accounts WHERE email = ? AND is_verified = 1", [normalizedEmail], (err, result) => {
        if (result.length === 0) return res.status(400).json({ message: "Session expired" });

        const sql = "UPDATE user_accounts SET password = ?, otp = NULL, otp_expires_at = NULL, is_verified = 1 WHERE email = ?";
        db.query(sql, [newPassword, normalizedEmail], (updErr) => {
            if (updErr) return res.status(500).json({ message: "Update error" });
            res.json({ message: "Password updated!" });
        });
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));