import { NextResponse } from 'next/server';
import { getDb, PRESCRIPTIONS_COLLECTION } from '@/lib/mongodb';

/**
 * GET /api/prescriptions/all
 * Returns ALL prescriptions (all statuses) for dashboard stats computation.
 */
export async function GET() {
    try {
        const db = await getDb();
        const prescriptions = await db
            .collection(PRESCRIPTIONS_COLLECTION)
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        const serialized = prescriptions.map((p) => ({
            ...p,
            _id: p._id.toString(),
            sharedAt: p.sharedAt ? new Date(p.sharedAt).toISOString() : null,
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('[GET /api/prescriptions/all]', error);
        return NextResponse.json(
            { message: 'Failed to fetch all prescriptions', error: String(error) },
            { status: 500 }
        );
    }
}
