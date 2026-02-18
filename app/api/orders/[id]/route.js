import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();
        const { id } = await params;
        const { status } = await request.json();

        if (!['Pending', 'Paid', 'Shipped', 'Delivered'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
