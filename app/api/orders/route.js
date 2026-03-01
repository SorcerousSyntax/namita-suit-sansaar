import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let orders;
        if (user.role === 'admin') {
            const { searchParams } = new URL(request.url);
            const yearParam = Number(searchParams.get('year'));
            const monthParam = Number(searchParams.get('month'));

            const query = {};
            if (Number.isInteger(yearParam) && yearParam > 2000 && yearParam < 3000) {
                const hasValidMonth = Number.isInteger(monthParam) && monthParam >= 1 && monthParam <= 12;
                const start = hasValidMonth
                    ? new Date(yearParam, monthParam - 1, 1)
                    : new Date(yearParam, 0, 1);
                const end = hasValidMonth
                    ? new Date(yearParam, monthParam, 1)
                    : new Date(yearParam + 1, 0, 1);

                query.createdAt = { $gte: start, $lt: end };
            }

            orders = await Order.find(query).sort({ createdAt: -1 });

            const monthYearBuckets = await Order.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$totalAmount' },
                    },
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
            ]);

            return NextResponse.json({ orders, monthYearBuckets });
        } else {
            orders = await Order.find({ userId: user.userId }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST() {
    return NextResponse.json(
        { error: 'Direct order placement is disabled. Please use payment verification flow.' },
        { status: 405 }
    );
}
