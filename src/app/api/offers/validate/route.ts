import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Offer from '@/models/Offer';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();
        const { code, orderTotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const now = new Date();
        const offer = await Offer.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
        });

        if (!offer) {
            return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
        }

        if (orderTotal < offer.minOrderValue) {
            return NextResponse.json({
                error: `Minimum order value is ₹${offer.minOrderValue}`,
            }, { status: 400 });
        }

        let discount = 0;
        if (offer.discountType === 'percentage') {
            discount = (orderTotal * offer.discountValue) / 100;
            if (offer.maxDiscount > 0 && discount > offer.maxDiscount) {
                discount = offer.maxDiscount;
            }
        } else {
            discount = offer.discountValue;
        }

        return NextResponse.json({
            valid: true,
            offer: {
                id: offer._id,
                code: offer.code,
                title: offer.title,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
            },
            discount: Math.round(discount),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
