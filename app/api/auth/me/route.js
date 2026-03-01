import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const sessionUser = await getCurrentUser();
        if (!sessionUser) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        await dbConnect();
        const dbUser = await User.findById(sessionUser.userId).select('name email role billingInfo');
        if (!dbUser) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: dbUser._id.toString(),
                userId: dbUser._id.toString(),
                name: dbUser.name,
                email: dbUser.email,
                role: dbUser.role,
                billingInfo: dbUser.billingInfo || null,
            },
        });
    } catch (error) {
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
