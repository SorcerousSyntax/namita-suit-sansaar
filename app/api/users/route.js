import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();
        const users = await User.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 });
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
