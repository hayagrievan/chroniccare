import { NextResponse } from "next/server";
import { getPatients } from "@/lib/jsonDb";

const VALID_STATUSES = new Set(["normal", "warning", "critical"]);
const VALID_TRENDS = new Set(["up", "down", "stable"]);

function normalizeMetric(m: any) {
    const label = m.label ?? m.name ?? m.metric ?? m.metric_name ?? m.parameter ?? m.test_name ?? "Metric";
    const value = m.value ?? m.val ?? m.reading ?? m.result ?? "—";
    const unit = m.unit ?? m.units ?? "";
    const rawTrend = String(m.trend ?? "stable").toLowerCase();
    const rawStatus = String(m.status ?? "normal").toLowerCase();
    return {
        label: String(label),
        value: String(value),
        unit: String(unit),
        trend: VALID_TRENDS.has(rawTrend) ? rawTrend : "stable",
        status: VALID_STATUSES.has(rawStatus) ? rawStatus : "normal",
    };
}

/** GET /api/patients */
export async function GET() {
    try {
        const patients = getPatients();
        return NextResponse.json(
            patients.map(p => ({
                ...p,
                patientId: p.id ?? p.patientId,
                clinicalMetrics: Array.isArray(p.clinicalMetrics)
                    ? p.clinicalMetrics.map(normalizeMetric)
                    : [],
            })),
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
