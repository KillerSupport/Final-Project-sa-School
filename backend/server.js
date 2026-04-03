// --- ACCOUNT MANAGEMENT & LOW STOCK ROUTES MOVED BELOW APP INITIALIZATION ---
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
// --- ROUTES MOVED BELOW APP INITIALIZATION ---
// JWT authentication middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

const app = express();
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files as static
app.use('/uploads', express.static(uploadDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

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

// --- 2. ROLE CHECK MIDDLEWARE ---
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const userId =
            req.body?.userId ||
            req.query?.userId ||
            req.params?.userId ||
            req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        db.query("SELECT r.role_name FROM user_accounts u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?", 
        [userId], (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });
            
            if (result.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const userRole = result[0].role_name;
            
            if (requiredRole && requiredRole !== '*') {
                const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
                if (!allowedRoles.includes(userRole)) {
                    return res.status(403).json({ message: "Access denied. Insufficient role." });
                }
            }

            req.userRole = userRole;
            next();
        });
    };
};

// --- 3. EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'tongtongornamental@gmail.com', pass: 'wsei zyzt cwpo tzlo' }
});

// --- 4. SIGNUP ROUTE (UPDATED with roles) ---
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
        const roleId = 1; // Default role is 'customer' (role_id = 1)

        // Hash the password
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) return res.status(500).json({ message: "Password hashing failed" });

            const sql = `INSERT INTO user_accounts 
                (first_name, middle_name, last_name, suffix, gender, email, password, birthday, address, contact_number, is_verified, otp, otp_expires_at, role_id, is_deleted) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 0)`;

            db.query(sql, [firstName, middleName, lastName, suffix, gender, normalizedEmail, hashedPassword, formattedDate, address, contact, otpCode, expiresAt, roleId], (insErr) => {
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
});

// --- 5. VERIFY ACCOUNT (New route for Verification.jsx) ---
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

// --- 7. LOGIN ROUTE (UPDATED with role info) ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const sql = "SELECT u.*, r.role_name FROM user_accounts u LEFT JOIN roles r ON u.role_id = r.role_id WHERE u.email = ? AND u.is_deleted = 0";
    
    db.query(sql, [normalizedEmail], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.length === 0) return res.status(401).json({ message: "Invalid credentials" });
        
        const user = result[0];
        
        // Compare password with stored hash
        bcrypt.compare(password, user.password, (compareErr, isMatch) => {
            if (compareErr) return res.status(500).json({ message: "Password comparison failed" });
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
            
            if (user.is_verified === 0) return res.status(403).json({ message: "Unverified" });
            res.json({ message: "Success", user: user });
        });
    });
});

// --- 8. FORGOT PASSWORD: SEND OTP ---
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

        // Hash the new password
        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) return res.status(500).json({ message: "Password hashing failed" });

            const sql = "UPDATE user_accounts SET password = ?, otp = NULL, otp_expires_at = NULL, is_verified = 1 WHERE email = ?";
            db.query(sql, [hashedPassword, normalizedEmail], (updErr) => {
                if (updErr) return res.status(500).json({ message: "Update error" });
                res.json({ message: "Password updated!" });
            });
        });
    });
});

// ===========================
// --- ECOMMERCE ROUTES ---
// ===========================

// --- 10. GET ALL PRODUCTS (including deleted/out of stock) ---
app.get('/api/products', (req, res) => {
    const { search, category, priceMin, priceMax } = req.query;
    let sql = "SELECT * FROM products";
    const params = [];

    if (search) {
        sql += " AND (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }

    if (priceMin) {
        sql += " AND price >= ?";
        params.push(parseInt(priceMin));
    }

    if (priceMax) {
        sql += " AND price <= ?";
        params.push(parseInt(priceMax));
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 11. GET SINGLE PRODUCT (including deleted) ---
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM products WHERE product_id = ?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result[0]);
    });
});

// --- 11.5. UPLOAD PRODUCT IMAGE ---
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ imageUrl, filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 11.6. UPLOAD USER ID IMAGE AND UPDATE SENIOR/PWD STATUS ---
app.post('/api/upload-id', upload.single('idImage'), (req, res) => {
    const { userId, isSenior, isPwd } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'No ID image uploaded' });
    }
    
    const idImageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    const sql = "UPDATE user_accounts SET is_senior = ?, is_pwd = ?, id_image_url = ? WHERE user_id = ?";
    db.query(sql, [isSenior ? 1 : 0, isPwd ? 1 : 0, idImageUrl, userId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "ID uploaded. Awaiting admin verification for discount eligibility.", idImageUrl });
    });
});

// --- 12. CREATE PRODUCT (Admin and Worker) ---
app.post('/api/products', checkRole('admin'), (req, res) => {
    const { name, description, petCareContent, category, price, stock, lowStockThreshold, imageUrl, compatibility, careDifficulty, lifespan, diet } = req.body;
    const sql = "INSERT INTO products (name, description, pet_care_content, category, price, stock, low_stock_threshold, image_url, compatibility, care_difficulty, lifespan, diet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [name, description, petCareContent, category, price, stock, lowStockThreshold || 5, imageUrl, compatibility, careDifficulty || 'beginner', lifespan, diet], (err, result) => {
    });
});

// --- 13. UPDATE PRODUCT (Admin and Worker) ---
app.put('/api/products/:id', checkRole('admin'), (req, res) => {
    const { id } = req.params;
    const { name, description, petCareContent, category, price, stock, lowStockThreshold, imageUrl, compatibility, careDifficulty, lifespan, diet } = req.body;
    const sql = "UPDATE products SET name = ?, description = ?, pet_care_content = ?, category = ?, price = ?, stock = ?, low_stock_threshold = ?, image_url = ?, compatibility = ?, care_difficulty = ?, lifespan = ?, diet = ? WHERE product_id = ?";

    db.query(sql, [name, description, petCareContent, category, price, stock, lowStockThreshold || 5, imageUrl, compatibility, careDifficulty || 'beginner', lifespan, diet, id], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Product updated" });
    });
});

// --- 14. DELETE PRODUCT (Admin and Worker) ---
app.delete('/api/products/:id', checkRole('admin'), (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE products SET is_deleted = 1 WHERE product_id = ?";

    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Product deleted" });
    });
});

// --- 14.1. CREATE PRODUCT REVIEW ---
app.post('/api/products/:productId/reviews', authenticateToken, (req, res) => {
    const { productId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user.userId;

    // Check if user has purchased this product
    const checkPurchaseSql = `
        SELECT oi.order_id FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered'
    `;

    db.query(checkPurchaseSql, [productId, userId], (err, purchaseResult) => {
        if (err) return res.status(500).json({ message: "Database error" });

        const isVerifiedPurchase = purchaseResult.length > 0;

        const sql = "INSERT INTO product_reviews (product_id, user_id, rating, review_text, is_verified_purchase) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [productId, userId, rating, reviewText, isVerifiedPurchase], (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json({ message: "Review submitted", reviewId: result.insertId });
        });
    });
});

// --- 14.2. GET PRODUCT REVIEWS ---
app.get('/api/products/:productId/reviews', (req, res) => {
    const { productId } = req.params;
    const sql = `
        SELECT r.*, u.first_name, u.last_name
        FROM product_reviews r
        JOIN user_accounts u ON r.user_id = u.user_id
        WHERE r.product_id = ? AND r.is_deleted = 0
        ORDER BY r.created_at DESC
    `;

    db.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 14.3. GET PRODUCT AVERAGE RATING ---
app.get('/api/products/:productId/rating', (req, res) => {
    const { productId } = req.params;
    const sql = `
        SELECT
            COUNT(*) as total_reviews,
            AVG(rating) as average_rating,
            COUNT(CASE WHEN is_verified_purchase = 1 THEN 1 END) as verified_reviews
        FROM product_reviews
        WHERE product_id = ? AND is_deleted = 0
    `;

    db.query(sql, [productId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const result = results[0];
        res.json({
            totalReviews: result.total_reviews,
            averageRating: parseFloat(result.average_rating || 0).toFixed(1),
            verifiedReviews: result.verified_reviews
        });
    });
});

// --- 14.4. DELETE PRODUCT REVIEW (User can delete their own reviews) ---
app.delete('/api/reviews/:reviewId', authenticateToken, (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const sql = "UPDATE product_reviews SET is_deleted = 1 WHERE review_id = ? AND user_id = ?";
    db.query(sql, [reviewId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Review not found or not authorized" });
        }
        res.json({ message: "Review deleted" });
    });
});

// --- 15. GET USER CART ---
app.get('/api/cart/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = `SELECT c.cart_id, c.user_id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock
                 FROM cart c
                 JOIN products p ON c.product_id = p.product_id
                 WHERE c.user_id = ? AND p.is_deleted = 0`;
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 16. ADD TO CART ---
app.post('/api/cart', (req, res) => {
    const { userId, productId, quantity } = req.body;
    
    // Check if item already in cart
    db.query("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (result.length > 0) {
            // Update quantity
            db.query("UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?", 
            [quantity, userId, productId], (updErr) => {
                if (updErr) return res.status(500).json({ message: "Update error" });
                res.json({ message: "Cart updated" });
            });
        } else {
            // Insert new item
            db.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", 
            [userId, productId, quantity], (insErr) => {
                if (insErr) return res.status(500).json({ message: "Insert error" });
                res.json({ message: "Added to cart" });
            });
        }
    });
});

// --- 17. UPDATE CART ITEM QUANTITY ---
app.put('/api/cart/:cartId', (req, res) => {
    const { cartId } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
        db.query("DELETE FROM cart WHERE cart_id = ?", [cartId], (err) => {
            if (err) return res.status(500).json({ message: "Delete error" });
            res.json({ message: "Item removed from cart" });
        });
    } else {
        db.query("UPDATE cart SET quantity = ? WHERE cart_id = ?", [quantity, cartId], (err) => {
            if (err) return res.status(500).json({ message: "Update error" });
            res.json({ message: "Cart updated" });
        });
    }
});

// --- 18. REMOVE FROM CART ---
app.delete('/api/cart/:cartId', (req, res) => {
    const { cartId } = req.params;
    db.query("DELETE FROM cart WHERE cart_id = ?", [cartId], (err) => {
        if (err) return res.status(500).json({ message: "Delete error" });
        res.json({ message: "Removed from cart" });
    });
});

// --- 19. CREATE ORDER WITH RECEIPT EMAIL ---
app.post('/api/orders', (req, res) => {
    const { userId, items, totalAmount, shippingAddress, paymentMethod = 'cash_on_store' } = req.body;

    // Get user discount status
    db.query("SELECT is_senior, is_pwd, senior_verified, pwd_verified FROM user_accounts WHERE user_id = ?", [userId], (userErr, userResult) => {
        if (userErr) return res.status(500).json({ message: "User query error" });
        if (userResult.length === 0) return res.status(404).json({ message: "User not found" });

        const isSenior = userResult[0].is_senior && userResult[0].senior_verified;
        const isPwd = userResult[0].is_pwd && userResult[0].pwd_verified;
        const discountRate = (isSenior || isPwd) ? 0.05 : 0;

        db.query("INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status) VALUES (?, ?, ?, ?, 'pending')", 
        [userId, totalAmount, shippingAddress, paymentMethod], (err, result) => {
            if (err) return res.status(500).json({ message: "Database error" });

            const orderId = result.insertId;

            // Insert order items with discount
            let inserted = 0;
            let calculatedTotal = 0;
            items.forEach(item => {
                const unitDiscount = item.price * discountRate;
                const lineTotal = (item.price - unitDiscount) * item.quantity;
                calculatedTotal += lineTotal;

                db.query("INSERT INTO order_items (order_id, product_id, quantity, price, unit_discount) VALUES (?, ?, ?, ?, ?)", 
                [orderId, item.product_id, item.quantity, item.price, unitDiscount], (itemErr) => {
                    if (itemErr) return res.status(500).json({ message: "Order item error" });
                    inserted++;

                    // Update product stock and finish after all items
                    if (inserted === items.length) {
                        items.forEach(item => {
                            db.query("UPDATE products SET stock = stock - ? WHERE product_id = ?", [item.quantity, item.product_id]);
                        });

                        // Update order total with calculated amount
                        db.query("UPDATE orders SET total_amount = ? WHERE order_id = ?", [calculatedTotal, orderId]);

                        // Create invoice record
                        const invoiceNumber = `INV-${orderId}-${Date.now()}`;
                        const invoicePdfPath = null;
                        db.query("INSERT INTO invoices (order_id, invoice_number, payment_method, invoice_pdf_path) VALUES (?, ?, ?, ?)",
                            [orderId, invoiceNumber, paymentMethod, invoicePdfPath], (invoiceErr, invoiceResult) => {
                            if (invoiceErr) {
                                console.error("Invoice creation error:", invoiceErr);
                                return res.status(500).json({ message: "Invoice creation failed" });
                            }

                            const newInvoiceId = invoiceResult.insertId;

                            // Update order with invoice path (if available)
                            db.query("UPDATE orders SET invoice_pdf_path = ? WHERE order_id = ?", [invoicePdfPath, orderId]);

                            // Clear user cart
                            db.query("DELETE FROM cart WHERE user_id = ?", [userId]);

                            // Send receipt email
                            sendOrderReceipt(orderId, userId, res);
                        });
                    }
                });
            });
        });
    });
});

// Function to send order receipt email
function sendOrderReceipt(orderId, userId, res) {
    // Get user email
    db.query("SELECT email, first_name, last_name FROM user_accounts WHERE user_id = ?", [userId], (err, userResult) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.json({ message: "Order created", orderId });
        }
        
        const userEmail = userResult[0].email;
        const userName = `${userResult[0].first_name} ${userResult[0].last_name}`;
        
        // Get order details
        db.query("SELECT * FROM orders WHERE order_id = ?", [orderId], (err, orderResult) => {
            if (err) {
                console.error("Error fetching order:", err);
                return res.json({ message: "Order created", orderId });
            }
            
            const order = orderResult[0];
            
            // Get order items
            db.query(`SELECT oi.*, p.name FROM order_items oi
                     JOIN products p ON oi.product_id = p.product_id
                     WHERE oi.order_id = ?`, [orderId], (err, itemsResult) => {
                if (err) {
                    console.error("Error fetching order items:", err);
                    return res.json({ message: "Order created", orderId });
                }
                
                // Generate receipt HTML
                const receiptHtml = generateReceiptHtml(order, itemsResult, userName);
                
                // Send email
                const mailOptions = {
                    from: 'tongtongornamental@gmail.com',
                    to: userEmail,
                    subject: `Order Receipt #${orderId} - TongTong Ornamental Fish Store`,
                    html: receiptHtml
                };
                
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Email error:", error);
                    } else {
                        console.log("Receipt email sent:", info.response);
                    }
                    res.json({ message: "Order created", orderId });
                });
            });
        });
    });
}

// Function to generate receipt HTML
function generateReceiptHtml(order, items, userName) {
    const itemsHtml = items.map(item => {
        const originalTotal = item.quantity * item.price;
        const discountTotal = item.quantity * item.unit_discount;
        const discountedTotal = originalTotal - discountTotal;
        return `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₱${item.price.toFixed(2)}</td>
            <td>₱${item.unit_discount.toFixed(2)}</td>
            <td>₱${discountedTotal.toFixed(2)}</td>
        </tr>
    `}).join('');
    
    const totalDiscount = items.reduce((sum, item) => sum + (item.quantity * item.unit_discount), 0);
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .receipt { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 18px; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>TongTong Ornamental Fish Store</h1>
                <h2>Order Receipt</h2>
            </div>
            
            <div class="receipt">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #${order.order_id}</p>
                <p><strong>Customer:</strong> ${userName}</p>
                <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Shipping Address:</strong> ${order.shipping_address}</p>
                
                <h3>Items Ordered</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Discount</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <p><strong>Total Discount:</strong> ₱${totalDiscount.toFixed(2)}</p>
                <p class="total">Total Amount: ₱${order.total_amount.toFixed(2)}</p>
                <p style="color: red; font-weight: bold;">Please show this receipt at the store to pay and get your order.</p>
            </div>
            
            <div class="footer">
                <p>Thank you for shopping with TongTong Ornamental Fish Store!</p>
                <p>If you have any questions, please contact us at tongtongornamental@gmail.com</p>
            </div>
        </body>
        </html>
    `;
}

// --- 20. GET USER ORDERS ---
app.get('/api/orders/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 21. GET ORDER DETAILS ---
app.get('/api/orders/:orderId/items', (req, res) => {
    const { orderId } = req.params;
    const sql = `SELECT oi.*, p.name, p.image_url FROM order_items oi
                 JOIN products p ON oi.product_id = p.product_id
                 WHERE oi.order_id = ?`;
    
    db.query(sql, [orderId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 22. GET ORDER RECEIPT ---
app.get('/api/orders/:orderId/receipt', (req, res) => {
    const { orderId } = req.params;
    
    // Get order details
    db.query("SELECT o.*, u.first_name, u.last_name FROM orders o JOIN user_accounts u ON o.user_id = u.user_id WHERE o.order_id = ?", [orderId], (err, orderResult) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (orderResult.length === 0) return res.status(404).json({ message: "Order not found" });
        
        const order = orderResult[0];
        const userName = `${order.first_name} ${order.last_name}`;
        
        // Get order items
        db.query(`SELECT oi.*, p.name FROM order_items oi
                 JOIN products p ON oi.product_id = p.product_id
                 WHERE oi.order_id = ?`, [orderId], (err, itemsResult) => {
            if (err) return res.status(500).json({ message: "Database error" });
            
            const receiptHtml = generateReceiptHtml(order, itemsResult, userName);
            res.send(receiptHtml);
        });
    });
});

// --- 26. GET ORDER INVOICE ---
app.get('/api/orders/:orderId/invoice', (req, res) => {
    const { orderId } = req.params;
    const sql = `SELECT i.*, o.user_id, o.total_amount, o.shipping_address FROM invoices i
                 JOIN orders o ON i.order_id = o.order_id
                 WHERE i.order_id = ?`;

    db.query(sql, [orderId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (results.length === 0) return res.status(404).json({ message: "Invoice not found" });
        res.json(results[0]);
    });
});

// --- 27. GET ALL INVOICES (Admin Only) ---
app.get('/api/admin/invoices', checkRole('admin'), (req, res) => {
    const sql = `SELECT i.*, u.email, u.first_name, u.last_name FROM invoices i
                 JOIN orders o ON i.order_id = o.order_id
                 JOIN user_accounts u ON o.user_id = u.user_id
                 ORDER BY i.created_at DESC`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 24. GET BACKGROUND SETTINGS ---
app.get('/api/background-settings', (req, res) => {
    const sql = "SELECT * FROM background_settings";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 25. UPDATE BACKGROUND SETTINGS (Admin Only) ---
app.put('/api/background-settings/:settingName', checkRole('admin'), (req, res) => {
    const { settingName } = req.params;
    const { settingValue } = req.body;
    
    const sql = "UPDATE background_settings SET setting_value = ? WHERE setting_name = ?";
    db.query(sql, [settingValue, settingName], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Background setting updated" });
    });
});

// --- 23. UPDATE ORDER STATUS (Admin Only) ---
app.put('/api/orders/:orderId', checkRole('admin'), (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const sql = "UPDATE orders SET status = ? WHERE order_id = ?";
    
    db.query(sql, [status, orderId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Order updated" });
    });
});

// --- 24. GET ALL ORDERS (Admin Only) ---
app.get('/api/admin/orders', checkRole('admin'), (req, res) => {
    const sql = `
        SELECT o.*, u.email, u.first_name, u.last_name 
        FROM orders o 
        JOIN user_accounts u ON o.user_id = u.user_id 
        ORDER BY o.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 32. REQUEST ORDER CANCELLATION ---
app.post('/api/orders/:orderId/cancel', (req, res) => {
    const { orderId } = req.params;
    const { userId, reason } = req.body;

    // Check if order exists and belongs to user
    db.query("SELECT * FROM orders WHERE order_id = ? AND user_id = ?", [orderId, userId], (err, orderResult) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (orderResult.length === 0) return res.status(404).json({ message: "Order not found" });
        
        const order = orderResult[0];
        if (order.status !== 'pending') {
            return res.status(400).json({ message: "Only pending orders can be cancelled" });
        }

        // Check if cancellation already requested
        db.query("SELECT * FROM order_cancellation_requests WHERE order_id = ?", [orderId], (err, cancelResult) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (cancelResult.length > 0) {
                return res.status(400).json({ message: "Cancellation already requested" });
            }

            // Create cancellation request
            const sql = "INSERT INTO order_cancellation_requests (order_id, user_id, reason) VALUES (?, ?, ?)";
            db.query(sql, [orderId, userId, reason], (err) => {
                if (err) return res.status(500).json({ message: "Database error" });
                
                // Update order cancellation status
                db.query("UPDATE orders SET cancellation_status = 'requested' WHERE order_id = ?", [orderId], (err) => {
                    if (err) return res.status(500).json({ message: "Database error" });
                    res.json({ message: "Cancellation request submitted successfully" });
                });
            });
        });
    });
});

// --- 33. GET CANCELLATION REQUESTS (Admin/Worker) ---
app.get('/api/admin/cancellation-requests', checkRole(['admin', 'worker']), (req, res) => {
    const sql = `
        SELECT cr.*, o.total_amount, o.status as order_status, 
               u.first_name, u.last_name, u.email
        FROM order_cancellation_requests cr
        JOIN orders o ON cr.order_id = o.order_id
        JOIN user_accounts u ON cr.user_id = u.user_id
        ORDER BY cr.created_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 34. APPROVE/REJECT CANCELLATION REQUEST (Admin/Worker) ---
app.put('/api/admin/cancellation-requests/:requestId', checkRole(['admin', 'worker']), (req, res) => {
    const { requestId } = req.params;
    const { action, adminUserId } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
    }

    // Get cancellation request
    db.query("SELECT * FROM order_cancellation_requests WHERE request_id = ?", [requestId], (err, requestResult) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (requestResult.length === 0) return res.status(404).json({ message: "Request not found" });

        const request = requestResult[0];
        if (request.status !== 'pending') {
            return res.status(400).json({ message: "Request already processed" });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        // Update cancellation request
        db.query(
            "UPDATE order_cancellation_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE request_id = ?",
            [newStatus, adminUserId, requestId],
            (err) => {
                if (err) return res.status(500).json({ message: "Database error" });

                // Update order status
                const orderStatus = action === 'approve' ? 'cancelled' : 'pending';
                const cancellationStatus = action === 'approve' ? 'approved' : 'rejected';
                
                db.query(
                    "UPDATE orders SET status = ?, cancellation_status = ? WHERE order_id = ?",
                    [orderStatus, cancellationStatus, request.order_id],
                    (err) => {
                        if (err) return res.status(500).json({ message: "Database error" });
                        
                        // If approved, restore stock
                        if (action === 'approve') {
                            db.query(
                                "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
                                [request.order_id],
                                (err, items) => {
                                    if (err) return res.status(500).json({ message: "Database error" });
                                    
                                    // Restore stock for each item
                                    items.forEach(item => {
                                        db.query(
                                            "UPDATE products SET stock = stock + ? WHERE product_id = ?",
                                            [item.quantity, item.product_id]
                                        );
                                    });
                                    
                                    res.json({ message: `Cancellation ${action}d successfully` });
                                }
                            );
                        } else {
                            res.json({ message: `Cancellation ${action}d successfully` });
                        }
                    }
                );
            }
        );
    });
});

// --- 35. GET LOW STOCK PRODUCTS (Admin/Worker) ---
app.get('/api/admin/low-stock', checkRole(['admin', 'worker']), (req, res) => {
    const sql = "SELECT * FROM products WHERE stock <= low_stock_threshold AND is_deleted = 0 ORDER BY stock ASC";
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 36. UPDATE PRODUCT STOCK ---
app.put('/api/products/:id/stock', checkRole('admin'), (req, res) => {
    const { id } = req.params;
    const { stock, lowStockThreshold } = req.body;

    const sql = "UPDATE products SET stock = ?, low_stock_threshold = ? WHERE product_id = ?";
    db.query(sql, [stock, lowStockThreshold, id], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Stock updated successfully" });
    });
});

// --- 37. ADVANCED PRODUCT SEARCH ---
app.get('/api/products/search', (req, res) => {
    const { 
        search, 
        category, 
        minPrice, 
        maxPrice, 
        sortBy = 'name', 
        sortOrder = 'ASC',
        inStock = false 
    } = req.query;

    let sql = `SELECT * FROM products WHERE is_deleted = 0`;
    const params = [];

    if (search) {
        sql += " AND (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
        sql += " AND category = ?";
        params.push(category);
    }

    if (minPrice) {
        sql += " AND price >= ?";
        params.push(minPrice);
    }

    if (maxPrice) {
        sql += " AND price <= ?";
        params.push(maxPrice);
    }

    if (inStock === 'true') {
        sql += " AND stock > 0";
    }

    // Sorting
    const allowedSortFields = ['name', 'price', 'created_at', 'stock'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
        sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 38. GET BEST SELLERS ---
app.get('/api/analytics/best-sellers', (req, res) => {
    const { period = 'monthly' } = req.query; // 'weekly' or 'monthly'
    
    let dateCondition;
    if (period === 'weekly') {
        dateCondition = "DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else {
        dateCondition = "DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    const sql = `
        SELECT p.product_id, p.name, p.image_url, p.price, 
               SUM(oi.quantity) as total_sold, 
               SUM(oi.line_total) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status = 'completed' AND ${dateCondition}
        GROUP BY p.product_id, p.name, p.image_url, p.price
        ORDER BY total_sold DESC
        LIMIT 10
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ period, bestSellers: results });
    });
});

// --- 39. GET SALES ANALYTICS (Admin/Worker) ---
app.get('/api/admin/analytics/sales', checkRole(['admin', 'worker']), (req, res) => {
    const { period = 'monthly' } = req.query;
    
    let dateCondition;
    if (period === 'weekly') {
        dateCondition = "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
    } else {
        dateCondition = "DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    const sql = `
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders_count,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value
        FROM orders 
        WHERE status = 'completed' AND ${dateCondition}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ period, sales: results });
    });
});

// --- 24. GET USER ROLE ---
app.post('/api/user-role', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    db.query("SELECT r.role_name FROM user_accounts u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?", 
    [userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ role: result[0].role_name });
    });
});

// --- 28. GET USER PROFILE ---
app.get('/api/user-profile/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT user_id, first_name, last_name, email, contact_number, address, is_senior, is_pwd, senior_verified, pwd_verified, id_image_url FROM user_accounts WHERE user_id = ? AND is_deleted = 0";
    
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(result[0]);
    });
});

// --- 28.1 UPDATE ACCOUNT PROFILE ---
app.put('/api/account/:userId', (req, res) => {
    const { userId } = req.params;
    const { first_name, last_name, email, id_image_url } = req.body;

    const sql = `
        UPDATE user_accounts
        SET first_name = ?, last_name = ?, email = ?, id_image_url = ?
        WHERE user_id = ? AND is_deleted = 0
    `;

    db.query(sql, [first_name, last_name, email, id_image_url || null, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Account updated successfully' });
    });
});

// --- 28.2 UPDATE ACCOUNT PASSWORD ---
app.put('/api/account/:userId/password', (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old and new password are required' });
    }

    const getSql = 'SELECT password FROM user_accounts WHERE user_id = ? AND is_deleted = 0';
    db.query(getSql, [userId], (err, users) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const currentHash = users[0].password;
        bcrypt.compare(oldPassword, currentHash, (compareErr, isMatch) => {
            if (compareErr) return res.status(500).json({ message: 'Password comparison failed' });
            if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

            bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) return res.status(500).json({ message: 'Password hashing failed' });

                const updateSql = 'UPDATE user_accounts SET password = ? WHERE user_id = ?';
                db.query(updateSql, [hashedPassword, userId], (updateErr) => {
                    if (updateErr) return res.status(500).json({ message: 'Database error' });
                    res.json({ message: 'Password updated successfully' });
                });
            });
        });
    });
});

// --- 29. ADMIN APPROVE/REJECT SENIOR STATUS ---
app.put('/api/admin/verify-senior/:userId', checkRole('admin'), (req, res) => {
    const { userId } = req.params;
    const { approve } = req.body; // true or false
    
    const sql = "UPDATE user_accounts SET senior_verified = ? WHERE user_id = ?";
    db.query(sql, [approve ? 1 : 0, userId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: `Senior status ${approve ? 'approved' : 'rejected'}` });
    });
});

// --- 30. ADMIN APPROVE/REJECT PWD STATUS ---
app.put('/api/admin/verify-pwd/:userId', checkRole('admin'), (req, res) => {
    const { userId } = req.params;
    const { approve } = req.body; // true or false
    
    const sql = "UPDATE user_accounts SET pwd_verified = ? WHERE user_id = ?";
    db.query(sql, [approve ? 1 : 0, userId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: `PWD status ${approve ? 'approved' : 'rejected'}` });
    });
});

// --- 31. GET PENDING VERIFICATION REQUESTS (Admin only) ---
app.get('/api/admin/verification-requests', checkRole('admin'), (req, res) => {
    const { search } = req.query;
    
    let sql = `SELECT u.user_id, u.first_name, u.last_name, u.email, u.contact_number, 
                      u.created_at,
                      CASE 
                          WHEN u.is_senior = 1 AND u.senior_verified IS NULL THEN 'senior'
                          WHEN u.is_pwd = 1 AND u.pwd_verified IS NULL THEN 'pwd'
                      END as request_type
               FROM user_accounts u 
               WHERE u.is_deleted = 0 
               AND ((u.is_senior = 1 AND u.senior_verified IS NULL) 
                    OR (u.is_pwd = 1 AND u.pwd_verified IS NULL))`;
    
    const params = [];

    if (search) {
        sql += " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY u.created_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 24. GET ALL USERS (Admin only) ---
app.get('/api/users', (req, res) => {
    const { search } = req.query;
    let sql = `SELECT u.user_id, u.first_name, u.last_name, u.email, u.contact_number, 
                      r.role_name, u.created_at, u.is_verified 
               FROM user_accounts u 
               LEFT JOIN roles r ON u.role_id = r.role_id 
               WHERE u.is_deleted = 0`;
    const params = [];

    if (search) {
        sql += " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY u.created_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 25. UPDATE USER ROLE (Admin only) ---
app.put('/api/users/:userId/role', (req, res) => {
    const { userId } = req.params;
    const { newRoleId, adminUserId } = req.body;

    // Verify that the person making the request is an admin
    db.query("SELECT r.role_name FROM user_accounts u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?", 
    [adminUserId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0 || result[0].role_name !== 'admin') {
            return res.status(403).json({ message: "Only admins can change user roles" });
        }

        // Update the user role
        const sql = "UPDATE user_accounts SET role_id = ? WHERE user_id = ?";
        db.query(sql, [newRoleId, userId], (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json({ message: "User role updated successfully" });
        });
    });
});

// --- 26. GET ALL ROLES ---
app.get('/api/roles', (req, res) => {
    const sql = "SELECT * FROM roles";
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// --- 27. GET PRODUCT CATEGORIES ---
app.get('/api/categories', (req, res) => {
    const sql = "SELECT DISTINCT category FROM products WHERE is_deleted = 0";
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const categories = results.map(r => r.category);
        res.json(categories);
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));