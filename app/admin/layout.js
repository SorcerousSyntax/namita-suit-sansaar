'use client';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="loading-spinner" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const navItems = [
        { href: '/admin', label: '📊 Dashboard', exact: true },
        { href: '/admin/products', label: '📦 Products' },
        { href: '/admin/orders', label: '🛒 Orders' },
        { href: '/admin/customers', label: '👥 Customers' },
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>⚙️ Admin Panel</h2>
                <ul className="admin-nav">
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={
                                    item.exact
                                        ? pathname === item.href ? 'active' : ''
                                        : pathname.startsWith(item.href) ? 'active' : ''
                                }
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </aside>
            <div className="admin-content">
                {children}
            </div>
        </div>
    );
}
