'use client';
import { useState, useEffect } from 'react';

export default function AdminCustomersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUsers(); }, []);

    async function fetchUsers() {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fade-in">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '24px' }}>Customers</h1>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <p>No registered customers yet</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Date Registered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: 'var(--gold-muted)', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', color: 'var(--gold)', fontWeight: 700,
                                                fontSize: '1rem',
                                            }}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
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
