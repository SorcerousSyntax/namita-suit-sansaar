import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Log config presence at startup (not values for security)
console.log('[Upload API] Cloudinary config:', {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET,
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    // Fail fast if config is missing
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('[Upload API] Missing configuration');
        return NextResponse.json(
            { error: 'Missing Cloudinary Configuration on Server. Please add Environment Variables.' },
            { status: 500 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            console.error('[Upload API] No file in request');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log('[Upload API] Uploading file:', file.name, 'size:', file.size, 'type:', file.type);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'namita-suit-sansaar/products' },
                (error, result) => {
                    if (error) {
                        console.error('[Upload API] Cloudinary error:', error);
                        reject(error);
                    } else {
                        console.log('[Upload API] Upload success:', result.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({ url: result.secure_url });

    } catch (error) {
        console.error('[Upload API] Fatal error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
