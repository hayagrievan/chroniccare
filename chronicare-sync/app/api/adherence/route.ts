import { NextRequest, NextResponse } from "next/server";
import {
    getAdherenceRecords, saveAdherenceRecords,
    getAdherenceByPatient, appendAuditEvent,
} from "@/lib/jsonDb";
import { computeAdherenceScore } from "@/lib/adherenceCalculator";

/** GET /api/adherence?patientId=PAT-001 — fetch adherence records for a patient */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");

        if (!patientId) {
            return NextResponse.json({ error: "patientId required" }, { status: 400 });
        }

        const records = getAdherenceByPatient(patientId);
        const score = computeAdherenceScore(patientId, records);

        return NextResponse.json({
            records,
            score,
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** POST /api/adherence — record a medication dose event */
export async function POST(req: NextRequest) {
    try {
        const { patientId, phrn, date, medicineId, medicineName, dose, scheduled, status } = await req.json();

        if (!patientId || !date || !medicineId || !status) {
            return NextResponse.json({ error: "patientId, date, medicineId, status required" }, { status: 400 });
        }

        const allRecords = getAdherenceRecords();
        const today = date || new Date().toISOString().split("T")[0];
        const recordId = `ADH-${patientId}-${today.replace(/-/g, "")}`;

        let dayRecord = allRecords.find((r: any) => r.recordId === recordId);

        if (!dayRecord) {
            dayRecord = {
                recordId,
                patientId,
                phrn: phrn || "",
                date: today,
                medications: [],
            };
            allRecords.push(dayRecord);
        }

        const existingIdx = dayRecord.medications.findIndex(
            (m: any) => m.medicineId === medicineId && m.scheduled === scheduled
        );

        const medEntry = {
            medicineId,
            medicineName,
            dose,
            scheduled: scheduled || "08:00",
            status,
            recordedAt: status !== "pending" ? new Date().toISOString() : null,
        };

        if (existingIdx >= 0) {
            dayRecord.medications[existingIdx] = medEntry;
        } else {
            dayRecord.medications.push(medEntry);
        }

        saveAdherenceRecords(allRecords);

        appendAuditEvent({
            action: "ADHERENCE_RECORDED",
            patientId,
            medicineId,
            medicineName,
            status,
            date: today,
        });

        // Recompute score
        const updatedRecords = getAdherenceByPatient(patientId);
        const updatedScore = computeAdherenceScore(patientId, updatedRecords);

        return NextResponse.json({ record: dayRecord, score: updatedScore });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
