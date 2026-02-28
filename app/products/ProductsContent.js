'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

const categories = [
    'All',
    'Party Wear',
    'Cotton Suits',
    'Winter Collection',
    'Silk Suits',
    'Anarkali',
    'Palazzo Sets',
    'Bridal Collection',
    'Daily Wear',
    'Necklaces',
    'Earrings',
    'Bangles',
    'Jewellery Sets',
    'Maang Tikka',
];

export default function ProductsContent() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [categoryOpen, setCategoryOpen] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat && categories.includes(cat)) {
            setCategory(cat);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [category, search]);

    useEffect(() => {
        setCategoryOpen(false);
    }, [category]);

    async function fetchProducts() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (category !== 'All') params.set('category', category);
            const res = await fetch(`/api/products?${params}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="container">
                <div className="page-header fade-in">
                    <h1>Our Collection</h1>
                    <p>Discover the perfect ethnic wear for every occasion</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <div
                        style={{
                            display: 'grid',
                            gap: '16px',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        }}
                    >
                        <div className="search-bar" style={{ maxWidth: '100%' }}>
                            <span className="search-icon">ðŸ”</span>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search for suits, lehengas, and more..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="input-group desktop-only">
                            <label>Category</label>
                            <select
                                className="input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="category-dropdown mobile-only">
                            <button
                                type="button"
                                className="btn btn-secondary category-dropdown-toggle"
                                onClick={() => setCategoryOpen(prev => !prev)}
                            >
                                <span>Category: {category}</span>
                                <span className={`chevron ${categoryOpen ? 'open' : ''}`}>v</span>
                            </button>
                            {categoryOpen && (
                                <div className="category-dropdown-menu">
                                    {categories.map(cat => (
                                        <button
                                            type="button"
                                            key={cat}
                                            className={`category-option ${cat === category ? 'active' : ''}`}
                                            onClick={() => {
                                                setCategory(cat);
                                                setCategoryOpen(false);
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Showing {products.length} result{products.length === 1 ? '' : 's'}
                        {category !== 'All' ? ` in ${category}` : ''}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
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
                ) : products.length > 0 ? (
                    <div className="grid grid-3">
                        {products.map(product => (
                            <Link href={`/products/${product._id}`} key={product._id} className="product-card">
                                <div className="product-card-image">
                                    {product.images && product.images[0] && (product.images[0].startsWith('data:') || product.images[0].startsWith('http')) ? (
                                        <img src={product.images[0]} alt={product.title} />
                                    ) : (
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #2a2520, #1a1510)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3rem',
                                            }}
                                        >
                                            ðŸ‘—
                                        </div>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="product-card-badge">
                                            <span className="badge badge-error">Out of Stock</span>
                                        </div>
                                    )}
                                    {product.stock > 0 && product.stock <= 5 && (
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
                        <div className="empty-state-icon">ðŸ”</div>
                        <p>No products found. Try a different search or category.</p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
