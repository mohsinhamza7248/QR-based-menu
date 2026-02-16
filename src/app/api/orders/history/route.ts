import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// GET /api/orders/history?ids=id1,id2,id3
// Fetches multiple orders by their IDs (for customer localStorage-based history)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');

        if (!ids) {
            return NextResponse.json({ orders: [] });
        }

        const idList = ids.split(',').filter(Boolean);

        if (idList.length === 0) {
            return NextResponse.json({ orders: [] });
        }

        const orders = await Order.find({ _id: { $in: idList } })
            .sort({ createdAt: -1 });

        // Calculate totals
        const totalBill = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalItems = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum: number, item: { quantity: number }) => itemSum + item.quantity, 0);
        }, 0);

        return NextResponse.json({
            orders,
            summary: {
                totalOrders: orders.length,
                totalItems,
                totalBill,
            }
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
