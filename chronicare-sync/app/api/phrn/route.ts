import { NextRequest, NextResponse } from "next/server";
import { lookupByPHRN, getPatients } from "@/lib/jsonDb";

/** GET /api/phrn?phrn=PHRN-IND-2026-000001 — lookup patient by PHRN */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const phrn = searchParams.get("phrn");

        if (!phrn) {
            return NextResponse.json({ error: "phrn query parameter required" }, { status: 400 });
        }

        const phrnEntry = lookupByPHRN(phrn.trim().toUpperCase());
        if (!phrnEntry) {
            return NextResponse.json({ error: "PHRN not found" }, { status: 404 });
        }

        // Retrieve full patient record
        const patients = getPatients();
        const patient = patients.find((p: any) => p.id === phrnEntry.patientId);

        if (!patient) {
            return NextResponse.json({ error: "Patient record not found for this PHRN" }, { status: 404 });
        }

        return NextResponse.json({
            phrn: phrnEntry.phrn,
            patientId: phrnEntry.patientId,
            issuedDate: phrnEntry.issuedDate,
            isActive: phrnEntry.isActive,
            patient: {
                ...patient,
                phrn: phrnEntry.phrn,
            },
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
