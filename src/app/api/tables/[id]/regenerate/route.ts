import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Table from '@/models/Table';
import { authenticateRequest } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const table = await Table.findById(id);

        if (!table) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qr-based-menu.vercel.app';
        const tableUrl = `${appUrl}/table/${table.number}`;

        const qrCode = await QRCode.toDataURL(tableUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
        });

        table.qrCode = qrCode;
        await table.save();

        return NextResponse.json({ table, message: 'QR Code regenerated' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
