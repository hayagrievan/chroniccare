import { NextRequest, NextResponse } from "next/server";
import { getPrescriptions, savePrescriptions } from "@/lib/jsonDb";

/** PATCH /api/prescriptions/[id] — update status (Dispensed / Cancelled) */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        const prescriptions = getPrescriptions();
        const rxIndex = prescriptions.findIndex(p => p.prescriptionId === id);

        if (rxIndex === -1) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        prescriptions[rxIndex].status = status;
        savePrescriptions(prescriptions);

        return NextResponse.json(prescriptions[rxIndex]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
