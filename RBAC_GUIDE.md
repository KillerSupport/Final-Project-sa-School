# 🔐 Role-Based Access Control (RBAC) Documentation

## Overview
The Pet Fish Ecommerce Store now includes a complete role-based access control system. This allows different user types to have different permissions and access levels.

---

## 📋 User Roles

### 1. **Customer** (Default Role)
- **Role ID**: 1
- **Description**: Regular customer who can browse and purchase products
- **Permissions**:
  - ✅ Browse product catalog
  - ✅ Search and filter products
  - ✅ View product details
  - ✅ Add items to cart
  - ✅ Place orders
  - ✅ View order history
  - ✅ Track order status
  - ❌ Cannot manage products
  - ❌ Cannot change order status
  - ❌ Cannot access admin dashboard

### 2. **Admin** (Administrator)
- **Role ID**: 2
- **Description**: Administrator with full system access
- **Permissions**:
  - ✅ All customer permissions
  - ✅ Create new products
  - ✅ Edit existing products
  - ✅ Delete products
  - ✅ Manage product inventory
  - ✅ Update order status
  - ✅ Access admin dashboard
  - ✅ View all orders

### 3. **Moderator** (Optional)
- **Role ID**: 3
- **Description**: Moderator with limited admin capabilities
- **Permissions**:
  - ✅ All customer permissions
  - ✅ Update order status
  - ✅ View order details
  - ❌ Cannot create/edit/delete products
  - ❌ Cannot access full admin dashboard

---

## 🗄️ Database Schema Updates

### Roles Table
```sql
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Accounts Table (Updated)
```sql
ALTER TABLE user_accounts 
ADD COLUMN role_id INT DEFAULT 1,
ADD FOREIGN KEY (role_id) REFERENCES roles(role_id);
```
- **Default role_id**: 1 (Customer)
- New users are automatically assigned the customer role upon signup

---

## 🛡️ Role Checking Middleware

### Backend Middleware (`checkRole`)
Located in `server.js`:

```javascript
const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const { userId } = req.body;
        
        // Check if user exists and has the required role
        db.query("SELECT r.role_name FROM user_accounts u 
                  JOIN roles r ON u.role_id = r.role_id 
                  WHERE u.user_id = ?", [userId], (err, result) => {
            
            if (userRole !== requiredRole) {
                return res.status(403).json({ message: "Access denied" });
            }
            
            next();
        });
    };
};
```

### Usage in Routes
```javascript
// Only admins can create products
app.post('/api/products', checkRole('admin'), (req, res) => {
    // Product creation logic
});

// Only admins can update order status
app.put('/api/orders/:orderId', checkRole('admin'), (req, res) => {
    // Order update logic
});
```

---

## 🔗 Protected API Endpoints

### Product Management (Admin Only)
| Method | Endpoint | Role Required |
|--------|----------|---------------|
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

**Non-Protected** (All Users):
| GET | `/api/products` | Any |
| GET | `/api/products/:id` | Any |
| GET | `/api/categories` | Any |

### Order Management
| Method | Endpoint | Role Required |
|--------|----------|---------------|
| PUT | `/api/orders/:orderId` | Admin |
| GET | `/api/orders/:userId` | Authenticated |
| POST | `/api/orders` | Authenticated |

### New Endpoint for Role Checking
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/user-role` | Get user's current role |

---

## 💻 Frontend Implementation

### Storing User Role
After login, the user object includes `role_name`:
```javascript
// In Login.jsx
localStorage.setItem('user', JSON.stringify(res.data.user));

// User object now contains:
{
    user_id: 1,
    email: "admin@example.com",
    role_name: "admin",
    first_name: "John",
    ...
}
```

### Admin Dashboard Access Control
```javascript
// AdminDashboard.jsx
const userRole = user?.role_name;

useEffect(() => {
    if (userRole !== 'admin') {
        Swal.fire({
            title: 'Access Denied',
            text: 'Only admins can access this dashboard',
            icon: 'error'
        }).then(() => navigate('/catalog'));
    }
}, [userRole]);
```

### Conditional UI Rendering
```javascript
// ProductCatalog.jsx
const userRole = JSON.parse(localStorage.getItem('user'))?.role_name;

return (
    <>
        {userRole === 'admin' && (
            <button onClick={() => navigate('/admin-dashboard')}>
                ⚙️ Admin Dashboard
            </button>
        )}
    </>
);
```

---

## 🔄 User Journey by Role

### Customer Journey
```
Login → Verify Email → Browse Catalog → 
Add to Cart → Checkout → Order Confirmation → 
View Order History
```

### Admin Journey
```
Login → View Catalog → 
Access Admin Dashboard → Manage Products/Orders → 
Update Inventory/OrderStatus
```

---

## 🛠️ Managing User Roles

### Method 1: Direct Database Update
```sql
-- Change a user to admin
UPDATE user_accounts 
SET role_id = 2 
WHERE user_id = 1;

-- Change user back to customer
UPDATE user_accounts 
SET role_id = 1 
WHERE user_id = 1;
```

### Method 2: Create Admin API Endpoint
Add this endpoint to server.js to programmatically change roles:
```javascript
// UPDATE USER ROLE (Admin only)
app.put('/api/users/:userId/role', checkRole('admin'), (req, res) => {
    const { userId } = req.params;
    const { newRoleId } = req.body;
    const requestUserId = req.body.userId; // The admin making request
    
    const sql = "UPDATE user_accounts SET role_id = ? WHERE user_id = ?";
    db.query(sql, [newRoleId, userId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "User role updated" });
    });
});
```

---

## 🔐 Security Best Practices

1. **Always Verify on Backend**: Never trust frontend role claims
2. **Use userId in Requests**: Include userId so server can verify actual role
3. **Soft Deletes**: Use `is_deleted` flag instead of hard deletes
4. **Audit Logging**: Log all admin actions for security
5. **Session Management**: Store role with user session
6. **Input Validation**: Always validate user input before using

---

## 📝 Default Test Data

After running `DATABASE_SCHEMA.sql`, you'll have:

**Roles Table**:
| role_id | role_name | description |
|---------|-----------|-------------|
| 1 | customer | Regular customer - can browse and purchase |
| 2 | admin | Administrator - can manage products and orders |
| 3 | moderator | Moderator - can manage orders and reports |

**Create Test Admin User** (SQL):
```sql
INSERT INTO user_accounts 
(first_name, last_name, email, password, role_id, is_verified) 
VALUES 
('Admin', 'User', 'admin@example.com', 'password123', 2, 1);
```

---

## 🐛 Troubleshooting

### Problem: "Access Denied - Admin role required"
**Solution**: Check that user's role_id is 2 (admin) in database
```sql
SELECT role_id FROM user_accounts WHERE user_id = 1;
```

### Problem: Admin button doesn't appear
**Solution**: Ensure role_name is stored in localStorage
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role_name); // Should be 'admin'
```

### Problem: Role check middleware returns 401
**Solution**: Make sure `userId` is included in request body
```javascript
// Correct
axios.post('/api/products', {
    userId: user.user_id,
    name: 'Fish',
    ...
});

// Wrong - missing userId
axios.post('/api/products', {
    name: 'Fish',
    ...
});
```

---

## ✅ Implementation Checklist

- [x] Database schema updated with roles table
- [x] user_accounts table has role_id foreign key
- [x] Default roles inserted into roles table
- [x] New users assigned customer role by default
- [x] Login endpoint returns user role
- [x] checkRole middleware implemented
- [x] Product management routes protected
- [x] Order management routes protected
- [x] AdminDashboard verifies admin role
- [x] ProductCatalog shows admin button if admin
- [x] localStorage stores user role
- [x] Frontend conditionally renders admin features

---

## 🚀 Future Enhancements

1. **Role Management UI**: Admin interface to change user roles
2. **Permission Levels**: Fine-grained permissions instead of just roles
3. **Audit Logging**: Track all admin actions
4. **Role-Based Reports**: Different dashboards for different roles
5. **Two-Factor Authentication**: Additional security for admins
6. **Activity History**: View user activity logs
7. **Role Expiration**: Temporary admin access

---

## 📞 Support

For issues with role management:
1. Check database schema was created correctly
2. Verify user's role_id in database
3. Check localStorage has role_name after login
4. Look at server logs for middleware errors
5. Verify API calls include userId parameter

---

All code is **JavaScript and CSS only** - no other languages!
