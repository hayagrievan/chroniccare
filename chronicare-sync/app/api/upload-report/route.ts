import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/upload-report
// Body: multipart/form-data with field `file` (PDF) and `patientId`
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const patientId = formData.get("patientId") as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
        }

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Maximum 10 MB." }, { status: 400 });
        }

        // ── Step 1: Extract raw text from PDF (lazy require avoids ENOENT on startup) ──
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let extractedText = "";
        try {
            const parsed = await pdfParse(buffer);
            extractedText = parsed.text?.trim() || "";
        } catch (pdfErr) {
            console.error("pdf-parse error:", pdfErr);
            return NextResponse.json({ error: "Failed to parse PDF. Ensure it is a text-based (not scanned) PDF." }, { status: 422 });
        }

        if (!extractedText || extractedText.length < 50) {
            return NextResponse.json({
                error: "PDF appears to be a scanned/image-only document. Please upload a text-based PDF or a typed report.",
            }, { status: 422 });
        }

        // ── Step 2: Send extracted text to Groq for structured extraction ───────
        const prompt = `You are a senior physician AI assistant. Extract ALL clinical information from this medical report text and return structured JSON.

Medical Report Text:
---
${extractedText.slice(0, 6000)}
---

Return ONLY valid JSON (no markdown fences) with this exact shape:
{
  "summary": "2-3 sentence clinical narrative summarizing the report",
  "riskLevel": "High" | "Medium" | "Low",
  "riskReason": "one sentence explaining the risk level",
  "suggestedActions": ["action 1", "action 2", "action 3", "action 4"],
  "extractedMetrics": [
    { "label": "metric name", "value": "numeric value", "unit": "unit", "trend": "stable", "status": "normal" | "warning" | "critical" }
  ]
}

Guidelines:
- extractedMetrics: extract every measurable value (BP, glucose, HbA1c, heart rate, cholesterol, etc.)
- For trend, use "up" if elevated/worsening, "down" if decreasing, "stable" if unchanged
- For status: normal (within range), warning (borderline), critical (dangerous)
- suggestedActions: ordered by urgency, be specific with treatment names when mentioned
- If a field cannot be determined from the text, use sensible defaults`;

        let groqResult: any = null;

        if (process.env.GROQ_API_KEY) {
            try {
                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a medical AI. Respond only with valid JSON. No markdown. No preamble." },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 1200,
                });

                const raw = completion.choices[0]?.message?.content || "{}";
                const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

                groqResult = JSON.parse(cleaned);
            } catch (groqErr: any) {
                console.error("Groq extraction error:", groqErr?.message);
                // Non-fatal — we still return the raw extracted text
                groqResult = null;
            }
        }

        // ── Step 3: Return result ───────────────────────────────────────────────
        return NextResponse.json({
            filename: file.name,
            uploadedAt: new Date().toISOString(),
            extractedText: extractedText.slice(0, 4000), // cap for storage
            patientId: patientId || null,
            groqAnalysis: groqResult,
            wordCount: extractedText.split(/\s+/).length,
        });

    } catch (err: any) {
        console.error("upload-report error:", err);
        return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
    }
}
