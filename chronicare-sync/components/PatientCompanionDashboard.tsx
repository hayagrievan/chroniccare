"use client";

import { useState, useEffect } from "react";
import { mockPatients, adherenceRecords, Patient } from "@/lib/mockData";
import HealthScoreGauge from "./ui/HealthScoreGauge";
import AdherenceRing from "./ui/AdherenceRing";
import PHRNBadge from "./ui/PHRNBadge";
import {
    Pill, Calendar, FileText, Bell, TrendingUp, TrendingDown,
    Minus, Activity, Shield, Clock, CheckCircle, AlertCircle,
    Heart, ChevronRight, Loader2, Sparkles, User, Check, X,
} from "lucide-react";

// Demo patient — in production this comes from authenticated PHRN session
const DEMO_PATIENT_PHRN = "PHRN-IND-2026-000001";
const DEMO_PATIENT_ID = "PAT-001";

interface DoseEntry {
    medicineId: string;
    medicineName: string;
    dose: string;
    scheduled: string;
    status: "taken" | "missed" | "skipped" | "pending";
}

const STATUS_COLORS = {
    taken: { bg: "#d3f9d8", color: "#2f9e44", border: "#8ce99a" },
    missed: { bg: "#ffe3e3", color: "#c92a2a", border: "#ffa8a8" },
    skipped: { bg: "#fff3bf", color: "#e67700", border: "#ffd43b" },
    pending: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" },
};

function MedDoseCard({ dose, onAction }: { dose: DoseEntry; onAction: (status: "taken" | "missed" | "skipped") => void }) {
    const s = STATUS_COLORS[dose.status];
    const isPending = dose.status === "pending";

    return (
        <div className="rounded-2xl border p-4 transition-all" style={{ background: s.bg, borderColor: s.border }}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                        <Pill size={14} style={{ color: s.color }} />
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>{dose.medicineName}</p>
                        <p className="text-xs" style={{ color: "#525f7f" }}>{dose.dose} · {dose.scheduled}</p>
                    </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: "rgba(255,255,255,0.7)", color: s.color }}>
                    {dose.status}
                </span>
            </div>

            {isPending && (
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => onAction("taken")}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                        style={{ background: "#2f9e44", color: "#fff" }}
                    >
                        <Check size={12} /> Taken
                    </button>
                    <button
                        onClick={() => onAction("missed")}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                        style={{ background: "#c92a2a", color: "#fff" }}
                    >
                        <X size={12} /> Missed
                    </button>
                    <button
                        onClick={() => onAction("skipped")}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                        style={{ background: "#e67700", color: "#fff" }}
                    >
                        <Minus size={12} /> Skipped
                    </button>
                </div>
            )}
        </div>
    );
}

function QuickStatCard({ icon, label, value, color, bg }: any) {
    return (
        <div className="rounded-2xl p-4 border" style={{ background: bg, borderColor: color + "33" }}>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                    {icon}
                </div>
                <p className="text-xs font-semibold" style={{ color: "#525f7f" }}>{label}</p>
            </div>
            <p className="text-xl font-black" style={{ color }}>{value}</p>
        </div>
    );
}

export default function PatientCompanionDashboard() {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [healthScore, setHealthScore] = useState<number>(0);
    const [adherenceScore, setAdherenceScore] = useState<number>(0);
    const [riskLevel, setRiskLevel] = useState<string>("Medium");
    const [riskScore, setRiskScore] = useState<number>(0);
    const [todayDoses, setTodayDoses] = useState<DoseEntry[]>([]);
    const [aiInsight, setAiInsight] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [scoreLoading, setScoreLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<"home" | "medications" | "records" | "consent">("home");

    useEffect(() => {
        // Load patient
        const p = mockPatients.find(pt => pt.id === DEMO_PATIENT_ID);
        if (p) setPatient(p);

        // Load today's doses from adherence records
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = adherenceRecords.find(r => r.patientId === DEMO_PATIENT_ID && r.date === today);
        const recent = adherenceRecords.find(r => r.patientId === DEMO_PATIENT_ID);
        setTodayDoses((todayRecord || recent)?.medications as DoseEntry[] || []);
        setLoading(false);

        if (p) {
            // Load scores
            Promise.all([
                fetch("/api/health-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patient: p }) }),
                fetch("/api/risk-prediction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patient: p }) }),
            ]).then(async ([hsRes, rpRes]) => {
                const hs = await hsRes.json();
                const rp = await rpRes.json();
                setHealthScore(hs.healthScore || 62);
                setAdherenceScore(hs.adherenceScore || 71);
                setRiskLevel(rp.riskLevel || "High");
                setRiskScore(rp.riskScore || 68);
                setAiInsight(rp.explanation || "");
                setScoreLoading(false);
            }).catch(() => {
                setHealthScore(62); setAdherenceScore(71); setRiskLevel("High"); setRiskScore(68);
                setScoreLoading(false);
            });
        }
    }, []);

    const handleDoseAction = async (dose: DoseEntry, status: "taken" | "missed" | "skipped") => {
        const updated = todayDoses.map(d =>
            d.medicineId === dose.medicineId && d.scheduled === dose.scheduled
                ? { ...d, status }
                : d
        );
        setTodayDoses(updated);

        // Record via API
        try {
            await fetch("/api/adherence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: DEMO_PATIENT_ID,
                    phrn: DEMO_PATIENT_PHRN,
                    date: new Date().toISOString().split("T")[0],
                    medicineId: dose.medicineId,
                    medicineName: dose.medicineName,
                    dose: dose.dose,
                    scheduled: dose.scheduled,
                    status,
                }),
            });
        } catch { /* ignore */ }
    };

    const rc = { High: { bg: "#ffe3e3", color: "#c92a2a" }, Medium: { bg: "#fff3bf", color: "#e67700" }, Low: { bg: "#d3f9d8", color: "#2f9e44" } };
    const riskStyle = rc[riskLevel as keyof typeof rc] || rc.Medium;

    if (loading || !patient) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 size={32} className="spin" style={{ color: "#4c6ef5" }} />
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* Patient Sidebar */}
            <div className="w-64 flex flex-col h-full shrink-0" style={{ background: "linear-gradient(175deg, #0f2744 0%, #1e3a5f 60%, #2d4fa1 100%)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                {/* Logo */}
                <div className="px-5 pt-6 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
                            <Heart size={17} style={{ color: "#ffa8a8" }} fill="#ffa8a8" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white">ChronicCare AI</p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Patient Companion</p>
                        </div>
                    </div>
                </div>

                {/* Patient Profile */}
                <div className="mx-3 mb-4 rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: "linear-gradient(135deg, #4c6ef5, #7c3aed)", color: "#fff" }}>
                            {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white truncate">{patient.name}</p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{patient.age}y · {patient.gender}</p>
                        </div>
                    </div>
                    <PHRNBadge phrn={DEMO_PATIENT_PHRN} size="sm" />
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5">
                    {[
                        { key: "home", icon: <Activity size={15} />, label: "My Dashboard" },
                        { key: "medications", icon: <Pill size={15} />, label: "Medication Tracker" },
                        { key: "records", icon: <FileText size={15} />, label: "Health Records" },
                        { key: "consent", icon: <Shield size={15} />, label: "Access & Consent" },
                    ].map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key as any)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.key ? "nav-active text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                        >
                            {item.icon}
                            {item.label}
                            {activeSection === item.key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
                        </button>
                    ))}
                </nav>

                <div className="px-5 pb-4">
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Patient Portal · Read-Only Records</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {activeSection === "home" && (
                    <div className="p-6 space-y-6">
                        {/* Welcome Header */}
                        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b5bdb)", color: "#fff" }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}</p>
                                    <h1 className="text-2xl font-black mt-0.5">{patient.name.split(" ")[0]}</h1>
                                    <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
                                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Primary Condition</p>
                                    <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: "rgba(255,255,255,0.15)" }}>
                                        {patient.disease === "Heart" ? "❤️ Cardiac" : patient.disease === "BP" ? "🩺 Hypertension" : patient.disease === "Sugar" ? "🩸 Diabetes" : "🧠 Stress"}
                                    </span>
                                    <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>Dr. {patient.assignedDoctor}</p>
                                </div>
                            </div>
                        </div>

                        {/* Score Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-2xl border p-5 flex flex-col items-center" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                {scoreLoading ? <Loader2 size={24} className="spin" style={{ color: "#4c6ef5" }} /> : <HealthScoreGauge score={healthScore} size={120} />}
                                <p className="text-xs font-bold mt-2" style={{ color: "#525f7f" }}>Health Score</p>
                            </div>

                            <div className="rounded-2xl border p-5 flex flex-col items-center" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                {scoreLoading ? <Loader2 size={24} className="spin" style={{ color: "#4c6ef5" }} /> : <AdherenceRing score={adherenceScore} size={100} />}
                                <p className="text-xs font-bold mt-2" style={{ color: "#525f7f" }}>Adherence Score</p>
                            </div>

                            <div className="rounded-2xl border p-5" style={{ background: riskStyle.bg, borderColor: riskStyle.color + "44" }}>
                                {scoreLoading ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 size={24} className="spin" style={{ color: "#4c6ef5" }} /></div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-4xl font-black mt-2" style={{ color: riskStyle.color }}>{riskScore}</p>
                                        <p className="text-sm font-bold" style={{ color: riskStyle.color }}>{riskLevel} Risk</p>
                                        <p className="text-xs mt-1" style={{ color: riskStyle.color + "aa" }}>Risk Score /100</p>
                                        <p className="text-xs mt-2 font-medium" style={{ color: riskStyle.color }}>
                                            {riskLevel === "High" ? "⚠️ Please contact your doctor" : riskLevel === "Medium" ? "📋 Monitor closely" : "✅ Keep it up!"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Today's Medications */}
                        <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#e8ecf4", background: "#f8f9ff" }}>
                                <div className="flex items-center gap-2">
                                    <Pill size={15} style={{ color: "#4c6ef5" }} />
                                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>Today's Medications</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#eef2ff", color: "#4c6ef5" }}>
                                    {todayDoses.filter(d => d.status === "taken").length}/{todayDoses.length} done
                                </span>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {todayDoses.length === 0 ? (
                                    <div className="col-span-2 py-8 text-center">
                                        <CheckCircle size={32} style={{ color: "#8ce99a" }} className="mx-auto mb-2" />
                                        <p className="text-sm" style={{ color: "#64748b" }}>No medications scheduled for today</p>
                                    </div>
                                ) : (
                                    todayDoses.map((dose, i) => (
                                        <MedDoseCard key={i} dose={dose} onAction={(s) => handleDoseAction(dose, s)} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* AI Insight */}
                        {aiInsight && (
                            <div className="rounded-2xl p-4 border" style={{ background: "#eef2ff", borderColor: "#748ffc40" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={14} style={{ color: "#4c6ef5" }} />
                                    <p className="text-xs font-bold uppercase" style={{ color: "#4c6ef5" }}>AI Health Insight</p>
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: "#1a1f36" }}>{aiInsight}</p>
                                <p className="text-xs mt-2 italic" style={{ color: "#8898aa" }}>
                                    This is an AI-generated insight. Always consult your doctor for medical decisions.
                                </p>
                            </div>
                        )}

                        {/* Next Appointment */}
                        <div className="rounded-2xl border p-4 flex items-center gap-4" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#eef2ff" }}>
                                <Calendar size={20} style={{ color: "#4c6ef5" }} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold" style={{ color: "#8898aa" }}>Next Appointment</p>
                                <p className="font-bold" style={{ color: "#1a1f36" }}>
                                    {new Date(patient.nextAppointment).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                                </p>
                                <p className="text-xs" style={{ color: "#64748b" }}>with {patient.assignedDoctor}</p>
                            </div>
                            <ChevronRight size={16} style={{ color: "#94a3b8" }} />
                        </div>
                    </div>
                )}

                {activeSection === "medications" && (
                    <PatientMedicationSection patient={patient} todayDoses={todayDoses} adherenceScore={adherenceScore} onDoseAction={handleDoseAction} />
                )}

                {activeSection === "records" && (
                    <PatientRecordsSection patient={patient} />
                )}

                {activeSection === "consent" && (
                    <PatientConsentSection patient={patient} />
                )}
            </div>
        </div>
    );
}

// ─── Medication Section ──────────────────────────────────────────────────────
function PatientMedicationSection({ patient, todayDoses, adherenceScore, onDoseAction }: any) {
    return (
        <div className="p-6 space-y-6">
            <div className="page-header -mx-6 -mt-6 px-6 py-5 mb-6">
                <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Medication Tracker</h1>
                <p className="text-sm" style={{ color: "#64748b" }}>Track daily doses · Monitor adherence · Stay on schedule</p>
            </div>

            <div className="flex justify-center">
                <AdherenceRing score={adherenceScore} size={160} label="Overall Adherence Score" />
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "#e8ecf4", background: "#f8f9ff" }}>
                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>Today's Schedule</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
                <div className="p-4 space-y-3">
                    {todayDoses.map((dose: DoseEntry, i: number) => (
                        <MedDoseCard key={i} dose={dose} onAction={(s) => onDoseAction(dose, s)} />
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border p-4" style={{ background: "#fff3bf", borderColor: "#ffd43b" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#e67700" }}>⚠️ Patient Restriction Notice</p>
                <p className="text-xs" style={{ color: "#92400e" }}>
                    You can record medication adherence (taken/missed/skipped) but cannot modify prescriptions.
                    Only your assigned doctor can change medication orders.
                </p>
            </div>
        </div>
    );
}

// ─── Records Section ─────────────────────────────────────────────────────────
function PatientRecordsSection({ patient }: { patient: Patient }) {
    return (
        <div className="p-6 space-y-6">
            <div className="page-header -mx-6 -mt-6 px-6 py-5 mb-6">
                <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Health Records</h1>
                <p className="text-sm" style={{ color: "#64748b" }}>Read-only view of your complete medical history</p>
            </div>

            {/* Clinical Metrics */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "#e8ecf4" }}>
                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>Latest Clinical Readings</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                    {patient.clinicalMetrics?.slice(0, 6).map(m => {
                        const colors = m.status === "critical" ? { bg: "#ffe3e3", color: "#c92a2a" } : m.status === "warning" ? { bg: "#fff3bf", color: "#e67700" } : { bg: "#d3f9d8", color: "#2f9e44" };
                        return (
                            <div key={m.label} className="rounded-xl p-3 border" style={{ background: colors.bg, borderColor: colors.color + "44" }}>
                                <p className="text-xs font-semibold" style={{ color: "#525f7f" }}>{m.label}</p>
                                <p className="text-lg font-black" style={{ color: colors.color }}>{m.value}</p>
                                <p className="text-xs" style={{ color: colors.color + "aa" }}>{m.unit} · {m.status}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Visit History */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "#e8ecf4" }}>
                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>Visit History</p>
                </div>
                <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                    {patient.historyTimeline?.map((h, i) => (
                        <div key={i} className="px-5 py-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "#1a1f36" }}>{h.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#8898aa" }}>{h.date} · {h.doctor}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                    style={{
                                        background: h.riskLevel === "High" ? "#ffe3e3" : h.riskLevel === "Medium" ? "#fff3bf" : "#d3f9d8",
                                        color: h.riskLevel === "High" ? "#c92a2a" : h.riskLevel === "Medium" ? "#e67700" : "#2f9e44",
                                    }}>{h.riskLevel}</span>
                            </div>
                            <p className="text-xs mt-2 leading-relaxed" style={{ color: "#525f7f" }}>{h.summary}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border p-4" style={{ background: "#fff3bf", borderColor: "#ffd43b" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#e67700" }}>⚠️ Read-Only Record Access</p>
                <p className="text-xs" style={{ color: "#92400e" }}>
                    These records are read-only. You cannot edit prescriptions, reports, diagnoses, or clinical findings.
                    Contact your doctor for corrections.
                </p>
            </div>
        </div>
    );
}

// ─── Consent Section ─────────────────────────────────────────────────────────
function PatientConsentSection({ patient }: { patient: Patient }) {
    const [consents, setConsents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/consent?patientId=${patient.id}`)
            .then(r => r.json())
            .then(data => { setConsents(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [patient.id]);

    const handleRevoke = async (consentId: string) => {
        try {
            const res = await fetch("/api/consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "revoke", consentId }),
            });
            if (res.ok) {
                setConsents(prev => prev.map(c => c.consentId === consentId ? { ...c, status: "Revoked" } : c));
            }
        } catch { /* ignore */ }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="page-header -mx-6 -mt-6 px-6 py-5 mb-6">
                <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Access & Consent</h1>
                <p className="text-sm" style={{ color: "#64748b" }}>Control who can access your health records</p>
            </div>

            {/* PHRN Share Card */}
            <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b5bdb)", color: "#fff" }}>
                <Shield size={32} className="mx-auto mb-3" style={{ opacity: 0.8 }} />
                <p className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>Your Health Reference Number</p>
                <div className="flex justify-center mb-3">
                    <PHRNBadge phrn={`PHRN-IND-2026-000001`} size="lg" />
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Share this PHRN with your doctor to grant access to your records.
                    Access requires your explicit approval.
                </p>
            </div>

            {/* Access List */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: "#e8ecf4" }}>
                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>Authorized Access</p>
                    <p className="text-xs" style={{ color: "#64748b" }}>{consents.filter(c => c.status === "Approved").length} active authorizations</p>
                </div>

                {loading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="spin" style={{ color: "#4c6ef5" }} /></div>
                ) : consents.length === 0 ? (
                    <div className="py-8 text-center">
                        <Shield size={32} style={{ color: "#e2e8f0" }} className="mx-auto mb-2" />
                        <p className="text-sm" style={{ color: "#94a3b8" }}>No access grants yet</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                        {consents.map(consent => (
                            <div key={consent.consentId} className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#eef2ff" }}>
                                        <User size={16} style={{ color: "#4c6ef5" }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: "#1a1f36" }}>{consent.doctorName}</p>
                                        <p className="text-xs" style={{ color: "#8898aa" }}>
                                            {consent.purpose} · Since {new Date(consent.approvedAt || consent.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                        style={{
                                            background: consent.status === "Approved" ? "#d3f9d8" : consent.status === "Revoked" ? "#ffe3e3" : "#fff3bf",
                                            color: consent.status === "Approved" ? "#2f9e44" : consent.status === "Revoked" ? "#c92a2a" : "#e67700",
                                        }}>
                                        {consent.status}
                                    </span>
                                    {consent.status === "Approved" && (
                                        <button
                                            onClick={() => handleRevoke(consent.consentId)}
                                            className="text-xs px-3 py-1 rounded-xl font-semibold transition-all hover:opacity-80"
                                            style={{ background: "#ffe3e3", color: "#c92a2a" }}
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
