import { NextRequest, NextResponse } from "next/server";
import { getAlerts, saveAlerts } from "@/lib/jsonDb";

/** PATCH /api/alerts/[id] — update alert status (Acknowledged / Resolved / Active) */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        const alerts = getAlerts();
        const alertIndex = alerts.findIndex(a => a.alertId === id);

        if (alertIndex === -1) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        alerts[alertIndex].status = status;
        if (status === "Resolved") {
            alerts[alertIndex].resolvedAt = new Date().toISOString();
        }

        saveAlerts(alerts);
        return NextResponse.json(alerts[alertIndex]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
