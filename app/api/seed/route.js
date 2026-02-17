import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';

const sampleProducts = [
    {
        title: 'Royal Silk Anarkali Suit',
        description: 'Exquisite silk anarkali suit with intricate gold embroidery. Perfect for weddings and festive occasions. Features a flowing silhouette with detailed zari work on the bodice and hem.',
        price: 4999,
        images: ['/uploads/sample-1.jpg'],
        stock: 25,
        category: 'Anarkali',
    },
    {
        title: 'Premium Cotton Palazzo Set',
        description: 'Comfortable and stylish cotton palazzo set with block print design. Ideal for daily wear with a touch of elegance. Comes with a matching dupatta.',
        price: 1899,
        images: ['/uploads/sample-2.jpg'],
        stock: 50,
        category: 'Palazzo Sets',
    },
    {
        title: 'Designer Party Wear Suit',
        description: 'Stunning georgette party wear suit with sequin and thread embroidery. Features a semi-stitched design for custom fitting. Perfect for evening events.',
        price: 3499,
        images: ['/uploads/sample-3.jpg'],
        stock: 30,
        category: 'Party Wear',
    },
    {
        title: 'Pure Cotton Daily Wear Suit',
        description: 'Lightweight pure cotton suit for everyday comfort. Features a simple yet elegant print pattern. Perfect for office and casual outings.',
        price: 999,
        images: ['/uploads/sample-4.jpg'],
        stock: 100,
        category: 'Daily Wear',
    },
    {
        title: 'Bridal Red Lehenga Suit',
        description: 'Magnificent bridal red suit with heavy gold embroidery and stone work. Crafted with premium velvet fabric. Includes a heavily embroidered dupatta.',
        price: 12999,
        images: ['/uploads/sample-5.jpg'],
        stock: 10,
        category: 'Bridal Collection',
    },
    {
        title: 'Winter Wool Blend Suit',
        description: 'Warm and cozy wool blend suit for winter. Features a beautiful kashmiri embroidery pattern. Perfect for the cold season while maintaining elegance.',
        price: 2499,
        images: ['/uploads/sample-6.jpg'],
        stock: 40,
        category: 'Winter Collection',
    },
    {
        title: 'Banarasi Silk Suit',
        description: 'Traditional Banarasi silk suit with classic weaving patterns. Rich texture and vibrant colors make this perfect for festive celebrations.',
        price: 5999,
        images: ['/uploads/sample-7.jpg'],
        stock: 20,
        category: 'Silk Suits',
    },
    {
        title: 'Printed Cotton Suit Set',
        description: 'Beautiful floral printed cotton suit with comfortable fabric. Features a modern cut with traditional prints. Great for summer days.',
        price: 1299,
        images: ['/uploads/sample-8.jpg'],
        stock: 75,
        category: 'Cotton Suits',
    },
    {
        title: 'Kundan Necklace Set',
        description: 'Exquisite artificial kundan necklace set with matching earrings. Gold-plated with meenakari work. Perfect for weddings and festive occasions.',
        price: 1499,
        images: ['/uploads/sample-9.jpg'],
        stock: 35,
        category: 'Necklaces',
    },
    {
        title: 'Pearl Jhumka Earrings',
        description: 'Elegant pearl jhumka earrings with antique gold finish. Lightweight and comfortable for all-day wear. Pairs beautifully with ethnic outfits.',
        price: 599,
        images: ['/uploads/sample-10.jpg'],
        stock: 60,
        category: 'Earrings',
    },
    {
        title: 'Gold-Plated Bangle Set',
        description: 'Set of 6 gold-plated bangles with intricate floral design. Tarnish-resistant coating ensures long-lasting shine. Available in multiple sizes.',
        price: 899,
        images: ['/uploads/sample-11.jpg'],
        stock: 45,
        category: 'Bangles',
    },
    {
        title: 'Bridal Jewellery Complete Set',
        description: 'Complete bridal jewellery set including necklace, earrings, maang tikka, and bangles. Heavy kundan and pearl work with royal finish.',
        price: 3999,
        images: ['/uploads/sample-12.jpg'],
        stock: 15,
        category: 'Jewellery Sets',
    },
];

export async function POST() {
    try {
        await dbConnect();

        const existingAdmin = await User.findOne({ email: 'admin@namitasuitsansaar.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('Admin@123', 12);
            await User.create({
                name: 'Admin',
                email: 'admin@namitasuitsansaar.com',
                password: hashedPassword,
                role: 'admin',
            });
        }

        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            await Product.insertMany(sampleProducts);
        }

        return NextResponse.json({
            message: 'Database seeded successfully',
            admin: { email: 'admin@namitasuitsansaar.com', password: 'Admin@123' },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
