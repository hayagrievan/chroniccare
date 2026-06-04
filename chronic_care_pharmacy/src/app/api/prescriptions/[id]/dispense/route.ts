import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, PRESCRIPTIONS_COLLECTION } from '@/lib/mongodb';

export async function PATCH(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        let filter: Record<string, unknown>;

        // Support both MongoDB ObjectId and prescriptionId (e.g. "RX-...")
        if (ObjectId.isValid(id)) {
            filter = { _id: new ObjectId(id) };
        } else {
            filter = { prescriptionId: id };
        }

        const db = await getDb();
        const result = await db.collection(PRESCRIPTIONS_COLLECTION).findOneAndUpdate(
            filter,
            {
                $set: {
                    status: 'Dispensed',
                    updatedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json({ message: 'Prescription not found' }, { status: 404 });
        }

        const serialized = {
            ...result,
            _id: result._id.toString(),
            sharedAt: result.sharedAt ? new Date(result.sharedAt).toISOString() : null,
            createdAt: result.createdAt ? new Date(result.createdAt).toISOString() : null,
            updatedAt: result.updatedAt ? new Date(result.updatedAt).toISOString() : null,
        };

        return NextResponse.json(serialized);
    } catch (error) {
        console.error(`[PATCH /api/prescriptions/${id}/dispense]`, error);
        return NextResponse.json(
            { message: 'Failed to dispense prescription', error: String(error) },
            { status: 500 }
        );
    }
}
