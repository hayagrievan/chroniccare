"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle, Clock, Bell, Shield, X, Loader2, RotateCcw } from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type AlertStatus = "Active" | "Acknowledged" | "Resolved";

interface Alert {
    _id: string;
    alertId: string;
    patientName: string;
    patientId: string;
    disease: string;
    riskLevel: string;
    type: string;
    message: string;
    metric?: string;
    value?: string;
    threshold?: string;
    severity: Severity;
    status: AlertStatus;
    doctor: string;
    createdAt: string;
}

const severityConfig: Record<Severity, { color: string; bg: string; border: string }> = {
    Critical: { color: "#fff", bg: "#c92a2a", border: "#c92a2a" },
    High: { color: "#fff", bg: "#e67700", border: "#e67700" },
    Medium: { color: "#e67700", bg: "#fff3bf", border: "#ffd43b" },
    Low: { color: "#2f9e44", bg: "#d3f9d8", border: "#8ce99a" },
};
const statusConfig: Record<AlertStatus, { color: string; bg: string; label: string }> = {
    Active: { color: "#c92a2a", bg: "#ffe3e3", label: "● Active" },
    Acknowledged: { color: "#e67700", bg: "#fff3bf", label: "◐ Acknowledged" },
    Resolved: { color: "#2f9e44", bg: "#d3f9d8", label: "✓ Resolved" },
};

type TabKey = "all" | "critical" | "pending" | "resolved";

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""} ago`;
}

export default function AlertManagementPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [tab, setTab] = useState<TabKey>("all");
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/alerts", { cache: "no-store" });
            const data = await res.json();
            if (Array.isArray(data)) setAlerts(data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchAlerts();
        // Auto-refresh every 30 seconds to pick up threshold-triggered alerts
        const id = setInterval(fetchAlerts, 30000);
        return () => clearInterval(id);
    }, [fetchAlerts]);

    const update = async (alertId: string, status: AlertStatus) => {
        setSavingId(alertId);
        await fetch(`/api/alerts/${alertId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        await fetchAlerts();
        setSavingId(null);
    };

    const filterFn = (key: TabKey) => {
        if (key === "all") return alerts;
        if (key === "critical") return alerts.filter(a => a.severity === "Critical");
        if (key === "pending") return alerts.filter(a => a.status === "Active" || a.status === "Acknowledged");
        return alerts.filter(a => a.status === "Resolved");
    };

    const displayed = filterFn(tab).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === "Critical" && a.status !== "Resolved").length,
        resolved: alerts.filter(a => a.status === "Resolved").length,
        pending: alerts.filter(a => a.status === "Active").length,
    };

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between page-header">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Alert Management</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>Patient safety alerts · auto-refreshes every 30s</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchAlerts} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Refresh now">
                        <RotateCcw size={15} style={{ color: "#64748b" }} />
                    </button>
                    {stats.critical > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold animate-pulse"
                            style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}>
                            <Bell size={12} /> {stats.critical} Critical Unresolved
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: "Total Alerts", value: stats.total, color: "#4c6ef5", bg: "#eef2ff" },
                        { label: "Critical Active", value: stats.critical, color: "#c92a2a", bg: "#ffe3e3" },
                        { label: "Pending Review", value: stats.pending, color: "#e67700", bg: "#fff3bf" },
                        { label: "Resolved", value: stats.resolved, color: "#2f9e44", bg: "#d3f9d8" },
                    ].map(s => (
                        <div key={s.label} className="rounded-2xl p-4 border card-hover" style={{ background: s.bg, borderColor: s.color + "33" }}>
                            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs font-medium mt-1" style={{ color: "#64748b" }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#f1f5f9", width: "fit-content" }}>
                    {(["all", "critical", "pending", "resolved"] as TabKey[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all flex items-center gap-2"
                            style={{
                                background: tab === t ? "#fff" : "transparent", color: tab === t ? "#4c6ef5" : "#64748b",
                                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
                            }}>
                            {t}
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: tab === t ? "#eef2ff" : "#e2e8f0", color: tab === t ? "#4c6ef5" : "#94a3b8" }}>
                                {filterFn(t).length}
                            </span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12 gap-3" style={{ color: "#8898aa" }}>
                        <Loader2 size={20} className="spin" /> <span className="text-sm">Loading alerts…</span>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16">
                        <Shield size={40} style={{ color: "#d3f9d8" }} className="mx-auto mb-3" />
                        <p className="font-semibold" style={{ color: "#2f9e44" }}>All clear — no alerts in this category</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayed.map(alert => {
                            const sc = severityConfig[alert.severity];
                            const stc = statusConfig[alert.status];
                            const isSelected = selected === alert.alertId;
                            const isSaving = savingId === alert.alertId;

                            return (
                                <div key={alert.alertId}
                                    className="rounded-2xl border overflow-hidden transition-all"
                                    style={{ borderColor: alert.status === "Resolved" ? "#e2e8f0" : sc.border + "60" }}>
                                    <div className="px-5 py-4 cursor-pointer"
                                        style={{ background: alert.status === "Resolved" ? "#fafafa" : "#fff" }}
                                        onClick={() => setSelected(isSelected ? null : alert.alertId)}>
                                        <div className="flex items-start gap-4">
                                            {/* Severity pill */}
                                            <div className="mt-0.5">
                                                <span className="text-xs px-2.5 py-1 rounded-full font-black"
                                                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}40` }}>
                                                    {alert.severity}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>{alert.patientName}</p>
                                                    <span className="text-xs" style={{ color: "#94a3b8" }}>{alert.patientId}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                        style={{ background: stc.bg, color: stc.color }}>{stc.label}</span>
                                                </div>
                                                <p className="text-xs font-medium mt-0.5" style={{ color: "#4c6ef5" }}>{alert.type}</p>
                                                <p className="text-xs mt-1 leading-relaxed" style={{ color: "#64748b" }}>{alert.message}</p>
                                                {alert.metric && (
                                                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                                                        {alert.metric}: <span style={{ color: "#c92a2a", fontWeight: 600 }}>{alert.value}</span>
                                                        {" "}(threshold: {alert.threshold})
                                                    </p>
                                                )}
                                                <p className="text-xs mt-1.5" style={{ color: "#94a3b8" }}>
                                                    <Clock size={10} className="inline mr-1" />
                                                    {timeAgo(alert.createdAt)} · {alert.doctor}
                                                </p>
                                            </div>

                                            {/* Quick actions */}
                                            <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                                {isSaving && <Loader2 size={14} className="spin" style={{ color: "#94a3b8" }} />}
                                                {!isSaving && alert.status === "Active" && (
                                                    <button onClick={() => update(alert.alertId, "Acknowledged")}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                        style={{ background: "#fff3bf", color: "#e67700", border: "1px solid #ffd43b" }}>
                                                        Acknowledge
                                                    </button>
                                                )}
                                                {!isSaving && alert.status !== "Resolved" && (
                                                    <button onClick={() => update(alert.alertId, "Resolved")}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                        style={{ background: "#d3f9d8", color: "#2f9e44", border: "1px solid #8ce99a" }}>
                                                        Resolve
                                                    </button>
                                                )}
                                                {!isSaving && alert.status === "Resolved" && (
                                                    <button onClick={() => update(alert.alertId, "Active")}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                                        style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
                                                        Reopen
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Escalation panel */}
                                    {isSelected && alert.status !== "Resolved" && (
                                        <div className="px-5 py-3 border-t fade-in" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
                                            <div className="flex gap-3 items-center">
                                                <p className="text-xs font-semibold" style={{ color: "#64748b" }}>Escalate to:</p>
                                                {["Specialist", "Head of Dept", "Emergency"].map(el => (
                                                    <button key={el} className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                                                        style={{ borderColor: "#ffa8a8", color: "#c92a2a" }}>
                                                        {el}
                                                    </button>
                                                ))}
                                                <button className="ml-auto" onClick={() => setSelected(null)}>
                                                    <X size={14} style={{ color: "#94a3b8" }} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
