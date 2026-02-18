'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useToast } from '@/components/ToastContext';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    async function fetchProduct() {
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            if (data.product) {
                setProduct(data.product);
            } else {
                router.push('/products');
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleAddToCart() {
        if (!product || product.stock === 0) return;
        addToCart(product, quantity);
        addToast(`${product.title} added to cart!`, 'success');
    }

    if (loading) {
        return (
            <div className="container product-detail">
                <div className="product-detail-grid">
                    <div className="skeleton" style={{ aspectRatio: '3/4' }}></div>
                    <div>
                        <div className="skeleton" style={{ height: '16px', width: '30%', marginBottom: '12px' }}></div>
                        <div className="skeleton" style={{ height: '36px', marginBottom: '16px' }}></div>
                        <div className="skeleton" style={{ height: '40px', width: '40%', marginBottom: '24px' }}></div>
                        <div className="skeleton" style={{ height: '80px', marginBottom: '24px' }}></div>
                        <div className="skeleton" style={{ height: '48px', width: '200px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <>
            <div className="container product-detail fade-in">
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/products" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        ← Back to Products
                    </Link>
                </div>

                <div className="product-detail-grid">
                    <div className="product-gallery">
                        <div className="product-main-image">
                            {product.images && product.images.length > 0 && (product.images[0].startsWith('data:') || product.images[0].startsWith('http')) ? (
                                <img src={product.images[selectedImage] || product.images[0]} alt={product.title} />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #2a2520, #1a1510)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '6rem',
                                }}>
                                    👗
                                </div>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="product-thumbnails">
                                {product.images.map((img, i) => (
                                    <button
                                        key={i}
                                        className={`product-thumb ${selectedImage === i ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(i)}
                                    >
                                        <img src={img} alt={`${product.title} ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-info">
                        <span className="category-label">{product.category}</span>
                        <h1>{product.title}</h1>
                        <div className="product-price-tag">₹{product.price.toLocaleString('en-IN')}</div>

                        <p className="product-description">{product.description}</p>

                        <div className="stock-info">
                            <span className={`stock-dot ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></span>
                            {product.stock > 0 ? (
                                <span style={{ color: 'var(--success)' }}>
                                    In Stock ({product.stock} available)
                                </span>
                            ) : (
                                <span style={{ color: 'var(--error)' }}>Out of Stock</span>
                            )}
                        </div>

                        {product.stock > 0 && (
                            <>
                                <div className="quantity-selector">
                                    <label>Quantity:</label>
                                    <div className="quantity-controls">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                                    </div>
                                </div>

                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                    🛒 Add to Cart
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
