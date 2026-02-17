import mongoose from 'mongoose';

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
