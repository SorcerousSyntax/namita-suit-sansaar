'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useToast } from '@/components/ToastContext';
import Link from 'next/link';
import Footer from '@/components/Footer';

function getColorVariants(product) {
    if (!product) return [];

    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
        return product.colorVariants
            .map(variant => ({
                color: (variant?.color || '').trim(),
                image: (variant?.image || '').trim(),
            }))
            .filter(variant => variant.color && variant.image);
    }

    const images = Array.isArray(product.images) ? product.images : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    return colors
        .map((color, index) => ({
            color,
            image: images[index] || images[0] || '',
        }))
        .filter(variant => variant.color && variant.image);
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState('');

    const colorVariants = useMemo(() => getColorVariants(product), [product]);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (!product) return;

        if (colorVariants.length > 0) {
            setSelectedColor(colorVariants[0].color);
        } else if (Array.isArray(product.colors) && product.colors.length > 0) {
            setSelectedColor(product.colors[0]);
        } else {
            setSelectedColor('');
        }

        setSelectedImage(0);
    }, [product, colorVariants]);

    useEffect(() => {
        if (!product || !selectedColor || colorVariants.length === 0) return;

        const variant = colorVariants.find(item => item.color === selectedColor);
        if (!variant?.image) return;

        const imageList = Array.isArray(product.images) ? product.images : [];
        const matchedIndex = imageList.findIndex(image => image === variant.image);
        if (matchedIndex >= 0) {
            setSelectedImage(matchedIndex);
        }
    }, [selectedColor, product, colorVariants]);

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

        const hasColors = (Array.isArray(product.colors) && product.colors.length > 0) || colorVariants.length > 0;
        if (hasColors && !selectedColor) {
            addToast('Please select a color', 'error');
            return;
        }

        const selectedVariant = colorVariants.find(variant => variant.color === selectedColor);
        addToCart(product, quantity, {
            color: selectedColor || null,
            image: selectedVariant?.image || null,
        });
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

    const images = Array.isArray(product.images) ? product.images : [];
    const selectedVariant = colorVariants.find(variant => variant.color === selectedColor);
    const displayImage = selectedVariant?.image || images[selectedImage] || images[0] || '';

    return (
        <>
            <div className="container product-detail fade-in">
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/products" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Back to Products
                    </Link>
                </div>

                <div className="product-detail-grid">
                    <div className="product-gallery">
                        <div className="product-main-image">
                            {displayImage && (displayImage.startsWith('data:') || displayImage.startsWith('http')) ? (
                                <img src={displayImage} alt={product.title} />
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
                                    IMG
                                </div>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="product-thumbnails">
                                {images.map((img, index) => (
                                    <button
                                        key={`${img}-${index}`}
                                        type="button"
                                        className={`product-thumb ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={img} alt={`${product.title} ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-info">
                        <span className="category-label">{product.category}</span>
                        <h1>{product.title}</h1>
                        <div className="product-price-tag">Rs {Number(product.price || 0).toLocaleString('en-IN')}</div>

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

                        {((Array.isArray(product.colors) && product.colors.length > 0) || colorVariants.length > 0) && (
                            <div className="color-selector">
                                <label>Color:</label>
                                <div className="color-options">
                                    {(colorVariants.length > 0
                                        ? colorVariants.map(variant => variant.color)
                                        : product.colors
                                    ).map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`color-chip ${selectedColor === color ? 'active' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            <span className="color-swatch" style={{ background: color }}></span>
                                            <span>{color}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.stock > 0 && (
                            <>
                                <div className="quantity-selector">
                                    <label>Quantity:</label>
                                    <div className="quantity-controls">
                                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                        <span>{quantity}</span>
                                        <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                                    </div>
                                </div>

                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                    Add to Cart
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
