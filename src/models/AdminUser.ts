import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'superadmin' | 'manager' | 'staff';
    createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'manager', 'staff'], default: 'staff' },
}, { timestamps: true });

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
