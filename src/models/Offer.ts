import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    isActive: boolean;
    validFrom: Date;
    validUntil: Date;
    createdAt: Date;
}

const OfferSchema = new Schema<IOffer>({
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
