'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-brand">
                    Namita <span>Suit Sansaar</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <li>
                        <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    </li>
                    <li>
                        <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
                    </li>
                    <li>
                        <Link href="/cart" onClick={() => setMenuOpen(false)}>
                            🛒 Cart
                            {getCartCount() > 0 && (
                                <span className="cart-badge">{getCartCount()}</span>
                            )}
                        </Link>
                    </li>

                    {user ? (
                        <>
                            <li>
                                <Link href="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                            </li>
                            {user.role === 'admin' && (
                                <li>
                                    <Link href="/admin" onClick={() => setMenuOpen(false)}>
                                        ⚙️ Admin
                                    </Link>
                                </li>
                            )}
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                            <li>
                                <span style={{ padding: '8px 16px', color: 'var(--gold)', fontSize: '0.9rem' }}>
                                    Hi, {user.name}
                                </span>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                            </li>
                            <li>
                                <Link href="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                                    Register
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
