import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
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

        let title, description, price, stock, category, images, colors;

        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            title = body.title;
            description = body.description;
            price = body.price;
            stock = body.stock;
            category = body.category;
            colors = Array.isArray(body.colors) ? body.colors : [];

            // Handle Base64 images in JSON
            images = [];
            const rawImages = body.images || [];

            for (const img of rawImages) {
                if (img.startsWith('data:')) {
                    // Upload Base64 to Cloudinary
                    try {
                        const result = await cloudinary.uploader.upload(img, {
                            folder: 'namita-suit-sansaar/products',
                        });
                        images.push(result.secure_url);
                    } catch (uploadError) {
                        console.error('Cloudinary Upload Error:', uploadError);
                        // If upload fails, skip or throw? Let's skip and log.
                    }
                } else {
                    // Already a URL
                    images.push(img);
                }
            }
        } else {
            const formData = await request.formData();
            title = formData.get('title');
            description = formData.get('description');
            price = formData.get('price');
            stock = formData.get('stock');
            category = formData.get('category');
            const rawColors = formData.getAll('colors') || [];
            colors = rawColors
                .flatMap(value => (typeof value === 'string' ? value.split(',') : []))
                .map(color => color.trim())
                .filter(Boolean);

            images = [];
            const imageFiles = [];
            const addIfFile = (file) => {
                if (file && typeof file.arrayBuffer === 'function') {
                    imageFiles.push(file);
                }
            };
            addIfFile(formData.get('image'));
            for (const candidate of formData.getAll('images')) addIfFile(candidate);

            for (const imageFile of imageFiles) {
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'namita-suit-sansaar/products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(buffer);
                });
                images.push(uploadResult.secure_url);
            }
        }

        const product = await Product.create({
            title,
            description,
            price,
            stock,
            category,
            images,
            colors,
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
