import mongoose from 'mongoose';

const ColorVariantSchema = new mongoose.Schema(
    {
        color: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a product title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative'],
    },
    images: {
        type: [String],
        default: [],
    },
    colors: {
        type: [String],
        default: [],
        set: (colors) => {
            if (!Array.isArray(colors)) return [];
            return colors
                .map(color => (typeof color === 'string' ? color.trim() : ''))
                .filter(Boolean);
        },
    },
    colorVariants: {
        type: [ColorVariantSchema],
        default: [],
        set: (variants) => {
            if (!Array.isArray(variants)) return [];
            return variants
                .map(variant => ({
                    color: typeof variant?.color === 'string' ? variant.color.trim() : '',
                    image: typeof variant?.image === 'string' ? variant.image.trim() : '',
                }))
                .filter(variant => variant.color && variant.image);
        },
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Stock cannot be negative'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: [
            'Party Wear',
            'Cotton Suits',
            'Winter Collection',
            'Silk Suits',
            'Anarkali',
            'Palazzo Sets',
            'Bridal Collection',
            'Daily Wear',
            'Necklaces',
            'Earrings',
            'Bangles',
            'Jewellery Sets',
            'Maang Tikka',
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
