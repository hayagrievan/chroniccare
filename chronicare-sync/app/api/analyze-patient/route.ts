import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { patient } = await req.json();

        if (!patient) {
            return NextResponse.json({ error: "Patient data required" }, { status: 400 });
        }

        const prompt = `You are an expert senior physician reviewing a patient's medical record. Analyze the following clinical data and provide:

1. A concise AI Clinical Summary (2-3 sentences, clinically precise)
2. A Risk Assessment with level (High/Medium/Low) and a reason
3. 4-6 Suggested Actions (ordered by urgency, be specific with dosages/timelines where appropriate)

Patient: ${patient.name}, ${patient.age}y ${patient.gender}
Condition: ${patient.disease}
Current Physician: ${patient.assignedDoctor}

Clinical Metrics:
${patient.clinicalMetrics.map((m: any) => `• ${m.label}: ${m.value} ${m.unit} [${m.status}]`).join("\n")}

Respond in this exact JSON format:
{
  "summary": "...",
  "riskLevel": "High|Medium|Low",
  "riskReason": "...",
  "suggestedActions": ["action1", "action2", "action3", "action4"]
}`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are a board-certified physician AI assistant. Respond only with valid JSON. Be clinically precise, evidence-based, and prioritize patient safety.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 800,
        });

        const raw = completion.choices[0]?.message?.content || "{}";

        // Strip markdown fences if present
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        let result;
        try {
            result = JSON.parse(cleaned);
        } catch {
            result = {
                summary: raw,
                riskLevel: patient.riskLevel,
                riskReason: "Analysis completed — see summary.",
                suggestedActions: [],
            };
        }

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Groq analyze-patient error:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to analyze patient data" },
            { status: 500 }
        );
    }
}
