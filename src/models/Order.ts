import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface IOrder extends Document {
    orderNumber: string;
    tableId: mongoose.Types.ObjectId;
    tableNumber: number;
    items: IOrderItem[];
    status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed';
    estimatedTime: number;
    subtotal: number;
    discount: number;
    total: number;
    appliedOffer?: mongoose.Types.ObjectId;
    couponCode?: string;
    customerNotes: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    orderNumber: { type: String, required: true, unique: true },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
    tableNumber: { type: Number, required: true },
    items: [OrderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'ready', 'completed'],
        default: 'pending'
    },
    estimatedTime: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    appliedOffer: { type: Schema.Types.ObjectId, ref: 'Offer' },
    couponCode: { type: String },
    customerNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
