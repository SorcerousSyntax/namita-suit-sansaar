'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastContext';

const categories = [
    'Party Wear', 'Cotton Suits', 'Winter Collection', 'Silk Suits',
    'Anarkali', 'Palazzo Sets', 'Bridal Collection', 'Daily Wear',
    'Necklaces', 'Earrings', 'Bangles', 'Jewellery Sets', 'Maang Tikka',
];

const EMPTY_COLOR_VARIANT = { color: '', image: '' };

function normalizeVariants(variants) {
    if (!Array.isArray(variants)) return [];

    const cleaned = variants
        .map(variant => ({
            color: (variant?.color || '').trim(),
            image: (variant?.image || '').trim(),
        }))
        .filter(variant => variant.color || variant.image);

    const hasIncomplete = cleaned.some(variant => !variant.color || !variant.image);
    if (hasIncomplete) {
        return { error: 'Each color variant needs both color and image.' };
    }

    const deduped = [];
    const seen = new Set();
    for (const variant of cleaned) {
        const key = variant.color.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(variant);
        }
    }

    return { variants: deduped };
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: categories[0],
        images: [],
        colorVariants: [EMPTY_COLOR_VARIANT],
    });
    const [uploading, setUploading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingProduct(null);
        setForm({
            title: '',
            description: '',
            price: '',
            stock: '',
            category: categories[0],
            images: [],
            colorVariants: [EMPTY_COLOR_VARIANT],
        });
        setShowModal(true);
    }

    function openEditModal(product) {
        const productImages = Array.isArray(product.images) ? product.images : [];
        const variantList = Array.isArray(product.colorVariants) && product.colorVariants.length > 0
            ? product.colorVariants
                .map(variant => ({
                    color: (variant?.color || '').trim(),
                    image: (variant?.image || '').trim(),
                }))
                .filter(variant => variant.color && variant.image)
            : (Array.isArray(product.colors) ? product.colors : [])
                .map((color, index) => ({
                    color,
                    image: productImages[index] || productImages[0] || '',
                }))
                .filter(variant => variant.color && variant.image);

        setEditingProduct(product);
        setForm({
            title: product.title,
            description: product.description,
            price: String(product.price),
            stock: String(product.stock),
            category: product.category,
            images: productImages,
            colorVariants: variantList.length > 0 ? variantList : [EMPTY_COLOR_VARIANT],
        });
        setShowModal(true);
    }

    function handleColorVariantChange(index, field, value) {
        setForm(prev => ({
            ...prev,
            colorVariants: prev.colorVariants.map((variant, i) => (
                i === index ? { ...variant, [field]: value } : variant
            )),
        }));
    }

    function addColorVariant() {
        setForm(prev => ({
            ...prev,
            colorVariants: [...prev.colorVariants, { ...EMPTY_COLOR_VARIANT }],
        }));
    }

    function removeColorVariant(index) {
        setForm(prev => {
            const nextVariants = prev.colorVariants.filter((_, i) => i !== index);
            return {
                ...prev,
                colorVariants: nextVariants.length > 0 ? nextVariants : [{ ...EMPTY_COLOR_VARIANT }],
            };
        });
    }

    async function handleImageUpload(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploading(true);

        try {
            const uploadedUrls = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error || `Upload failed (${res.status})`);
                }

                const data = await res.json();
                const urls = Array.isArray(data.urls) ? data.urls : (data.url ? [data.url] : []);
                if (!urls.length) {
                    throw new Error('No URL returned from server');
                }
                uploadedUrls.push(...urls);
            }

            setForm(prev => {
                const nextImages = [...prev.images, ...uploadedUrls];
                let nextUploadIndex = 0;
                const nextVariants = prev.colorVariants.map(variant => {
                    if (variant.image || nextUploadIndex >= uploadedUrls.length) return variant;
                    const image = uploadedUrls[nextUploadIndex];
                    nextUploadIndex += 1;
                    return { ...variant, image };
                });

                return {
                    ...prev,
                    images: nextImages,
                    colorVariants: nextVariants,
                };
            });

            addToast(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded!`, 'success');
        } catch (error) {
            console.error('Upload error:', error);
            addToast(error.message, 'error');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleSave(e) {
        e.preventDefault();

        if (form.images.length === 0) {
            if (!confirm('This product has no images. Save anyway?')) return;
        }

        const normalized = normalizeVariants(form.colorVariants);
        if (normalized.error) {
            addToast(normalized.error, 'error');
            return;
        }

        const colorVariants = normalized.variants || [];

        const body = {
            title: form.title,
            description: form.description,
            price: parseFloat(form.price),
            stock: parseInt(form.stock, 10),
            category: form.category,
            images: form.images,
            colors: colorVariants.map(variant => variant.color),
            colorVariants,
        };

        try {
            const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                addToast(editingProduct ? 'Product updated!' : 'Product created!', 'success');
                setShowModal(false);
                fetchProducts();
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to save product', 'error');
            }
        } catch (error) {
            console.error(error);
            addToast(`Error saving product: ${error.message}`, 'error');
        }
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                addToast('Product deleted', 'success');
                fetchProducts();
            }
        } catch (error) {
            addToast('Failed to delete', 'error');
        }
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Products</h1>
                <button className="btn btn-primary" onClick={openAddModal}>+ Add Product</button>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '8px',
                                                background: 'var(--bg-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                flexShrink: 0,
                                                overflow: 'hidden',
                                            }}>
                                                {product.images?.[0] && (product.images[0].startsWith('data:') || product.images[0].startsWith('http'))
                                                    ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : 'IMG'}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{product.title}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-gold">{product.category}</span></td>
                                    <td>Rs {Number(product.price || 0).toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                                            {product.stock > 0 ? product.stock : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(product)}>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        No products yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea
                                        className="input"
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                                    <div className="input-group">
                                        <label>Price (Rs)</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={form.price}
                                            onChange={e => setForm({ ...form, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={form.stock}
                                            onChange={e => setForm({ ...form, stock: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select
                                        className="input"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Images</label>
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="input" />
                                    {uploading && <span style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>Uploading...</span>}
                                    {form.images.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                            {form.images.map((img, i) => (
                                                <div key={i} style={{ position: 'relative' }}>
                                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '8px',
                                                        background: 'var(--bg-tertiary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1rem',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {img.startsWith('data:') || img.startsWith('http')
                                                            ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            : 'IMG'}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-6px',
                                                            right: '-6px',
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            background: '#dc2626',
                                                            color: 'white',
                                                            border: 'none',
                                                            fontSize: '0.7rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    >x</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Color Variants (Color + Photo)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {form.colorVariants.map((variant, index) => (
                                            <div
                                                key={`${index}-${variant.image || 'none'}`}
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                                    gap: '10px',
                                                    padding: '12px',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: 'var(--bg-tertiary)',
                                                }}
                                            >
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Color name (e.g. Maroon)"
                                                    value={variant.color}
                                                    onChange={e => handleColorVariantChange(index, 'color', e.target.value)}
                                                />
                                                <select
                                                    className="input"
                                                    value={variant.image}
                                                    onChange={e => handleColorVariantChange(index, 'image', e.target.value)}
                                                    disabled={form.images.length === 0}
                                                >
                                                    <option value="">
                                                        {form.images.length === 0 ? 'Upload images first' : 'Select variant image'}
                                                    </option>
                                                    {form.images.map((img, imgIndex) => (
                                                        <option key={`${imgIndex}-${img}`} value={img}>
                                                            Image {imgIndex + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeColorVariant(index)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '10px' }}>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={addColorVariant}>
                                            + Add Color Variant
                                        </button>
                                    </div>
                                    <small style={{ color: 'var(--text-muted)' }}>
                                        Customer product image will switch when that color is selected.
                                    </small>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={uploading}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading Images...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                            </div>

                            {form.images.length === 0 && (
                                <p style={{ fontSize: '0.8rem', color: '#eab308', marginTop: '8px' }}>
                                    No images attached yet. Upload at least one product image.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
