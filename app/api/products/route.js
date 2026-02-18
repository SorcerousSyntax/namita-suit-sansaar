import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const query = category ? { category } : {};
        const products = await Product.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ products });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        await dbConnect();

        const formData = await request.formData();

        const title = formData.get('title');
        const description = formData.get('description');
        const price = formData.get('price');
        const stock = formData.get('stock');
        const category = formData.get('category');
        const imageFile = formData.get('image');

        let imageUrls = [];
        if (imageFile) {
            // Convert file to buffer
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'namita-suit-sansaar/products' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
            imageUrls.push(uploadResult.secure_url);
        }

        const product = await Product.create({
            title,
            description,
            price,
            stock,
            category,
            images: imageUrls,
        });

        return NextResponse.json({ product }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
