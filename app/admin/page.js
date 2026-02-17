'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '24px' }}>Dashboard</h1>
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card">
                            <div className="skeleton" style={{ height: '40px', width: '60px', marginBottom: '8px' }}></div>
                            <div className="skeleton" style={{ height: '16px', width: '80%' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '24px' }}>
                Dashboard Overview
            </h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value">{stats?.totalProducts || 0}</div>
                    <div className="stat-label">Total Products</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-value">{stats?.totalOrders || 0}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-label">Registered Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
            </div>

            <div style={{ marginTop: '32px', padding: '24px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '16px' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href="/admin/products" className="btn btn-primary">Manage Products</a>
                    <a href="/admin/orders" className="btn btn-secondary">View Orders</a>
                    <a href="/admin/customers" className="btn btn-secondary">View Customers</a>
                </div>
            </div>
        </div>
    );
}
