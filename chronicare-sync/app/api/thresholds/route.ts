import { NextRequest, NextResponse } from "next/server";
import { getThresholds, saveThresholds } from "@/lib/jsonDb";

/** GET /api/thresholds — fetch current threshold settings for the doctor */
export async function GET() {
    try {
        const doc = getThresholds();
        return NextResponse.json(doc, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** PUT /api/thresholds — save updated thresholds */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { heartRate, systolicBP, spo2, glucose } = body;

        const doc = {
            doctorId: "dr-priya-nair",
            heartRate,
            systolicBP,
            spo2,
            glucose,
            updatedAt: new Date().toISOString()
        };

        saveThresholds(doc);
        return NextResponse.json(doc);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
