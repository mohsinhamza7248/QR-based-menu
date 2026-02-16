import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
    name: string;
    description: string;
    price: number;
    image: string;
    category: 'veg' | 'non-veg' | 'drinks' | 'combos' | 'desserts';
    isAvailable: boolean;
    preparationTime: number;
    tags: string[];
    createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    category: {
        type: String,
        enum: ['veg', 'non-veg', 'drinks', 'combos', 'desserts'],
        required: true
    },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 15 },
    tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
