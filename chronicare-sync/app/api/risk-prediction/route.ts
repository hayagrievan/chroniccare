import { NextRequest, NextResponse } from "next/server";
import { getAdherenceByPatient, appendAuditEvent } from "@/lib/jsonDb";
import { adherenceRecords } from "@/lib/mockData";
import { predictRisk } from "@/lib/mlRiskEngine";
import { computeAdherenceScore } from "@/lib/adherenceCalculator";

export async function POST(req: NextRequest) {
    try {
        const { patient } = await req.json();

        if (!patient) {
            return NextResponse.json({ error: "Patient data required" }, { status: 400 });
        }

        // Get adherence for this patient
        const dbRecords = getAdherenceByPatient(patient.id || patient.patientId);
        const allRecords = dbRecords.length > 0 ? dbRecords : adherenceRecords.filter(r => r.patientId === (patient.id || patient.patientId));
        const adherenceResult = computeAdherenceScore(patient.id || patient.patientId, allRecords as any);

        // Run risk prediction
        const result = predictRisk(patient, adherenceResult.overallScore);

        // Audit log
        appendAuditEvent({
            action: "RISK_PREDICTION",
            patientId: patient.id,
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
        });

        return NextResponse.json({
            ...result,
            adherenceScore: adherenceResult.overallScore,
        });
    } catch (err: any) {
        console.error("Risk prediction error:", err);
        return NextResponse.json({ error: err.message || "Risk prediction failed" }, { status: 500 });
    }
}
