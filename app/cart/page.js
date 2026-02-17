'use client';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
    const router = useRouter();

    if (cartItems.length === 0) {
        return (
            <div className="container">
                <div className="cart-empty fade-in">
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                        Your Cart is Empty
                    </h2>
                    <p>Looks like you haven&apos;t added anything yet.</p>
                    <Link href="/products" className="btn btn-primary">
                        Start Shopping →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container cart-page fade-in">
            <div className="page-header">
                <h1>Shopping Cart</h1>
                <p>{getCartCount()} item{getCartCount() !== 1 ? 's' : ''} in your cart</p>
            </div>

            <div className="cart-layout">
                <div>
                    {cartItems.map(item => (
                        <div key={item._id} className="cart-item">
                            <div className="cart-item-image">
                                {item.images && item.images[0] && !item.images[0].startsWith('/uploads/sample') ? (
                                    <img src={item.images[0]} alt={item.title} />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(135deg, #2a2520, #1a1510)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                    }}>
                                        👗
                                    </div>
                                )}
                            </div>
                            <div className="cart-item-info">
                                <h3 className="cart-item-title">{item.title}</h3>
                                <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                                    </div>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeFromCart(item._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span style={{ color: 'var(--success)' }}>
                            {getCartTotal() >= 999 ? 'FREE' : '₹99'}
                        </span>
                    </div>
                    <div className="cart-summary-total">
                        <span>Total</span>
                        <span style={{ color: 'var(--gold)' }}>
                            ₹{(getCartTotal() + (getCartTotal() >= 999 ? 0 : 99)).toLocaleString('en-IN')}
                        </span>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => router.push('/checkout')}
                    >
                        Proceed to Checkout →
                    </button>
                </div>
            </div>
        </div>
    );
}
