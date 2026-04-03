import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user?.role_name || '');
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [bestSellersRes, salesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/analytics/best-sellers?period=${period}`),
                axios.get(`http://localhost:5000/api/admin/analytics/sales?period=${period}`)
            ]);

            setBestSellers(bestSellersRes.data.bestSellers);
            setSalesData(salesRes.data.sales);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const getTotalRevenue = () => {
        return salesData.reduce((sum, day) => sum + (day.total_revenue || 0), 0);
    };

    const getTotalOrders = () => {
        return salesData.reduce((sum, day) => sum + (day.orders_count || 0), 0);
    };

    const getAverageOrderValue = () => {
        const totalRevenue = getTotalRevenue();
        const totalOrders = getTotalOrders();
        return totalOrders > 0 ? totalRevenue / totalOrders : 0;
    };

    if (loading) {
        return <div className="analytics-loading">Loading analytics...</div>;
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1><BarChart3 size={32} /> Sales Analytics</h1>
                <div className="period-selector">
                    <button
                        className={period === 'weekly' ? 'active' : ''}
                        onClick={() => setPeriod('weekly')}
                    >
                        <Calendar size={16} />
                        This Week
                    </button>
                    <button
                        className={period === 'monthly' ? 'active' : ''}
                        onClick={() => setPeriod('monthly')}
                    >
                        <Calendar size={16} />
                        This Month
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon revenue">
                        <TrendingUp size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{formatCurrency(getTotalRevenue())}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon orders">
                        <BarChart3 size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{getTotalOrders()}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon average">
                        <Users size={24} />
                    </div>
                    <div className="card-content">
                        <h3>{formatCurrency(getAverageOrderValue())}</h3>
                        <p>Average Order Value</p>
                    </div>
                </div>
            </div>

            {/* Best Sellers */}
            <div className="analytics-section">
                <h2>🏆 Best Sellers ({period === 'weekly' ? 'This Week' : 'This Month'})</h2>
                {bestSellers.length === 0 ? (
                    <div className="no-data">No sales data available for this period</div>
                ) : (
                    <div className="best-sellers-grid">
                        {bestSellers.map((product, index) => (
                            <div key={product.product_id} className="best-seller-card">
                                <div className="rank-badge">#{index + 1}</div>
                                <div className="product-image">
                                    <img
                                        src={product.image_url || 'https://via.placeholder.com/100'}
                                        alt={product.name}
                                    />
                                </div>
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <p className="price">{formatCurrency(product.price)}</p>
                                    <div className="sales-stats">
                                        <span className="sold">{product.total_sold} sold</span>
                                        <span className="revenue">{formatCurrency(product.total_revenue)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sales Chart (Admin/Worker only) */}
            {(userRole === 'admin' || userRole === 'worker') && (
                <div className="analytics-section">
                    <h2>📊 Daily Sales Trend</h2>
                    <div className="sales-chart">
                        {salesData.length === 0 ? (
                            <div className="no-data">No sales data available</div>
                        ) : (
                            <div className="chart-container">
                                <div className="chart-bars">
                                    {salesData.map((day, index) => {
                                        const maxRevenue = Math.max(...salesData.map(d => d.total_revenue || 0));
                                        const height = maxRevenue > 0 ? (day.total_revenue / maxRevenue) * 100 : 0;

                                        return (
                                            <div key={index} className="chart-bar-container">
                                                <div
                                                    className="chart-bar"
                                                    style={{ height: `${height}%` }}
                                                    title={`${day.date}: ${formatCurrency(day.total_revenue)} (${day.orders_count} orders)`}
                                                >
                                                    <span className="bar-value">{formatCurrency(day.total_revenue)}</span>
                                                </div>
                                                <span className="bar-label">
                                                    {new Date(day.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;