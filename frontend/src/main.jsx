import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './Login';
import Signup from './Signup';
import Verification from './Verification';
import ForgotPassword from './ForgotPassword';
import ProductCatalog from './ProductCatalog';
import ProductDetails from './ProductDetails';
import Cart from './Cart';
import Checkout from './Checkout';
import OrderHistory from './OrderHistory';
import AdminDashboard from './AdminDashboard';
import WorkerDashboard from './WorkerDashboard';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify" element={<Verification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/catalog" element={<ProductCatalog />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-info" element={<OrderHistory />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            </Routes>
        </Router>
    </React.StrictMode>
);