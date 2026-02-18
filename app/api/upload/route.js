import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const formData = await request.formData();
        const files = formData.getAll('images');

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const urls = [];

        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
            }

            // Limit file size (5MB)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 });
            }

            // Convert to base64 data URL (works on Vercel)
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;
            urls.push(dataUrl);
        }

        return NextResponse.json({ urls });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
