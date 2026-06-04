"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Patient } from "@/lib/mockData";
import {
    Users, Download, Send, Search, ChevronUp, ChevronDown,
    Heart, Activity, Droplets, Brain, ChevronRight,
    Upload, FileUp, Loader2, CheckCircle, X, AlertTriangle,
    UserPlus, RotateCcw, Trash2,
} from "lucide-react";

// ── CSV Export helper ────────────────────────────────────────────────────────
function downloadCSV(patients: Patient[]) {
    const headers = ["ID", "Name", "Age", "Gender", "Disease", "Risk Level", "Phone", "Email", "Last Visit", "Next Appointment", "Assigned Doctor"];
    const rows = patients.map(p => [
        p.id, p.name, p.age, p.gender, p.disease, p.riskLevel,
        p.phone ?? "", p.email ?? "",
        p.lastVisit, p.nextAppointment, p.assignedDoctor,
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `my-patients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
}

type SortKey = "name" | "age" | "riskLevel" | "disease" | "lastVisit" | "nextAppointment";
type SortDir = "asc" | "desc";
type UploadStep = "idle" | "uploading" | "preview" | "done" | "error";

const diseaseColor: Record<string, { color: string; bg: string }> = {
    Heart: { color: "#c92a2a", bg: "#ffe3e3" },
    BP: { color: "#6741d9", bg: "#f3f0ff" },
    Sugar: { color: "#e67700", bg: "#fff3bf" },
    Stress: { color: "#0c8599", bg: "#c5f6fa" },
};
const riskColor: Record<string, string> = { High: "#c92a2a", Medium: "#e67700", Low: "#2f9e44" };
const riskBg: Record<string, string> = { High: "#ffe3e3", Medium: "#fff3bf", Low: "#d3f9d8" };
const DiseaseIcon: Record<string, React.ReactNode> = {
    Heart: <Heart size={12} />, BP: <Activity size={12} />, Sugar: <Droplets size={12} />, Stress: <Brain size={12} />,
};

function SortArrow({ col, sort, dir }: { col: SortKey; sort: SortKey; dir: SortDir }) {
    if (sort !== col) return <span className="opacity-20">↕</span>;
    return dir === "asc" ? <ChevronUp size={12} className="inline" /> : <ChevronDown size={12} className="inline" />;
}

/* ─────────────────────────────────────────────────────────────────────
   Add Patient via PDF modal
   ───────────────────────────────────────────────────────────────────── */
function AddPatientModal({
    onClose,
    onAdded,
}: {
    onClose: () => void;
    onAdded: (p: Patient) => void;
}) {
    const [step, setStep] = useState<UploadStep>("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [extracted, setExtracted] = useState<(Patient & { riskReason?: string }) | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
            setErrorMsg("Only PDF files are accepted."); setStep("error"); return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg("File too large — max 10 MB."); setStep("error"); return;
        }
        setStep("uploading");
        setErrorMsg("");
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/extract-new-patient", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Extraction failed.");
            setExtracted(data.patient);
            setStep("preview");
        } catch (e: any) {
            setErrorMsg(e.message || "Something went wrong.");
            setStep("error");
        }
    };

    const confirmAdd = () => {
        if (!extracted) return;
        onAdded(extracted as Patient); // parent will refresh list from server
        setStep("done");
        setTimeout(onClose, 1400);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}>

            <div className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl fade-in"
                style={{ background: "#fff" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 page-header">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "#dbe4ff" }}>
                            <UserPlus size={17} style={{ color: "#4c6ef5" }} />
                        </div>
                        <div>
                            <p className="font-bold text-base" style={{ color: "#1a1f36" }}>Add Patient via Medical Record</p>
                            <p className="text-xs" style={{ color: "#8898aa" }}>
                                PDF → pdf-parse → Groq AI → saved to patient database
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X size={16} style={{ color: "#8898aa" }} />
                    </button>
                </div>

                <div className="px-6 py-5">

                    {/* ── IDLE / ERROR ── */}
                    {(step === "idle" || step === "error") && (
                        <div className="space-y-4">
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                                onClick={() => inputRef.current?.click()}
                                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
                                style={{ borderColor: dragOver ? "#4c6ef5" : "#c5d0fc", background: dragOver ? "#eef2ff" : "#f4f6ff" }}>
                                <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#dbe4ff" }}>
                                    <FileUp size={26} style={{ color: "#4c6ef5" }} />
                                </div>
                                <p className="font-semibold text-base" style={{ color: "#1a1f36" }}>Drop patient record PDF here</p>
                                <p className="text-sm mt-1" style={{ color: "#8898aa" }}>or click to browse · Max 10 MB · Text-based PDFs only</p>
                                <p className="text-xs mt-3 px-4 py-2 rounded-xl inline-block" style={{ background: "#eef2ff", color: "#4c6ef5" }}>
                                    ✦ Groq AI extracts name, age, condition, metrics, history — saved permanently
                                </p>
                            </div>

                            {step === "error" && (
                                <div className="flex items-start gap-2 px-4 py-3 rounded-2xl text-sm"
                                    style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}>
                                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Upload failed</p>
                                        <p className="text-xs mt-0.5 opacity-80">{errorMsg}</p>
                                    </div>
                                    <button className="ml-auto" onClick={() => setStep("idle")}><RotateCcw size={14} /></button>
                                </div>
                            )}

                            <div className="rounded-2xl px-4 py-3 text-xs" style={{ background: "#f8fafc", color: "#8898aa" }}>
                                <p className="font-semibold mb-1" style={{ color: "#64748b" }}>Supported PDF types</p>
                                <ul className="space-y-0.5 list-disc list-inside">
                                    <li>Outpatient / discharge summaries</li>
                                    <li>Lab reports with patient details</li>
                                    <li>Prescription printouts with demographic info</li>
                                    <li>Referral letters with clinical findings</li>
                                </ul>
                                <p className="mt-2" style={{ color: "#94a3b8" }}>
                                    ⚠ Scanned / image-only PDFs are not supported. Use OCR first.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── UPLOADING ── */}
                    {step === "uploading" && (
                        <div className="py-12 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#eef2ff" }}>
                                <Loader2 size={32} style={{ color: "#4c6ef5" }} className="spin" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-base" style={{ color: "#1a1f36" }}>Extracting patient data…</p>
                                <p className="text-sm mt-1" style={{ color: "#8898aa" }}>pdf-parse → Groq llama-3.3-70b → saving to database</p>
                            </div>
                            <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "#e8ecf4" }}>
                                <div className="h-full rounded-full shimmer"
                                    style={{ width: "100%", background: "linear-gradient(90deg,#748ffc,#4c6ef5,#748ffc)" }} />
                            </div>
                        </div>
                    )}

                    {/* ── PREVIEW ── */}
                    {step === "preview" && extracted && (
                        <div className="space-y-4 fade-in">
                            <p className="text-xs font-bold uppercase" style={{ color: "#8898aa" }}>
                                Extracted Patient — review before adding
                            </p>

                            {/* Identity card */}
                            <div className="rounded-2xl p-4 border flex gap-4" style={{ background: "#f4f6ff", borderColor: "#c5d0fc" }}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0"
                                    style={{ background: riskBg[extracted.riskLevel], color: riskColor[extracted.riskLevel] }}>
                                    {extracted.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-base" style={{ color: "#1a1f36" }}>{extracted.name}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                            style={{ background: riskBg[extracted.riskLevel], color: riskColor[extracted.riskLevel] }}>
                                            {extracted.riskLevel} RISK
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1"
                                            style={{ background: diseaseColor[extracted.disease]?.bg, color: diseaseColor[extracted.disease]?.color }}>
                                            {DiseaseIcon[extracted.disease]} {extracted.disease}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs" style={{ color: "#8898aa" }}>
                                        <span>{extracted.age}y · {extracted.gender}</span>
                                        {extracted.phone && <span>{extracted.phone}</span>}
                                        {extracted.email && <span>{extracted.email}</span>}
                                    </div>
                                    {extracted.address && (
                                        <p className="text-xs mt-0.5 truncate" style={{ color: "#8898aa" }}>{extracted.address}</p>
                                    )}
                                </div>
                            </div>

                            {/* AI summary */}
                            {extracted.llmSummary && (
                                <div className="rounded-2xl p-3 border" style={{ background: "#eef2ff", borderColor: "#748ffc40" }}>
                                    <p className="text-xs font-bold mb-1" style={{ color: "#4c6ef5" }}>✦ AI Clinical Summary</p>
                                    <p className="text-xs leading-relaxed" style={{ color: "#1a1f36" }}>{extracted.llmSummary}</p>
                                    {(extracted as any).riskReason && (
                                        <p className="text-xs mt-1 italic" style={{ color: "#8898aa" }}>{(extracted as any).riskReason}</p>
                                    )}
                                </div>
                            )}

                            {/* Metrics */}
                            {extracted.clinicalMetrics.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>
                                        Clinical Metrics ({extracted.clinicalMetrics.length})
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {extracted.clinicalMetrics.slice(0, 6).map((m, i) => {
                                            const sc = m.status === "critical" ? { color: "#c92a2a", bg: "#ffe3e3" }
                                                : m.status === "warning" ? { color: "#e67700", bg: "#fff3bf" }
                                                    : { color: "#2f9e44", bg: "#d3f9d8" };
                                            return (
                                                <div key={i} className="rounded-xl p-2.5 border"
                                                    style={{ background: sc.bg, borderColor: sc.color + "50" }}>
                                                    <p className="text-xs" style={{ color: "#525f7f" }}>{m.label}</p>
                                                    <p className="font-black text-base" style={{ color: sc.color }}>{m.value}</p>
                                                    <p className="text-xs" style={{ color: sc.color + "aa" }}>{m.unit}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {extracted.suggestedActions.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>Suggested Actions</p>
                                    <div className="space-y-1.5">
                                        {extracted.suggestedActions.slice(0, 3).map((a, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs rounded-xl px-3 py-2"
                                                style={{
                                                    background: i === 0 && extracted.riskLevel === "High" ? "#ffe3e3" : "#f4f6fb",
                                                    border: `1px solid ${i === 0 && extracted.riskLevel === "High" ? "#ffa8a8" : "#e8ecf4"}`,
                                                }}>
                                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 font-bold"
                                                    style={{ background: i === 0 && extracted.riskLevel === "High" ? "#c92a2a" : "#4c6ef5", fontSize: "9px" }}>
                                                    {i + 1}
                                                </span>
                                                <span style={{ color: "#1a1f36" }}>{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button onClick={() => { setStep("idle"); setExtracted(null); }}
                                    className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-slate-50"
                                    style={{ borderColor: "#e8ecf4", color: "#8898aa" }}>
                                    ← Re-upload
                                </button>
                                <button onClick={confirmAdd}
                                    className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-semibold text-white flex items-center justify-center gap-2">
                                    <UserPlus size={15} /> Confirm &amp; Add Patient
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── DONE ── */}
                    {step === "done" && (
                        <div className="py-12 flex flex-col items-center gap-4 fade-in">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#d3f9d8" }}>
                                <CheckCircle size={32} style={{ color: "#2f9e44" }} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-base" style={{ color: "#1a1f36" }}>
                                    {extracted?.name} saved to database ✓
                                </p>
                                <p className="text-sm mt-1" style={{ color: "#8898aa" }}>Patient list is being refreshed…</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────
   Main Page  (fetches from /api/patients — always reads the JSON file)
   ───────────────────────────────────────────────────────────────────── */
export default function MyPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortKey>("name");
    const [dir, setDir] = useState<SortDir>("asc");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newlyAdded, setNewlyAdded] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Fetch patients from the live API (reads from data/patients.json)
    const fetchPatients = async () => {
        setLoading(true);
        setFetchError("");
        try {
            const res = await fetch("/api/patients", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load patients");
            setPatients(data);
        } catch (e: any) {
            setFetchError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPatients(); }, []);

    const handleSort = (col: SortKey) => {
        if (sort === col) setDir(d => d === "asc" ? "desc" : "asc");
        else { setSort(col); setDir("asc"); }
    };

    // Called when patient was confirmed in the modal (already saved server-side)
    const handleAdded = (p: Patient) => {
        setNewlyAdded(prev => [p.id, ...prev]);
        fetchPatients();   // re-fetch from disk so list reflects the DB write
    };

    const filtered = [...patients]
        .filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase()) ||
            p.disease.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const va = String(a[sort as keyof typeof a] ?? "");
            const vb = String(b[sort as keyof typeof b] ?? "");
            return dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });

    const highCount = patients.filter(p => p.riskLevel === "High").length;
    const medCount = patients.filter(p => p.riskLevel === "Medium").length;
    const lowCount = patients.filter(p => p.riskLevel === "Low").length;
    const total = patients.length;

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between page-header">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>My Patients</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                        {loading ? "Loading…" : `${total} patients · Tap a row to expand`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => downloadCSV(filtered)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                        <Download size={14} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
                        <Send size={14} /> Send Reminder
                    </button>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-primary">
                        <Upload size={14} /> Add via PDF
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3" style={{ color: "#8898aa" }}>
                        <Loader2 size={22} className="spin" />
                        <span className="text-sm">Loading patients from database…</span>
                    </div>
                )}

                {/* Error state */}
                {!loading && fetchError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                        style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}>
                        <AlertTriangle size={15} />
                        {fetchError}
                        <button className="ml-auto text-xs underline" onClick={fetchPatients}>Retry</button>
                    </div>
                )}

                {!loading && !fetchError && (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: "Total Patients", value: total, color: "#4c6ef5", bg: "#eef2ff" },
                                { label: "High Risk", value: highCount, color: "#c92a2a", bg: "#ffe3e3" },
                                { label: "Medium Risk", value: medCount, color: "#e67700", bg: "#fff3bf" },
                                { label: "Low Risk", value: lowCount, color: "#2f9e44", bg: "#d3f9d8" },
                            ].map(s => (
                                <div key={s.label} className="rounded-2xl p-4 border card-hover"
                                    style={{ background: s.bg, borderColor: s.color + "33" }}>
                                    <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                                    <p className="text-xs font-medium mt-1" style={{ color: "#64748b" }}>{s.label}</p>
                                    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: s.color + "20" }}>
                                        <div className="h-full rounded-full"
                                            style={{ width: `${total ? (s.value / total) * 100 : 0}%`, background: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* New patient banner */}
                        {newlyAdded.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm fade-in"
                                style={{ background: "#d3f9d8", border: "1px solid #8ce99a", color: "#2f9e44" }}>
                                <CheckCircle size={15} />
                                <span className="font-semibold">
                                    {newlyAdded.length} patient{newlyAdded.length > 1 ? "s" : ""} added and saved to database
                                </span>
                                <button className="ml-auto text-xs opacity-60 hover:opacity-100"
                                    onClick={() => setNewlyAdded([])}>Dismiss</button>
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name, ID, or condition..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
                                style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1a1f36" }} />
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: "#f8fafc" }}>
                                        {([
                                            { key: "name", label: "Patient" },
                                            { key: "age", label: "Age" },
                                            { key: "disease", label: "Condition" },
                                            { key: "riskLevel", label: "Risk" },
                                            { key: "lastVisit", label: "Last Visit" },
                                            { key: "nextAppointment", label: "Next Appt" },
                                            { key: null, label: "" },
                                            { key: null, label: "Actions" },
                                        ] as { key: SortKey | null; label: string }[]).map((col, i) => (
                                            <th key={i}
                                                onClick={() => col.key && handleSort(col.key)}
                                                className={`text-left px-5 py-3 text-xs font-semibold select-none ${col.key ? "cursor-pointer hover:text-indigo-600" : ""}`}
                                                style={{ color: "#64748b" }}>
                                                {col.label} {col.key && <SortArrow col={col.key} sort={sort} dir={dir} />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "#94a3b8" }}>
                                                <Users size={36} className="mx-auto mb-2 opacity-30" />
                                                No patients match your search.
                                            </td>
                                        </tr>
                                    ) : filtered.map((p, i) => {
                                        const isExpanded = expandedId === p.id;
                                        const isNew = newlyAdded.includes(p.id);
                                        const dc = diseaseColor[p.disease] ?? { color: "#64748b", bg: "#f1f5f9" };
                                        return (
                                            <Fragment key={p.id}>
                                                <tr key={p.id}
                                                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                                    className="cursor-pointer transition-colors hover:bg-indigo-50"
                                                    style={{
                                                        borderTop: "1px solid #e2e8f0",
                                                        background: isNew ? "#f0fdf4" : i % 2 === 0 ? "#fff" : "#fafafa",
                                                    }}>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                                                                style={{ background: dc.bg, color: dc.color }}>
                                                                {p.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold" style={{ color: "#1a1f36" }}>{p.name}</p>
                                                                    {isNew && (
                                                                        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                                                            style={{ background: "#d3f9d8", color: "#2f9e44" }}>NEW</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs" style={{ color: "#94a3b8" }}>{p.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 font-medium" style={{ color: "#1a1f36" }}>{p.age}y</td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                            style={{ background: dc.bg, color: dc.color }}>
                                                            {DiseaseIcon[p.disease]}
                                                            {p.disease === "BP" ? "Hypertension" : p.disease === "Sugar" ? "Diabetes" : p.disease}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                                            style={{ background: riskBg[p.riskLevel], color: riskColor[p.riskLevel] }}>
                                                            {p.riskLevel}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-xs" style={{ color: "#64748b" }}>
                                                        {new Date(p.lastVisit).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                                                    </td>
                                                    <td className="px-5 py-4 text-xs" style={{ color: "#64748b" }}>
                                                        {new Date(p.nextAppointment).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <ChevronRight size={16}
                                                            className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                                            style={{ color: "#94a3b8" }} />
                                                    </td>
                                                    {/* Delete action */}
                                                    <td className="px-3 py-4" onClick={e => e.stopPropagation()}>
                                                        {confirmDeleteId === p.id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    onClick={async () => {
                                                                        setDeletingId(p.id);
                                                                        setConfirmDeleteId(null);
                                                                        try {
                                                                            await fetch(`/api/patients/${p.id}`, { method: "DELETE" });
                                                                            setPatients(prev => prev.filter(x => x.id !== p.id));
                                                                            if (expandedId === p.id) setExpandedId(null);
                                                                        } finally { setDeletingId(null); }
                                                                    }}
                                                                    className="text-xs px-2 py-1 rounded-lg font-bold text-white"
                                                                    style={{ background: "#ef4444" }}>
                                                                    Yes
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmDeleteId(null)}
                                                                    className="text-xs px-2 py-1 rounded-lg font-bold"
                                                                    style={{ background: "#f1f5f9", color: "#64748b" }}>
                                                                    No
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmDeleteId(p.id)}
                                                                disabled={deletingId === p.id}
                                                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                                                                title="Remove patient">
                                                                {deletingId === p.id
                                                                    ? <Loader2 size={14} style={{ color: "#ef4444" }} className="spin" />
                                                                    : <Trash2 size={14} style={{ color: "#ef4444" }} />}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr key={`${p.id}-exp`} style={{ background: "#f0f4ff" }}>
                                                        <td colSpan={8} className="px-5 py-4">
                                                            <div className="grid grid-cols-3 gap-4 fade-in">
                                                                <div>
                                                                    <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>TOP METRICS</p>
                                                                    <div className="space-y-1.5">
                                                                        {p.clinicalMetrics.slice(0, 3).map(m => (
                                                                            <div key={m.label} className="flex justify-between text-xs">
                                                                                <span style={{ color: "#64748b" }}>{m.label}</span>
                                                                                <span className="font-semibold"
                                                                                    style={{ color: m.status === "critical" ? "#c92a2a" : m.status === "warning" ? "#e67700" : "#2f9e44" }}>
                                                                                    {m.value} {m.unit}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                        {p.clinicalMetrics.length === 0 && (
                                                                            <p className="text-xs" style={{ color: "#94a3b8" }}>No metrics recorded</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>AI SUMMARY</p>
                                                                    <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                                                                        {p.llmSummary ? p.llmSummary.slice(0, 180) + "…" : "No summary available."}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold mb-2" style={{ color: "#8898aa" }}>TOP ACTION</p>
                                                                    {p.suggestedActions.length > 0 ? (
                                                                        <div className="text-xs p-2.5 rounded-xl"
                                                                            style={{
                                                                                background: p.riskLevel === "High" ? "#ffe3e3" : "#d3f9d8",
                                                                                color: p.riskLevel === "High" ? "#c92a2a" : "#2f9e44"
                                                                            }}>
                                                                            {p.suggestedActions[0]}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-xs" style={{ color: "#94a3b8" }}>No actions recorded</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <AddPatientModal
                    onClose={() => setShowModal(false)}
                    onAdded={handleAdded}
                />
            )}
        </div>
    );
}
