import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Table from '@/models/Table';
import { authenticateRequest } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const tables = await Table.find().sort({ number: 1 });
        return NextResponse.json({ tables });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const body = await request.json();
        const { number, label } = body;

        if (!number || !label) {
            return NextResponse.json({ error: 'Table number and label required' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const tableUrl = `${appUrl}/table/${number}`;

        const qrCode = await QRCode.toDataURL(tableUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });

        const table = await Table.create({ number, label, qrCode });
        return NextResponse.json({ table }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
