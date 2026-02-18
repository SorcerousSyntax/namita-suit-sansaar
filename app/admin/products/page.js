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
        setImageFile(null); // Reset image file for editing
        setShowModal(true);
    }

    async function uploadValues(files) {
        setUploading(true);
        const formData = new FormData();
        for (const file of files) {
            formData.append('images', file);
        }
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            let data;
            try { data = await res.json(); } catch (e) { throw new Error('Server Error'); }

            if (res.ok && data.urls) {
                setForm(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
                addToast('Images uploaded!', 'success');
            } else {
                addToast(data.error || 'Upload failed', 'error');
            }
        } catch (error) {
            addToast('Upload failed: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    }

    function handleImageUpload(e) {
        const files = e.target.files;
        if (!files.length) return;

        if (editingProduct) {
            // For editing, use the old flow: upload immediately to /api/upload
            uploadValues(files);
        } else {
            // For creating, just store the file to send with FormData later
            const file = files[0]; // User's API only handles one image
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setForm(prev => ({ ...prev, images: [e.target.result] }));
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSave(e) {
        e.preventDefault();

        if (form.images.length === 0 && !imageFile && !editingProduct) {
            if (!confirm('This product has no images. Save anyway?')) return;
        }

        try {
            if (editingProduct) {
                // UPDATE (PUT) - Use JSON
                const body = {
                    title: form.title,
                    description: form.description,
                    price: parseFloat(form.price),
                    stock: parseInt(form.stock),
                    category: form.category,
                    images: form.images,
                };
                const res = await fetch(`/api/products/${editingProduct._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) {
                    addToast('Product updated!', 'success');
                    setShowModal(false);
                    fetchProducts();
                } else {
                    const data = await res.json();
                    addToast(data.error || 'Failed to update product', 'error');
                }
            } else {
                // CREATE (POST) - Use FormData
                const formData = new FormData();
                formData.append('title', form.title);
                formData.append('description', form.description);
                formData.append('price', parseFloat(form.price));
                formData.append('stock', parseInt(form.stock));
                formData.append('category', form.category);
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                const res = await fetch('/api/products', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    addToast('Product created!', 'success');
                    setShowModal(false);
                    fetchProducts();
                } else {
                    const data = await res.json();
                    addToast(data.error || 'Failed to create product', 'error');
                }
            }
        } catch (error) {
            addToast('Error saving product', 'error');
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
                                                {product.images?.[0] && (product.images[0].startsWith('data:') || product.images[0].startsWith('http'))
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
                                                        {img.startsWith('data:') || img.startsWith('http') ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👗'}
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
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={uploading}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading Images...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                            </div>

                            {/* Debug info to help user verify images are attached */}
                            {form.images.length === 0 && (
                                <p style={{ fontSize: '0.8rem', color: '#eab308', marginTop: '8px' }}>
                                    ⚠️ No images attached yet. Please upload an image and wait for it to appear above.
                                </p>
                            )}
                            {/* <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '10px' }}>
                                Debug: {JSON.stringify(form.images)}
                            </div> */}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
