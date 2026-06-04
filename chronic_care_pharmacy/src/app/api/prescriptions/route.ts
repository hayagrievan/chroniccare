import { NextResponse } from 'next/server';
import { getDb, PRESCRIPTIONS_COLLECTION } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getDb();
        const prescriptions = await db
            .collection(PRESCRIPTIONS_COLLECTION)
            .find({ status: 'Pending' })
            .sort({ createdAt: -1 })
            .toArray();

        // Serialize _id (ObjectId → string)
        const serialized = prescriptions.map((p) => ({
            ...p,
            _id: p._id.toString(),
            sharedAt: p.sharedAt ? new Date(p.sharedAt).toISOString() : null,
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('[GET /api/prescriptions]', error);
        return NextResponse.json(
            { message: 'Failed to fetch prescriptions', error: String(error) },
            { status: 500 }
        );
    }
}
