import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Product from '@/lib/models/Product';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

        // Validate phone number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
            return NextResponse.json(
                { error: 'Please provide a valid 10-digit Indian phone number' },
                { status: 400 }
            );
        }

        // Validate pincode
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(pincode)) {
            return NextResponse.json(
                { error: 'Please provide a valid 6-digit pincode' },
                { status: 400 }
            );
        }

        // Calculate total from database prices (never trust client-side amounts)
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
                    { error: `Insufficient stock for ${product.title}. Only ${product.stock} left.` },
                    { status: 400 }
                );
            }

            totalAmount += product.price * item.quantity;
            orderProducts.push({
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity: item.quantity,
                image: product.images[0] || '',
            });
        }

        // Add shipping
        const shipping = totalAmount >= 999 ? 0 : 99;
        totalAmount += shipping;

        // Create Razorpay order (amount is in paise)
        const receiptId = 'rcpt_' + crypto.randomBytes(8).toString('hex');
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: receiptId,
            notes: {
                fullName,
                phone,
                userId: auth.user.userId,
            },
        });

        return NextResponse.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            products: orderProducts,
            totalAmount,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
