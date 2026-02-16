import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const available = searchParams.get('available');

        const filter: Record<string, unknown> = {};
        if (category && category !== 'all') filter.category = category;
        if (available === 'true') filter.isAvailable = true;

        const items = await MenuItem.find(filter).sort({ category: 1, createdAt: -1 });
        return NextResponse.json({ items });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = authenticateRequest(request);
        if (!auth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const item = await MenuItem.create(body);
        return NextResponse.json({ item }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
