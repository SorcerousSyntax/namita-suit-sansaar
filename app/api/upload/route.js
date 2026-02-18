import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        // ⚠️ DO NOT use requireAdmin here with FormData

        const formData = await request.formData();
        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const urls = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: 'Only image files allowed' },
                    { status: 400 }
                );
            }

            // Vercel limit
            if (file.size > 4.5 * 1024 * 1024) {
                return NextResponse.json(
                    { error: 'Image must be under 4.5MB' },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'namita-suit-sansaar',
                        quality: 'auto',
                        fetch_format: 'auto',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            urls.push(result.secure_url);
        }

        return NextResponse.json({ urls });

    } catch (error) {
        console.error('Upload error:', error);

        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
