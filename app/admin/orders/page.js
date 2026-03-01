'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ToastContext';
import { openOrderPrintWindow } from '@/lib/printOrder';

function monthLabel(month, year) {
    return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
    });
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthYearBuckets, setMonthYearBuckets] = useState([]);
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const { addToast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, [selectedYear, selectedMonth]);

    async function fetchOrders() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedYear !== 'all') params.set('year', selectedYear);
            if (selectedMonth !== 'all') params.set('month', selectedMonth);

            const query = params.toString();
            const res = await fetch(query ? `/api/orders?${query}` : '/api/orders');
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch orders');
            }

            setOrders(data.orders || []);
            if (Array.isArray(data.monthYearBuckets)) {
                setMonthYearBuckets(data.monthYearBuckets);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
            addToast('Failed to fetch orders', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(orderId, status) {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                addToast(`Order updated to ${status}`, 'success');
                fetchOrders();
            } else {
                addToast('Failed to update', 'error');
            }
        } catch (error) {
            addToast('Something went wrong', 'error');
        }
    }

    const statusBadge = (status) => {
        const map = {
            Pending: 'badge-warning',
            Paid: 'badge-success',
            Shipped: 'badge-gold',
            Delivered: 'badge-success',
        };
        return map[status] || 'badge-gold';
    };

    const paymentBadge = (status) => {
        const map = {
            paid: 'badge-success',
            pending: 'badge-warning',
            failed: 'badge-error',
        };
        return map[status] || 'badge-warning';
    };

    const availableYears = useMemo(() => {
        const years = new Set();
        for (const bucket of monthYearBuckets) {
            years.add(String(bucket?._id?.year));
        }
        return [...years].filter(Boolean).sort((a, b) => Number(b) - Number(a));
    }, [monthYearBuckets]);

    const visibleHistoryBuckets = useMemo(() => {
        return monthYearBuckets.filter(bucket => {
            const yearMatch = selectedYear === 'all' || String(bucket?._id?.year) === selectedYear;
            const monthMatch = selectedMonth === 'all' || String(bucket?._id?.month) === selectedMonth;
            return yearMatch && monthMatch;
        });
    }, [monthYearBuckets, selectedYear, selectedMonth]);

    const groupedOrders = useMemo(() => {
        const groups = new Map();
        for (const order of orders) {
            const date = new Date(order.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const key = `${year}-${month}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(order);
        }
        return [...groups.entries()];
    }, [orders]);

    return (
        <div className="fade-in">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '16px' }}>Orders</h1>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <select
                    className="input"
                    value={selectedYear}
                    onChange={e => {
                        const nextYear = e.target.value;
                        setSelectedYear(nextYear);
                        if (nextYear === 'all') setSelectedMonth('all');
                    }}
                    style={{ minWidth: '140px' }}
                >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select
                    className="input"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    style={{ minWidth: '140px' }}
                    disabled={selectedYear === 'all'}
                >
                    <option value="all">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={String(month)}>
                            {new Date(2020, month - 1, 1).toLocaleDateString('en-IN', { month: 'long' })}
                        </option>
                    ))}
                </select>

                {(selectedYear !== 'all' || selectedMonth !== 'all') && (
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            setSelectedYear('all');
                            setSelectedMonth('all');
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                {visibleHistoryBuckets.map(bucket => {
                    const month = Number(bucket?._id?.month);
                    const year = Number(bucket?._id?.year);
                    const count = Number(bucket?.count || 0);
                    const totalAmount = Number(bucket?.totalAmount || 0);
                    return (
                        <div key={`${year}-${month}`} className="card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{monthLabel(month, year)}</div>
                            <div style={{ marginTop: '6px', fontWeight: 700 }}>{count} order{count === 1 ? '' : 's'}</div>
                            <div style={{ marginTop: '4px', color: 'var(--gold)', fontWeight: 600 }}>
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">No orders</div>
                    <p>No orders found for selected month/year.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Products</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedOrders.map(([groupKey, group]) => {
                                const [yearString, monthString] = groupKey.split('-');
                                const groupLabel = monthLabel(Number(monthString), Number(yearString));

                                return (
                                    <Fragment key={groupKey}>
                                        <tr>
                                            <td colSpan={8} style={{ fontWeight: 700, background: 'var(--bg-secondary)' }}>
                                                {groupLabel} ({group.length} order{group.length === 1 ? '' : 's'})
                                            </td>
                                        </tr>
                                        {group.map(order => (
                                            <tr key={order._id}>
                                                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </td>
                                                <td>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{order.fullName}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Phone: {order.phone}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                                                            {order.address}, {order.pincode}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.9rem' }}>
                                                        {order.products.map((item, i) => (
                                                            <div key={i}>
                                                                {item.title}
                                                                {item.color ? ` (${item.color})` : ''}
                                                                {' '}x {item.quantity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 700, color: 'var(--gold)' }}>
                                                    ₹{order.totalAmount.toLocaleString('en-IN')}
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                    })}
                                                    <br />
                                                    {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </td>
                                                <td>
                                                    <span className={`badge ${statusBadge(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${paymentBadge(order.paymentStatus || 'pending')}`}>
                                                        {(order.paymentStatus || 'pending').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <select
                                                            className="input"
                                                            value={order.status}
                                                            onChange={e => updateStatus(order._id, e.target.value)}
                                                            style={{ padding: '8px', fontSize: '0.85rem', minWidth: '120px' }}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Paid">Paid</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => openOrderPrintWindow(order, { title: 'Order Details' })}
                                                        >
                                                            Print / Save PDF
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
