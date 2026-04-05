import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Edit2, ArrowLeft, LogOut, User, Package, Eye, EyeOff, ShoppingCart, TrendingUp, Receipt, DollarSign, Plus, X } from 'lucide-react';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const getInitialTab = () => {
        const saved = localStorage.getItem('workerActiveTab') || 'inventory';
        if (saved === 'invoice') return 'cash-register';
        return saved;
    };
    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [products, setProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productSortOrder, setProductSortOrder] = useState('a-z');
    const [lowStockSearch, setLowStockSearch] = useState('');
    const [lowStockSortOrder, setLowStockSortOrder] = useState('a-z');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        stock: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    // Orders state
    const [orders, setOrders] = useState([]);
    const [orderSearch, setOrderSearch] = useState('');
    const [orderFilter, setOrderFilter] = useState('pending');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderProcessing, setOrderProcessing] = useState(false);

    // Sales History state
    const [salesHistory, setSalesHistory] = useState([]);
    const [salesSearch, setSalesSearch] = useState('');
    const [salesDateFilter, setSalesDateFilter] = useState('all');
    const [salesView, setSalesView] = useState('history');

    // Sales Reports state
    const [reportPeriod, setReportPeriod] = useState('today');
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [avgOrderValue, setAvgOrderValue] = useState(0);
    const [topProducts, setTopProducts] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);

    // Cash Register state
    const [dailyTransactions, setDailyTransactions] = useState([]);
    const [cashRegisterData, setCashRegisterData] = useState({
        totalCash: 0,
        totalCard: 0,
        expectedCash: 0,
        actualCash: 0,
        discrepancy: 0,
        transactionCount: 0
    });
    const [manualEntry, setManualEntry] = useState({
        amount: '',
        type: 'cash',
        description: ''
    });
    const [showCashModal, setShowCashModal] = useState(false);
    const [cashRegisterLoading, setCashRegisterLoading] = useState(false);
    const [cashierInvoiceQueue, setCashierInvoiceQueue] = useState([]);
    const [cashierFilters, setCashierFilters] = useState({ search: '' });
    const [showCashierOrderModal, setShowCashierOrderModal] = useState(false);
    const [selectedCashierOrderDetails, setSelectedCashierOrderDetails] = useState(null);
    const [cashierActionLoading, setCashierActionLoading] = useState(false);

    // Manual Walk-in Order state
    const [showManualOrderModal, setShowManualOrderModal] = useState(false);
    const [manualOrderFormData, setManualOrderFormData] = useState({ customer_name: '', email: '', contact_number: '', discount_type: 'regular' });
    const [manualOrderProductSearch, setManualOrderProductSearch] = useState('');
    const [manualOrderSelectedProductId, setManualOrderSelectedProductId] = useState('');
    const [manualOrderItems, setManualOrderItems] = useState([]);
    const [manualOrderLoading, setManualOrderLoading] = useState(false);

    // Transaction Log state
    const [transactionLog, setTransactionLog] = useState([]);
    const [transactionSearch, setTransactionSearch] = useState('');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
    const [transactionLoading, setTransactionLoading] = useState(false);

    // Profile state
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileEdit, setProfileEdit] = useState({ first_name: '', last_name: '', email: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordEdit, setPasswordEdit] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.user_id;
    const userRole = user?.role_name || 'Worker';
    const workerName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Worker';
    const profileImageStorageKey = userId ? `workerProfileImage:${userId}` : 'workerProfileImage';
    const [profileImagePreview, setProfileImagePreview] = useState(localStorage.getItem(profileImageStorageKey) || user?.profile_image_url || user?.id_image_url || '');
    const [profileImageFile, setProfileImageFile] = useState(null);

    useEffect(() => {
        localStorage.setItem('workerActiveTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        fetchProducts();
        fetchLowStockProducts();
        fetchOrders();
        fetchSalesHistory();
        fetchCashRegisterData();
        fetchTransactionLog();
    }, []);

    useEffect(() => {
        if (activeTab === 'sales' && salesView === 'reports') {
            fetchSalesReport(reportPeriod);
        }
    }, [activeTab, salesView, reportPeriod]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            const activeProducts = (res.data || [])
                .filter(p => !p.is_deleted)
                .map(p => ({
                    ...p,
                    product_name: p.product_name || p.name
                }));
            setProducts(activeProducts);
        } catch (err) {
            Swal.fire('Error', 'Failed to fetch products', 'error');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStockProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/products');
            const lowStock = (res.data || [])
                .filter((p) => !p.is_deleted && Number(p.stock || 0) <= 20)
                .map((p) => ({
                ...p,
                product_name: p.product_name || p.name
            }));
            setLowStockProducts(lowStock);
        } catch (err) {
            setLowStockProducts([]);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/worker/orders?userId=${userId}`);
            setOrders(res.data.orders || res.data || []);
        } catch (err) {
            setOrders([]);
        }
    };

    const fetchSalesHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/worker/sales-history?userId=${userId}`);
            setSalesHistory(res.data.salesHistory || res.data || []);
        } catch (err) {
            setSalesHistory([]);
        }
    };

    const fetchSalesReport = async (period) => {
        setReportLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/worker/reports?period=${period}&userId=${userId}`);
            setTotalSales(res.data.totalSales || 0);
            setTotalOrders(res.data.totalOrders || 0);
            setAvgOrderValue(res.data.avgOrderValue || 0);
            setTopProducts(res.data.topProducts || []);
        } catch (err) {
            setTotalSales(0);
            setTotalOrders(0);
            setAvgOrderValue(0);
            setTopProducts([]);
        } finally {
            setReportLoading(false);
        }
    };

    const fetchCashRegisterData = async () => {
        setCashRegisterLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/worker/cash-register?userId=${userId}`);
            setCashRegisterData(res.data.summary || {
                totalCash: 0,
                totalCard: 0,
                expectedCash: 0,
                actualCash: 0,
                discrepancy: 0,
                transactionCount: 0
            });
            setDailyTransactions(res.data.transactions || []);
            setCashierInvoiceQueue(res.data.pendingInvoices || []);
        } catch (err) {
            setCashRegisterData({
                totalCash: 0,
                totalCard: 0,
                expectedCash: 0,
                actualCash: 0,
                discrepancy: 0,
                transactionCount: 0
            });
            setDailyTransactions([]);
            setCashierInvoiceQueue([]);
        } finally {
            setCashRegisterLoading(false);
        }
    };

    const fetchTransactionLog = async () => {
        setTransactionLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/worker/transaction-log?userId=${userId}`);
            setTransactionLog(res.data || []);
        } catch (err) {
            setTransactionLog([]);
        } finally {
            setTransactionLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/logout', {
                userId,
                sessionLogId: localStorage.getItem('sessionLogId'),
                sessionToken: localStorage.getItem('sessionToken')
            });
        } catch (error) {
            console.error('Logout log error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionLogId');
        localStorage.removeItem('sessionToken');
        navigate('/');
    };

    const handleBackNavigation = () => {
        if (String(userRole || '').toLowerCase() === 'admin') {
            navigate('/admin-dashboard');
            return;
        }

        navigate('/');
    };

    const handleProcessOrder = async (status) => {
        if (!selectedOrder) return;
        setOrderProcessing(true);
        try {
            await axios.put(`http://localhost:5000/api/worker/orders/${selectedOrder.order_id}`, {
                status: status,
                userId: userId
            });
            Swal.fire('Success', `Order ${status} successfully`, 'success');
            setShowOrderModal(false);
            setSelectedOrder(null);
            fetchOrders();
            fetchSalesHistory();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to process order', 'error');
        } finally {
            setOrderProcessing(false);
        }
    };

    const handlePrintReceipt = (receipt) => {
        const printContent = `
            <div style="font-family: monospace; padding: 20px; max-width: 400px;">
                <h2 style="text-align: center;">RECEIPT</h2>
                <hr />
                <p><strong>Order #:</strong> ${receipt.order_id}</p>
                <p><strong>Date:</strong> ${new Date(receipt.order_date).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${receipt.customer_name}</p>
                <p><strong>Processed By:</strong> ${workerName}</p>
                <hr />
                <p><strong>Items:</strong></p>
                <p style="font-size: 0.9em;">${receipt.items_count} item(s)</p>
                <hr />
                <p><strong>Subtotal:</strong> ₱${parseFloat(receipt.subtotal || 0).toFixed(2)}</p>
                <p><strong>Tax:</strong> ₱${parseFloat(receipt.tax || 0).toFixed(2)}</p>
                <p><strong>Total:</strong> ₱${parseFloat(receipt.total || 0).toFixed(2)}</p>
                <hr />
                <p><strong>Payment Method:</strong> ${receipt.payment_method}</p>
                <p style="text-align: center; margin-top: 20px; font-size: 0.8em;">Thank you for your purchase!</p>
            </div>
        `;
        
        const newWindow = window.open('', '', 'height=500,width=400');
        newWindow.document.write(printContent);
        newWindow.document.close();
        newWindow.focus();
        setTimeout(() => {
            newWindow.print();
            newWindow.close();
        }, 250);
    };

    const handleAddCashEntry = async () => {
        if (!manualEntry.amount || manualEntry.amount <= 0) {
            Swal.fire('Error', 'Please enter a valid amount', 'error');
            return;
        }

        setCashRegisterLoading(true);
        try {
            await axios.post(`http://localhost:5000/api/worker/cash-register/entry`, {
                amount: parseFloat(manualEntry.amount),
                type: manualEntry.type,
                description: manualEntry.description,
                userId: userId
            });
            Swal.fire('Success', 'Cash entry recorded successfully', 'success');
            setShowCashModal(false);
            setManualEntry({ amount: '', type: 'cash', description: '' });
            fetchCashRegisterData();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to record entry', 'error');
        } finally {
            setCashRegisterLoading(false);
        }
    };

    const handleUpdateActualCash = async () => {
        const { value: actualAmount } = await Swal.fire({
            title: 'Enter Actual Cash Count',
            input: 'number',
            inputLabel: 'Actual cash amount in drawer',
            inputPlaceholder: 'Enter amount',
            showCancelButton: true
        });

        if (actualAmount) {
            setCashRegisterLoading(true);
            try {
                await axios.put(`http://localhost:5000/api/worker/cash-register/reconcile`, {
                    actualCash: parseFloat(actualAmount),
                    userId: userId
                });
                Swal.fire('Success', 'Cash reconciliation updated', 'success');
                fetchCashRegisterData();
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to update reconciliation', 'error');
            } finally {
                setCashRegisterLoading(false);
            }
        }
    };

    const handleViewCashierOrderDetails = async (orderId) => {
        setCashierActionLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/worker/cash-register/order/${orderId}/details?userId=${userId}`);
            setSelectedCashierOrderDetails(res.data || null);
            setShowCashierOrderModal(true);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to load order details', 'error');
        } finally {
            setCashierActionLoading(false);
        }
    };

    const handleConfirmCashierPayment = async (order) => {
        const { value: formValues } = await Swal.fire({
            title: `Mark Paid: Order #${order.order_id}`,
            html: `
                <label style="display:block; text-align:left; margin-bottom:6px;">Payment Method</label>
                <select id="swal-payment-method" class="swal2-input" style="margin:0 0 10px 0;">
                    <option value="cash_on_store">Cash</option>
                    <option value="card">Card</option>
                    <option value="gcash">GCash</option>
                    <option value="online">Online</option>
                </select>
                <label style="display:block; text-align:left; margin-bottom:6px;">Notes (optional)</label>
                <textarea id="swal-payment-notes" class="swal2-textarea" placeholder="Optional cashier notes"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Mark as Paid',
            preConfirm: () => {
                const paymentMethod = document.getElementById('swal-payment-method')?.value;
                const notes = document.getElementById('swal-payment-notes')?.value || '';
                if (!paymentMethod) {
                    Swal.showValidationMessage('Payment method is required');
                    return null;
                }
                return { paymentMethod, notes };
            }
        });

        if (!formValues) return;

        setCashRegisterLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/worker/cash-register/order/${order.order_id}/status`, {
                status: 'paid',
                paymentMethod: formValues.paymentMethod,
                notes: formValues.notes,
                userId
            });

            Swal.fire('Success', 'Order marked as paid', 'success');
            fetchCashRegisterData();
            fetchSalesHistory();
            fetchTransactionLog();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to mark order as paid', 'error');
        } finally {
            setCashRegisterLoading(false);
        }
    };

    const handleMarkCashierOrderCancelled = async (order) => {
        const result = await Swal.fire({
            title: `Cancel Order #${order.order_id}?`,
            text: 'This will remove it from pending cashier queue.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, mark cancelled'
        });

        if (!result.isConfirmed) return;

        setCashRegisterLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/worker/cash-register/order/${order.order_id}/status`, {
                status: 'cancelled',
                userId
            });
            Swal.fire('Success', 'Order marked as cancelled', 'success');
            fetchCashRegisterData();
            fetchOrders();
            fetchTransactionLog();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to mark order as cancelled', 'error');
        } finally {
            setCashRegisterLoading(false);
        }
    };

    const handleCreateWalkInOrder = async () => {
        const { customer_name } = manualOrderFormData;
        if (!customer_name.trim()) {
            Swal.fire('Error', 'Please enter customer name', 'error');
            return;
        }
        if (manualOrderItems.length === 0) {
            Swal.fire('Error', 'Please add at least one product', 'error');
            return;
        }
        if (manualOrderTotal <= 0) {
            Swal.fire('Error', 'Total amount must be greater than zero', 'error');
            return;
        }

        setManualOrderLoading(true);
        try {
            await axios.post('http://localhost:5000/api/worker/cash-register/manual-order', {
                customer_name: customer_name.trim(),
                email: manualOrderFormData.email || null,
                contact_number: manualOrderFormData.contact_number || null,
                discount_type: manualOrderFormData.discount_type,
                subtotal: manualOrderSubtotal,
                discount_amount: manualOrderDiscountAmount,
                total_amount: manualOrderTotal,
                items: manualOrderItems.map((item) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price
                })),
                userId: userId
            });
            Swal.fire('Success', 'Walk-in order created and marked as paid', 'success');
            setShowManualOrderModal(false);
            setManualOrderFormData({ customer_name: '', email: '', contact_number: '', discount_type: 'regular' });
            setManualOrderProductSearch('');
            setManualOrderSelectedProductId('');
            setManualOrderItems([]);
            fetchCashRegisterData();
            fetchTransactionLog();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to create walk-in order', 'error');
        } finally {
            setManualOrderLoading(false);
        }
    };

    const getInvoiceStatusLabel = (rawStatus) => {
        const normalized = String(rawStatus || '').toLowerCase();
        if (normalized === 'cancelled') return 'Cancelled';
        if (normalized === 'completed' || normalized === 'delivered' || normalized === 'paid') return 'Paid';
        return 'Pending';
    };

    const handleUpdateInvoiceStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/worker/invoice/${orderId}/status`, {
                status,
                userId
            });
            Swal.fire('Success', `Invoice marked as ${status}`, 'success');
            fetchCashRegisterData();
            fetchOrders();
            fetchSalesHistory();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update invoice status', 'error');
        }
    };

    const handleSendInvoiceEmail = async (orderId) => {
        try {
            await axios.post('http://localhost:5000/api/worker/send-invoice-email', {
                order_id: orderId,
                userId: userId
            });
            Swal.fire('Success', 'Invoice email sent successfully', 'success');
            fetchTransactionLog();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to send invoice email', 'error');
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setEditingId(product.product_id);
        setFormData({
            stock: product.stock
        });
        setShowModal(true);
    };

    const handleSaveStock = async () => {
        if (!formData.stock && formData.stock !== 0 || !editingProduct) return;

        setLoading(true);
        try {
            await axios.put(`http://localhost:5000/api/products/${editingId}/stock`, {
                stock: parseInt(formData.stock),
                lowStockThreshold: 20,
                userId: userId
            });

            Swal.fire('Success', 'Stock updated successfully', 'success');
            setShowModal(false);
            setEditingId(null);
            setEditingProduct(null);
            fetchProducts();
            fetchLowStockProducts();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to update stock', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filtered and sorted products
    const visibleProducts = useMemo(() => {
        let filtered = products.filter(p => {
            const searchLower = productSearch.toLowerCase();
            return p.product_name?.toLowerCase().includes(searchLower) ||
                   p.category?.toLowerCase().includes(searchLower);
        });

        if (productSortOrder === 'a-z') {
            filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        } else if (productSortOrder === 'z-a') {
            filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
        } else if (productSortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else if (productSortOrder === 'oldest') {
            filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        }

        return filtered;
    }, [products, productSearch, productSortOrder]);

    // Filtered low stock products
    const visibleLowStockProducts = useMemo(() => {
        let filtered = lowStockProducts.filter((p) => {
            const searchLower = lowStockSearch.toLowerCase();
            if (Number(p.stock || 0) > 20) {
                return false;
            }

            return p.product_name?.toLowerCase().includes(searchLower) ||
                   p.category?.toLowerCase().includes(searchLower);
        });

        if (lowStockSortOrder === 'a-z') {
            filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        } else if (lowStockSortOrder === 'z-a') {
            filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
        } else if (lowStockSortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else if (lowStockSortOrder === 'oldest') {
            filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        }

        return filtered;
    }, [lowStockProducts, lowStockSearch, lowStockSortOrder]);

    const lowStockAlertCount = useMemo(() => {
        return lowStockProducts.filter((p) => Number(p.stock || 0) <= 20).length;
    }, [lowStockProducts]);

    const filteredCashierOrders = useMemo(() => {
        return cashierInvoiceQueue.filter((order) => {
            return !cashierFilters.search || 
                String(order.customer_name || '').toLowerCase().includes(cashierFilters.search.toLowerCase()) ||
                String(order.order_id || '').toString().includes(cashierFilters.search) ||
                String(order.email || '').toLowerCase().includes(cashierFilters.search.toLowerCase());
        });
    }, [cashierInvoiceQueue, cashierFilters]);

    const manualWalkInProductOptions = useMemo(() => {
        const search = manualOrderProductSearch.trim().toLowerCase();
        return products.filter((product) => {
            if (product.is_deleted || Number(product.stock || 0) <= 0) return false;
            if (!search) return true;
            return String(product.product_name || '').toLowerCase().includes(search);
        });
    }, [products, manualOrderProductSearch]);

    const manualOrderSubtotal = useMemo(() => {
        return manualOrderItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    }, [manualOrderItems]);

    const manualOrderDiscountRate = useMemo(() => {
        return manualOrderFormData.discount_type === 'regular' ? 0 : 0.05;
    }, [manualOrderFormData.discount_type]);

    const manualOrderDiscountAmount = useMemo(() => {
        return manualOrderSubtotal * manualOrderDiscountRate;
    }, [manualOrderSubtotal, manualOrderDiscountRate]);

    const manualOrderTotal = useMemo(() => {
        return Math.max(manualOrderSubtotal - manualOrderDiscountAmount, 0);
    }, [manualOrderSubtotal, manualOrderDiscountAmount]);

    const resolveProductPrice = (product) => {
        return Number(product.price ?? product.product_price ?? product.selling_price ?? product.unit_price ?? 0);
    };

    const handleAddManualProduct = () => {
        if (!manualOrderSelectedProductId) return;

        const selected = products.find((p) => Number(p.product_id) === Number(manualOrderSelectedProductId));
        if (!selected) return;

        const maxStock = Number(selected.stock || 0);
        if (maxStock <= 0) {
            Swal.fire('Error', 'Selected product is out of stock', 'error');
            return;
        }

        const unitPrice = resolveProductPrice(selected);
        setManualOrderItems((prev) => {
            const existing = prev.find((item) => Number(item.product_id) === Number(selected.product_id));
            if (existing) {
                return prev.map((item) => {
                    if (Number(item.product_id) !== Number(selected.product_id)) return item;
                    const nextQty = Math.min(Number(item.quantity || 0) + 1, Number(item.max_stock || 0));
                    return { ...item, quantity: nextQty };
                });
            }

            return [
                ...prev,
                {
                    product_id: selected.product_id,
                    product_name: selected.product_name || selected.name,
                    price: unitPrice,
                    quantity: 1,
                    max_stock: maxStock
                }
            ];
        });
        setManualOrderSelectedProductId('');
    };

    const handleManualProductQtyChange = (productId, quantityValue) => {
        const numericQty = Math.max(1, parseInt(quantityValue, 10) || 1);
        setManualOrderItems((prev) => prev.map((item) => {
            if (Number(item.product_id) !== Number(productId)) return item;
            const boundedQty = Math.min(numericQty, Number(item.max_stock || numericQty));
            return { ...item, quantity: boundedQty };
        }));
    };

    const handleRemoveManualProduct = (productId) => {
        setManualOrderItems((prev) => prev.filter((item) => Number(item.product_id) !== Number(productId)));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        const confirmResult = await Swal.fire({
            title: 'Save changes?',
            text: 'Your profile updates will be applied.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2563eb'
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        setProfileLoading(true);
        try {
            let uploadedImageUrl = profileImagePreview;
            if (profileImageFile) {
                const imageForm = new FormData();
                imageForm.append('image', profileImageFile);
                const uploadRes = await axios.post('http://localhost:5000/api/upload-image', imageForm, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImageUrl = uploadRes.data.imageUrl;
            }

            await axios.put(`http://localhost:5000/api/account/${userId}`, {
                first_name: profileEdit.first_name,
                last_name: profileEdit.last_name,
                email: profileEdit.email,
                id_image_url: uploadedImageUrl
            });

            if (passwordEdit.oldPassword || passwordEdit.newPassword || passwordEdit.confirmPassword) {
                if (!passwordEdit.oldPassword || !passwordEdit.newPassword || !passwordEdit.confirmPassword) {
                    throw new Error('Please complete all password fields.');
                }

                if (passwordEdit.newPassword !== passwordEdit.confirmPassword) {
                    throw new Error('New passwords do not match');
                }

                setPasswordLoading(true);
                await axios.put(`http://localhost:5000/api/account/${userId}/password`, {
                    oldPassword: passwordEdit.oldPassword,
                    newPassword: passwordEdit.newPassword
                });
            }

            const updatedUser = {
                ...user,
                first_name: profileEdit.first_name,
                last_name: profileEdit.last_name,
                email: profileEdit.email,
                id_image_url: uploadedImageUrl
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            localStorage.setItem(profileImageStorageKey, uploadedImageUrl || '');

            setProfileImagePreview(uploadedImageUrl || '');
            setProfileImageFile(null);
            setPasswordEdit({ oldPassword: '', newPassword: '', confirmPassword: '' });
            Swal.fire('Success', 'Profile updated!', 'success');
            setShowProfileModal(false);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to update profile', 'error');
        } finally {
            setProfileLoading(false);
            setPasswordLoading(false);
        }
    };

    const openProfileModal = async () => {
        if (!userId) {
            setShowProfileModal(true);
            return;
        }

        setProfileLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/user-profile/${userId}`);
            setProfileEdit({
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                email: res.data.email || ''
            });
            setProfileImagePreview(res.data.id_image_url || localStorage.getItem(profileImageStorageKey) || '');
            setProfileImageFile(null);
        } catch (err) {
            Swal.fire('Error', 'Failed to load profile info', 'error');
        } finally {
            setProfileLoading(false);
            setShowProfileModal(true);
        }
    };

    const isAdminView = String(userRole || '').toLowerCase() === 'admin';

    return (
        <div className="worker-dashboard">
            {/* Header */}
            <div className="worker-header">
                <div className="worker-header-flex">
                    <div className="worker-header-left">
                        {isAdminView ? (
                            <button
                                onClick={handleBackNavigation}
                                className="worker-header-icon-btn"
                                title="Back to Admin Dashboard"
                            >
                                <ArrowLeft size={24} />
                                <div className="worker-header-icon-label">Admin</div>
                            </button>
                        ) : (
                            <>
                                <div className="worker-avatar-lg">
                                    {profileImagePreview ? (
                                        <img src={profileImagePreview} alt="Worker" className="worker-avatar-image" />
                                    ) : (
                                        <span>{workerName ? workerName[0].toUpperCase() : 'W'}</span>
                                    )}
                                </div>
                                <div className="worker-header-profile-text">
                                    <div className="worker-header-profile-name">{workerName || 'Worker'}</div>
                                    <div className="worker-header-profile-email">{user?.email || ''}</div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="worker-header-center">
                        <h1 className="worker-header-title">TongTong Ornamental Fish Pet Store</h1>
                    </div>
                    <div className="worker-header-right">
                        <div className="worker-header-icon-group">
                            {!isAdminView && (
                                <button onClick={openProfileModal} className="worker-header-icon-btn" title="Profile">
                                    <User size={24} />
                                    <div className="worker-header-icon-label">Profile</div>
                                </button>
                            )}
                            <button onClick={handleLogout} className="worker-header-icon-btn danger" title="Logout">
                                <LogOut size={24} />
                                <div className="worker-header-icon-label">Logout</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="worker-tabs">
                <button
                    className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Package size={18} />
                    Inventory
                </button>
                <button
                    className={`tab-button ${activeTab === 'low-stock' ? 'active' : ''} tab-button-with-badge`}
                    onClick={() => setActiveTab('low-stock')}
                >
                    <Package size={18} />
                    Low Stock
                    {lowStockAlertCount > 0 && <span className="tab-alert-badge">{lowStockAlertCount}</span>}
                </button>
                <button
                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <ShoppingCart size={18} />
                    Orders
                </button>
                <button
                    className={`tab-button ${activeTab === 'cash-register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cash-register')}
                >
                    <DollarSign size={18} />
                    Cash Register
                </button>
                <button
                    className={`tab-button ${activeTab === 'transaction-log' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transaction-log')}
                >
                    <TrendingUp size={18} />
                    Transaction Log
                </button>
                <button
                    className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    <Receipt size={18} />
                    Sales History
                </button>
            </div>

            {/* Tab Content */}
            <div className="worker-tab-content">
                {/* Inventory Management Tab */}
                {activeTab === 'inventory' && (
                    <div className="inventory-section">
                        <h3>Product Inventory</h3>

                        {/* Filter Bar */}
                        <div className="products-filter-bar">
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="products-search-input"
                            />
                            <select
                                value={productSortOrder}
                                onChange={(e) => setProductSortOrder(e.target.value)}
                                className="products-sort-select"
                            >
                                <option value="a-z">A-Z</option>
                                <option value="z-a">Z-A</option>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>

                        {/* Products List */}
                        {loading ? (
                            <p className="loading-text">Loading products...</p>
                        ) : visibleProducts.length === 0 ? (
                            <p className="no-products-text">No products found</p>
                        ) : (
                            <div className="products-grid">
                                {visibleProducts.map((product) => (
                                    <div key={product.product_id} className="product-card">
                                        <div className="product-image">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.product_name} />
                                            ) : (
                                                <div className="product-thumb-fallback">No Img</div>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <h4>{product.product_name}</h4>
                                            <p className="product-category">{product.category}</p>
                                            <div className="product-stock">
                                                <span>Stock: </span>
                                                <span className="stock-count-number">{product.stock}</span>
                                            </div>
                                            <p className="product-price">₱{parseFloat(product.price || 0).toFixed(2)}</p>
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditClick(product)}
                                                title="Edit Stock"
                                            >
                                                <Edit2 size={16} />
                                                Update Stock
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Low Stock Alerts Tab */}
                {activeTab === 'low-stock' && (
                    <div className="low-stock-section">
                        <h3>Low Stock Alerts ({lowStockAlertCount})</h3>

                        {/* Filter Bar */}
                        <div className="products-filter-bar">
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={lowStockSearch}
                                onChange={(e) => setLowStockSearch(e.target.value)}
                                className="products-search-input"
                            />
                            <select
                                value={lowStockSortOrder}
                                onChange={(e) => setLowStockSortOrder(e.target.value)}
                                className="products-sort-select"
                            >
                                <option value="a-z">A-Z</option>
                                <option value="z-a">Z-A</option>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>

                        {/* Low Stock Products */}
                        {loading ? (
                            <p className="loading-text">Loading low stock items...</p>
                        ) : visibleLowStockProducts.length === 0 ? (
                            <p className="no-products-text">No low stock alerts</p>
                        ) : (
                            <div className="products-grid">
                                {visibleLowStockProducts.map((product) => (
                                    <div key={product.product_id} className="product-card">
                                        <div className="product-image">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.product_name} />
                                            ) : (
                                                <div className="product-thumb-fallback">No Img</div>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <h4>{product.product_name}</h4>
                                            <p className="product-category">{product.category}</p>
                                            <div className="product-stock">
                                                <span>Stock: </span>
                                                <span className="stock-count-number">{product.stock}</span>
                                            </div>
                                            <p className="product-price">₱{parseFloat(product.price || 0).toFixed(2)}</p>
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditClick(product)}
                                                title="Update Stock"
                                            >
                                                <Edit2 size={16} />
                                                Update Stock
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <h3>Order Management</h3>
                        
                        <div className="orders-filter-bar">
                            <input
                                type="text"
                                placeholder="Search by order ID or customer..."
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                className="products-search-input"
                            />
                            <select
                                value={orderFilter}
                                onChange={(e) => setOrderFilter(e.target.value)}
                                className="products-sort-select"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="all">All Orders</option>
                            </select>
                        </div>

                        {loading ? (
                            <p className="loading-text">Loading orders...</p>
                        ) : orders.filter(o => orderFilter === 'all' || o.order_status === orderFilter).filter(o => 
                            o.order_id?.toString().includes(orderSearch) || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())
                        ).length === 0 ? (
                            <p className="no-products-text">No orders found</p>
                        ) : (
                            <div className="orders-list">
                                {orders.filter(o => orderFilter === 'all' || o.order_status === orderFilter).filter(o => 
                                    o.order_id?.toString().includes(orderSearch) || o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())
                                ).map((order) => (
                                    <div key={order.order_id} className="order-item" onClick={() => {setSelectedOrder(order); setShowOrderModal(true);}}>
                                        <div className="order-header">
                                            <span className="order-id">Order #{order.order_id}</span>
                                            <span className={`order-status ${order.order_status}`}>{order.order_status}</span>
                                        </div>
                                        <div className="order-details">
                                            <p><strong>Customer:</strong> {order.customer_name}</p>
                                            <p><strong>Total:</strong> ₱{parseFloat(order.order_total).toFixed(2)}</p>
                                            <p><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sales History Tab */}
                {activeTab === 'sales' && (
                    <div className="sales-section">
                        <h3>Sales History</h3>

                        <div className="sales-view-tabs">
                            <button
                                type="button"
                                className={`sales-view-tab ${salesView === 'history' ? 'active' : ''}`}
                                onClick={() => setSalesView('history')}
                            >
                                Sales History
                            </button>
                            <button
                                type="button"
                                className={`sales-view-tab ${salesView === 'reports' ? 'active' : ''}`}
                                onClick={() => setSalesView('reports')}
                            >
                                Reports
                            </button>
                        </div>

                        {salesView === 'history' && (
                            <>
                                <div className="sales-filter-bar">
                                    <input
                                        type="text"
                                        placeholder="Search by customer or order ID..."
                                        value={salesSearch}
                                        onChange={(e) => setSalesSearch(e.target.value)}
                                        className="products-search-input"
                                    />
                                    <select
                                        value={salesDateFilter}
                                        onChange={(e) => setSalesDateFilter(e.target.value)}
                                        className="products-sort-select"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                </div>

                                {loading ? (
                                    <p className="loading-text">Loading sales history...</p>
                                ) : salesHistory.filter(s =>
                                    s.order_id?.toString().includes(salesSearch) || s.customer_name?.toLowerCase().includes(salesSearch.toLowerCase())
                                ).length === 0 ? (
                                    <p className="no-products-text">No sales records found</p>
                                ) : (
                                    <div className="sales-table-wrapper">
                                        <table className="sales-table">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Payment Method</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salesHistory.filter(s =>
                                                    s.order_id?.toString().includes(salesSearch) || s.customer_name?.toLowerCase().includes(salesSearch.toLowerCase())
                                                ).map((sale) => (
                                                    <tr key={sale.order_id}>
                                                        <td>#{sale.order_id}</td>
                                                        <td>{sale.customer_name}</td>
                                                        <td>{new Date(sale.order_date).toLocaleDateString()}</td>
                                                        <td>₱{parseFloat(sale.order_total).toFixed(2)}</td>
                                                        <td>{sale.payment_method}</td>
                                                        <td><span className={`order-status ${sale.order_status}`}>{sale.order_status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {salesView === 'reports' && (
                            <>
                                <div className="report-period-select">
                                    <select
                                        value={reportPeriod}
                                        onChange={(e) => setReportPeriod(e.target.value)}
                                        className="products-sort-select"
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>

                                {reportLoading ? (
                                    <p className="loading-text">Loading report...</p>
                                ) : (
                                    <div className="reports-grid">
                                        <div className="report-card">
                                            <h4>Total Sales</h4>
                                            <p className="report-value">₱{totalSales.toFixed(2)}</p>
                                        </div>
                                        <div className="report-card">
                                            <h4>Total Orders</h4>
                                            <p className="report-value">{totalOrders}</p>
                                        </div>
                                        <div className="report-card">
                                            <h4>Average Order Value</h4>
                                            <p className="report-value">₱{avgOrderValue.toFixed(2)}</p>
                                        </div>

                                        {topProducts.length > 0 && (
                                            <div className="report-card full-width">
                                                <h4>Top Selling Products</h4>
                                                <div className="top-products-list">
                                                    {topProducts.map((product, idx) => (
                                                        <div key={idx} className="top-product-item">
                                                            <span className="product-rank">{idx + 1}.</span>
                                                            <div className="product-name-qty">
                                                                <p className="product-name">{product.product_name}</p>
                                                                <p className="product-qty">{product.quantity_sold} sold</p>
                                                            </div>
                                                            <span className="product-revenue">₱{parseFloat(product.revenue).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Cash Register Tab */}
                {activeTab === 'cash-register' && (
                    <div className="cash-register-section">
                        <h3>Cashier Register</h3>

                        {cashRegisterLoading ? (
                            <p className="loading-text">Loading cash register data...</p>
                        ) : (
                            <>
                                <div className="cash-register-top-row">
                                    <div className="cash-register-queue-panel">
                                        <div className="cash-transactions">
                                            <h4>Pending Orders Queue</h4>
                                            <button
                                                onClick={() => setShowManualOrderModal(true)}
                                                className="action-button add-button"
                                                style={{ marginBottom: 12 }}
                                            >
                                                <Plus size={18} />
                                                Walk-in Customer
                                            </button>

                                            <div className="orders-filter-bar cashier-filters-flex" style={{ marginTop: 12 }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search by customer, order ID, or email..."
                                                    value={cashierFilters.search}
                                                    onChange={(e) => setCashierFilters((prev) => ({ ...prev, search: e.target.value }))}
                                                    className="products-search-input"
                                                />
                                            </div>

                                            {filteredCashierOrders.length === 0 ? null : (
                                                <div className="sales-table-wrapper">
                                                    <table className="sales-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Order ID</th>
                                                                <th>Customer Name</th>
                                                                <th>Email</th>
                                                                <th>Contact Number</th>
                                                                <th>Date & Time</th>
                                                                <th>Total Amount</th>
                                                                <th>Status</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {filteredCashierOrders.map((order) => (
                                                                <tr key={`cashier-${order.order_id}`}>
                                                                    <td>#{order.order_id}</td>
                                                                    <td>{order.customer_name}</td>
                                                                    <td>{order.email || '-'}</td>
                                                                    <td>{order.contact_number || '-'}</td>
                                                                    <td>{new Date(order.created_at).toLocaleString()}</td>
                                                                    <td>₱{parseFloat(order.total_amount || 0).toFixed(2)}</td>
                                                                    <td>
                                                                        <span className="order-status pending">Pending</span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="cashier-table-actions">
                                                                            <button
                                                                                className="action-button add-button small"
                                                                                onClick={() => handleViewCashierOrderDetails(order.order_id)}
                                                                                disabled={cashierActionLoading}
                                                                            >
                                                                                View
                                                                            </button>
                                                                            <button
                                                                                className="action-button add-button small"
                                                                                onClick={() => handleConfirmCashierPayment(order)}
                                                                                disabled={cashierActionLoading || !order.has_invoice}
                                                                                title={!order.has_invoice ? 'Generate invoice first' : 'Mark as paid'}
                                                                            >
                                                                                Mark Paid
                                                                            </button>
                                                                            <button
                                                                                className="action-button add-button small"
                                                                                onClick={() => handleMarkCashierOrderCancelled(order)}
                                                                                disabled={cashierActionLoading}
                                                                            >
                                                                                Mark Cancelled
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="cash-register-sales-panel">
                                        <div className="cash-card cash-sales-card">
                                            <h4>Total Sales Today:</h4>
                                            <p className="cash-value">₱{parseFloat(cashRegisterData.totalCash || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {filteredCashierOrders.length === 0 && (
                                    <p className="no-products-text cash-empty-align">No pending orders found</p>
                                )}

                                {/* Transaction History */}
                                <div className="cash-transactions">
                                    <h4>Today's Transactions</h4>
                                    {dailyTransactions.length === 0 ? (
                                        <p className="no-products-text">No transactions recorded</p>
                                    ) : (
                                        <div className="transactions-list">
                                            {dailyTransactions.map((transaction, idx) => (
                                                <div key={idx} className="transaction-item">
                                                    <div className="transaction-info">
                                                        <p className="transaction-type">{transaction.type}</p>
                                                        <p className="transaction-desc">{transaction.description}</p>
                                                        <p className="transaction-time">{new Date(transaction.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                    <span className={`transaction-amount ${transaction.type === 'cash' ? 'cash-amount' : 'card-amount'}`}>
                                                        ₱{parseFloat(transaction.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

            {/* Email Receipts History Tab */}
            {/* Transaction Log Tab */}
            {activeTab === 'transaction-log' && (
                <div className="transaction-log-section">
                    <h3>Transaction Log</h3>

                    <div className="transaction-filter-bar">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            className="products-search-input"
                        />
                        <select
                            value={transactionTypeFilter}
                            onChange={(e) => setTransactionTypeFilter(e.target.value)}
                            className="products-sort-select"
                        >
                            <option value="all">All Types</option>
                            <option value="order">Order</option>
                            <option value="invoice">Invoice</option>
                            <option value="payment">Payment</option>
                            <option value="email">Email Sent</option>
                        </select>
                    </div>

                    {transactionLoading ? (
                        <div className="loading">Loading transaction log...</div>
                    ) : transactionLog.length === 0 ? (
                        <div className="no-data">No transactions recorded</div>
                    ) : (
                        <div className="transaction-list">
                            {transactionLog
                                .filter(tx =>
                                    (transactionTypeFilter === 'all' || tx.transaction_type === transactionTypeFilter) &&
                                    (tx.customer_name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
                                    tx.order_id?.toString().includes(transactionSearch) ||
                                    tx.description?.toLowerCase().includes(transactionSearch.toLowerCase()))
                                )
                                .map(tx => (
                                    <div key={tx.transaction_id} className="transaction-log-item">
                                        <div className="transaction-log-header">
                                            <span className={`log-type ${tx.transaction_type}`}>
                                                {tx.transaction_type?.toUpperCase()}
                                            </span>
                                            <span className="log-customer">{tx.customer_name}</span>
                                            <span className="log-date">{new Date(tx.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="log-description">{tx.description}</p>
                                        <div className="log-details">
                                            <span>Order: #{tx.order_id}</span>
                                            <span>Amount: ₱{parseFloat(tx.amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            </div>

            {/* Edit Stock Modal */}
            {showModal && editingProduct && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Update Stock</h3>
                        <p className="product-name">{editingProduct.product_name}</p>

                        <div className="form-group">
                            <label>Current Stock</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                className="input-field"
                                placeholder="Enter stock quantity"
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowModal(false)}
                                className="cancel-button"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStock}
                                className="save-button"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Processing Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Process Order</h3>
                        <p className="product-name">Order #{selectedOrder.order_id}</p>

                        <div className="order-modal-details">
                            <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                            <p><strong>Total:</strong> ₱{parseFloat(selectedOrder.order_total).toFixed(2)}</p>
                            <p><strong>Status:</strong> {selectedOrder.order_status}</p>
                            <p><strong>Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="cancel-button"
                                disabled={orderProcessing}
                            >
                                Close
                            </button>
                            {selectedOrder.order_status === 'pending' && (
                                <button
                                    onClick={() => handleProcessOrder('processing')}
                                    className="save-button"
                                    disabled={orderProcessing}
                                >
                                    {orderProcessing ? 'Processing...' : 'Start Processing'}
                                </button>
                            )}
                            {selectedOrder.order_status === 'processing' && (
                                <button
                                    onClick={() => handleProcessOrder('completed')}
                                    className="save-button"
                                    disabled={orderProcessing}
                                >
                                    {orderProcessing ? 'Completing...' : 'Mark as Completed'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cashier Order Details Modal */}
            {showCashierOrderModal && selectedCashierOrderDetails && (
                <div className="modal-overlay" onClick={() => setShowCashierOrderModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Order Details</h3>

                        <div className="order-modal-details">
                            <p><strong>Order ID:</strong> #{selectedCashierOrderDetails.order?.order_id}</p>
                            <p><strong>Customer:</strong> {selectedCashierOrderDetails.order?.customer_name}</p>
                            <p><strong>Email:</strong> {selectedCashierOrderDetails.order?.email || '-'}</p>
                            <p><strong>Contact Number:</strong> {selectedCashierOrderDetails.order?.contact_number || '-'}</p>
                            <p><strong>Date & Time:</strong> {selectedCashierOrderDetails.order?.created_at ? new Date(selectedCashierOrderDetails.order.created_at).toLocaleString() : '-'}</p>
                            <p><strong>Status:</strong> {selectedCashierOrderDetails.order?.status || '-'}</p>
                        </div>

                        <div className="sales-table-wrapper" style={{ marginTop: 12 }}>
                            <table className="sales-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedCashierOrderDetails.items || []).map((item) => (
                                        <tr key={item.order_item_id}>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>₱{parseFloat(item.price || 0).toFixed(2)}</td>
                                            <td>₱{parseFloat(item.line_subtotal || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="order-modal-details" style={{ marginTop: 12 }}>
                            <p><strong>Subtotal:</strong> ₱{parseFloat(selectedCashierOrderDetails.summary?.subtotal || 0).toFixed(2)}</p>
                            <p><strong>Discount:</strong> -₱{parseFloat(selectedCashierOrderDetails.summary?.discount || 0).toFixed(2)}</p>
                            <p><strong>Total Amount:</strong> ₱{parseFloat(selectedCashierOrderDetails.summary?.total || 0).toFixed(2)}</p>
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => setShowCashierOrderModal(false)}
                                className="cancel-button"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cash Register Manual Entry Modal */}
            {showCashModal && (
                <div className="modal-overlay" onClick={() => setShowCashModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Add Cash Register Entry</h3>

                        <div className="form-group">
                            <label>Entry Type</label>
                            <select
                                value={manualEntry.type}
                                onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value })}
                                className="input-field"
                            >
                                <option value="cash">Cash Sale</option>
                                <option value="cash-return">Cash Return</option>
                                <option value="cash-expense">Cash Expense</option>
                                <option value="cash-adjustment">Cash Adjustment</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={manualEntry.amount}
                                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                                className="input-field"
                                placeholder="Enter amount"
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (optional)</label>
                            <textarea
                                value={manualEntry.description}
                                onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                                className="input-field"
                                rows="2"
                                placeholder="Add notes about this entry..."
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => {setShowCashModal(false); setManualEntry({ amount: '', type: 'cash', description: '' });}}
                                className="cancel-button"
                                disabled={cashRegisterLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCashEntry}
                                className="save-button"
                                disabled={cashRegisterLoading}
                            >
                                {cashRegisterLoading ? 'Recording...' : 'Record Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Invoice Modal */}
            {showManualOrderModal && (
                <div className="modal-overlay" onClick={() => setShowManualOrderModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Register Walk-in Customer</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Record a cash payment for a customer who didn't order online</p>

                        <div className="form-group">
                            <label>Customer Name *</label>
                            <input
                                type="text"
                                value={manualOrderFormData.customer_name}
                                onChange={(e) => setManualOrderFormData({ ...manualOrderFormData, customer_name: e.target.value })}
                                className="input-field"
                                placeholder="Enter customer name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email (optional)</label>
                            <input
                                type="email"
                                value={manualOrderFormData.email}
                                onChange={(e) => setManualOrderFormData({ ...manualOrderFormData, email: e.target.value })}
                                className="input-field"
                                placeholder="customer@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Number (optional)</label>
                            <input
                                type="tel"
                                value={manualOrderFormData.contact_number}
                                onChange={(e) => setManualOrderFormData({ ...manualOrderFormData, contact_number: e.target.value })}
                                className="input-field"
                                placeholder="09xxxxxxxxx"
                            />
                        </div>

                        <div className="form-group">
                            <label>Search Product</label>
                            <input
                                type="text"
                                value={manualOrderProductSearch}
                                onChange={(e) => setManualOrderProductSearch(e.target.value)}
                                className="input-field"
                                placeholder="Type product name..."
                            />
                        </div>

                        <div className="manual-order-product-row">
                            <select
                                value={manualOrderSelectedProductId}
                                onChange={(e) => setManualOrderSelectedProductId(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select product...</option>
                                {manualWalkInProductOptions.map((product) => (
                                    <option key={product.product_id} value={product.product_id}>
                                        {product.product_name} | Stock: {product.stock} | ₱{parseFloat(resolveProductPrice(product) || 0).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            <button type="button" className="save-button manual-order-add-btn" onClick={handleAddManualProduct}>
                                Add Product
                            </button>
                        </div>

                        <div className="manual-order-items-box">
                            {manualOrderItems.length === 0 ? (
                                <p className="no-products-text">No products selected</p>
                            ) : (
                                manualOrderItems.map((item) => (
                                    <div key={`walkin-item-${item.product_id}`} className="manual-order-item-row">
                                        <div className="manual-order-item-main">
                                            <div className="manual-order-item-name">{item.product_name}</div>
                                            <div className="manual-order-item-price">₱{parseFloat(item.price || 0).toFixed(2)} each</div>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.max_stock}
                                            value={item.quantity}
                                            onChange={(e) => handleManualProductQtyChange(item.product_id, e.target.value)}
                                            className="input-field manual-order-qty"
                                        />
                                        <div className="manual-order-line-total">
                                            ₱{parseFloat((Number(item.price || 0) * Number(item.quantity || 0)) || 0).toFixed(2)}
                                        </div>
                                        <button
                                            type="button"
                                            className="cancel-button manual-order-remove-btn"
                                            onClick={() => handleRemoveManualProduct(item.product_id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="form-group">
                            <label>Discount Type</label>
                            <div className="manual-order-discount-row">
                                <label className="manual-order-radio-label">
                                    <input
                                        type="radio"
                                        name="manual-discount-type"
                                        value="regular"
                                        checked={manualOrderFormData.discount_type === 'regular'}
                                        onChange={(e) => setManualOrderFormData({ ...manualOrderFormData, discount_type: e.target.value })}
                                    />
                                    Regular
                                </label>
                                <label className="manual-order-radio-label">
                                    <input
                                        type="radio"
                                        name="manual-discount-type"
                                        value="senior"
                                        checked={manualOrderFormData.discount_type === 'senior'}
                                        onChange={(e) => setManualOrderFormData({ ...manualOrderFormData, discount_type: e.target.value })}
                                    />
                                    Senior
                                </label>
                                <label className="manual-order-radio-label">
                                    <input
                                        type="radio"
                                        name="manual-discount-type"
                                        value="pwd"
                                        checked={manualOrderFormData.discount_type === 'pwd'}
                                        onChange={(e) => setManualOrderFormData({ ...manualOrderFormData, discount_type: e.target.value })}
                                    />
                                    PWD
                                </label>
                            </div>
                        </div>

                        <div className="manual-order-totals-grid">
                            <div className="manual-order-total-line">
                                <span>Subtotal</span>
                                <strong>₱{manualOrderSubtotal.toFixed(2)}</strong>
                            </div>
                            <div className="manual-order-total-line">
                                <span>Discount</span>
                                <strong>-₱{manualOrderDiscountAmount.toFixed(2)}</strong>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Total Amount *</label>
                            <input
                                type="text"
                                value={`₱${manualOrderTotal.toFixed(2)}`}
                                className="input-field manual-order-total-readonly"
                                readOnly
                            />
                        </div>

                        <div className="modal-buttons">
                            <button
                                onClick={() => {
                                    setShowManualOrderModal(false);
                                    setManualOrderFormData({ customer_name: '', email: '', contact_number: '', discount_type: 'regular' });
                                    setManualOrderProductSearch('');
                                    setManualOrderSelectedProductId('');
                                    setManualOrderItems([]);
                                }}
                                className="cancel-button"
                                disabled={manualOrderLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateWalkInOrder}
                                className="save-button"
                                disabled={manualOrderLoading}
                            >
                                {manualOrderLoading ? 'Creating...' : 'Create & Mark Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Profile</h3>
                            <button className="close-button" onClick={() => setShowProfileModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        {profileLoading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <form className="profile-form" onSubmit={handleSaveProfile}>
                                <div className="form-group">
                                    <label>Profile Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            setProfileImageFile(file || null);
                                            if (file) {
                                                setProfileImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    {profileImagePreview && (
                                        <img
                                            src={profileImagePreview}
                                            alt="Profile Preview"
                                            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }}
                                        />
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileEdit.first_name}
                                        onChange={(e) => setProfileEdit({ ...profileEdit, first_name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileEdit.last_name}
                                        onChange={(e) => setProfileEdit({ ...profileEdit, last_name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileEdit.email}
                                        onChange={(e) => setProfileEdit({ ...profileEdit, email: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Old Password</label>
                                    <div className="password-visibility-wrap">
                                        <input
                                            type={showOldPassword ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={passwordEdit.oldPassword}
                                            onChange={(e) => setPasswordEdit({ ...passwordEdit, oldPassword: e.target.value })}
                                            className="input-field"
                                        />
                                        <button type="button" className="password-visibility-btn" onClick={() => setShowOldPassword((v) => !v)}>
                                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="password-visibility-wrap">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordEdit.newPassword}
                                            onChange={(e) => setPasswordEdit({ ...passwordEdit, newPassword: e.target.value })}
                                            className="input-field"
                                        />
                                        <button type="button" className="password-visibility-btn" onClick={() => setShowNewPassword((v) => !v)}>
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <div className="password-visibility-wrap">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordEdit.confirmPassword}
                                            onChange={(e) => setPasswordEdit({ ...passwordEdit, confirmPassword: e.target.value })}
                                            className="input-field"
                                        />
                                        <button type="button" className="password-visibility-btn" onClick={() => setShowConfirmPassword((v) => !v)}>
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowProfileModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={profileLoading || passwordLoading}>
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerDashboard;
