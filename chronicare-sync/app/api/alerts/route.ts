import { NextRequest, NextResponse } from "next/server";
import { getAlerts, saveAlerts } from "@/lib/jsonDb";

/** GET /api/alerts — list alerts; optionally filter by status or severity */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const severity = searchParams.get("severity");

        let alerts = getAlerts();
        if (status) {
            alerts = alerts.filter(a => a.status === status);
        }
        if (severity) {
            alerts = alerts.filter(a => a.severity === severity);
        }

        // Sort by createdAt descending
        alerts.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json(alerts, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** POST /api/alerts — create a new alert (e.g. threshold-triggered) */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const alertId = `ALT-${Date.now()}`;
        const newAlert = {
            alertId,
            ...body,
            status: "Active",
            createdAt: new Date().toISOString()
        };

        const alerts = getAlerts();
        alerts.push(newAlert);
        saveAlerts(alerts);

        return NextResponse.json(newAlert, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
