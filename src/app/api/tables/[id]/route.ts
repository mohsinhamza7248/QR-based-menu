import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Table from '@/models/Table';
import { authenticateRequest } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const { id } = await params;
        const table = await Table.findByIdAndDelete(id);
        if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        return NextResponse.json({ message: 'Table deleted' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
