import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import Table from '@/models/Table';
import Order from '@/models/Order';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalMenuItems,
            totalTables,
            todayOrders,
            activeOrders,
            todayRevenue,
        ] = await Promise.all([
            MenuItem.countDocuments(),
            Table.countDocuments({ isActive: true }),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ status: { $in: ['pending', 'accepted', 'preparing'] } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: today }, status: { $ne: 'pending' } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
        ]);

        return NextResponse.json({
            stats: {
                totalMenuItems,
                totalTables,
                todayOrders,
                activeOrders,
                todayRevenue: todayRevenue[0]?.total || 0,
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
