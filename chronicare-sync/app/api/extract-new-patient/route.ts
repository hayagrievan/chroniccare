export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "patients.json");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/extract-new-patient
 * Accepts a PDF medical record, extracts patient demographics + clinical data
 * and returns a Patient-compatible object ready to be added to the doctor's list.
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file)
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

        if (file.size > 10 * 1024 * 1024)
            return NextResponse.json({ error: "Max 10 MB." }, { status: 400 });

        // ── Step 1: pdf-parse (lazy require avoids module-load self-test ENOENT) ────
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
        const buf = Buffer.from(await file.arrayBuffer());
        let text = "";
        try {
            const parsed = await pdfParse(buf);
            text = parsed.text?.trim() || "";
        } catch (err) {
            console.error("PDF parse error:", err);
            return NextResponse.json(
                { error: "Failed to parse PDF. Ensure it is a text-based PDF." },
                { status: 422 }
            );
        }

        if (text.length < 30) {
            return NextResponse.json(
                {
                    error:
                        "PDF appears to be scanned/image-only. Please upload a text-based PDF.",
                },
                { status: 422 }
            );
        }

        // ── Step 2: Groq Extraction ──────────────────────────────────────
        const today = new Date().toISOString().split("T")[0];

        const prompt = `You are a senior physician AI. Extract ALL patient information from this medical record and return structured JSON.

Medical Record:
---
${text.slice(0, 7000)}
---

Return ONLY valid JSON (no markdown, no code fences) with this EXACT shape. Use the example item shapes shown:

{
  "name": "Full patient name",
  "age": 45,
  "gender": "Male",
  "phone": "+91 98765 43210",
  "email": "patient@email.com",
  "address": "123 Main Street, Chennai, Tamil Nadu",
  "disease": "Heart",
  "riskLevel": "High",
  "assignedDoctor": "Dr. Name Surname",
  "llmSummary": "2-3 sentence clinical summary of the patient record.",
  "riskReason": "One sentence explaining why this risk level was assigned.",
  "clinicalMetrics": [
    { "label": "Heart Rate", "value": "94", "unit": "bpm", "trend": "up", "status": "warning" },
    { "label": "Blood Pressure", "value": "148/92", "unit": "mmHg", "trend": "up", "status": "critical" }
  ],
  "suggestedActions": [
    "Immediate cardiology referral",
    "Daily BP monitoring"
  ],
  "historyTimeline": [
    { "date": "27 Feb 2026", "title": "OPD Visit", "summary": "Presented with chest pain.", "riskLevel": "High", "doctor": "Dr. Name Surname" }
  ]
}

Rules:
- disease: MUST be exactly one of: Heart, BP, Sugar, Stress
- riskLevel: MUST be exactly one of: High, Medium, Low
- clinicalMetrics[].status: MUST be exactly one of: normal, warning, critical
- clinicalMetrics[].trend: MUST be exactly one of: up, down, stable
- Extract EVERY numeric measurement from the record into clinicalMetrics (BP, HR, glucose, HbA1c, SpO2, temperature, weight, etc.)
- The field name is "label" (not name, metric_name, or parameter)
- The field name is "value" as a string (not val or reading)
- historyTimeline: list every visit/event mentioned; if none found, return []
- Return empty string "" for any field not found in the document`;

        let groqData: any = null;

        if (process.env.GROQ_API_KEY) {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a medical AI. Output ONLY valid JSON. No markdown fences.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.1,
                max_tokens: 1800,
            });

            const raw = completion.choices[0]?.message?.content || "{}";

            const cleaned = raw
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            try {
                groqData = JSON.parse(cleaned);
            } catch (err) {
                console.error("JSON parse error:", err);
                groqData = null;
            }
        }

        if (!groqData) {
            return NextResponse.json(
                {
                    error:
                        "Could not extract patient data. Check GROQ_API_KEY and PDF format.",
                },
                { status: 422 }
            );
        }

        // ── Step 3: Build Patient Object ─────────────────────────────────
        const patientId = `PAT-${Date.now().toString().slice(-6)}`;

        // Normalize helpers — Groq can return non-standard strings
        const validStatuses = new Set(["normal", "warning", "critical"]);
        const validTrends = new Set(["up", "down", "stable"]);
        const validRisk = new Set(["High", "Medium", "Low"]);
        const validDiseases = new Set(["Heart", "BP", "Sugar", "Stress"]);

        const normalizeStatus = (s: string) => validStatuses.has(s) ? s : "normal";
        const normalizeTrend = (t: string) => validTrends.has(t) ? t : "stable";

        const rawMetrics: any[] = groqData.clinicalMetrics || [];
        const cleanMetrics = rawMetrics.map((m: any) => ({
            // Accept common Groq aliases: label / name / metric_name / parameter / test_name
            label: String(m.label ?? m.name ?? m.metric_name ?? m.parameter ?? m.test_name ?? m.metric ?? "Metric"),
            // Accept val / reading / result in addition to value
            value: String(m.value ?? m.val ?? m.reading ?? m.result ?? "—"),
            unit: String(m.unit ?? m.units ?? ""),
            trend: normalizeTrend(String(m.trend ?? "stable")),
            status: normalizeStatus(String(m.status ?? "normal")),
        }));

        const patient = {
            id: patientId,
            name: groqData.name || "Unknown Patient",
            age: Number(groqData.age) || 0,
            gender: ["Male", "Female"].includes(groqData.gender) ? groqData.gender : "Male",
            phone: groqData.phone || "",
            email: groqData.email || "",
            address: groqData.address || "",
            disease: validDiseases.has(groqData.disease) ? groqData.disease : "Heart",
            riskLevel: validRisk.has(groqData.riskLevel) ? groqData.riskLevel : "Medium",
            assignedDoctor: groqData.assignedDoctor || "Dr. Priya Nair",
            profileImage: "",
            uploadedReports: [],
            lastVisit: today,
            nextAppointment: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
            clinicalMetrics: cleanMetrics,
            suggestedActions: Array.isArray(groqData.suggestedActions) ? groqData.suggestedActions : [],
            historyTimeline:
                groqData.historyTimeline?.length > 0
                    ? groqData.historyTimeline
                    : [
                        {
                            date: new Date().toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            }),
                            title: "Record Uploaded",
                            summary:
                                "Patient added via uploaded medical record.",
                            riskLevel:
                                groqData.riskLevel || "Medium",
                            doctor:
                                groqData.assignedDoctor ||
                                "Dr. Priya Nair",
                        },
                    ],
            llmSummary: groqData.llmSummary || "",
            riskReason: groqData.riskReason || "",
            extractedText: text.slice(0, 2000),
        };

        // ── Step 4: Persist to data/patients.json ──────────────────────────────────
        try {
            const raw = await fs.readFile(DATA_FILE, "utf-8");
            const existing = JSON.parse(raw) as object[];
            // Prepend so the new patient appears first
            const updated = [patient, ...existing];
            await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
        } catch (writeErr) {
            // Non-fatal: log but still return success — frontend can add locally
            console.error("Failed to persist patient to JSON:", writeErr);
        }

        return NextResponse.json({ patient });
    } catch (err: any) {
        console.error("extract-new-patient error:", err);
        return NextResponse.json(
            { error: err?.message || "Internal error" },
            { status: 500 }
        );
    }
}