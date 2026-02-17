'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastContext';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => { fetchOrders(); }, []);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
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
            'Pending': 'badge-warning',
            'Shipped': 'badge-gold',
            'Delivered': 'badge-success',
        };
        return map[status] || 'badge-gold';
    };

    return (
        <div className="fade-in">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '24px' }}>Orders</h1>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p>No orders yet</p>
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{order.fullName}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                📞 {order.phone}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                                                📍 {order.address}, {order.pincode}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {order.products.map((item, i) => (
                                                <div key={i}>{item.title} × {item.quantity}</div>
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
                                        <select
                                            className="input"
                                            value={order.status}
                                            onChange={e => updateStatus(order._id, e.target.value)}
                                            style={{ padding: '8px', fontSize: '0.85rem', minWidth: '120px' }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
