import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const existingAdmin = await AdminUser.findOne({ role: 'superadmin' });
        if (existingAdmin) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
        }

        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const admin = await AdminUser.create({
            name,
            email,
            password: hashedPassword,
            role: 'superadmin',
        });

        return NextResponse.json({
            message: 'Admin created successfully',
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
        }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
