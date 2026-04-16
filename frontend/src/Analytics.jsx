import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
    const [bestSellers, setBestSellers] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?.user_id;

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [bestSellersRes, salesRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/analytics/best-sellers?period=${period}`),
                axios.get(`http://localhost:5000/api/admin/analytics/sales`, {
                    params: { period, userId },
                    headers: userId ? { 'x-user-id': String(userId) } : {}
                })
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

    const formatShortDate = (value) => {
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseDateFromKey = (key) => {
        if (key instanceof Date) {
            return new Date(key.getFullYear(), key.getMonth(), key.getDate());
        }

        if (typeof key === 'string') {
            const normalized = key.includes('T') ? key : `${key}T00:00:00`;
            return new Date(normalized);
        }

        return new Date(key);
    };

    const toDateKey = (value) => {
        const date = parseDateFromKey(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return formatDateKey(date);
    };

    const getMonthWeekSlots = () => {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const firstWeekStart = new Date(monthStart);
        firstWeekStart.setDate(monthStart.getDate() - monthStart.getDay());
        firstWeekStart.setHours(0, 0, 0, 0);

        const slots = [];
        let currentStart = new Date(firstWeekStart);
        let weekNumber = 1;

        while (currentStart <= monthEnd) {
            const currentEnd = new Date(currentStart);
            currentEnd.setDate(currentStart.getDate() + 6);

            slots.push({
                week_number: weekNumber,
                week_start: formatDateKey(currentStart),
                week_end: formatDateKey(currentEnd)
            });

            currentStart.setDate(currentStart.getDate() + 7);
            weekNumber += 1;
        }

        return slots;
    };

    const buildDateSlots = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (period === 'weekly') {
            const monday = new Date(today);
            const day = monday.getDay();
            const mondayOffset = day === 0 ? -6 : 1 - day;
            monday.setDate(monday.getDate() + mondayOffset);

            return Array.from({ length: 7 }, (_, index) => {
                const current = new Date(monday);
                current.setDate(monday.getDate() + index);
                return {
                    date: formatDateKey(current),
                    label: current.toLocaleDateString('en-US', { weekday: 'short' }),
                    tooltipLabel: formatShortDate(current)
                };
            });
        }

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const totalDays = monthEnd.getDate();

        return Array.from({ length: totalDays }, (_, index) => {
            const current = new Date(monthStart);
            current.setDate(monthStart.getDate() + index);
            return {
                date: formatDateKey(current),
                label: String(current.getDate()),
                tooltipLabel: formatShortDate(current)
            };
        });
    };

    const getWeeklyBucketsForMonthlyView = (dailyRows) => {
        const weekSlots = getMonthWeekSlots();
        const grouped = new Map();

        weekSlots.forEach((slot) => {
            grouped.set(slot.week_number, {
                ...slot,
                total_revenue: 0,
                orders_count: 0
            });
        });

        dailyRows.forEach((row) => {
            const currentDateKey = toDateKey(row.date);
            if (!currentDateKey) return;

            const date = parseDateFromKey(currentDateKey);
            const slot = weekSlots.find((entry) => currentDateKey >= entry.week_start && currentDateKey <= entry.week_end);

            if (!slot) return;

            const bucket = grouped.get(slot.week_number);
            bucket.total_revenue += Number(row.total_revenue || 0);
            bucket.orders_count += Number(row.orders_count || 0);
        });

        return Array.from(grouped.values()).sort((left, right) => left.week_number - right.week_number);
    };

    const salesChartData = (() => {
        if (period === 'monthly') {
            const weeklyBuckets = getWeeklyBucketsForMonthlyView(salesData);
            return weeklyBuckets.map((bucket) => {
                const start = parseDateFromKey(bucket.week_start || bucket.date);
                const end = parseDateFromKey(bucket.week_end || bucket.date);

                return {
                    date: bucket.week_start || bucket.date,
                    total_revenue: Number(bucket.total_revenue || 0),
                    orders_count: Number(bucket.orders_count || 0),
                    label: `Week ${bucket.week_number}`,
                    tooltipLabel: `${formatShortDate(start)} - ${formatShortDate(end)}`
                };
            });
        }

        const salesByDate = salesData.reduce((acc, row) => {
            const key = toDateKey(row.date);
            if (!key) return acc;

            acc.set(key, {
                total_revenue: Number(row.total_revenue || 0),
                orders_count: Number(row.orders_count || 0)
            });
            return acc;
        }, new Map());

        return buildDateSlots().map((slot) => {
            const existing = salesByDate.get(slot.date);
            return {
                date: slot.date,
                total_revenue: existing?.total_revenue ?? 0,
                orders_count: existing?.orders_count ?? 0,
                label: slot.label,
                tooltipLabel: slot.tooltipLabel
            };
        });
    })();

    const chartWidthPx = Math.max(560, salesChartData.length * 42);

    const chartPoints = (() => {
        if (salesChartData.length === 0) return [];

        const maxRevenue = Math.max(...salesChartData.map((entry) => entry.total_revenue || 0), 0);
        const chartWidth = 100;
        const chartHeight = 100;
        const topPadding = 12;
        const bottomPadding = 8;
        const verticalRange = chartHeight - topPadding - bottomPadding;

        return salesChartData.map((day, index) => {
            const x = salesChartData.length === 1
                ? 50
                : ((index + 0.5) / salesChartData.length) * chartWidth;
            const y = maxRevenue > 0
                ? topPadding + (1 - ((day.total_revenue || 0) / maxRevenue)) * verticalRange
                : chartHeight - bottomPadding;
            
            const percentageOfMax = maxRevenue > 0 
                ? Math.round(((day.total_revenue || 0) / maxRevenue) * 100)
                : 0;

            return {
                ...day,
                x,
                y,
                label: day.label,
                displayLabel: `${Math.round(day.total_revenue || 0)} (${percentageOfMax}%)`,
                tooltip: `${day.tooltipLabel}: ${formatCurrency(day.total_revenue)} (${day.orders_count} orders)`
            };
        });
    })();

    const chartPath = chartPoints.length > 0
        ? chartPoints.map((point) => `${point.x},${point.y}`).join(' ')
        : '';

    const hoveredChartPoint = hoveredPoint !== null ? chartPoints[hoveredPoint] : null;
    const tooltipPrefersLeft = Boolean(hoveredChartPoint && hoveredChartPoint.x > 78);
    const tooltipPrefersBottom = Boolean(hoveredChartPoint && hoveredChartPoint.y < 24);

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
                            <div className="chart-container line-chart-container">
                                <div className={`chart-scroll-x ${period === 'weekly' ? 'no-scroll' : ''}`}>
                                    <div className="chart-plot" style={{ width: period === 'weekly' ? '100%' : `${chartWidthPx}px` }}>
                                        <div className="chart-stage">
                                            <svg
                                                className="sales-line-chart"
                                                viewBox="0 0 100 100"
                                                preserveAspectRatio="none"
                                                role="img"
                                                aria-label={`Sales line chart for ${period === 'weekly' ? 'this week' : 'this month'}`}
                                            >
                                                <defs>
                                                    <linearGradient id="salesLineFill" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="rgba(37, 99, 235, 0.35)" />
                                                        <stop offset="100%" stopColor="rgba(37, 99, 235, 0.02)" />
                                                    </linearGradient>
                                                    <linearGradient id="salesLineStroke" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#2563eb" />
                                                        <stop offset="100%" stopColor="#10b981" />
                                                    </linearGradient>
                                                </defs>

                                                <line x1="0" y1="0" x2="0" y2="100" className="chart-axis" />
                                                <line x1="0" y1="100" x2="100" y2="100" className="chart-axis" />

                                                {chartPoints.length > 1 && (
                                                    <>
                                                        <polygon
                                                            className="sales-line-area"
                                                            points={`${chartPath} 100,100 0,100`}
                                                            fill="url(#salesLineFill)"
                                                        />
                                                        <polyline
                                                            className="sales-line-path"
                                                            points={chartPath}
                                                            fill="none"
                                                            stroke="url(#salesLineStroke)"
                                                            strokeWidth="2.1"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </>
                                                )}

                                                {chartPoints.map((point, index) => (
                                                    <g key={`${point.date}-${index}`}>
                                                        <circle
                                                            cx={point.x}
                                                            cy={point.y}
                                                            r="6"
                                                            fill="transparent"
                                                            onMouseEnter={() => setHoveredPoint(index)}
                                                            onMouseLeave={() => setHoveredPoint(null)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                        <circle
                                                            className="sales-line-point"
                                                            cx={point.x}
                                                            cy={point.y}
                                                            r="1.8"
                                                            pointerEvents="none"
                                                        />
                                                    </g>
                                                ))}
                                            </svg>

                                            {hoveredChartPoint && (
                                                <div
                                                    className="chart-tooltip-floating"
                                                    style={{
                                                        left: `${hoveredChartPoint.x}%`,
                                                        top: `${hoveredChartPoint.y}%`,
                                                        transform: tooltipPrefersBottom
                                                            ? (tooltipPrefersLeft
                                                                ? 'translate(calc(-100% - 10px), 10px)'
                                                                : 'translate(10px, 10px)')
                                                            : (tooltipPrefersLeft
                                                                ? 'translate(calc(-100% - 10px), -105%)'
                                                                : 'translate(10px, -105%)')
                                                    }}
                                                >
                                                    <div className="tooltip-label">{hoveredChartPoint.tooltipLabel}</div>
                                                    <div className="tooltip-sales">{formatCurrency(hoveredChartPoint.total_revenue)}</div>
                                                    <div className="tooltip-orders">{hoveredChartPoint.orders_count} orders</div>
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="line-chart-labels"
                                            style={{ gridTemplateColumns: `repeat(${chartPoints.length}, minmax(0, 1fr))` }}
                                        >
                                            {chartPoints.map((point, index) => (
                                                <div key={`${point.date}-label-${index}`} className="line-chart-label">
                                                    {point.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {period !== 'weekly' && chartWidthPx > 640 && (
                                    <div className="chart-scroll-indicator" aria-hidden="true">
                                        <span className="scroll-arrow">&#8592;</span>
                                        <span className="scroll-text">Scroll horizontally for more dates</span>
                                        <span className="scroll-arrow">&#8594;</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;