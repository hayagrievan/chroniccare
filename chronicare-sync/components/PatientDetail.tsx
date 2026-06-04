"use client";

import { useState, useEffect, useRef } from "react";
import { Patient, ClinicalMetric, UploadedReport } from "@/lib/mockData";
import {
    X, FileText, Activity, AlertTriangle, TrendingUp, TrendingDown,
    Minus, Clock, User, Phone, Calendar, ChevronDown, ChevronUp,
    Sparkles, Send, Bot, Loader2, RefreshCw, MessageSquare,
    Upload, CheckCircle, FileUp, Trash2, Download, Brain,
} from "lucide-react";
import HealthScoreGauge from "./ui/HealthScoreGauge";
import AdherenceRing from "./ui/AdherenceRing";
import XAIBarChart from "./ui/XAIBarChart";
import PHRNBadge from "./ui/PHRNBadge";
import RiskScoreMeter from "./ui/RiskScoreMeter";

// ── PDF Download helper ──────────────────────────────────────────────────────
function downloadMedicalReportPDF(patient: Patient, aiSummary: string) {
    const metrics = patient.clinicalMetrics.map(m =>
        `<tr><td style="padding:4px 8px;color:#525f7f">${m.label}:</td><td style="padding:4px 8px;font-weight:600;color:${m.status === 'critical' ? '#c92a2a' : m.status === 'warning' ? '#e67700' : '#2f9e44'}">${m.value} ${m.unit}</td></tr>`
    ).join("");
    const actions = patient.suggestedActions.map((a, i) =>
        `<div style="margin:4px 0;padding:6px 10px;background:#f4f6fb;border-radius:8px;font-size:12px">${i + 1}. ${a}</div>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><title>Medical Report - ${patient.name}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#1a1f36;font-size:13px}h2{color:#4c6ef5}table{width:100%;border-collapse:collapse}.header{display:flex;justify-content:space-between;border-bottom:2px solid #4c6ef5;padding-bottom:12px;margin-bottom:16px}</style>
</head><body>
<div class="header">
  <div><strong style="color:#4c6ef5;font-size:15px">Apollo Multispeciality Hospital</strong><br><small>21, Greams Lane, Chennai · Tel: 044-2829-3333</small></div>
  <div style="text-align:right"><strong>MRD: ${patient.id}</strong><br><small>Date: ${patient.lastVisit}</small></div>
</div>
<p style="text-align:center;background:#eef2ff;padding:6px;border-radius:6px;color:#4c6ef5;font-weight:bold">OUTPATIENT MEDICAL REPORT</p>
<table style="background:#f4f6fb;border-radius:8px;margin-bottom:16px">
  <tr><td style="padding:4px 8px;color:#8898aa">Patient Name</td><td style="padding:4px 8px;font-weight:600">${patient.name}</td><td style="padding:4px 8px;color:#8898aa">Age / Gender</td><td style="padding:4px 8px;font-weight:600">${patient.age}Y / ${patient.gender}</td></tr>
  <tr><td style="padding:4px 8px;color:#8898aa">Contact</td><td style="padding:4px 8px">${patient.phone}</td><td style="padding:4px 8px;color:#8898aa">Consultant</td><td style="padding:4px 8px">${patient.assignedDoctor}</td></tr>
</table>
<h2>Chief Complaints</h2>
<p>${patient.disease === 'Heart' ? 'Palpitation, chest discomfort, and exertional dyspnoea' : patient.disease === 'BP' ? 'Persistent headaches, dizziness, and visual disturbances' : patient.disease === 'Sugar' ? 'Polyuria, polydipsia, and fatigue over the past 3 months' : 'Chronic fatigue, sleep disturbances, and anxiety episodes'}</p>
<h2>Clinical Findings</h2>
<table style="width:100%">${metrics}</table>
<h2>AI Assessment</h2>
<p>${aiSummary}</p>
<h2>Risk Level</h2>
<p><strong>${patient.riskLevel}</strong></p>
<h2>Suggested Actions</h2>
${actions}
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8ecf4;display:flex;justify-content:space-between">
  <div><strong>${patient.assignedDoctor}</strong><br><small>Consultant Physician · MCI-45621</small></div>
  <div style="border:2px solid #4c6ef5;padding:8px 16px;text-align:center;color:#4c6ef5"><strong>DIGITAL SEAL</strong><br><small>Apollo Hospital</small></div>
</div>
</body></html>`;
    const w = window.open("", "_blank", "width=900,height=700")!;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
}

interface PatientDetailProps {
    patient: Patient;
    onClose: () => void;
}

const statusStyles = {
    normal: { color: "#2f9e44", bg: "#d3f9d8", border: "#8ce99a" },
    warning: { color: "#e67700", bg: "#fff3bf", border: "#ffd43b" },
    critical: { color: "#c92a2a", bg: "#ffe3e3", border: "#ffa8a8" },
};
const riskStyles = {
    High: { color: "#c92a2a", bg: "#ffe3e3", border: "#ffa8a8", icon: "🔴" },
    Medium: { color: "#e67700", bg: "#fff3bf", border: "#ffd43b", icon: "🟡" },
    Low: { color: "#2f9e44", bg: "#d3f9d8", border: "#8ce99a", icon: "🟢" },
};

interface GroqAnalysis {
    summary: string;
    riskLevel: string;
    riskReason: string;
    suggestedActions: string[];
}

function MetricCard({ metric }: { metric: ClinicalMetric }) {
    // Fallback to "normal" styling if Groq returns an unexpected status value
    const s = statusStyles[metric.status as keyof typeof statusStyles] ?? statusStyles.normal;
    const TIcon =
        metric.trend === "down" ? TrendingDown : metric.trend === "up" ? TrendingUp : Minus;
    return (
        <div className="rounded-2xl p-3.5 border card-hover" style={{ background: s.bg, borderColor: s.border }}>
            <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-medium" style={{ color: "#525f7f" }}>{metric.label}</p>
                <TIcon size={12} style={{ color: metric.trend === "up" ? "#c92a2a" : metric.trend === "down" ? "#2f9e44" : "#94a3b8" }} />
            </div>
            <p className="text-xl font-black" style={{ color: s.color }}>{metric.value}</p>
            <p className="text-xs mt-0.5" style={{ color: s.color + "cc" }}>{metric.unit} · {metric.status}</p>
        </div>
    );
}

function TimelineItem({ entry, isLast }: { entry: any; isLast: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const rs = riskStyles[entry.riskLevel as "High" | "Medium" | "Low"];
    return (
        <div className={`relative pl-9 pb-5 ${isLast ? "" : "timeline-item"}`}>
            <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 border-2"
                style={{ background: rs.bg, borderColor: rs.border }}>
                {rs.icon}
            </div>
            <div className="rounded-2xl p-3 border cursor-pointer hover:shadow-sm transition-all card-hover"
                style={{ background: "#fff", borderColor: "#e8ecf4" }}
                onClick={() => setExpanded(!expanded)}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "#1a1f36" }}>{entry.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#8898aa" }}>
                            <Clock size={9} className="inline mr-1" />{entry.date} · {entry.doctor}
                        </p>
                    </div>
                    {expanded ? <ChevronUp size={13} style={{ color: "#8898aa" }} /> : <ChevronDown size={13} style={{ color: "#8898aa" }} />}
                </div>
                {expanded && (
                    <p className="text-xs mt-2 leading-relaxed fade-in" style={{ color: "#525f7f" }}>{entry.summary}</p>
                )}
            </div>
        </div>
    );
}

/* ── Chat Message ── */
interface ChatMsg { role: "user" | "assistant"; content: string }

function ChatPanel({ patient }: { patient: Patient }) {
    const [msgs, setMsgs] = useState<ChatMsg[]>([
        { role: "assistant", content: `Hi! I'm your AI clinical assistant for ${patient.name}'s case. Ask me anything about this patient's condition, metrics, or treatment options.` },
    ]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    const send = async () => {
        if (!input.trim() || streaming) return;
        const userMsg: ChatMsg = { role: "user", content: input.trim() };
        setMsgs(p => [...p, userMsg]);
        setInput("");
        setStreaming(true);

        // placeholder for streaming text
        setMsgs(p => [...p, { role: "assistant", content: "" }]);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...msgs, userMsg].map(m => ({ role: m.role, content: m.content })),
                    patientContext: patient,
                }),
            });

            if (!res.ok || !res.body) throw new Error("Stream failed");
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let acc = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                acc += decoder.decode(value, { stream: true });
                setMsgs(p => {
                    const next = [...p];
                    next[next.length - 1] = { role: "assistant", content: acc };
                    return next;
                });
            }
        } catch {
            setMsgs(p => {
                const next = [...p];
                next[next.length - 1] = { role: "assistant", content: "Sorry, I couldn't connect to the AI. Please check your GROQ_API_KEY in .env.local." };
                return next;
            });
        } finally {
            setStreaming(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ background: m.role === "assistant" ? "#dbe4ff" : "#d3f9d8" }}>
                            {m.role === "assistant"
                                ? <Bot size={13} style={{ color: "#4c6ef5" }} />
                                : <User size={13} style={{ color: "#2f9e44" }} />}
                        </div>
                        <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                            style={{
                                background: m.role === "assistant" ? "#f4f6fb" : "#dbe4ff",
                                color: "#1a1f36",
                                borderBottomLeftRadius: m.role === "assistant" ? "4px" : "16px",
                                borderBottomRightRadius: m.role === "user" ? "4px" : "16px",
                            }}>
                            {m.content || (streaming && i === msgs.length - 1
                                ? <span className="ai-cursor" />
                                : "")}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t" style={{ borderColor: "#e8ecf4" }}>
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send()}
                        placeholder="Ask about this patient…"
                        className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none"
                        style={{ borderColor: "#e8ecf4", background: "#f4f6fb", color: "#1a1f36" }}
                        disabled={streaming}
                    />
                    <button onClick={send} disabled={!input.trim() || streaming}
                        className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#4c6ef5,#748ffc)" }}>
                        {streaming ? <Loader2 size={13} className="text-white spin" /> : <Send size={13} className="text-white" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── PDF Upload Panel ── */
function UploadPanel({ patient }: { patient: Patient }) {
    const [reports, setReports] = useState<UploadedReport[]>(patient.uploadedReports || []);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
            setUploadError("Only PDF files are accepted."); return;
        }
        setUploading(true);
        setUploadError("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("patientId", patient.id);
            const res = await fetch("/api/upload-report", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            const report: UploadedReport = {
                filename: data.filename,
                uploadedAt: data.uploadedAt,
                extractedText: data.extractedText,
                groqAnalysis: data.groqAnalysis,
            };
            setReports(p => [report, ...p]);
            setExpanded(0);
        } catch (e: any) {
            setUploadError(e.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-5 space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => !uploading && inputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
                style={{
                    borderColor: dragOver ? "#4c6ef5" : "#c5d0fc",
                    background: dragOver ? "#eef2ff" : "#f4f6ff",
                }}>
                <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 size={32} style={{ color: "#4c6ef5" }} className="spin" />
                        <p className="text-sm font-semibold" style={{ color: "#4c6ef5" }}>Parsing PDF + running Groq AI…</p>
                        <p className="text-xs" style={{ color: "#8898aa" }}>This usually takes 5-10 seconds</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: "#dbe4ff" }}>
                            <FileUp size={22} style={{ color: "#4c6ef5" }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "#1a1f36" }}>Drop a PDF here or click to browse</p>
                        <p className="text-xs" style={{ color: "#8898aa" }}>Text-based PDFs only · Max 10 MB · AI extraction powered by Groq</p>
                    </div>
                )}
            </div>

            {uploadError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs" style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}>
                    ⚠️ {uploadError}
                </div>
            )}

            {/* Uploaded Reports List */}
            {reports.length === 0 ? (
                <div className="text-center py-6">
                    <Upload size={32} style={{ color: "#c5d0fc" }} className="mx-auto mb-2" />
                    <p className="text-sm" style={{ color: "#8898aa" }}>No reports uploaded yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase" style={{ color: "#8898aa" }}>{reports.length} Report{reports.length > 1 ? "s" : ""}</p>
                    {reports.map((r, idx) => (
                        <div key={idx} className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                            {/* Header row */}
                            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
                                onClick={() => setExpanded(expanded === idx ? null : idx)}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: r.groqAnalysis ? "#d3f9d8" : "#fff3bf" }}>
                                        {r.groqAnalysis
                                            ? <CheckCircle size={14} style={{ color: "#2f9e44" }} />
                                            : <FileText size={14} style={{ color: "#e67700" }} />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: "#1a1f36" }}>{r.filename}</p>
                                        <p className="text-xs" style={{ color: "#8898aa" }}>
                                            {new Date(r.uploadedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            {r.groqAnalysis ? " · AI extracted" : " · Text only"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {r.groqAnalysis && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: riskStyles[r.groqAnalysis.riskLevel as "High" | "Medium" | "Low"]?.bg, color: riskStyles[r.groqAnalysis.riskLevel as "High" | "Medium" | "Low"]?.color }}>
                                            {r.groqAnalysis.riskLevel} Risk
                                        </span>
                                    )}
                                    {expanded === idx ? <ChevronUp size={13} style={{ color: "#8898aa" }} /> : <ChevronDown size={13} style={{ color: "#8898aa" }} />}
                                </div>
                            </div>

                            {/* Expanded details */}
                            {expanded === idx && r.groqAnalysis && (
                                <div className="px-4 pb-4 space-y-3 fade-in">
                                    <div className="rounded-xl p-3" style={{ background: "#eef2ff" }}>
                                        <p className="text-xs font-bold mb-1" style={{ color: "#4c6ef5" }}>AI Summary</p>
                                        <p className="text-xs leading-relaxed" style={{ color: "#1a1f36" }}>{r.groqAnalysis.summary}</p>
                                    </div>

                                    {r.groqAnalysis.extractedMetrics?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>Extracted Metrics</p>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {r.groqAnalysis.extractedMetrics.map((m, mi) => (
                                                    <MetricCard key={mi} metric={m} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {r.groqAnalysis.suggestedActions?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>Suggested Actions</p>
                                            <div className="space-y-1.5">
                                                {r.groqAnalysis.suggestedActions.map((a, ai) => (
                                                    <div key={ai} className="flex items-start gap-2 text-xs rounded-xl px-2 py-1.5" style={{ background: "#f4f6fb" }}>
                                                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 text-xs font-bold" style={{ background: "#4c6ef5", fontSize: "9px" }}>{ai + 1}</span>
                                                        <span style={{ color: "#1a1f36" }}>{a}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {expanded === idx && !r.groqAnalysis && (
                                <div className="px-4 pb-4 fade-in">
                                    <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>Extracted Text Preview</p>
                                    <pre className="text-xs leading-relaxed rounded-xl p-3 overflow-auto max-h-40" style={{ background: "#f4f6fb", color: "#525f7f", whiteSpace: "pre-wrap" }}>
                                        {r.extractedText.slice(0, 800)}{r.extractedText.length > 800 ? "\n…" : ""}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Main Component ── */
export default function PatientDetail({ patient, onClose }: PatientDetailProps) {
    const [activeTab, setActiveTab] = useState<"metrics" | "ai-intelligence" | "adherence" | "history" | "chat" | "upload">("metrics");
    const [analysis, setAnalysis] = useState<GroqAnalysis | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const rs = riskStyles[patient.riskLevel as "High" | "Medium" | "Low"];

    const [intel, setIntel] = useState<{
        healthScore: number;
        category: string;
        adherenceScore: number;
        riskScore: number;
        riskLevel: string;
        confidence: number;
        contributions: any[];
        explanation: string;
        forecastText?: string;
        trend?: string;
        loading: boolean;
        error?: string;
    }>({
        healthScore: 0,
        category: "Moderate Risk",
        adherenceScore: 70,
        riskScore: 0,
        riskLevel: "Medium",
        confidence: 75,
        contributions: [],
        explanation: "",
        loading: true,
    });

    const [adherenceData, setAdherenceData] = useState<{
        records: any[];
        score: any;
        loading: boolean;
    }>({
        records: [],
        score: null,
        loading: true,
    });

    useEffect(() => {
        const fetchIntelAndAdherence = async () => {
            setIntel(prev => ({ ...prev, loading: true }));
            setAdherenceData(prev => ({ ...prev, loading: true }));
            try {
                const [hsRes, rpRes, adhRes, fcRes] = await Promise.all([
                    fetch("/api/health-score", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patient }),
                    }),
                    fetch("/api/risk-prediction", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patient }),
                    }),
                    fetch(`/api/adherence?patientId=${patient.id}`),
                    fetch("/api/progression-forecast", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patient }),
                    }),
                ]);

                const hs = await hsRes.json();
                const rp = await rpRes.json();
                const adh = await adhRes.json();
                const fc = await fcRes.json();

                setIntel({
                    healthScore: hs.healthScore || 0,
                    category: hs.category || "Moderate Risk",
                    adherenceScore: hs.adherenceScore || rp.adherenceScore || 70,
                    riskScore: rp.riskScore || 0,
                    riskLevel: rp.riskLevel || patient.riskLevel,
                    confidence: rp.confidence || 75,
                    contributions: rp.contributions || [],
                    explanation: rp.explanation || "",
                    forecastText: fc.forecastText || "",
                    trend: fc.trend || "stable",
                    loading: false,
                });

                setAdherenceData({
                    records: adh.records || [],
                    score: adh.score || null,
                    loading: false,
                });
            } catch (err) {
                console.error("Error loading intelligence:", err);
                setIntel(prev => ({ ...prev, loading: false, error: "Failed to load" }));
                setAdherenceData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchIntelAndAdherence();
    }, [patient.id]);

    const getHeatmapData = () => {
        const data = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const record = adherenceData.records.find(r => r.date === dateStr);
            let status: "taken" | "missed" | "skipped" | "none" = "none";
            if (record && record.medications && record.medications.length > 0) {
                const meds = record.medications;
                const hasMissed = meds.some((m: any) => m.status === "missed");
                const hasSkipped = meds.some((m: any) => m.status === "skipped");
                const hasTaken = meds.some((m: any) => m.status === "taken");
                if (hasMissed) status = "missed";
                else if (hasSkipped) status = "skipped";
                else if (hasTaken) status = "taken";
            }
            data.push({ date: dateStr, status, label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) });
        }
        return data;
    };

    const runAnalysis = async () => {
        setAiLoading(true);
        setAiError("");
        setAnalysis(null);
        try {
            const res = await fetch("/api/analyze-patient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient }),
            });
            if (!res.ok) throw new Error((await res.json()).error || "API error");
            const data: GroqAnalysis = await res.json();
            setAnalysis(data);
        } catch (e: any) {
            setAiError(e.message || "Analysis failed");
        } finally {
            setAiLoading(false);
        }
    };

    // Auto-run on mount
    useEffect(() => { runAnalysis(); }, [patient.id]);

    const displayActions = analysis?.suggestedActions?.length
        ? analysis.suggestedActions
        : patient.suggestedActions;
    const displaySummary = analysis?.summary || patient.llmSummary;
    const displayRisk = analysis?.riskLevel || patient.riskLevel;
    const displayRiskReason = analysis?.riskReason;

    return (
        <div className="flex h-full fade-in">
            {/* LEFT – PDF Viewer */}
            <div className="w-2/5 flex flex-col" style={{ borderRight: "1px solid #e8ecf4", background: "#1e293b" }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}>
                    <div className="flex items-center gap-2">
                        <FileText size={15} style={{ color: "#748ffc" }} />
                        <p className="text-sm font-semibold text-white">Medical Report</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "#1e40af", color: "#93c5fd" }}>PDF</span>
                        <button
                            onClick={() => downloadMedicalReportPDF(patient, displaySummary || patient.llmSummary || "")}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                            style={{ background: "rgba(76,110,245,0.25)", color: "#93c5fd" }}
                            title="Download medical report as PDF">
                            <Download size={12} /> Download PDF
                        </button>
                        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
                            <X size={15} style={{ color: "#94a3b8" }} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="rounded-xl p-6 text-sm shadow-2xl" style={{ background: "#fff", minHeight: "620px" }}>
                        {/* Hospital letterhead */}
                        <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "2px solid #4c6ef5" }}>
                            <div>
                                <p className="text-base font-bold" style={{ color: "#4c6ef5" }}>Apollo Multispeciality Hospital</p>
                                <p className="text-xs" style={{ color: "#525f7f" }}>21, Greams Lane, Chennai · Tel: 044-2829-3333</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold" style={{ color: "#1a1f36" }}>MRD: {patient.id}</p>
                                <p className="text-xs" style={{ color: "#525f7f" }}>Date: {patient.lastVisit}</p>
                            </div>
                        </div>

                        <p className="text-center font-bold text-xs mb-4 py-1.5 rounded-lg" style={{ background: "#eef2ff", color: "#4c6ef5" }}>
                            OUTPATIENT MEDICAL REPORT
                        </p>

                        <div className="space-y-3 text-xs" style={{ color: "#1a1f36" }}>
                            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: "#f4f6fb" }}>
                                {[
                                    { l: "Patient Name", v: patient.name },
                                    { l: "Age / Gender", v: `${patient.age}Y / ${patient.gender}` },
                                    { l: "Contact", v: patient.phone },
                                    { l: "Consultant", v: patient.assignedDoctor },
                                ].map(r => (
                                    <div key={r.l}>
                                        <p className="font-semibold" style={{ color: "#8898aa" }}>{r.l}</p>
                                        <p className="font-medium">{r.v}</p>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <p className="font-bold mb-1.5" style={{ color: "#4c6ef5" }}>CHIEF COMPLAINTS</p>
                                <p className="leading-relaxed" style={{ color: "#525f7f" }}>
                                    {patient.disease === "Heart" ? "Palpitation, chest discomfort, and exertional dyspnoea" :
                                        patient.disease === "BP" ? "Persistent headaches, dizziness, and visual disturbances" :
                                            patient.disease === "Sugar" ? "Polyuria, polydipsia, and fatigue over the past 3 months" :
                                                "Chronic fatigue, sleep disturbances, and anxiety episodes"}
                                </p>
                            </div>

                            <div>
                                <p className="font-bold mb-1.5" style={{ color: "#4c6ef5" }}>CLINICAL FINDINGS</p>
                                <div className="space-y-1.5">
                                    {patient.clinicalMetrics.map(m => (
                                        <div key={m.label} className="flex justify-between py-1" style={{ borderBottom: "1px solid #f0f3fa" }}>
                                            <span style={{ color: "#525f7f" }}>{m.label}:</span>
                                            <span className="font-semibold" style={{ color: m.status === "critical" ? "#c92a2a" : m.status === "warning" ? "#e67700" : "#2f9e44" }}>
                                                {m.value} {m.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="font-bold mb-1.5" style={{ color: "#4c6ef5" }}>AI ASSESSMENT</p>
                                {aiLoading
                                    ? <div className="h-3 rounded shimmer w-full" />
                                    : <p className="leading-relaxed" style={{ color: "#525f7f" }}>{displaySummary}</p>}
                            </div>

                            <div className="mt-6 pt-4 flex justify-between items-end" style={{ borderTop: "1px solid #e8ecf4" }}>
                                <div>
                                    <p className="font-bold">{patient.assignedDoctor}</p>
                                    <p style={{ color: "#525f7f" }}>Consultant Physician · MCI-45621</p>
                                </div>
                                <div className="px-3 py-2 rounded-xl border-2 text-center" style={{ borderColor: "#4c6ef5", color: "#4c6ef5" }}>
                                    <p className="font-bold text-xs">DIGITAL SEAL</p>
                                    <p className="text-xs">Apollo Hospital</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT – AI Data Panel */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#f8f9ff" }}>
                {/* Patient header */}
                <div className="px-5 py-4 page-header">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black"
                                style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                                {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-base font-bold" style={{ color: "#1a1f36" }}>{patient.name}</h2>
                                    {patient.phrn && <PHRNBadge phrn={patient.phrn} size="sm" />}
                                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                        style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                                        {displayRisk.toUpperCase()} RISK
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                    <span className="text-xs flex items-center gap-1" style={{ color: "#8898aa" }}>
                                        <User size={10} /> {patient.age}y · {patient.gender} · {patient.id}
                                    </span>
                                    <span className="text-xs flex items-center gap-1" style={{ color: "#8898aa" }}>
                                        <Phone size={10} /> {patient.phone}
                                    </span>
                                    <span className="text-xs flex items-center gap-1" style={{ color: "#8898aa" }}>
                                        <Calendar size={10} /> Next: {new Date(patient.nextAppointment).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={runAnalysis} disabled={aiLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80 disabled:opacity-40"
                            style={{ borderColor: "#748ffc", background: "#eef2ff", color: "#4c6ef5" }}>
                            {aiLoading ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />} Re-analyze
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 p-1 rounded-xl flex-wrap" style={{ background: "#e8ecf4", width: "fit-content" }}>
                        {(["metrics", "ai-intelligence", "adherence", "history", "chat", "upload"] as const).map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5"
                                style={{
                                    background: activeTab === t ? "#fff" : "transparent",
                                    color: activeTab === t ? "#4c6ef5" : "#8898aa",
                                    boxShadow: activeTab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                }}>
                                {t === "metrics" ? <Activity size={11} /> : 
                                 t === "ai-intelligence" ? <Brain size={11} /> :
                                 t === "adherence" ? <Clock size={11} /> :
                                 t === "history" ? <Clock size={11} /> : 
                                 t === "upload" ? <Upload size={11} /> : 
                                 <MessageSquare size={11} />}
                                {t === "chat" ? "AI Chat" : 
                                 t === "metrics" ? "Clinical" : 
                                 t === "ai-intelligence" ? "AI Intelligence" :
                                 t === "adherence" ? "Adherence" :
                                 t === "upload" ? "Reports" : 
                                 "History"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === "upload" ? (
                        <UploadPanel patient={patient} />
                    ) : activeTab === "chat" ? (
                        <ChatPanel patient={patient} />
                    ) : activeTab === "history" ? (
                        <div className="p-5">
                            <p className="text-xs font-bold uppercase mb-4" style={{ color: "#8898aa" }}>Visit History</p>
                            {patient.historyTimeline.map((entry, i) => (
                                <TimelineItem key={i} entry={entry} isLast={i === patient.historyTimeline.length - 1} />
                            ))}
                        </div>
                    ) : activeTab === "ai-intelligence" ? (
                        <div className="p-5 space-y-5 fade-in">
                            {intel.loading ? (
                                <div className="py-12 flex flex-col items-center justify-center">
                                    <Loader2 className="spin" style={{ color: "#4c6ef5" }} size={32} />
                                    <p className="text-xs mt-2" style={{ color: "#8898aa" }}>Loading clinical intelligence engines...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Gauge and Meter Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border p-4 flex flex-col items-center justify-center" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                            <HealthScoreGauge score={intel.healthScore} size={140} />
                                            <p className="text-xs font-bold mt-2" style={{ color: "#525f7f" }}>Computed Health Score</p>
                                        </div>
                                        <div className="rounded-2xl border p-4 flex flex-col items-center justify-center" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                            <RiskScoreMeter score={intel.riskScore} />
                                            <p className="text-xs font-bold mt-2" style={{ color: "#525f7f" }}>Supervised ML Risk Meter</p>
                                        </div>
                                    </div>

                                    {/* XAI Bar Chart */}
                                    <div className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                        <p className="text-xs font-bold uppercase mb-3" style={{ color: "#8898aa" }}>Explainable AI (SHAP Feature Importance)</p>
                                        <XAIBarChart contributions={intel.contributions} />
                                    </div>

                                    {/* Progression Forecast */}
                                    {intel.forecastText && (
                                        <div className="rounded-2xl p-4 border" style={{ background: "#eef2ff", borderColor: "#748ffc40" }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles size={14} style={{ color: "#4c6ef5" }} />
                                                <p className="text-xs font-bold uppercase" style={{ color: "#4c6ef5" }}>Disease Progression Forecast</p>
                                                {intel.trend === "improving" && <TrendingDown size={13} style={{ color: "#2f9e44" }} />}
                                                {intel.trend === "deteriorating" && <TrendingUp size={13} style={{ color: "#c92a2a" }} />}
                                                {intel.trend === "stable" && <Minus size={13} style={{ color: "#e67700" }} />}
                                            </div>
                                            <p className="text-xs leading-relaxed" style={{ color: "#1a1f36" }}>{intel.forecastText}</p>
                                        </div>
                                    )}

                                    {/* AI Insight */}
                                    <div className="rounded-xl p-3" style={{ background: "#f1f5f9" }}>
                                        <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
                                            <strong>Clinical Explanation:</strong> {intel.explanation}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : activeTab === "adherence" ? (
                        <div className="p-5 space-y-5 fade-in">
                            {adherenceData.loading ? (
                                <div className="py-12 flex flex-col items-center justify-center">
                                    <Loader2 className="spin" style={{ color: "#4c6ef5" }} size={32} />
                                    <p className="text-xs mt-2" style={{ color: "#8898aa" }}>Loading adherence history...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border p-4 flex flex-col items-center justify-center" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                            <AdherenceRing score={intel.adherenceScore} size={130} />
                                            <p className="text-xs font-bold mt-2" style={{ color: "#525f7f" }}>Adherence Score</p>
                                        </div>
                                        <div className="rounded-2xl border p-4 flex flex-col justify-center" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                            <p className="text-xs font-bold uppercase mb-2" style={{ color: "#8898aa" }}>Adherence Rates</p>
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span style={{ color: "#525f7f" }}>Taken Doses</span>
                                                        <span className="font-semibold" style={{ color: "#2f9e44" }}>{adherenceData.score?.takenDoseRate || 0}%</span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full" style={{ background: "#f1f5f9" }}>
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${adherenceData.score?.takenDoseRate || 0}%`, background: "#2f9e44" }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span style={{ color: "#525f7f" }}>Missed Doses</span>
                                                        <span className="font-semibold" style={{ color: "#c92a2a" }}>{adherenceData.score?.missedDoseRate || 0}%</span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full" style={{ background: "#f1f5f9" }}>
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${adherenceData.score?.missedDoseRate || 0}%`, background: "#c92a2a" }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span style={{ color: "#525f7f" }}>Skipped Doses</span>
                                                        <span className="font-semibold" style={{ color: "#e67700" }}>{adherenceData.score?.skippedDoseRate || 0}%</span>
                                                    </div>
                                                    <div className="w-full h-2 rounded-full" style={{ background: "#f1f5f9" }}>
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${adherenceData.score?.skippedDoseRate || 0}%`, background: "#e67700" }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 30-Day Calendar Heatmap */}
                                    <div className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                        <p className="text-xs font-bold uppercase mb-3" style={{ color: "#8898aa" }}>30-Day Adherence Heatmap</p>
                                        <div className="grid grid-cols-7 gap-2">
                                            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                                                <div key={idx} className="text-center text-xs font-bold py-1" style={{ color: "#8898aa" }}>{day}</div>
                                            ))}
                                            {getHeatmapData().map((day, idx) => {
                                                const bg = day.status === "taken" ? "#2f9e44" :
                                                           day.status === "missed" ? "#c92a2a" :
                                                           day.status === "skipped" ? "#e67700" : "#f1f5f9";
                                                return (
                                                    <div key={idx} className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold relative group"
                                                        style={{
                                                            background: bg,
                                                            color: day.status === "none" ? "#8898aa" : "#fff",
                                                            boxShadow: day.status !== "none" ? `0 2px 6px ${bg}44` : "none",
                                                        }}
                                                        title={`${day.label}: ${day.status.toUpperCase()}`}>
                                                        {day.label.split(" ")[0]}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-end gap-3 mt-4 text-xs font-semibold" style={{ color: "#8898aa" }}>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3.5 h-3.5 rounded" style={{ background: "#2f9e44" }} />
                                                <span>Taken</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3.5 h-3.5 rounded" style={{ background: "#c92a2a" }} />
                                                <span>Missed</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3.5 h-3.5 rounded" style={{ background: "#e67700" }} />
                                                <span>Skipped</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3.5 h-3.5 rounded" style={{ background: "#f1f5f9" }} />
                                                <span>No record</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alerts Section */}
                                    {adherenceData.score?.alerts?.length > 0 && (
                                        <div className="rounded-2xl border p-4" style={{ background: "#ffe3e3", borderColor: "#ffa8a8" }}>
                                            <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: "#c92a2a" }}>
                                                <AlertTriangle size={13} />
                                                Active Adherence Alerts
                                            </p>
                                            <div className="space-y-1.5">
                                                {adherenceData.score.alerts.map((alert: any, idx: number) => (
                                                    <p key={idx} className="text-xs" style={{ color: "#c92a2a" }}>
                                                        • {alert.message}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-5 space-y-4">
                            {/* AI Summary */}
                            <div className="rounded-2xl p-4 border" style={{ background: "#eef2ff", borderColor: "#748ffc40" }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {aiLoading ? <Loader2 size={14} style={{ color: "#4c6ef5" }} className="spin" /> : <Sparkles size={14} style={{ color: "#4c6ef5" }} />}
                                        <p className="text-xs font-bold uppercase" style={{ color: "#4c6ef5" }}>
                                            {aiLoading ? "Groq AI Analyzing…" : "AI Clinical Summary"}
                                        </p>
                                    </div>
                                    {!aiLoading && !aiError && (
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#dbe4ff", color: "#4c6ef5" }}>
                                            llama-3.3-70b
                                        </span>
                                    )}
                                </div>
                                {aiLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-2.5 rounded-full shimmer" style={{ width: "100%" }} />
                                        <div className="h-2.5 rounded-full shimmer" style={{ width: "85%" }} />
                                        <div className="h-2.5 rounded-full shimmer" style={{ width: "70%" }} />
                                    </div>
                                ) : aiError ? (
                                    <div>
                                        <p className="text-xs" style={{ color: "#c92a2a" }}>⚠️ {aiError} — showing cached data.</p>
                                        <p className="text-xs leading-relaxed mt-1" style={{ color: "#1a1f36" }}>{patient.llmSummary}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs leading-relaxed" style={{ color: "#1a1f36" }}>{displaySummary}</p>
                                )}
                            </div>

                            {/* Metrics Grid */}
                            <div>
                                <p className="text-xs font-bold uppercase mb-2" style={{ color: "#8898aa" }}>Clinical Metrics</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {patient.clinicalMetrics.map(m => <MetricCard key={m.label} metric={m} />)}
                                </div>
                            </div>

                            {/* Risk */}
                            <div className="rounded-2xl p-4 border" style={{ background: rs.bg, borderColor: rs.border }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={14} style={{ color: rs.color }} />
                                    <p className="text-xs font-bold uppercase" style={{ color: rs.color }}>Risk Assessment</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                                        style={{ background: "rgba(255,255,255,0.6)" }}>
                                        {rs.icon}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg" style={{ color: rs.color }}>{displayRisk} Risk</p>
                                        <p className="text-xs leading-relaxed" style={{ color: rs.color + "cc" }}>
                                            {displayRiskReason ||
                                                (patient.riskLevel === "High" ? "Requires immediate clinical attention" :
                                                    patient.riskLevel === "Medium" ? "Monitor closely, follow-up in 2 weeks" :
                                                        "Well-managed, routine follow-up in 3 months")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Suggested Actions */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-xs font-bold uppercase" style={{ color: "#8898aa" }}>Suggested Actions</p>
                                    {analysis && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#dbe4ff", color: "#4c6ef5" }}>AI</span>}
                                </div>
                                <div className="space-y-2">
                                    {aiLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="h-9 rounded-2xl shimmer" />
                                        ))
                                    ) : (
                                        displayActions.map((action, i) => (
                                            <div key={i} className="flex items-start gap-3 rounded-2xl px-3 py-2.5 border card-hover"
                                                style={{
                                                    background: i === 0 && patient.riskLevel === "High" ? "#ffe3e3" : "#fff",
                                                    borderColor: i === 0 && patient.riskLevel === "High" ? "#ffa8a8" : "#e8ecf4",
                                                }}>
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white"
                                                    style={{ background: i === 0 && patient.riskLevel === "High" ? "#c92a2a" : "#4c6ef5" }}>
                                                    {i + 1}
                                                </div>
                                                <p className="text-xs leading-relaxed" style={{ color: "#1a1f36" }}>{action}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
