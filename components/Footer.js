'use client';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-grid">
                    <div>
                        <div className="footer-brand">Namita Suit Sansaar</div>
                        <p className="footer-desc">
                            Your premier destination for elegant ethnic wear. We bring you the finest collection
                            of suits, lehengas, and traditional outfits crafted with love and precision.
                        </p>
                    </div>

                    <div>
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/products">Shop All</Link></li>
                            <li><Link href="/cart">Cart</Link></li>
                            <li><Link href="/orders">My Orders</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Categories</h4>
                        <ul className="footer-links">
                            <li><Link href="/products?category=Party+Wear">Party Wear</Link></li>
                            <li><Link href="/products?category=Cotton+Suits">Cotton Suits</Link></li>
                            <li><Link href="/products?category=Silk+Suits">Silk Suits</Link></li>
                            <li><Link href="/products?category=Bridal+Collection">Bridal Collection</Link></li>
                            <li><Link href="/products?category=Jewellery+Sets">Artificial Jewellery</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Contact Us</h4>
                        <ul className="footer-links">
                            <li>📧 namitasuitsansaar@gmail.com</li>
                            <li>📞 +91 9315749405</li>
                            <li>📍 sainik enclave part 2 jharoda kaln, New Delhi</li>
                            <li style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <a href="#" style={{ fontSize: '1.3rem' }}>📘</a>
                                    <a href="#" style={{ fontSize: '1.3rem' }}>📸</a>
                                    <a href="#" style={{ fontSize: '1.3rem' }}>🐦</a>
                                    <a href="#" style={{ fontSize: '1.3rem' }}>📌</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} Namita Suit Sansaar. All rights reserved. |{' '}
                        <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms & Conditions</Link> |{' '}
                        <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
