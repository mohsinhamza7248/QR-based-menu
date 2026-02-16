import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
    number: number;
    label: string;
    isActive: boolean;
    qrCode: string;
    createdAt: Date;
}

const TableSchema = new Schema<ITable>({
    number: { type: Number, required: true, unique: true },
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    qrCode: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
