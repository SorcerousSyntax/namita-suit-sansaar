import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const auth = await requireAuth();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            products,
            fullName,
            phone,
            address,
            pincode,
            totalAmount,
        } = await request.json();

        // Verify the payment signature using HMAC SHA256
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { error: 'Payment verification failed. Invalid signature.' },
                { status: 400 }
            );
        }

        // Signature is valid â€” payment is legitimate
        // Now deduct stock (only after verified payment)
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

            orderProducts.push({
                productId: product._id,
                title: item.title || product.title,
                price: item.price || product.price,
                quantity: item.quantity,
                image: item.image || product.images?.[0] || '',
                color: selectedColor || null,
            });
        }

        // Create order in database with payment details
        const order = await Order.create({
            userId: auth.user.userId,
            products: orderProducts,
            totalAmount,
            fullName,
            phone,
            address,
            pincode,
            status: 'Paid',
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        return NextResponse.json({
            success: true,
            message: 'Payment verified and order placed successfully',
            order,
        }, { status: 201 });
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
    }
}
