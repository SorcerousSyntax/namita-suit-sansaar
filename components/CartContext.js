'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const normalized = Array.isArray(parsed)
                    ? parsed.map(item => {
                        const selectedColor = item.selectedColor || item.color || '';
                        const cartKey = item.cartKey || `${item._id}::${selectedColor || ''}`;
                        return { ...item, selectedColor: selectedColor || null, cartKey };
                    })
                    : [];
                setCartItems(normalized);
            } catch (e) {
                console.error('Cart parse failed:', e);
            }
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, loaded]);

    function addToCart(product, quantity = 1, options = {}) {
        const selectedColor = options?.color || null;
        const cartKey = `${product._id}::${selectedColor || ''}`;
        setCartItems(prev => {
            const existing = prev.find(item => item.cartKey === cartKey);
            if (existing) {
                return prev.map(item =>
                    item.cartKey === cartKey
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity, selectedColor, cartKey }];
        });
    }

    function removeFromCart(cartKey) {
        setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
    }

    function updateQuantity(cartKey, quantity) {
        if (quantity < 1) {
            removeFromCart(cartKey);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.cartKey === cartKey ? { ...item, quantity } : item
            )
        );
    }

    function clearCart() {
        setCartItems([]);
    }

    function getCartTotal() {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function getCartCount() {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
                loaded,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
