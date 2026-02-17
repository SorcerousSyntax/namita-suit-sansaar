'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastContext';

const categories = [
    'Party Wear', 'Cotton Suits', 'Winter Collection', 'Silk Suits',
    'Anarkali', 'Palazzo Sets', 'Bridal Collection', 'Daily Wear',
    'Necklaces', 'Earrings', 'Bangles', 'Jewellery Sets', 'Maang Tikka',
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', price: '', stock: '', category: categories[0], images: [],
    });
    const [uploading, setUploading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => { fetchProducts(); }, []);

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
        setForm({ title: '', description: '', price: '', stock: '', category: categories[0], images: [] });
        setShowModal(true);
    }

    function openEditModal(product) {
        setEditingProduct(product);
        setForm({
            title: product.title,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category,
            images: product.images || [],
        });
        setShowModal(true);
    }

    async function handleImageUpload(e) {
        const files = e.target.files;
        if (!files.length) return;
        setUploading(true);
        const formData = new FormData();
        for (const file of files) {
            formData.append('images', file);
        }
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.urls) {
                setForm(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
                addToast('Images uploaded!', 'success');
            }
        } catch (error) {
            addToast('Upload failed', 'error');
        } finally {
            setUploading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        const body = {
            title: form.title,
            description: form.description,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            category: form.category,
            images: form.images,
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
                addToast(editingProduct ? 'Product updated!' : 'Product added!', 'success');
                setShowModal(false);
                fetchProducts();
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to save', 'error');
            }
        } catch (error) {
            addToast('Something went wrong', 'error');
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
                                                width: '48px', height: '48px', borderRadius: '8px',
                                                background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                                            }}>
                                                {product.images?.[0] && !product.images[0].startsWith('/uploads/sample')
                                                    ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                                    : '👗'}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{product.title}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-gold">{product.category}</span></td>
                                    <td>₹{product.price.toLocaleString('en-IN')}</td>
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
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input type="text" className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="input-group">
                                        <label>Price (₹)</label>
                                        <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>Stock</label>
                                        <input type="number" className="input" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required min="0" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
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
                                                        width: '60px', height: '60px', borderRadius: '8px',
                                                        background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden',
                                                    }}>
                                                        {img.startsWith('/uploads/sample') ? '👗' : <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                                                        style={{
                                                            position: 'absolute', top: '-6px', right: '-6px',
                                                            width: '20px', height: '20px', borderRadius: '50%',
                                                            background: '#dc2626', color: 'white', border: 'none',
                                                            fontSize: '0.7rem', cursor: 'pointer',
                                                        }}
                                                    >✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
