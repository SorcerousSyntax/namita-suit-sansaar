'use client';
import { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [pincode, setPincode] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    if (!user) {
        return (
            <div className="container">
                <div className="cart-empty fade-in">
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                        Please Login First
                    </h2>
                    <p>You need to be logged in to checkout.</p>
                    <Link href="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Login →
                    </Link>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <div className="container">
                <div className="cart-empty fade-in">
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                        Your Cart is Empty
                    </h2>
                    <p>Add some products before checking out.</p>
                    <Link href="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Shop Now →
                    </Link>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="confirmation-page fade-in">
                <div className="confirmation-icon">✅</div>
                <h1>Order Placed Successfully!</h1>
                <p>Thank you for your purchase. Your order has been confirmed and will be processed shortly.</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link href="/orders" className="btn btn-primary">
                        View My Orders
                    </Link>
                    <Link href="/products" className="btn btn-outline">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    async function handlePlaceOrder(e) {
        e.preventDefault();
        if (!fullName || !phone || !address || !pincode) {
            addToast('Please fill in all fields', 'error');
            return;
        }
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    products: cartItems.map(item => ({
                        productId: item._id,
                        quantity: item.quantity,
                    })),
                    fullName,
                    phone,
                    address,
                    pincode,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                clearCart();
                setOrderPlaced(true);
                addToast('Order placed successfully!', 'success');
            } else {
                addToast(data.error || 'Failed to place order', 'error');
            }
        } catch (error) {
            addToast('Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    }

    const total = getCartTotal();
    const shipping = total >= 999 ? 0 : 99;

    return (
        <div className="container checkout-page fade-in">
            <div className="page-header">
                <h1>Checkout</h1>
                <p>Complete your order</p>
            </div>

            <div className="checkout-grid">
                <div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '24px' }}>
                        Shipping Details
                    </h2>
                    <form onSubmit={handlePlaceOrder} className="checkout-form">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" className="input" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input type="tel" className="input" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Full Address</label>
                            <textarea className="input" placeholder="Enter your complete address" value={address} onChange={e => setAddress(e.target.value)} required></textarea>
                        </div>
                        <div className="input-group">
                            <label>Pincode</label>
                            <input type="text" className="input" placeholder="Enter pincode" value={pincode} onChange={e => setPincode(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
                            {loading ? 'Placing Order...' : `Place Order — ₹${(total + shipping).toLocaleString('en-IN')}`}
                        </button>
                    </form>
                </div>

                <div className="order-summary-card">
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '20px' }}>
                        Order Summary
                    </h3>
                    {cartItems.map(item => (
                        <div key={item._id} className="cart-summary-row">
                            <span>{item.title} × {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span style={{ color: 'var(--success)' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                    </div>
                    <div className="cart-summary-total">
                        <span>Total</span>
                        <span style={{ color: 'var(--gold)' }}>₹{(total + shipping).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
