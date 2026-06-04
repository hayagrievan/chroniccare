import { NextRequest, NextResponse } from "next/server";
import {
    getConsentLogs, saveConsentLogs, appendAuditEvent,
    getPHRNRegistry, getPatients,
} from "@/lib/jsonDb";

function makeConsentId() {
    return `CON-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** GET /api/consent?patientId=PAT-001 — get consent history for a patient */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");

        const logs = getConsentLogs();
        const filtered = patientId
            ? logs.filter((c: any) => c.patientId === patientId)
            : logs;

        return NextResponse.json(filtered, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** POST /api/consent — consent operations: request, approve, revoke */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, patientId, phrn, doctorId, doctorName, purpose, consentId } = body;

        const logs = getConsentLogs();

        if (action === "request") {
            // Validate PHRN exists
            const registry = getPHRNRegistry();
            const phrnEntry = registry.find((r: any) =>
                (phrn && r.phrn === phrn) || (patientId && r.patientId === patientId)
            );
            if (!phrnEntry) {
                return NextResponse.json({ error: "PHRN not found in registry" }, { status: 404 });
            }

            // Check if already approved
            const existing = logs.find(
                (c: any) => c.patientId === (phrnEntry.patientId) &&
                    c.doctorId === doctorId &&
                    c.status === "Approved"
            );
            if (existing) {
                return NextResponse.json({ message: "Access already approved", consent: existing });
            }

            const newConsent = {
                consentId: makeConsentId(),
                patientId: phrnEntry.patientId,
                phrn: phrnEntry.phrn,
                doctorId: doctorId || "dr-priya-nair",
                doctorName: doctorName || "Dr. Priya Nair",
                status: "Pending",
                requestedAt: new Date().toISOString(),
                approvedAt: null,
                revokedAt: null,
                expiresAt: null,
                purpose: purpose || "Clinical consultation",
            };

            logs.push(newConsent);
            saveConsentLogs(logs);
            appendAuditEvent({ action: "CONSENT_REQUESTED", ...newConsent });

            return NextResponse.json(newConsent, { status: 201 });
        }

        if (action === "approve") {
            const idx = logs.findIndex((c: any) => c.consentId === consentId);
            if (idx < 0) return NextResponse.json({ error: "Consent not found" }, { status: 404 });
            logs[idx].status = "Approved";
            logs[idx].approvedAt = new Date().toISOString();
            saveConsentLogs(logs);
            appendAuditEvent({ action: "CONSENT_APPROVED", consentId, patientId: logs[idx].patientId });
            return NextResponse.json(logs[idx]);
        }

        if (action === "revoke") {
            const idx = logs.findIndex((c: any) => c.consentId === consentId);
            if (idx < 0) return NextResponse.json({ error: "Consent not found" }, { status: 404 });
            logs[idx].status = "Revoked";
            logs[idx].revokedAt = new Date().toISOString();
            saveConsentLogs(logs);
            appendAuditEvent({ action: "CONSENT_REVOKED", consentId, patientId: logs[idx].patientId });
            return NextResponse.json(logs[idx]);
        }

        return NextResponse.json({ error: "Invalid action. Use: request, approve, revoke" }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
