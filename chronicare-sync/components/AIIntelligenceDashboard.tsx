"use client";

import { useState, useEffect } from "react";
import { mockPatients, Patient } from "@/lib/mockData";
import HealthScoreGauge from "./ui/HealthScoreGauge";
import AdherenceRing from "./ui/AdherenceRing";
import XAIBarChart from "./ui/XAIBarChart";
import PHRNBadge from "./ui/PHRNBadge";
import {
    Sparkles, Activity, AlertTriangle, TrendingUp,
    TrendingDown, Minus, Brain, Shield, Loader2, ChevronDown, ChevronUp,
    ArrowRight, Target, Zap,
} from "lucide-react";

interface PatientIntelligence {
    patient: Patient;
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
}

const RISK_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    High: { bg: "#ffe3e3", color: "#c92a2a", border: "#ffa8a8" },
    Medium: { bg: "#fff3bf", color: "#e67700", border: "#ffd43b" },
    Low: { bg: "#d3f9d8", color: "#2f9e44", border: "#8ce99a" },
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
    return (
        <div className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: "#8898aa", letterSpacing: "0.06em" }}>{label}</p>
            <p className="text-3xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "#8898aa" }}>{sub}</p>
        </div>
    );
}

function PatientIntelligenceCard({ intel, onExpand, isExpanded }: { intel: PatientIntelligence; onExpand: () => void; isExpanded: boolean }) {
    const rc = RISK_COLORS[intel.riskLevel] || RISK_COLORS.Low;

    return (
        <div className="rounded-2xl border overflow-hidden transition-all" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
            <div
                className="px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={onExpand}
            >
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
                        style={{ background: rc.bg, color: rc.color }}
                    >
                        {intel.patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>{intel.patient.name}</p>
                            {intel.patient.phrn && <PHRNBadge phrn={intel.patient.phrn} size="sm" showCopy={false} />}
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: rc.bg, color: rc.color }}>
                                {intel.riskLevel} Risk
                            </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "#8898aa" }}>
                            {intel.patient.age}y · {intel.patient.gender} · {intel.patient.disease}
                        </p>
                    </div>

                    {/* Scores */}
                    {intel.loading ? (
                        <Loader2 size={18} className="spin" style={{ color: "#4c6ef5" }} />
                    ) : (
                        <div className="flex items-center gap-6 shrink-0">
                            <div className="text-center">
                                <p className="text-lg font-black" style={{ color: intel.healthScore >= 80 ? "#2f9e44" : intel.healthScore >= 50 ? "#e67700" : "#c92a2a" }}>
                                    {intel.healthScore}
                                </p>
                                <p className="text-xs" style={{ color: "#8898aa" }}>Health</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black" style={{ color: rc.color }}>{intel.riskScore}</p>
                                <p className="text-xs" style={{ color: "#8898aa" }}>Risk</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black" style={{ color: intel.adherenceScore >= 80 ? "#2f9e44" : intel.adherenceScore >= 60 ? "#e67700" : "#c92a2a" }}>
                                    {intel.adherenceScore}%
                                </p>
                                <p className="text-xs" style={{ color: "#8898aa" }}>Adherence</p>
                            </div>
                            {isExpanded ? <ChevronUp size={16} style={{ color: "#94a3b8" }} /> : <ChevronDown size={16} style={{ color: "#94a3b8" }} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Detail */}
            {isExpanded && !intel.loading && (
                <div className="px-5 pb-5 space-y-4 fade-in" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        {/* Health Score Gauge */}
                        <div className="flex flex-col items-center gap-2">
                            <HealthScoreGauge score={intel.healthScore} size={140} />
                            <p className="text-xs font-semibold" style={{ color: "#525f7f" }}>Health Score</p>
                        </div>

                        {/* Adherence Ring */}
                        <div className="flex flex-col items-center gap-2">
                            <AdherenceRing score={intel.adherenceScore} size={120} label="Adherence Score" />
                        </div>

                        {/* Risk Meter */}
                        <div className="flex flex-col items-center gap-2 justify-center">
                            <div className="rounded-2xl p-4 text-center w-full" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
                                <AlertTriangle size={20} style={{ color: rc.color }} className="mx-auto mb-1" />
                                <p className="text-2xl font-black" style={{ color: rc.color }}>{intel.riskScore}<span className="text-sm">/100</span></p>
                                <p className="text-xs font-bold" style={{ color: rc.color }}>{intel.riskLevel} RISK</p>
                                <p className="text-xs mt-1" style={{ color: rc.color + "aa" }}>{intel.confidence}% confidence</p>
                            </div>
                        </div>
                    </div>

                    {/* XAI Chart */}
                    <div className="rounded-2xl p-4 border" style={{ background: "#f8f9ff", borderColor: "#e8ecf4" }}>
                        <XAIBarChart contributions={intel.contributions} />
                    </div>

                    {/* Forecast */}
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

                    {/* AI Explanation */}
                    <div className="rounded-xl p-3" style={{ background: "#f1f5f9" }}>
                        <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
                            <strong>AI Insight:</strong> {intel.explanation}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AIIntelligenceDashboard() {
    const [intelligence, setIntelligence] = useState<PatientIntelligence[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    useEffect(() => {
        // Initialize with loading state for all patients
        const initial = mockPatients.map(p => ({
            patient: p,
            healthScore: 0,
            category: "Moderate Risk",
            adherenceScore: 0,
            riskScore: 0,
            riskLevel: p.riskLevel,
            confidence: 0,
            contributions: [],
            explanation: "",
            loading: true,
        }));
        setIntelligence(initial);

        // Load intelligence for each patient
        mockPatients.forEach(async (patient, i) => {
            try {
                const [hsRes, rpRes] = await Promise.all([
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
                ]);

                const hs = await hsRes.json();
                const rp = await rpRes.json();

                setIntelligence(prev => prev.map((item, idx) =>
                    idx === i ? {
                        ...item,
                        healthScore: hs.healthScore || 0,
                        category: hs.category || "Moderate Risk",
                        adherenceScore: hs.adherenceScore || rp.adherenceScore || 70,
                        riskScore: rp.riskScore || 0,
                        riskLevel: rp.riskLevel || patient.riskLevel,
                        confidence: rp.confidence || 75,
                        contributions: rp.contributions || [],
                        explanation: rp.explanation || "",
                        loading: false,
                    } : item
                ));

                // Load forecast for first patient automatically
                if (i === 0) {
                    const fcRes = await fetch("/api/progression-forecast", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patient }),
                    });
                    const fc = await fcRes.json();
                    setIntelligence(prev => prev.map((item, idx) =>
                        idx === 0 ? { ...item, forecastText: fc.forecastText, trend: fc.trend } : item
                    ));
                }
            } catch {
                setIntelligence(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, loading: false, error: "Failed to load" } : item
                ));
            }
        });

        setSummaryLoading(false);
    }, []);

    const handleExpand = async (patientId: string) => {
        const isExpanding = expandedId !== patientId;
        setExpandedId(isExpanding ? patientId : null);

        // Load forecast on expansion
        if (isExpanding) {
            const idx = intelligence.findIndex(i => i.patient.id === patientId);
            const item = intelligence[idx];
            if (item && !item.forecastText && !item.loading) {
                try {
                    const fcRes = await fetch("/api/progression-forecast", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ patient: item.patient }),
                    });
                    const fc = await fcRes.json();
                    setIntelligence(prev => prev.map((it, i) =>
                        i === idx ? { ...it, forecastText: fc.forecastText, trend: fc.trend } : it
                    ));
                } catch { /* ignore */ }
            }
        }
    };

    // Summary stats
    const loaded = intelligence.filter(i => !i.loading);
    const avgHealth = loaded.length > 0 ? Math.round(loaded.reduce((s, i) => s + i.healthScore, 0) / loaded.length) : 0;
    const avgAdherence = loaded.length > 0 ? Math.round(loaded.reduce((s, i) => s + i.adherenceScore, 0) / loaded.length) : 0;
    const highRisk = loaded.filter(i => i.riskLevel === "High").length;
    const criticalAdherence = loaded.filter(i => i.adherenceScore < 60).length;

    const sorted = [...intelligence].sort((a, b) => b.riskScore - a.riskScore);

    return (
        <div className="h-full overflow-y-auto" style={{ background: "#f8fafc" }}>
            {/* Header */}
            <div className="px-6 py-5 page-header sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4c6ef5, #7c3aed)" }}>
                                <Brain size={18} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>AI Intelligence Engine</h1>
                                <p className="text-sm" style={{ color: "#64748b" }}>
                                    Clinically-guided risk prediction · SHAP explainability · Disease progression forecasting
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: "#eef2ff", color: "#4c6ef5", border: "1px solid #c7d2fe" }}>
                        <Zap size={11} />
                        Framingham · ADA · XGBoost
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Avg Health Score" value={avgHealth} sub="Fleet average 0–100" color={avgHealth >= 70 ? "#2f9e44" : avgHealth >= 50 ? "#e67700" : "#c92a2a"} />
                    <StatCard label="Avg Adherence" value={`${avgAdherence}%`} sub="Medication compliance" color={avgAdherence >= 75 ? "#2f9e44" : "#e67700"} />
                    <StatCard label="High Risk Patients" value={highRisk} sub={`of ${intelligence.length} total`} color={highRisk > 0 ? "#c92a2a" : "#2f9e44"} />
                    <StatCard label="Adherence Alerts" value={criticalAdherence} sub="Below 60% threshold" color={criticalAdherence > 0 ? "#e67700" : "#2f9e44"} />
                </div>

                {/* ML Model Info */}
                <div className="rounded-2xl p-4 border" style={{ background: "linear-gradient(135deg, #1e3a5f, #2d4fa1)", borderColor: "#3b5bdb" }}>
                    <div className="flex items-center gap-3 mb-3">
                        <Shield size={16} className="text-blue-300" />
                        <p className="text-sm font-bold text-white">Clinically Guided ML Engine</p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "Algorithm", value: "XGBoost-style weighted scoring" },
                            { label: "Features", value: "8 clinical + adherence factors" },
                            { label: "Validation", value: "Framingham · ADA · WHO CVD" },
                            { label: "Explainability", value: "SHAP-style contributions" },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                                <p className="text-xs font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Intelligence List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>
                            Patient Risk Rankings <span style={{ color: "#8898aa", fontWeight: 400 }}>— sorted by risk score</span>
                        </p>
                        <p className="text-xs" style={{ color: "#8898aa" }}>Click any row to expand AI analysis</p>
                    </div>

                    <div className="space-y-3">
                        {sorted.map(intel => (
                            <PatientIntelligenceCard
                                key={intel.patient.id}
                                intel={intel}
                                isExpanded={expandedId === intel.patient.id}
                                onExpand={() => handleExpand(intel.patient.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
