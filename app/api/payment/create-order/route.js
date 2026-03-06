import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Product from '@/lib/models/Product';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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
                    { error: `Insufficient stock for ${product.title}. Only ${product.stock} left.` },
                    { status: 400 }
                );
            }

            const colorVariants = Array.isArray(product.colorVariants)
                ? product.colorVariants
                    .map(variant => ({
                        color: typeof variant?.color === 'string' ? variant.color.trim() : '',
                        image: typeof variant?.image === 'string' ? variant.image.trim() : '',
                    }))
                    .filter(variant => variant.color)
                : [];
            const availableColors = colorVariants.length > 0
                ? colorVariants.map(variant => variant.color)
                : (Array.isArray(product.colors) ? product.colors.filter(Boolean) : []);
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
            const selectedVariant = colorVariants.find(
                variant => variant.color.toLowerCase() === selectedColor.toLowerCase()
            );

            totalAmount += product.price * quantity;
            orderProducts.push({
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity,
                image: selectedVariant?.image || product.images[0] || '',
                color: selectedColor || null,
            });
        }

        // Initialize Razorpay instance lazily to avoid build-time errors if env vars are missing
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing');
            return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

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
            waivedDeliveryCharge: 99,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }
}
