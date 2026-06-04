import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { messages, patientContext } = await req.json();

        const systemPrompt = patientContext
            ? `You are an expert AI physician assistant. You are currently reviewing the following patient:

Patient: ${patientContext.name}, ${patientContext.age}y ${patientContext.gender}
Condition: ${patientContext.disease} | Risk: ${patientContext.riskLevel}
Metrics: ${patientContext.clinicalMetrics?.map((m: any) => `${m.label}: ${m.value} ${m.unit}`).join(", ")}

Answer clinical questions concisely and accurately. Always recommend consulting the attending physician for final decisions. Do not use markdown formatting in responses — use plain text only.`
            : "You are an expert AI physician assistant. Answer clinical questions concisely and accurately.";

        const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages,
            ],
            temperature: 0.4,
            max_tokens: 600,
            stream: true,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content || "";
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                } catch (e) {
                    controller.error(e);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "Cache-Control": "no-cache",
            },
        });
    } catch (err: any) {
        console.error("Groq chat error:", err);
        return new Response(JSON.stringify({ error: err?.message || "Chat failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
