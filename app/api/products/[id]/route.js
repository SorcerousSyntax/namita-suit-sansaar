import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { requireAdmin } from '@/lib/auth';

function normalizeColorVariants(rawVariants) {
    if (!Array.isArray(rawVariants)) return [];
    return rawVariants
        .map(variant => ({
            color: typeof variant?.color === 'string' ? variant.color.trim() : '',
            image: typeof variant?.image === 'string' ? variant.image.trim() : '',
        }))
        .filter(variant => variant.color && variant.image);
}

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const hasVariants = Array.isArray(body.colorVariants);
        const hasColors = Array.isArray(body.colors);
        const updateBody = { ...body };

        if (hasVariants || hasColors) {
            const colorVariants = hasVariants ? normalizeColorVariants(body.colorVariants) : [];
            const normalizedColors = (
                colorVariants.length > 0
                    ? colorVariants.map(variant => variant.color)
                    : hasColors ? body.colors : []
            )
                .map(color => (typeof color === 'string' ? color.trim() : ''))
                .filter(Boolean);

            if (hasVariants) updateBody.colorVariants = colorVariants;
            updateBody.colors = normalizedColors;
        }

        const product = await Product.findByIdAndUpdate(id, updateBody, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ product });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();
        const { id } = await params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
