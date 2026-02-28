'use client';
import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { openOrderPrintWindow } from '@/lib/printOrder';

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
    const [paymentId, setPaymentId] = useState('');
    const [razorpayReady, setRazorpayReady] = useState(false);
    const [receiptOrder, setReceiptOrder] = useState(null);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayReady(true);
        script.onerror = () => setRazorpayReady(false);
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

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

    const receiptSubtotal = useMemo(() => {
        if (!receiptOrder) return 0;
        return (receiptOrder.products || []).reduce((sum, item) => {
            return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
        }, 0);
    }, [receiptOrder]);

    const receiptShipping = useMemo(() => {
        if (!receiptOrder) return 0;
        const total = Number(receiptOrder.totalAmount) || 0;
        return Math.max(total - receiptSubtotal, 0);
    }, [receiptOrder, receiptSubtotal]);

    if (orderPlaced) {
        const orderId = receiptOrder?._id ? `#${receiptOrder._id.slice(-8).toUpperCase()}` : null;
        const orderDate = receiptOrder?.createdAt
            ? new Date(receiptOrder.createdAt).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : null;
        const orderPaymentId = receiptOrder?.razorpayPaymentId || paymentId;

        return (
            <div className="confirmation-page fade-in">
                <div className="confirmation-icon">✅</div>
                <h1>Payment Successful!</h1>
                <p>Thank you for your purchase. Your payment has been verified and order has been placed.</p>
                {orderPaymentId && (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 24px',
                        margin: '20px auto',
                        maxWidth: '400px',
                    }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Payment ID</div>
                        <div style={{ fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>{orderPaymentId}</div>
                    </div>
                )}
                {receiptOrder && (
                    <div className="receipt-card">
                        <div className="receipt-header">
                            <div>
                                <div className="receipt-title">Order Receipt</div>
                                {orderId && <div className="receipt-meta">Order {orderId}</div>}
                                {orderDate && <div className="receipt-meta">{orderDate}</div>}
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => openOrderPrintWindow(receiptOrder, { title: 'Order Receipt' })}
                            >
                                Print / Save PDF
                            </button>
                        </div>

                            <div className="receipt-section">
                                <div className="receipt-label">Shipping To</div>
                                <div className="receipt-value">{receiptOrder.fullName}</div>
                                <div className="receipt-value">Phone: {receiptOrder.phone}</div>
                                <div className="receipt-value">Address: {receiptOrder.address}, {receiptOrder.pincode}</div>
                            </div>

                        <div className="receipt-section">
                            <div className="receipt-label">Items</div>
                            {(receiptOrder.products || []).map((item, idx) => (
                                <div className="receipt-row" key={`${item.productId || idx}`}>
                                    <span>
                                        {item.title}
                                        {item.color ? ` (${item.color})` : ''}
                                        {' '}x {item.quantity}
                                    </span>
                                    <span>₹{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                            <div className="receipt-row">
                                <span>Subtotal</span>
                                <span>₹{receiptSubtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="receipt-row">
                                <span>Shipping</span>
                                <span style={{ color: receiptShipping === 0 ? 'var(--success)' : 'inherit' }}>
                                    {receiptShipping === 0 ? 'FREE' : `₹${receiptShipping.toLocaleString('en-IN')}`}
                                </span>
                            </div>
                            <div className="receipt-total">
                                <span>Total</span>
                                <span>₹{Number(receiptOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                )}
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

        // Validate phone
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            addToast('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        // Validate pincode
        if (!/^\d{6}$/.test(pincode)) {
            addToast('Please enter a valid 6-digit pincode', 'error');
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create Razorpay order via our API
            const createRes = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    products: cartItems.map(item => ({
                        productId: item._id,
                        quantity: item.quantity,
                        color: item.selectedColor || null,
                    })),
                    fullName,
                    phone: cleanPhone,
                    address,
                    pincode,
                }),
            });

            const orderData = await createRes.json();

            if (!createRes.ok) {
                addToast(orderData.error || 'Failed to create order', 'error');
                setLoading(false);
                return;
            }

            if (!window.Razorpay) {
                addToast('Payment gateway failed to load. Please refresh and try again.', 'error');
                setLoading(false);
                return;
            }

            // Step 2: Open Razorpay checkout modal
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Namita Suit Sansaar',
                description: 'Premium Ethnic Wear',
                order_id: orderData.orderId,
                handler: async function (response) {
                    // Step 3: Verify payment on server
                    try {
                        const verifyRes = await fetch('/api/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                products: orderData.products,
                                totalAmount: orderData.totalAmount,
                                fullName,
                                phone: cleanPhone,
                                address,
                                pincode,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.success) {
                            clearCart();
                            setPaymentId(response.razorpay_payment_id);
                            setReceiptOrder(verifyData.order || null);
                            setOrderPlaced(true);
                            addToast('Payment successful! Order placed.', 'success');
                        } else {
                            addToast(verifyData.error || 'Payment verification failed', 'error');
                        }
                    } catch (error) {
                        addToast('Payment verification failed. Contact support.', 'error');
                    }
                    setLoading(false);
                },
                prefill: {
                    name: fullName,
                    contact: cleanPhone,
                    email: user.email || '',
                },
                theme: {
                    color: '#d4a853',
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        addToast('Payment cancelled', 'warning');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                addToast(`Payment failed: ${response.error.description}`, 'error');
                setLoading(false);
            });
            rzp.open();
        } catch (error) {
            addToast('Something went wrong. Please try again.', 'error');
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
                            <input type="tel" className="input" placeholder="10-digit phone number" value={phone} onChange={e => setPhone(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label>Full Address</label>
                            <textarea className="input" placeholder="Enter your complete address" value={address} onChange={e => setAddress(e.target.value)} required></textarea>
                        </div>
                        <div className="input-group">
                            <label>Pincode</label>
                            <input type="text" className="input" placeholder="6-digit pincode" value={pincode} onChange={e => setPincode(e.target.value)} required />
                        </div>

                        {/* Security badges */}
                        <div style={{
                            display: 'flex', gap: '16px', flexWrap: 'wrap',
                            padding: '16px', background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)', marginTop: '8px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                🔒 <span>SSL Encrypted</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                🛡️ <span>Secure Payment</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                ✅ <span>Razorpay Verified</span>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !razorpayReady} style={{ marginTop: '8px' }}>
                            {loading ? 'Processing...' : `Pay ₹${(total + shipping).toLocaleString('en-IN')} with Razorpay`}
                        </button>
                    </form>
                </div>

                <div className="order-summary-card">
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--gold)', marginBottom: '20px' }}>
                        Order Summary
                    </h3>
                    {cartItems.map(item => (
                        <div key={item.cartKey || item._id} className="cart-summary-row">
                            <span>
                                {item.title}
                                {item.selectedColor ? ` (${item.selectedColor})` : ''}
                                {' '}x {item.quantity}
                            </span>
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

                    <div style={{
                        marginTop: '20px', padding: '16px',
                        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Powered by</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3395FF', letterSpacing: '0.5px' }}>
                            Razorpay
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            UPI • Cards • Net Banking • Wallets
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
