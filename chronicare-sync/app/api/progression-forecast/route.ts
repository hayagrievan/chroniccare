import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { computeHealthScore } from "@/lib/healthScoreEngine";
import { predictRisk } from "@/lib/mlRiskEngine";
import { getAdherenceByPatient } from "@/lib/jsonDb";
import { computeAdherenceScore } from "@/lib/adherenceCalculator";
import { adherenceRecords } from "@/lib/mockData";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { patient } = await req.json();
        if (!patient) return NextResponse.json({ error: "Patient required" }, { status: 400 });

        const patientId = patient.id || patient.patientId;

        // Get adherence
        const dbRecords = getAdherenceByPatient(patientId);
        const allRecords = dbRecords.length > 0
            ? dbRecords
            : adherenceRecords.filter(r => r.patientId === patientId);
        const adherenceResult = computeAdherenceScore(patientId, allRecords as any);

        // Compute current scores
        const healthScoreResult = computeHealthScore(patient, adherenceResult.overallScore);
        const riskResult = predictRisk(patient, adherenceResult.overallScore);

        // Determine trend from history timeline
        const history = patient.historyTimeline || [];
        const highRiskEvents = history.filter((h: any) => h.riskLevel === "High").length;
        const mediumEvents = history.filter((h: any) => h.riskLevel === "Medium").length;

        // Build Groq prompt for forecast
        const prompt = `You are a clinical AI system generating a disease progression forecast. Based on the following patient data, provide a structured 3-month and 6-month health forecast.

Patient: ${patient.name}, ${patient.age}y ${patient.gender}
Primary Condition: ${patient.disease}
Current Health Score: ${healthScoreResult.totalScore}/100 (${healthScoreResult.category})
Current Risk Level: ${riskResult.riskLevel} (${riskResult.riskScore}/100)
Medication Adherence: ${adherenceResult.overallScore}%
Adherence Trend: ${adherenceResult.trend}
High-risk clinical events in history: ${highRiskEvents}
Top risk driver: ${riskResult.contributions[0]?.feature || "Unknown"} (${riskResult.contributions[0]?.contribution || 0}% contribution)

Clinical Metrics:
${patient.clinicalMetrics?.slice(0, 6).map((m: any) => `• ${m.label}: ${m.value} ${m.unit} [${m.status}]`).join("\n")}

Respond in this EXACT JSON format only:
{
  "currentRisk": "${riskResult.riskLevel}",
  "threeMonthProjection": "Low|Medium|High",
  "sixMonthProjection": "Low|Medium|High",
  "trend": "improving|stable|deteriorating",
  "forecastText": "2-3 sentence clinical forecast...",
  "keyFactors": ["factor1", "factor2", "factor3"]
}`;

        let forecastData: any;

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert clinical AI forecasting system. Generate precise, evidence-based disease progression forecasts. Always respond with valid JSON only.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 500,
            });

            const raw = completion.choices[0]?.message?.content || "{}";
            const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            forecastData = JSON.parse(cleaned);
        } catch {
            // Fallback deterministic forecast
            const trend = adherenceResult.overallScore < 60
                ? "deteriorating"
                : healthScoreResult.totalScore > 70
                ? "improving"
                : "stable";

            const threeMonth = riskResult.riskScore > 70
                ? "High"
                : riskResult.riskScore > 45
                ? "Medium"
                : "Low";

            forecastData = {
                currentRisk: riskResult.riskLevel,
                threeMonthProjection: threeMonth,
                sixMonthProjection: riskResult.riskLevel,
                trend,
                forecastText: `Based on current clinical indicators, the patient shows a ${trend} trajectory. ${
                    adherenceResult.overallScore < 70
                        ? "Improving medication adherence is the highest-priority intervention."
                        : "Continue current management plan with regular monitoring."
                }`,
                keyFactors: riskResult.contributions.slice(0, 3).map(c => `${c.feature}: ${c.value}`),
            };
        }

        return NextResponse.json({
            ...forecastData,
            healthScore: healthScoreResult.totalScore,
            riskScore: riskResult.riskScore,
            adherenceScore: adherenceResult.overallScore,
        });
    } catch (err: any) {
        console.error("Progression forecast error:", err);
        return NextResponse.json({ error: err.message || "Forecast failed" }, { status: 500 });
    }
}
