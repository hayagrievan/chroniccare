import { NextRequest, NextResponse } from "next/server";
import { getPatients } from "@/lib/jsonDb";
import { getAdherenceByPatient } from "@/lib/jsonDb";
import { computeHealthScore } from "@/lib/healthScoreEngine";
import { computeAdherenceScore } from "@/lib/adherenceCalculator";
import { adherenceRecords } from "@/lib/mockData";

export async function POST(req: NextRequest) {
    try {
        const { patientId, patient: patientBody } = await req.json();

        let patient = patientBody;
        if (!patient && patientId) {
            const patients = getPatients();
            patient = patients.find((p: any) => p.id === patientId || p.patientId === patientId);
        }

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        // Get adherence score
        const dbRecords = getAdherenceByPatient(patient.id || patient.patientId);
        const allRecords = dbRecords.length > 0 ? dbRecords : adherenceRecords.filter(r => r.patientId === (patient.id || patient.patientId));
        const adherenceResult = computeAdherenceScore(patient.id || patient.patientId, allRecords as any);

        // Compute health score
        const result = computeHealthScore(patient, adherenceResult.overallScore);

        return NextResponse.json({
            patientId: patient.id || patient.patientId,
            healthScore: result.totalScore,
            category: result.category,
            components: result.components,
            explanation: result.explanation,
            adherenceScore: adherenceResult.overallScore,
        });
    } catch (err: any) {
        console.error("Health score error:", err);
        return NextResponse.json({ error: err.message || "Failed to compute health score" }, { status: 500 });
    }
}
