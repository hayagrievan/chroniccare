"use client";

import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from "recharts";
import {
    Heart, Activity, Wind, Droplets, Loader2, Save, CheckCircle,
    AlertTriangle, Sparkles, Shield, Zap, ChevronRight,
} from "lucide-react";

interface Patient {
    id?: string; patientId?: string; name: string; disease: string;
    riskLevel: string;
    clinicalMetrics: Array<{ label: string; value: string; unit: string; status: string }>;
}
interface Thresholds { heartRate: number; systolicBP: number; spo2: number; glucose: number }

const SAFE = "#22c55e";
const WARN = "#f59e0b";
const CRIT = "#ef4444";
const BLUE = "#4c6ef5";

/** Deterministic per-patient sparkline — seeded by patientId+label, never changes on slider moves */
function stableReadings(pid: string, label: string, base: number, count = 18) {
    let seed = 0;
    const key = pid + label;
    for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) & 0xffffffff;
    const rng = () => { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 0xffffffff; };
    return Array.from({ length: count }, (_, i) => ({
        t: i, v: Math.max(base * 0.82, Math.min(base * 1.18, base + (rng() - 0.5) * base * 0.18)),
    }));
}

function getRiskLevel(val: number, thrVal: number, metricKey: keyof Thresholds): "safe" | "warn" | "critical" {
    const diff = metricKey === "spo2" ? thrVal - val : val - thrVal;
    if (diff <= 0) return "safe";
    if (diff < thrVal * 0.05) return "warn";
    return "critical";
}
const riskLabel: Record<string, string> = { safe: "Safe", warn: "Borderline", critical: "Critical" };
const riskColor: Record<string, string> = { safe: SAFE, warn: WARN, critical: CRIT };

// ── Smart Gradient Slider ─────────────────────────────────────────────────────
function SmartSlider({
    label, icon, value, onChange, min, max, unit, safeRange, metricKey, riskState, localVal,
}: {
    label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void;
    min: number; max: number; unit: string; safeRange: string; metricKey: string; riskState: string; localVal: number;
}) {
    const pct = ((localVal - min) / (max - min)) * 100;
    const riskC = riskColor[riskState] ?? SAFE;
    const isPulse = riskState === "critical";

    return (
        <div className="rounded-2xl p-5 border transition-all duration-300"
            style={{
                background: `linear-gradient(135deg, #ffffff 0%, ${riskC}08 100%)`,
                borderColor: riskState === "safe" ? "#e2e8f0" : riskC + "60",
                boxShadow: isPulse ? `0 0 0 2px ${riskC}30, 0 4px 20px ${riskC}15` : "0 1px 4px rgba(0,0,0,0.06)",
            }}>
            {/* Metric header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: riskC + "20", color: riskC }}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>{label}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>Safe: {safeRange}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: riskC, transition: "color .3s" }}>
                        {localVal}
                        <span className="text-sm font-normal ml-1" style={{ color: "#94a3b8" }}>{unit}</span>
                    </p>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${isPulse ? "animate-pulse" : ""}`}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: riskC }} />
                        <span className="text-xs font-semibold" style={{ color: riskC }}>{riskLabel[riskState]}</span>
                    </div>
                </div>
            </div>

            {/* Gradient track slider */}
            <div className="relative">
                <div className="relative h-3 rounded-full overflow-hidden mb-1"
                    style={{ background: "linear-gradient(to right, #22c55e 0%, #f59e0b 60%, #ef4444 100%)" }}>
                    {/* Filled portion overlay — darkens the unfilled right side */}
                    <div className="absolute right-0 top-0 h-full rounded-r-full"
                        style={{ width: `${100 - pct}%`, background: "rgba(255,255,255,0.55)" }} />
                </div>
                <input
                    type="range" min={min} max={max} value={localVal}
                    onChange={e => onChange(+e.target.value)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-3"
                    style={{ top: 0 }}
                />
                {/* Custom thumb */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-100"
                    style={{
                        left: `calc(${pct}% - 10px)`,
                        background: riskC,
                        boxShadow: `0 0 0 3px ${riskC}40, 0 2px 8px rgba(0,0,0,0.2)`,
                        top: "6px",
                        position: "absolute",
                        pointerEvents: "none",
                    }} />
            </div>
            <div className="flex justify-between mt-3">
                <span className="text-xs" style={{ color: "#94a3b8" }}>{min} {unit}</span>
                <span className="text-xs" style={{ color: "#94a3b8" }}>{max} {unit}</span>
            </div>
        </div>
    );
}

// ── Live Preview Mini Chart ───────────────────────────────────────────────────
function LivePreviewPanel({
    patients, thresholds, localThr, breachCount,
}: {
    patients: Patient[]; thresholds: Thresholds; localThr: Thresholds; breachCount: number;
}) {
    const pid = patients[0]?.patientId ?? patients[0]?.id ?? "P0";
    const base = 85; // example HR base
    const data = stableReadings(pid, "Heart Rate", base);
    const thrLine = localThr.heartRate;

    return (
        <div className="rounded-2xl border overflow-hidden h-full flex flex-col"
            style={{ background: "#0f172a" }}>
            {/* Panel header */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "#1e293b" }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" />
                        <p className="text-sm font-bold text-white">Live Impact Preview</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse"
                        style={{ background: "#22c55e20", color: "#22c55e" }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Simulating
                    </div>
                </div>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>Threshold line updates in real-time as you adjust sliders</p>
            </div>

            {/* Mini chart */}
            <div className="px-5 py-4">
                <p className="text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>HEART RATE · PATIENT SAMPLE</p>
                <div className="rounded-xl overflow-hidden p-3" style={{ background: "#1e293b", height: 130 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 4, bottom: 4 }}>
                            <Line type="monotone" dataKey="v" stroke="#4c6ef5" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <ReferenceLine y={thrLine} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: `${thrLine}`, fill: "#ef4444", fontSize: 10, position: "right" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: "#ef4444" }}>
                    Dashed red line = current heart rate threshold ({thrLine} bpm)
                </p>
            </div>

            {/* Alert impact */}
            <div className="px-5 py-4 border-t" style={{ borderColor: "#1e293b" }}>
                <p className="text-xs font-semibold mb-3" style={{ color: "#94a3b8" }}>ALERT IMPACT</p>
                <div className={`rounded-xl p-4 text-center ${breachCount > 0 ? "border border-red-500/30" : "border border-green-500/30"}`}
                    style={{ background: breachCount > 0 ? "#ef444415" : "#22c55e10" }}>
                    <p className={`text-3xl font-black ${breachCount > 0 ? "text-red-400" : "text-green-400"}`}>{breachCount}</p>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                        patient{breachCount !== 1 ? "s" : ""} will trigger alerts
                    </p>
                </div>
            </div>

            {/* Threshold summary */}
            <div className="px-5 pb-4 flex-1 space-y-2">
                <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>CURRENT THRESHOLDS</p>
                {[
                    { label: "Heart Rate", val: localThr.heartRate, unit: "bpm" },
                    { label: "Systolic BP", val: localThr.systolicBP, unit: "mmHg" },
                    { label: "SpO₂ Min", val: localThr.spo2, unit: "%" },
                    { label: "Glucose", val: localThr.glucose, unit: "mg/dL" },
                ].map(t => (
                    <div key={t.label} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#64748b" }}>{t.label}</span>
                        <span className="text-xs font-bold text-white">{t.val} <span style={{ color: "#64748b" }}>{t.unit}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Patient Vitals Card ───────────────────────────────────────────────────────
function VitalsCard({ patient, thresholds }: { patient: Patient; thresholds: Thresholds }) {
    const pid = patient.patientId ?? patient.id ?? "?";
    const metrics = patient.clinicalMetrics.slice(0, 3);
    const scMap: Record<string, string> = { critical: CRIT, warning: WARN, normal: SAFE };

    return (
        <div className="rounded-2xl border p-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                        style={{
                            background: patient.riskLevel === "High" ? "#ffe3e3" : "#fff3bf",
                            color: patient.riskLevel === "High" ? CRIT : WARN
                        }}>
                        {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                        <p className="text-xs font-bold" style={{ color: "#1a1f36" }}>{patient.name}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>{pid}</p>
                    </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{
                        background: patient.riskLevel === "High" ? "#ffe3e3" : "#fff3bf",
                        color: patient.riskLevel === "High" ? CRIT : WARN
                    }}>
                    {patient.riskLevel}
                </span>
            </div>
            <div className="space-y-2.5">
                {metrics.map(m => {
                    const base = parseFloat(m.value.split("/")[0]) || 60;
                    const data = stableReadings(pid, m.label, base);
                    const sc = scMap[m.status] ?? SAFE;
                    const thrLine =
                        m.label.toLowerCase().includes("heart") ? thresholds.heartRate :
                            m.label.toLowerCase().includes("systolic") || m.label.toLowerCase().includes("bp") ? thresholds.systolicBP :
                                m.label.toLowerCase().includes("spo") ? thresholds.spo2 :
                                    m.label.toLowerCase().includes("glucose") ? thresholds.glucose : undefined;
                    return (
                        <div key={m.label} className="flex items-center gap-3">
                            <div className="w-24 shrink-0">
                                <p className="text-xs" style={{ color: "#64748b" }}>{m.label}</p>
                                <p className="text-sm font-black" style={{ color: sc }}>{m.value}</p>
                            </div>
                            <div className="flex-1 h-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} margin={{ top: 2, bottom: 2 }}>
                                        <Line type="monotone" dataKey="v" stroke={sc} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                                        {thrLine !== undefined && <ReferenceLine y={thrLine} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} />}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc, boxShadow: `0 0 5px ${sc}` }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HealthMonitoringPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [thresholds, setThresholds] = useState<Thresholds>({ heartRate: 90, systolicBP: 140, spo2: 95, glucose: 180 });
    const [localThr, setLocalThr] = useState<Thresholds>({ heartRate: 90, systolicBP: 140, spo2: 95, glucose: 180 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [pr, tr] = await Promise.all([
                fetch("/api/patients", { cache: "no-store" }),
                fetch("/api/thresholds", { cache: "no-store" }),
            ]);
            const pats = await pr.json();
            const thr = await tr.json();
            setPatients(pats.filter((p: any) => ["High", "Medium"].includes(p.riskLevel)).slice(0, 4));
            setThresholds(thr);
            setLocalThr(thr);
            setLoading(false);
        };
        load();
    }, []);

    /** Patients breaching the SAVED thresholds (not the local slider values) */
    const breachAlerts = useMemo(() => {
        const list: any[] = [];
        for (const p of patients) {
            const pid = p.patientId ?? p.id ?? "";
            for (const m of p.clinicalMetrics) {
                const val = parseFloat(m.value.split("/")[0]);
                if (isNaN(val)) continue;
                const label = m.label.toLowerCase();
                let breach = false; let thrVal = 0;
                if (label.includes("heart") && val > thresholds.heartRate) { breach = true; thrVal = thresholds.heartRate; }
                if ((label.includes("systolic") || label.includes("bp")) && val > thresholds.systolicBP) { breach = true; thrVal = thresholds.systolicBP; }
                if ((label.includes("spo") || label.includes("o2")) && val < thresholds.spo2) { breach = true; thrVal = thresholds.spo2; }
                if ((label.includes("glucose") || label.includes("sugar")) && val > thresholds.glucose) { breach = true; thrVal = thresholds.glucose; }
                if (breach) list.push({ pid, name: p.name, metric: m.label, value: val, thrVal, disease: p.disease, riskLevel: p.riskLevel });
            }
        }
        return list;
    }, [patients, thresholds]);

    // Per-slider risk state based on LOCAL values (not saved)
    const sliderRisk = useMemo(() => ({
        heartRate: patients.some(p => p.clinicalMetrics.some(m => m.label.toLowerCase().includes("heart") && parseFloat(m.value) > localThr.heartRate)) ? "critical" : localThr.heartRate > 95 ? "warn" : "safe",
        systolicBP: patients.some(p => p.clinicalMetrics.some(m => (m.label.toLowerCase().includes("systolic") || m.label.toLowerCase().includes("bp")) && parseFloat(m.value) > localThr.systolicBP)) ? "critical" : localThr.systolicBP > 150 ? "warn" : "safe",
        spo2: patients.some(p => p.clinicalMetrics.some(m => m.label.toLowerCase().includes("spo") && parseFloat(m.value) < localThr.spo2)) ? "critical" : localThr.spo2 < 93 ? "warn" : "safe",
        glucose: patients.some(p => p.clinicalMetrics.some(m => m.label.toLowerCase().includes("glucose") && parseFloat(m.value) > localThr.glucose)) ? "critical" : localThr.glucose > 200 ? "warn" : "safe",
    }), [patients, localThr]);

    const hasChanges = JSON.stringify(localThr) !== JSON.stringify(thresholds);
    const breachCount = breachAlerts.length;

    const saveThresholds = async () => {
        setSaving(true);
        try {
            await fetch("/api/thresholds", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(localThr) });
            setThresholds(localThr);
            for (const ba of breachAlerts) {
                await fetch("/api/alerts", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        patientId: ba.pid, patientName: ba.name, disease: ba.disease, riskLevel: ba.riskLevel,
                        type: "Threshold Breach", message: `${ba.metric} is ${ba.value} — exceeds threshold of ${ba.thrVal}.`,
                        metric: ba.metric, value: String(ba.value), threshold: String(ba.thrVal),
                        severity: "High", doctor: "Dr. Priya Nair",
                    }),
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } finally { setSaving(false); }
    };

    const SLIDERS: Array<{
        key: keyof Thresholds; label: string; icon: React.ReactNode;
        min: number; max: number; unit: string; safeRange: string;
    }> = [
            { key: "heartRate", label: "Heart Rate", icon: <Heart size={18} />, min: 60, max: 120, unit: "bpm", safeRange: "60–100 bpm" },
            { key: "systolicBP", label: "Systolic BP", icon: <Activity size={18} />, min: 100, max: 180, unit: "mmHg", safeRange: "90–130 mmHg" },
            { key: "spo2", label: "SpO₂ Min Threshold", icon: <Wind size={18} />, min: 88, max: 99, unit: "%", safeRange: "95–100%" },
            { key: "glucose", label: "Post-Prandial Glucose", icon: <Droplets size={18} />, min: 140, max: 250, unit: "mg/dL", safeRange: "< 180 mg/dL" },
        ];

    return (
        <div className="h-full overflow-y-auto" style={{ background: "#f8fafc" }}>
            {/* Page Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
                style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Health Monitoring</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>Live vitals · deterministic sparklines · threshold-triggered alerts</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "#d3f9d8", color: "#2f9e44", border: "1px solid #8ce99a" }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#2f9e44" }} />
                    Live Monitoring Active
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 gap-3" style={{ color: "#8898aa" }}>
                    <Loader2 size={22} className="spin" /> <span className="text-sm">Loading patient vitals…</span>
                </div>
            ) : (
                <div className="p-6 space-y-6">
                    {/* Patient vitals grid */}
                    <div>
                        <h2 className="text-sm font-bold mb-3" style={{ color: "#1a1f36" }}>
                            Patient Vitals
                            <span className="text-xs font-normal ml-2" style={{ color: "#94a3b8" }}>Stable readings · dashed line = saved threshold</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {patients.map(p => (
                                <VitalsCard key={p.patientId ?? p.id} patient={p} thresholds={thresholds} />
                            ))}
                        </div>
                    </div>

                    {/* ═══ Premium Threshold Management Section ═══ */}
                    <div className="rounded-3xl overflow-hidden border" style={{ borderColor: "#e2e8f0", boxShadow: "0 8px 40px rgba(76,110,245,0.08)" }}>
                        {/* Section Header */}
                        <div className="px-6 py-5 flex items-center justify-between"
                            style={{ background: "linear-gradient(135deg, #1a1f36 0%, #0f172a 100%)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: "rgba(76,110,245,0.25)" }}>
                                    <Shield size={20} style={{ color: "#818cf8" }} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">Alert Threshold Management</h2>
                                    <p className="text-xs" style={{ color: "#64748b" }}>Clinical precision controls — affect real-time alert engine</p>
                                </div>
                            </div>
                            {/* AI Badge */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                                style={{ background: "rgba(250,204,21,0.1)", borderColor: "rgba(250,204,21,0.25)" }}>
                                <Sparkles size={13} style={{ color: "#fbbf24" }} />
                                <span className="text-xs font-semibold" style={{ color: "#fbbf24" }}>AI Adaptive Threshold Suggestions Available</span>
                            </div>
                        </div>

                        {/* Two-column layout */}
                        <div className="grid grid-cols-3 gap-0" style={{ background: "#f8fafc" }}>
                            {/* Left — Slider controls (2/3 width) */}
                            <div className="col-span-2 p-6 space-y-4" style={{ borderRight: "1px solid #e2e8f0" }}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold tracking-wider" style={{ color: "#94a3b8" }}>THRESHOLD CONTROLS</p>
                                    {hasChanges && (
                                        <span className="text-xs font-semibold flex items-center gap-1.5 px-2 py-1 rounded-lg"
                                            style={{ background: "#fff3bf", color: "#b45309" }}>
                                            <AlertTriangle size={11} /> Unsaved changes
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {SLIDERS.map(s => (
                                        <SmartSlider
                                            key={s.key}
                                            label={s.label} icon={s.icon} unit={s.unit} safeRange={s.safeRange}
                                            metricKey={s.key} value={thresholds[s.key]} localVal={localThr[s.key]}
                                            min={s.min} max={s.max}
                                            riskState={(sliderRisk as any)[s.key]}
                                            onChange={v => setLocalThr(prev => ({ ...prev, [s.key]: v }))}
                                        />
                                    ))}
                                </div>

                                {/* Save section */}
                                <div className="pt-2">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={saveThresholds}
                                            disabled={saving || !hasChanges}
                                            className="group relative overflow-hidden flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-40"
                                            style={{
                                                background: saving ? "#64748b" : "linear-gradient(135deg, #4c6ef5 0%, #7c3aed 100%)",
                                                boxShadow: hasChanges && !saving ? "0 4px 20px rgba(76,110,245,0.4)" : "none",
                                                transform: hasChanges && !saving ? "translateY(-1px)" : "none",
                                            }}>
                                            {saving ? (
                                                <Loader2 size={16} className="spin" />
                                            ) : saved ? (
                                                <CheckCircle size={16} />
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            {saving ? "Applying…" : saved ? "Thresholds Saved!" : "Save & Apply Thresholds"}
                                            {!saving && !saved && (
                                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            )}
                                        </button>
                                        <div>
                                            {saved ? (
                                                <p className="text-xs font-semibold flex items-center gap-1" style={{ color: "#22c55e" }}>
                                                    <CheckCircle size={12} /> {breachAlerts.length} alert{breachAlerts.length !== 1 ? "s" : ""} posted to Alert Management
                                                </p>
                                            ) : (
                                                <p className="text-xs" style={{ color: "#94a3b8" }}>Changes will affect the real-time alert engine</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right — Live Preview Panel (1/3 width) */}
                            <div className="p-6" style={{ background: "#fff" }}>
                                <LivePreviewPanel
                                    patients={patients}
                                    thresholds={thresholds}
                                    localThr={localThr}
                                    breachCount={breachCount}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Breach list if any */}
                    {breachAlerts.length > 0 && (
                        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#fca5a5" }}>
                            <div className="px-5 py-3 flex items-center gap-2" style={{ background: "#fef2f2" }}>
                                <AlertTriangle size={14} style={{ color: "#ef4444" }} />
                                <p className="text-sm font-bold" style={{ color: "#991b1b" }}>
                                    {breachAlerts.length} patients currently exceed saved thresholds
                                </p>
                                <span className="ml-auto text-xs" style={{ color: "#94a3b8" }}>
                                    Click "Save & Apply" to post alerts
                                </span>
                            </div>
                            <div className="divide-y" style={{ borderColor: "#fee2e2" }}>
                                {breachAlerts.map((a, i) => (
                                    <div key={i} className="flex items-center gap-4 px-5 py-3" style={{ background: "#fff" }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                            style={{ background: "#fee2e2", color: "#ef4444" }}>
                                            {a.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold" style={{ color: "#1a1f36" }}>{a.name}</p>
                                            <p className="text-xs" style={{ color: "#94a3b8" }}>{a.pid} · {a.disease}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                                                {a.metric}: <span className="font-black">{a.value}</span>
                                            </p>
                                            <p className="text-xs" style={{ color: "#94a3b8" }}>Threshold: {a.thrVal}</p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                            style={{ background: "#fee2e2", color: "#ef4444" }}>BREACH</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
