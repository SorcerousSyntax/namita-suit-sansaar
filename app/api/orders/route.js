import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { requireAuth, requireAdmin, getCurrentUser } from '@/lib/auth';

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
            orders = await Order.find().sort({ createdAt: -1 });
        } else {
            orders = await Order.find({ userId: user.userId }).sort({ createdAt: -1 });
        }

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const auth = await requireAuth();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();
        const { products, fullName, phone, address, pincode } = await request.json();

        if (!products || !products.length || !fullName || !phone || !address || !pincode) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        let totalAmount = 0;
        const orderProducts = [];

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.productId}` },
                    { status: 404 }
                );
            }
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for ${product.title}` },
                    { status: 400 }
                );
            }

            const availableColors = Array.isArray(product.colors) ? product.colors.filter(Boolean) : [];
            const selectedColor = typeof item.color === 'string' ? item.color.trim() : '';
            if (availableColors.length > 0) {
                if (!selectedColor) {
                    return NextResponse.json(
                        { error: `Please select a color for ${product.title}.` },
                        { status: 400 }
                    );
                }
                if (!availableColors.includes(selectedColor)) {
                    return NextResponse.json(
                        { error: `Selected color is not available for ${product.title}.` },
                        { status: 400 }
                    );
                }
            }

            product.stock -= item.quantity;
            await product.save();

            totalAmount += product.price * item.quantity;
            orderProducts.push({
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity: item.quantity,
                image: product.images[0] || '',
                color: selectedColor || null,
            });
        }

        const order = await Order.create({
            userId: auth.user.userId,
            products: orderProducts,
            totalAmount,
            fullName,
            phone,
            address,
            pincode,
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
