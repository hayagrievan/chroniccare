import { NextResponse } from 'next/server';
import { getDb, PRESCRIPTIONS_COLLECTION } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid')?.trim();

    if (!uid) {
        return NextResponse.json({ message: 'uid query parameter is required' }, { status: 400 });
    }

    try {
        let searchId = uid;
        let matchedPhrn = "";
        if (uid.toUpperCase().startsWith("PHRN")) {
            const registryPath = path.join(process.cwd(), '..', 'chronicare-sync', 'data', 'phrn-registry.json');
            if (fs.existsSync(registryPath)) {
                const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
                const entry = registry.find((r: any) => r.phrn.toLowerCase() === uid.toLowerCase());
                if (entry) {
                    searchId = entry.patientId;
                    matchedPhrn = entry.phrn;
                }
            }
        }

        const db = await getDb();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await db
            .collection(PRESCRIPTIONS_COLLECTION)
            .find({ patientId: { $regex: new RegExp(`^${searchId}$`, 'i') } })
            .sort({ createdAt: -1 })
            .toArray();

        if (raw.length === 0) {
            return NextResponse.json({ patient: null, prescriptions: [] });
        }

        // Serialize ObjectId + Date fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prescriptions = raw.map((doc: any) => ({
            ...doc,
            _id: doc._id.toString(),
            sharedAt: doc.sharedAt ? new Date(doc.sharedAt).toISOString() : null,
            createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
            updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const first: any = prescriptions[0];

        // Read phrn-registry.json to attach PHRN
        let phrn = matchedPhrn;
        if (!phrn) {
            const registryPath = path.join(process.cwd(), '..', 'chronicare-sync', 'data', 'phrn-registry.json');
            if (fs.existsSync(registryPath)) {
                const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
                const entry = registry.find((r: any) => r.patientId.toLowerCase() === searchId.toLowerCase());
                if (entry) {
                    phrn = entry.phrn;
                }
            }
        }

        const patient = {
            _id: `patient-${searchId}`,
            uniqueId: first.patientId,
            name: first.patientName,
            phrn: phrn,
            age: null,
            gender: null,
            phone: null,
            prescriptions,
        };

        return NextResponse.json({ patient, prescriptions });
    } catch (error) {
        console.error('[GET /api/patients/search]', error);
        return NextResponse.json(
            { message: 'Failed to search patient', error: String(error) },
            { status: 500 }
        );
    }
}
