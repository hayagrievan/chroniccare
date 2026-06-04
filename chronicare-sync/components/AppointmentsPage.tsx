"use client";

import { useState, useEffect, useRef } from "react";
import {
    Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus,
    ChevronLeft, ChevronRight, X, Loader2, Heart, Activity,
    Droplets, Brain, AlertTriangle,
} from "lucide-react";

interface Appointment {
    _id?: string;
    appointmentId: string;
    patientId: string;
    patientName: string;
    disease: string;
    riskLevel: string;
    date: string;
    time: string;
    type: string;
    status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
    doctor?: string;
    notes?: string;
}

interface Patient { id: string; name: string; disease: string; riskLevel: string; }

const DAYS_IN_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const diseaseColor: Record<string, { color: string; bg: string }> = {
    Heart: { color: "#c92a2a", bg: "#ffe3e3" },
    BP: { color: "#6741d9", bg: "#f3f0ff" },
    Sugar: { color: "#e67700", bg: "#fff3bf" },
    Stress: { color: "#0c8599", bg: "#c5f6fa" },
};
const DiseaseIcon: Record<string, React.ReactNode> = {
    Heart: <Heart size={12} />, BP: <Activity size={12} />, Sugar: <Droplets size={12} />, Stress: <Brain size={12} />,
};
const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    Confirmed: { color: "#4c6ef5", bg: "#eef2ff", icon: <CheckCircle size={12} /> },
    Pending: { color: "#e67700", bg: "#fff3bf", icon: <AlertCircle size={12} /> },
    Completed: { color: "#2f9e44", bg: "#d3f9d8", icon: <CheckCircle size={12} /> },
    Cancelled: { color: "#c92a2a", bg: "#ffe3e3", icon: <XCircle size={12} /> },
};

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

/* ─── Book Appointment Modal ─── */
function BookModal({
    patients, onClose, onBooked,
}: { patients: Patient[]; onClose: () => void; onBooked: () => void }) {
    const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [time, setTime] = useState("10:00");
    const [type, setType] = useState("Routine Check");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const submit = async () => {
        const pat = patients.find(p => p.id === patientId);
        if (!pat) return;
        setLoading(true); setErr("");
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId, patientName: pat.name,
                    disease: pat.disease, riskLevel: pat.riskLevel,
                    date, time, type, notes,
                    doctor: "Dr. Priya Nair",
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onBooked();
            onClose();
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl fade-in" style={{ background: "#fff" }}>
                <div className="flex items-center justify-between px-6 py-4 page-header">
                    <div>
                        <p className="font-bold text-base" style={{ color: "#1a1f36" }}>Book Appointment</p>
                        <p className="text-xs" style={{ color: "#8898aa" }}>Saved to database</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X size={16} style={{ color: "#8898aa" }} /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    {err && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                            style={{ background: "#ffe3e3", color: "#c92a2a" }}>
                            <AlertTriangle size={13} /> {err}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Patient</label>
                        <select value={patientId} onChange={e => setPatientId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                            style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                className="w-full px-3 py-3 rounded-xl border text-sm outline-none"
                                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Time</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)}
                                className="w-full px-3 py-3 rounded-xl border text-sm outline-none"
                                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Type</label>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                            style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}>
                            {["Routine Check", "Follow-up", "Urgent Review", "Lab Results", "Counselling", "Post-procedure Review", "Cardiac Check", "Diabetes Review", "HbA1c Review", "Echo follow-up"].map(t => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Notes (optional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                            placeholder="Any special notes for this appointment..."
                            className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                            style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }} />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
                            style={{ borderColor: "#e2e8f0", color: "#8898aa" }}>Cancel</button>
                        <button onClick={submit} disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function AppointmentsPage() {
    const today = new Date().toISOString().split("T")[0];
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState(today);
    const [showModal, setShowModal] = useState(false);
    const [appointments, setAppts] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);

    const fetchAppts = async () => {
        setLoading(true);
        setFetchError("");
        try {
            const [ar, pr] = await Promise.all([
                fetch("/api/appointments", { cache: "no-store" }),
                fetch("/api/patients", { cache: "no-store" }),
            ]);

            const apptsData = await ar.json();
            if (!ar.ok) {
                throw new Error(apptsData.error || "Failed to load appointments");
            }
            setAppts(Array.isArray(apptsData) ? apptsData : []);

            const patsData = await pr.json();
            if (!pr.ok) {
                throw new Error(patsData.error || "Failed to load patients");
            }
            const pats = Array.isArray(patsData) ? patsData : [];
            setPatients(pats.map((p: any) => ({ id: p.patientId ?? p.id, name: p.name, disease: p.disease, riskLevel: p.riskLevel })));
        } catch (e: any) {
            setFetchError(e.message || "An unexpected error occurred");
            setAppts([]);
            setPatients([]);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAppts(); }, []);

    const changeStatus = async (appointmentId: string, status: string) => {
        setSavingId(appointmentId);
        try {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update appointment status");
            }
            await fetchAppts();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSavingId(null);
        }
    };

    const prevMonth = () => { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); };
    const nextMonth = () => { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); };

    const apptsByDate = (Array.isArray(appointments) ? appointments : []).reduce<Record<string, Appointment[]>>((acc, a) => {
        acc[a.date] = [...(acc[a.date] || []), a]; return acc;
    }, {});

    const selectedAppts = apptsByDate[selectedDate] || [];
    const upcoming = (Array.isArray(appointments) ? appointments : []).filter(a => a.date >= today && a.status !== "Cancelled");

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between page-header">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Appointments</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>
                        {loading ? "Loading…" : `${appointments.length} total · ${upcoming.length} upcoming`}
                    </p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white btn-primary">
                    <Plus size={14} /> Book Appointment
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3" style={{ color: "#8898aa" }}>
                    <Loader2 size={22} className="spin" /> <span className="text-sm">Loading appointments…</span>
                </div>
            ) : (
                <div className="p-6 space-y-5">
                    {fetchError && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm"
                            style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}>
                            <AlertTriangle size={15} className="shrink-0" />
                            <div>
                                <p className="font-semibold">Database Connection Error</p>
                                <p className="text-xs mt-0.5 opacity-80">{fetchError}</p>
                            </div>
                            <button className="ml-auto text-xs underline shrink-0" onClick={fetchAppts}>Retry</button>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="col-span-2 rounded-2xl border p-5" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <div className="flex items-center justify-between mb-5">
                            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100"><ChevronLeft size={16} style={{ color: "#64748b" }} /></button>
                            <h2 className="text-base font-bold" style={{ color: "#1a1f36" }}>{MONTHS[calMonth]} {calYear}</h2>
                            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100"><ChevronRight size={16} style={{ color: "#64748b" }} /></button>
                        </div>
                        <div className="grid grid-cols-7 mb-2">
                            {DAYS_IN_WEEK.map(d => <p key={d} className="text-center text-xs font-semibold py-1" style={{ color: "#94a3b8" }}>{d}</p>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: getFirstDay(calYear, calMonth) }).map((_, i) => <div key={`e${i}`} />)}
                            {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const dayAppts = apptsByDate[dateStr] || [];
                                const isToday = dateStr === today;
                                const isSelected = dateStr === selectedDate;
                                return (
                                    <button key={day} onClick={() => setSelectedDate(dateStr)}
                                        className="relative flex flex-col items-center py-2 rounded-xl transition-all"
                                        style={{
                                            background: isSelected ? "#4c6ef5" : isToday ? "#eef2ff" : "transparent",
                                            color: isSelected ? "#fff" : isToday ? "#4c6ef5" : "#1a1f36"
                                        }}>
                                        <span className="text-sm font-medium">{day}</span>
                                        {dayAppts.length > 0 && (
                                            <div className="flex gap-0.5 mt-0.5">
                                                {dayAppts.slice(0, 3).map((a, di) => (
                                                    <div key={di} className="w-1.5 h-1.5 rounded-full"
                                                        style={{ background: isSelected ? "#fff" : a.riskLevel === "High" ? "#c92a2a" : a.riskLevel === "Medium" ? "#e67700" : "#2f9e44" }} />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: "1px solid #e2e8f0" }}>
                            {[{ color: "#c92a2a", label: "High Risk" }, { color: "#e67700", label: "Medium" }, { color: "#2f9e44", label: "Low Risk" }].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                                    <p className="text-xs" style={{ color: "#64748b" }}>{l.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Appointments for selected date */}
                    <div className="rounded-2xl border p-4 overflow-y-auto max-h-[480px]" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={14} style={{ color: "#4c6ef5" }} />
                            <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>
                                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                        </div>
                        {selectedAppts.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar size={40} style={{ color: "#cbd5e0" }} className="mx-auto mb-2" />
                                <p className="text-xs" style={{ color: "#94a3b8" }}>No appointments — click to add</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedAppts.map(a => {
                                    const dc = diseaseColor[a.disease] ?? { color: "#64748b", bg: "#f1f5f9" };
                                    const sc = statusConfig[a.status];
                                    return (
                                        <div key={a.appointmentId} className="rounded-xl p-3 border" style={{ borderColor: "#e2e8f0" }}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: dc.bg, color: dc.color }}>
                                                        {a.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold" style={{ color: "#1a1f36" }}>{a.patientName}</p>
                                                        <p className="text-xs" style={{ color: "#94a3b8" }}>{a.patientId}</p>
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}>
                                                    {sc.icon} {a.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs" style={{ color: "#64748b" }}>{a.type}</p>
                                                <div className="flex items-center gap-1 text-xs" style={{ color: "#4c6ef5" }}>
                                                    <Clock size={10} />{a.time}
                                                </div>
                                            </div>
                                            {/* Quick status buttons */}
                                            {a.status !== "Completed" && a.status !== "Cancelled" && (
                                                <div className="flex gap-2 mt-2">
                                                    {a.status === "Pending" && (
                                                        <button onClick={() => changeStatus(a.appointmentId, "Confirmed")}
                                                            disabled={savingId === a.appointmentId}
                                                            className="text-xs px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4c6ef5" }}>
                                                            Confirm
                                                        </button>
                                                    )}
                                                    <button onClick={() => changeStatus(a.appointmentId, "Completed")}
                                                        disabled={savingId === a.appointmentId}
                                                        className="text-xs px-2 py-1 rounded-lg" style={{ background: "#d3f9d8", color: "#2f9e44" }}>
                                                        Complete
                                                    </button>
                                                    <button onClick={() => changeStatus(a.appointmentId, "Cancelled")}
                                                        disabled={savingId === a.appointmentId}
                                                        className="text-xs px-2 py-1 rounded-lg" style={{ background: "#ffe3e3", color: "#c92a2a" }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Upcoming list */}
                    <div className="col-span-3">
                        <h3 className="text-sm font-bold mb-3" style={{ color: "#1a1f36" }}>All Upcoming Appointments</h3>
                        <div className="space-y-2">
                            {upcoming.length === 0 ? (
                                <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>No upcoming appointments.</p>
                            ) : upcoming.map(a => {
                                const dc = diseaseColor[a.disease] ?? { color: "#64748b", bg: "#f1f5f9" };
                                const sc = statusConfig[a.status];
                                return (
                                    <div key={a.appointmentId} className="flex items-center gap-4 px-4 py-3 rounded-xl border"
                                        style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: dc.bg, color: dc.color }}>
                                            {a.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold" style={{ color: "#1a1f36" }}>{a.patientName}</p>
                                            <p className="text-xs" style={{ color: "#64748b" }}>{a.type} · {a.patientId}</p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: dc.bg, color: dc.color }}>
                                            {DiseaseIcon[a.disease]} {a.disease}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold" style={{ color: "#1a1f36" }}>
                                                {new Date(a.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {a.time}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: sc.bg, color: sc.color }}>
                                            {sc.icon} {a.status}
                                        </span>
                                        {a.status !== "Completed" && a.status !== "Cancelled" && (
                                            <button onClick={() => changeStatus(a.appointmentId, "Completed")}
                                                disabled={savingId === a.appointmentId}
                                                className="text-xs px-2 py-1 rounded-lg" style={{ background: "#d3f9d8", color: "#2f9e44" }}>
                                                {savingId === a.appointmentId ? "…" : "Done"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            )}

            {showModal && <BookModal patients={patients} onClose={() => setShowModal(false)} onBooked={fetchAppts} />}
        </div>
    );
}
