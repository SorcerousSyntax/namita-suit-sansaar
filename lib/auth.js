import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function getTokenFromCookies() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    return token?.value || null;
}

export async function getCurrentUser() {
    const token = await getTokenFromCookies();
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }
    return { user };
}

export async function requireAdmin() {
    const result = await requireAuth();
    if (result.error) return result;
    if (result.user.role !== 'admin') {
        return { error: 'Forbidden - Admin only', status: 403 };
    }
    return result;
}
