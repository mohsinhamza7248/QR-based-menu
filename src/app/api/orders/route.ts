import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Table from '@/models/Table';
import { authenticateRequest } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const tableId = searchParams.get('tableId');

        const filter: Record<string, unknown> = {};
        if (status && status !== 'all') filter.status = status;
        if (tableId) filter.tableId = tableId;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate('tableId')
            .populate('appliedOffer');

        return NextResponse.json({ orders });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        // Look up the table by number to get the real ObjectId
        const tableNumber = parseInt(body.tableId) || body.tableNumber;
        const table = await Table.findOne({ number: tableNumber });

        const orderNumber = generateOrderNumber();

        const order = await Order.create({
            ...body,
            orderNumber,
            tableId: table ? table._id : undefined,
            tableNumber: tableNumber,
            status: 'pending',
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
