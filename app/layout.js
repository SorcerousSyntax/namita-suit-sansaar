import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { CartProvider } from '@/components/CartContext';
import { ToastProvider } from '@/components/ToastContext';
import Navbar from '@/components/Navbar';

export const metadata = {
    title: 'Namita Suit Sansaar | Premium Ethnic Wear',
    description: 'Your premier destination for elegant ethnic wear. Shop stunning suits, lehengas, and traditional outfits crafted with love and precision.',
    keywords: 'ethnic wear, suits, lehenga, salwar kameez, traditional clothing, Indian fashion',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <CartProvider>
                        <ToastProvider>
                            <Navbar />
                            <main>{children}</main>
                        </ToastProvider>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
