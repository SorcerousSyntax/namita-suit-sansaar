import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
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
        } = await request.json();

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !products ||
            !products.length ||
            !fullName ||
            !phone ||
            !address ||
            !pincode
        ) {
            return NextResponse.json({ error: 'Missing required payment/order fields' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return NextResponse.json({ error: 'Please provide a valid 10-digit Indian phone number' }, { status: 400 });
        }
        if (!/^\d{6}$/.test(pincode)) {
            return NextResponse.json({ error: 'Please provide a valid 6-digit pincode' }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
        }

        // Verify Razorpay signature first.
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

        // Idempotency guard so duplicate verify calls do not create duplicate orders.
        const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
        if (existingOrder) {
            if (String(existingOrder.userId) !== String(auth.user.userId)) {
                return NextResponse.json({ error: 'Unauthorized payment verification attempt' }, { status: 403 });
            }
            return NextResponse.json({
                success: true,
                message: 'Payment already verified and order already placed',
                order: existingOrder,
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const [razorpayOrder, razorpayPayment] = await Promise.all([
            razorpay.orders.fetch(razorpay_order_id),
            razorpay.payments.fetch(razorpay_payment_id),
        ]);

        if (!razorpayOrder || !razorpayPayment) {
            return NextResponse.json({ error: 'Unable to verify payment details with gateway' }, { status: 400 });
        }

        if (razorpayPayment.order_id !== razorpay_order_id) {
            return NextResponse.json({ error: 'Payment/order mismatch' }, { status: 400 });
        }

        if (String(razorpayOrder.notes?.userId || '') !== String(auth.user.userId)) {
            return NextResponse.json({ error: 'Unauthorized payment verification attempt' }, { status: 403 });
        }

        if (!['captured', 'authorized'].includes(razorpayPayment.status)) {
            return NextResponse.json({ error: 'Payment is not successful yet' }, { status: 400 });
        }

        // Validate ordered items from DB pricing and stock; then compute expected total.
        const orderProducts = [];
        let totalAmount = 0;

        for (const item of products) {
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) {
                return NextResponse.json(
                    { error: 'Quantity must be a positive integer for all products.' },
                    { status: 400 }
                );
            }

            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.productId}` },
                    { status: 404 }
                );
            }
            if (product.stock < quantity) {
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

            totalAmount += product.price * quantity;

            orderProducts.push({
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity,
                image: product.images?.[0] || '',
                color: selectedColor || null,
            });
        }

        const expectedAmountPaise = Math.round(totalAmount * 100);
        if (
            Number(razorpayOrder.amount) !== expectedAmountPaise ||
            Number(razorpayPayment.amount) !== expectedAmountPaise
        ) {
            return NextResponse.json(
                { error: 'Paid amount does not match order amount. Order not placed.' },
                { status: 400 }
            );
        }

        // Deduct stock only after all validations and payment checks pass.
        for (const item of orderProducts) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }

        const order = await Order.create({
            userId: auth.user.userId,
            products: orderProducts,
            totalAmount,
            fullName,
            phone: cleanPhone,
            address,
            pincode,
            status: 'Paid',
            paymentStatus: 'paid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        await User.findByIdAndUpdate(auth.user.userId, {
            billingInfo: {
                fullName,
                phone: cleanPhone,
                address,
                pincode,
                lastUsedAt: new Date(),
            },
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
