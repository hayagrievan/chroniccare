import { NextRequest, NextResponse } from "next/server";
import { getAuditLog, appendAuditEvent } from "@/lib/jsonDb";

/** GET /api/audit-log — fetch audit events (paginated) */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const patientId = searchParams.get("patientId");

        let log = getAuditLog();
        if (patientId) {
            log = log.filter((e: any) => e.patientId === patientId);
        }

        return NextResponse.json(log.slice(0, limit), { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** POST /api/audit-log — record a new audit event */
export async function POST(req: NextRequest) {
    try {
        const event = await req.json();
        appendAuditEvent(event);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
