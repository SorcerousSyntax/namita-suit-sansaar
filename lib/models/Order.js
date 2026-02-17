import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            title: String,
            price: Number,
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            image: String,
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    fullName: {
        type: String,
        required: [true, 'Please provide full name'],
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
    },
    address: {
        type: String,
        required: [true, 'Please provide address'],
    },
    pincode: {
        type: String,
        required: [true, 'Please provide pincode'],
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
