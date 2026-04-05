import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    const getTotalSales = () => {
        return salesData.reduce((sum, day) => sum + (day.total_revenue || 0), 0);
    };

    const getTotalOrders = () => {
        return salesData.reduce((sum, day) => sum + (day.orders_count || 0), 0);
    };

    const topThreeProducts = bestSellers.slice(0, 3);

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

            <div className="analytics-panels">
                <div className="analytics-panel top-products-panel">
                    <h2>🏆 Top 3 Most Sold Products ({period === 'weekly' ? 'This Week' : 'This Month'})</h2>

                    {topThreeProducts.length === 0 ? (
                        <div className="no-data">No sales data available for this period</div>
                    ) : (
                        <div className="top-products-list">
                            {topThreeProducts.map((product, index) => (
                                <div key={product.product_id} className="top-product-row">
                                    <div className="top-product-rank">#{index + 1}</div>
                                    <div className="top-product-details">
                                        <h4>{product.name}</h4>
                                        <p>{product.total_sold} sold</p>
                                    </div>
                                    <div className="top-product-revenue">{formatCurrency(product.total_revenue)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="analytics-panel sales-overview-panel">
                    <h2>📊 Sales Overview ({period === 'weekly' ? 'This Week' : 'This Month'})</h2>

                    <div className="overview-metrics">
                        <div className="overview-metric-card">
                            <div className="card-icon orders">
                                <BarChart3 size={24} />
                            </div>
                            <div className="card-content">
                                <h3>{getTotalOrders()}</h3>
                                <p>Total Orders</p>
                            </div>
                        </div>
                        <div className="overview-metric-card">
                            <div className="card-icon revenue">
                                <TrendingUp size={24} />
                            </div>
                            <div className="card-content">
                                <h3>{formatCurrency(getTotalSales())}</h3>
                                <p>Total Sales</p>
                            </div>
                        </div>
                    </div>

                    <div className="sales-chart-card">
                        <h3>Sales Chart</h3>
                        {salesData.length === 0 ? (
                            <div className="no-data">No sales data available</div>
                        ) : (
                            <div className="chart-container">
                                <div className="chart-bars">
                                    {salesData.map((day, index) => {
                                        const maxRevenue = Math.max(...salesData.map((d) => d.total_revenue || 0));
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
            </div>
        </div>
    );
};

export default Analytics;