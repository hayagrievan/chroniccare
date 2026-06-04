"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, Clock, XCircle, User, RefreshCw, Eye, FileText, Loader2, Plus } from "lucide-react";
import { mockPatients } from "@/lib/mockData";

interface Consent {
    consentId: string;
    patientId: string;
    phrn: string;
    doctorId: string;
    doctorName: string;
    status: "Pending" | "Approved" | "Revoked" | "Expired";
    requestedAt: string;
    approvedAt: string | null;
    revokedAt: string | null;
    purpose: string;
}

const STATUS_CONFIG = {
    Approved: { bg: "#d3f9d8", color: "#2f9e44", border: "#8ce99a", icon: <CheckCircle size={14} /> },
    Pending: { bg: "#fff3bf", color: "#e67700", border: "#ffd43b", icon: <Clock size={14} /> },
    Revoked: { bg: "#ffe3e3", color: "#c92a2a", border: "#ffa8a8", icon: <XCircle size={14} /> },
    Expired: { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0", icon: <XCircle size={14} /> },
};

export default function ConsentManagementPage() {
    const [consents, setConsents] = useState<Consent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"All" | "Approved" | "Pending" | "Revoked">("All");
    const [requestModal, setRequestModal] = useState(false);
    const [newPhrn, setNewPhrn] = useState("");
    const [newPurpose, setNewPurpose] = useState("Chronic disease management");
    const [requesting, setRequesting] = useState(false);
    const [requestMsg, setRequestMsg] = useState("");
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const loadConsents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/consent");
            const data = await res.json();
            setConsents(Array.isArray(data) ? data.filter((c: Consent) => c.doctorId === "dr-priya-nair") : []);
        } catch {
            // Fallback to empty
        } finally {
            setLoading(false);
        }
    };

    const loadAuditLog = async () => {
        setAuditLoading(true);
        try {
            const res = await fetch("/api/audit-log?limit=20");
            const data = await res.json();
            setAuditLog(Array.isArray(data) ? data : []);
        } catch { } finally { setAuditLoading(false); }
    };

    useEffect(() => {
        loadConsents();
        loadAuditLog();
    }, []);

    const handleRequestAccess = async () => {
        if (!newPhrn.trim()) return;
        setRequesting(true);
        setRequestMsg("");
        try {
            const res = await fetch("/api/consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "request",
                    phrn: newPhrn.trim().toUpperCase(),
                    doctorId: "dr-priya-nair",
                    doctorName: "Dr. Priya Nair",
                    purpose: newPurpose,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setRequestMsg("✅ Access request sent successfully.");
                await loadConsents();
                setTimeout(() => { setRequestModal(false); setRequestMsg(""); setNewPhrn(""); }, 1500);
            } else {
                setRequestMsg(`❌ ${data.error || "Request failed"}`);
            }
        } catch {
            setRequestMsg("❌ Network error");
        } finally {
            setRequesting(false);
        }
    };

    const filtered = consents.filter(c => filter === "All" ? true : c.status === filter);

    const stats = {
        total: consents.length,
        approved: consents.filter(c => c.status === "Approved").length,
        pending: consents.filter(c => c.status === "Pending").length,
        revoked: consents.filter(c => c.status === "Revoked").length,
    };

    const getPatientForConsent = (consent: Consent) =>
        mockPatients.find(p => p.id === consent.patientId);

    return (
        <div className="h-full overflow-y-auto" style={{ background: "#f8fafc" }}>
            {/* Header */}
            <div className="px-6 py-5 page-header sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b5bdb)" }}>
                            <Shield size={17} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Consent Management</h1>
                            <p className="text-sm" style={{ color: "#64748b" }}>PHRN-based patient access control · Full audit trail</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadConsents} className="p-2 rounded-xl hover:bg-white transition-colors" title="Refresh">
                            <RefreshCw size={15} style={{ color: "#64748b" }} />
                        </button>
                        <button
                            onClick={() => setRequestModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #4c6ef5, #7c3aed)" }}
                        >
                            <Plus size={14} /> Request Patient Access
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: "Total Access Grants", value: stats.total, color: "#4c6ef5", bg: "#eef2ff" },
                        { label: "Approved", value: stats.approved, color: "#2f9e44", bg: "#d3f9d8" },
                        { label: "Pending Approval", value: stats.pending, color: "#e67700", bg: "#fff3bf" },
                        { label: "Revoked", value: stats.revoked, color: "#c92a2a", bg: "#ffe3e3" },
                    ].map(stat => (
                        <div key={stat.label} className="rounded-2xl p-4 border" style={{ background: stat.bg, borderColor: stat.color + "44" }}>
                            <p className="text-xs font-bold mb-1" style={{ color: stat.color }}>{stat.label}</p>
                            <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Privacy Info */}
                <div className="rounded-2xl p-4 border" style={{ background: "linear-gradient(135deg, #1e3a5f, #2d4fa1)", borderColor: "#3b5bdb" }}>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield size={16} className="text-blue-300" />
                        <p className="text-sm font-bold text-white">Privacy-Preserving Access Control</p>
                    </div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                        All patient record access requires explicit patient consent via PHRN. Patients can revoke access at any time.
                        Every access event is immutably logged in the audit trail. Government admins see only anonymized aggregate data.
                    </p>
                </div>

                {/* Filter + List */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        {(["All", "Approved", "Pending", "Revoked"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                style={{
                                    background: filter === f ? "#4c6ef5" : "#e8ecf4",
                                    color: filter === f ? "#fff" : "#64748b",
                                }}
                            >
                                {f} {f !== "All" && <span>({stats[f.toLowerCase() as keyof typeof stats] || 0})</span>}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="spin" style={{ color: "#4c6ef5" }} /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center rounded-2xl border" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                            <Shield size={40} style={{ color: "#e2e8f0" }} className="mx-auto mb-3" />
                            <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
                                {filter === "All" ? "No consent records yet" : `No ${filter} consents`}
                            </p>
                            <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>Use "Request Patient Access" to add new PHRN-based access</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(consent => {
                                const patient = getPatientForConsent(consent);
                                const sc = STATUS_CONFIG[consent.status] || STATUS_CONFIG.Expired;

                                return (
                                    <div key={consent.consentId} className="rounded-2xl border p-4" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
                                                style={{ background: sc.bg, color: sc.color }}
                                            >
                                                {patient?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-sm" style={{ color: "#1a1f36" }}>
                                                        {patient?.name || consent.patientId}
                                                    </p>
                                                    <span
                                                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold"
                                                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                                                    >
                                                        {sc.icon} {consent.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-0.5 font-mono" style={{ color: "#8898aa" }}>{consent.phrn}</p>
                                                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                                                    Purpose: {consent.purpose} ·
                                                    Requested: {new Date(consent.requestedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    {consent.approvedAt && ` · Approved: ${new Date(consent.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#f1f5f9", color: "#64748b" }}>
                                                    {consent.consentId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Audit Log */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>Audit Trail</p>
                        <p className="text-xs" style={{ color: "#8898aa" }}>Last 20 events · Immutable log</p>
                    </div>

                    <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e8ecf4" }}>
                        {auditLoading ? (
                            <div className="py-8 flex justify-center"><Loader2 className="spin" style={{ color: "#4c6ef5" }} /></div>
                        ) : auditLog.length === 0 ? (
                            <div className="py-8 text-center">
                                <FileText size={32} style={{ color: "#e2e8f0" }} className="mx-auto mb-2" />
                                <p className="text-sm" style={{ color: "#94a3b8" }}>No audit events yet</p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                                {auditLog.map((event, i) => (
                                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#eef2ff" }}>
                                                <Eye size={12} style={{ color: "#4c6ef5" }} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold" style={{ color: "#1a1f36" }}>
                                                    {event.action?.replace(/_/g, " ")}
                                                    {event.patientId && ` · ${event.patientId}`}
                                                    {event.medicineName && ` · ${event.medicineName}`}
                                                </p>
                                                <p className="text-xs" style={{ color: "#8898aa" }}>
                                                    {event.status && `Status: ${event.status} · `}
                                                    {new Date(event.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#f1f5f9", color: "#64748b", fontFamily: "monospace" }}>
                                            {event.action}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {requestModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                    onClick={(e) => e.target === e.currentTarget && setRequestModal(false)}
                >
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#fff" }}>
                        <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #1e3a5f, #3b5bdb)" }}>
                            <p className="font-bold text-white">Request Patient Record Access</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Patient must approve access via their portal</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Patient PHRN</label>
                                <input
                                    type="text"
                                    value={newPhrn}
                                    onChange={(e) => setNewPhrn(e.target.value.toUpperCase())}
                                    placeholder="PHRN-IND-2026-000001"
                                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none font-mono"
                                    style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Purpose of Access</label>
                                <select
                                    value={newPurpose}
                                    onChange={(e) => setNewPurpose(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                                    style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                                >
                                    <option>Chronic disease management</option>
                                    <option>Emergency consultation</option>
                                    <option>Second opinion review</option>
                                    <option>Lab result review</option>
                                    <option>Follow-up care</option>
                                </select>
                            </div>

                            {requestMsg && (
                                <div className="px-4 py-2.5 rounded-xl text-sm" style={{ background: requestMsg.includes("✅") ? "#d3f9d8" : "#ffe3e3", color: requestMsg.includes("✅") ? "#2f9e44" : "#c92a2a" }}>
                                    {requestMsg}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setRequestModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#f1f5f9", color: "#64748b" }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRequestAccess}
                                    disabled={requesting || !newPhrn.trim()}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg, #4c6ef5, #7c3aed)" }}
                                >
                                    {requesting ? <Loader2 size={14} className="spin" /> : <Shield size={14} />}
                                    {requesting ? "Requesting..." : "Send Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
