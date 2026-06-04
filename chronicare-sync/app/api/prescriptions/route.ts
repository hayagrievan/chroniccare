import { NextRequest, NextResponse } from "next/server";
import { getPrescriptions, savePrescriptions } from "@/lib/jsonDb";

/** GET /api/prescriptions?patientId=... */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");
        
        let prescriptions = getPrescriptions();
        if (patientId) {
            prescriptions = prescriptions.filter(p => p.patientId === patientId);
        }

        // Sort by createdAt descending
        prescriptions.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json(prescriptions, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** POST /api/prescriptions — save prescription */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { patientId, patientName, disease, doctorName, items, diagnosis, notes } = body;

        if (!patientId || !items?.length) {
            return NextResponse.json({ error: "patientId and at least one medicine item are required" }, { status: 400 });
        }

        const prescriptionId = `RX-${Date.now()}`;

        // ── Log the full prescription payload to the server console ──────────
        const logPayload = {
            prescriptionId,
            patientId,
            patientName: patientName || "",
            disease: disease || "",
            doctorName: doctorName || "Dr. Priya Nair",
            diagnosis: diagnosis || "",
            notes: notes || "",
            items,
            issuedAt: new Date().toISOString(),
        };
        console.log("\n╔══════════════════════════════════════════════════════════╗");
        console.log("║           PRESCRIPTION SAVED — FULL PAYLOAD              ║");
        console.log("╚══════════════════════════════════════════════════════════╝");
        console.log(JSON.stringify(logPayload, null, 2));
        console.log("→ Storing in local JSON database\n");

        const newPrescription = {
            prescriptionId,
            patientId,
            patientName: patientName || "",
            disease: disease || "",
            doctorId: "dr-priya-nair",
            doctorName: doctorName || "Dr. Priya Nair",
            items,
            diagnosis: diagnosis || "",
            notes: notes || "",
            status: "Pending",
            pharmacyShared: false,
            createdAt: new Date().toISOString()
        };

        const prescriptions = getPrescriptions();
        prescriptions.push(newPrescription);
        savePrescriptions(prescriptions);

        return NextResponse.json(newPrescription, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

