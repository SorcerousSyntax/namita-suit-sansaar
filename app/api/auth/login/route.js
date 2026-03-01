import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                userId: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                billingInfo: user.billingInfo || null,
            },
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { error: 'Login failed: ' + error.message },
            { status: 500 }
        );
    }
}
