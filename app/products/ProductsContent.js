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
    const searchParams = useSearchParams();

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setCategory(cat);
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [category, search]);

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

                <div style={{ marginBottom: '32px' }}>
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search for suits, lehengas, and more..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="products-layout">
                    <div className="filter-sidebar">
                        <h3>Categories</h3>
                        <ul className="filter-list">
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button
                                        className={category === cat ? 'active' : ''}
                                        onClick={() => setCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
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
                                            {product.images && product.images[0] && !product.images[0].startsWith('/uploads/sample') ? (
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
                                                    👗
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
                                            <div className="product-card-price">₹{product.price.toLocaleString('en-IN')}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🔍</div>
                                <p>No products found. Try a different search or category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
