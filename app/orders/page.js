'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchOrders();
        else if (!authLoading) setLoading(false);
    }, [user, authLoading]);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }

    if (!user && !authLoading) {
        return (
            <div className="container">
                <div className="cart-empty fade-in">
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>ðŸ”</div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                        Please Login
                    </h2>
                    <p>You need to be logged in to view your orders.</p>
                    <Link href="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Login â†’
                    </Link>
                </div>
            </div>
        );
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
        <div className="container fade-in">
            <div className="page-header">
                <h1>My Orders</h1>
                <p>Track your order history</p>
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">ðŸ“¦</div>
                    <p>No orders yet. Start shopping to see your orders here!</p>
                    <Link href="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Shop Now â†’
                    </Link>
                </div>
            ) : (
                <div>
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                                    <span className="order-date" style={{ marginLeft: '16px' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <span className={`badge ${statusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-items">
                                {order.products.map((item, idx) => (
                                    <div key={idx} className="order-item">
                                        <span>
                                            {item.title}
                                            {item.color ? ` (${item.color})` : ''}
                                            {' '}Ã— {item.quantity}
                                        </span>
                                        <span>â‚¹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-total">
                                <span>Total</span>
                                <span>â‚¹{order.totalAmount.toLocaleString('en-IN')}</span>
                            </div>

                            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                ðŸ“ {order.address} â€¢ ðŸ“ž {order.phone}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
