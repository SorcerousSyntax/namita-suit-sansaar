'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const testimonials = [
    {
        name: 'Priya Sharma',
        location: 'New Delhi',
        text: 'Absolutely love the quality of suits here! The Banarasi silk collection is stunning. Will definitely order again.',
        initial: 'P',
    },
    {
        name: 'Ananya Gupta',
        location: 'Mumbai',
        text: 'The party wear suits are gorgeous and the fabric quality is top-notch. Fast delivery and beautiful packaging too!',
        initial: 'A',
    },
    {
        name: 'Meera Patel',
        location: 'Ahmedabad',
        text: 'Best online ethnic wear store I have found. The cotton suits are so comfortable and perfect for daily wear. Great prices!',
        initial: 'M',
    },
];

const heroSlides = [
    '/hero-1.jpg',
    '/hero-2.jpg',
    '/hero-3.jpg',
    '/hero-4.jpg',
];

export default function HomePage() {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        fetchFeatured();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    async function fetchFeatured() {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setFeatured((data.products || []).slice(0, 4));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-slideshow">
                    {heroSlides.map((src, i) => (
                        <div
                            key={i}
                            className={`hero-slide ${i === activeSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${src})` }}
                        />
                    ))}
                </div>
                <div className="hero-content">
                    <span className="hero-label">âœ¨ Premium Ethnic Wear Collection</span>
                    <h1>
                        Elegant Ethnic Wear
                        <span className="gold">For Every Occasion</span>
                    </h1>
                    <p>
                        Discover our exquisite collection of handcrafted suits, lehengas, and traditional
                        outfits designed to make you shine at every celebration.
                    </p>
                    <div className="hero-buttons">
                        <Link href="/products" className="btn btn-primary btn-lg">
                            Shop Now â†’
                        </Link>
                        <Link href="/products?category=Bridal+Collection" className="btn btn-outline btn-lg">
                            Bridal Collection
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Featured <span className="gold">Collection</span></h2>
                        <p>Handpicked styles for the modern woman</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="product-card">
                                    <div className="skeleton" style={{ aspectRatio: '3/4' }}></div>
                                    <div style={{ padding: '20px' }}>
                                        <div className="skeleton" style={{ height: '14px', marginBottom: '8px', width: '50%' }}></div>
                                        <div className="skeleton" style={{ height: '18px', marginBottom: '12px' }}></div>
                                        <div className="skeleton" style={{ height: '24px', width: '40%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : featured.length > 0 ? (
                        <div className="grid grid-4">
                            {featured.map(product => (
                                <Link href={`/products/${product._id}`} key={product._id} className="product-card">
                                    <div className="product-card-image">
                                        {product.images && product.images[0] && (product.images[0].startsWith('data:') || product.images[0].startsWith('http')) ? (
                                            <img src={product.images[0]} alt={product.title} />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #2a2520, #1a1510)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3rem',
                                            }}>
                                                ðŸ‘—
                                            </div>
                                        )}
                                        {product.stock <= 5 && product.stock > 0 && (
                                            <div className="product-card-badge">
                                                <span className="badge badge-warning">Only {product.stock} left</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-card-body">
                                        <span className="product-card-category">{product.category}</span>
                                        <h3 className="product-card-title">{product.title}</h3>
                                        {product.colors && product.colors.length > 0 && (
                                            <div className="product-card-colors">
                                                {product.colors.slice(0, 4).map((color) => (
                                                    <span
                                                        key={color}
                                                        className="color-dot"
                                                        style={{ background: color }}
                                                        title={color}
                                                    ></span>
                                                ))}
                                                {product.colors.length > 4 && (
                                                    <span className="color-more">+{product.colors.length - 4}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="product-card-price">â‚¹{product.price.toLocaleString('en-IN')}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">ðŸ›ï¸</div>
                            <p>No products yet. Click the button below to seed sample data!</p>
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: '16px' }}
                                onClick={async () => {
                                    await fetch('/api/seed', { method: 'POST' });
                                    window.location.reload();
                                }}
                            >
                                Seed Sample Products
                            </button>
                        </div>
                    )}

                    {featured.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <Link href="/products" className="btn btn-outline">
                                View All Products â†’
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose <span className="gold">Us</span></h2>
                        <p>Experience the difference of premium ethnic fashion</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">âœ¨</div>
                            <h3>Premium Quality</h3>
                            <p>Every piece is crafted with the finest fabrics and meticulous attention to detail</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">ðŸšš</div>
                            <h3>Fast Delivery</h3>
                            <p>Free shipping on orders above â‚¹999. Delivered to your doorstep within 5-7 days</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">ðŸ’Ž</div>
                            <h3>Authentic Designs</h3>
                            <p>Traditional patterns meet modern aesthetics in our exclusive designer collection</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">ðŸ”„</div>
                            <h3>Easy Returns</h3>
                            <p>Hassle-free 7-day return policy. Your satisfaction is our top priority</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>What Our <span className="gold">Customers Say</span></h2>
                        <p>Real reviews from our happy customers</p>
                    </div>

                    <div className="testimonials-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <div className="testimonial-stars">â˜…â˜…â˜…â˜…â˜…</div>
                                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.initial}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-location">{t.location}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '12px' }}>
                        Ready to Find Your <span style={{ color: 'var(--gold)' }}>Perfect Outfit?</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                        Browse our complete collection and discover ethnic wear that speaks to your style.
                    </p>
                    <Link href="/products" className="btn btn-primary btn-lg">
                        Explore Collection â†’
                    </Link>
                </div>
            </section>

            <Footer />
        </>
    );
}
