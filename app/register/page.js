'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/components/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        if (password.length < 6) {
            addToast('Password must be at least 6 characters', 'error');
            return;
        }
        setLoading(true);
        const result = await register(name, email, password);
        setLoading(false);

        if (result.success) {
            addToast('Registration successful! Welcome aboard.', 'success');
            router.push('/');
        } else {
            addToast(result.error || 'Registration failed', 'error');
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <h1>Create Account</h1>
                <p className="subtitle">Join Namita Suit Sansaar today</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Your full name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
