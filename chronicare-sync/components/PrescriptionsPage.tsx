"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Search, Plus, X, Check, Pill, Send, Clock, Package,
    ChevronDown, Loader2, AlertTriangle, Stethoscope, User,
    FileText, Trash2, ExternalLink, CheckCircle,
} from "lucide-react";

// ── Static Pharmacy Inventory ────────────────────────────────────────────────
// In production this would be fetched from the pharmacy service API
const PHARMACY_INVENTORY = [
    // Cardiac
    { id: "MED-001", name: "Aspirin", category: "Cardiac", form: "Tablet", strength: "75 mg", stock: 850 },
    { id: "MED-002", name: "Atorvastatin", category: "Cardiac", form: "Tablet", strength: "20 mg", stock: 420 },
    { id: "MED-003", name: "Metoprolol", category: "Cardiac", form: "Tablet", strength: "50 mg", stock: 310 },
    { id: "MED-004", name: "Ramipril", category: "Cardiac", form: "Tablet", strength: "5 mg", stock: 290 },
    { id: "MED-005", name: "Clopidogrel", category: "Cardiac", form: "Tablet", strength: "75 mg", stock: 185 },
    { id: "MED-006", name: "Nitroglycerin", category: "Cardiac", form: "Spray", strength: "0.4 mg", stock: 60 },
    // Hypertension
    { id: "MED-007", name: "Amlodipine", category: "Hypertension", form: "Tablet", strength: "5 mg", stock: 640 },
    { id: "MED-008", name: "Telmisartan", category: "Hypertension", form: "Tablet", strength: "40 mg", stock: 380 },
    { id: "MED-009", name: "Hydrochlorothiazide", category: "Hypertension", form: "Tablet", strength: "25 mg", stock: 500 },
    { id: "MED-010", name: "Losartan", category: "Hypertension", form: "Tablet", strength: "50 mg", stock: 275 },
    // Diabetes
    { id: "MED-011", name: "Metformin", category: "Diabetes", form: "Tablet", strength: "500 mg", stock: 720 },
    { id: "MED-012", name: "Glipizide", category: "Diabetes", form: "Tablet", strength: "5 mg", stock: 290 },
    { id: "MED-013", name: "Insulin Glargine", category: "Diabetes", form: "Injection", strength: "100 U/mL", stock: 80 },
    { id: "MED-014", name: "Sitagliptin", category: "Diabetes", form: "Tablet", strength: "100 mg", stock: 160 },
    { id: "MED-015", name: "Empagliflozin", category: "Diabetes", form: "Tablet", strength: "10 mg", stock: 120 },
    // Stress / Mental Health
    { id: "MED-016", name: "Escitalopram", category: "Stress", form: "Tablet", strength: "10 mg", stock: 340 },
    { id: "MED-017", name: "Alprazolam", category: "Stress", form: "Tablet", strength: "0.25 mg", stock: 180 },
    { id: "MED-018", name: "Buspirone", category: "Stress", form: "Tablet", strength: "10 mg", stock: 220 },
    { id: "MED-019", name: "Clonazepam", category: "Stress", form: "Tablet", strength: "0.5 mg", stock: 95 },
    // General
    { id: "MED-020", name: "Pantoprazole", category: "General", form: "Tablet", strength: "40 mg", stock: 600 },
    { id: "MED-021", name: "Vitamin D3", category: "General", form: "Capsule", strength: "60,000 IU", stock: 450 },
    { id: "MED-022", name: "Paracetamol", category: "General", form: "Tablet", strength: "500 mg", stock: 900 },
];

const FREQ_OPTIONS = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "At bedtime", "As needed"];
const DUR_OPTIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months", "Ongoing"];
const DOSAGE_OPTIONS = ["1 tablet", "2 tablets", "½ tablet", "1 capsule", "1 injection", "2 puffs", "5 mL", "10 mL"];

const CAT_COLOR: Record<string, { bg: string; color: string }> = {
    Cardiac: { bg: "#ffe3e3", color: "#c92a2a" },
    Hypertension: { bg: "#f3f0ff", color: "#6741d9" },
    Diabetes: { bg: "#fff3bf", color: "#e67700" },
    Stress: { bg: "#c5f6fa", color: "#0c8599" },
    General: { bg: "#f1f5f9", color: "#475569" },
};

interface PrescriptionItem {
    medicineId: string; medicineName: string; strength: string; form: string;
    dosage: string; frequency: string; duration: string; quantity: number; instructions: string;
}

interface Patient { id: string; patientId?: string; name: string; disease: string; riskLevel: string; }

interface SavedRx {
    prescriptionId: string; patientName: string; disease: string;
    items: PrescriptionItem[]; diagnosis: string; status: string;
    pharmacyShared: boolean; createdAt: string; doctorName: string;
}

// ── Medicine Card in inventory ───────────────────────────────────────────────
function MedCard({ med, onAdd, alreadyAdded }: { med: typeof PHARMACY_INVENTORY[0]; onAdd: () => void; alreadyAdded: boolean }) {
    const cc = CAT_COLOR[med.category] ?? CAT_COLOR.General;
    const lowStock = med.stock < 100;
    return (
        <button onClick={onAdd} disabled={alreadyAdded}
            className="w-full text-left rounded-xl p-3 border transition-all hover:shadow-md disabled:opacity-50 group"
            style={{ background: "#fff", borderColor: alreadyAdded ? "#22c55e" : "#e2e8f0" }}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: cc.bg, color: cc.color }}>
                    {med.category}
                </span>
                {alreadyAdded
                    ? <CheckCircle size={14} style={{ color: "#22c55e" }} />
                    : <Plus size={14} style={{ color: "#4c6ef5" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
            <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>{med.name}</p>
            <p className="text-xs" style={{ color: "#64748b" }}>{med.strength} · {med.form}</p>
            <div className="flex items-center gap-1 mt-2">
                <Package size={10} style={{ color: lowStock ? "#e67700" : "#22c55e" }} />
                <span className="text-xs font-semibold" style={{ color: lowStock ? "#e67700" : "#22c55e" }}>
                    {med.stock} in stock
                </span>
            </div>
        </button>
    );
}

// ── Prescription Line Item ───────────────────────────────────────────────────
function RxItem({ item, onChange, onRemove }: { item: PrescriptionItem; onChange: (f: string, v: string | number) => void; onRemove: () => void }) {
    return (
        <div className="rounded-xl border p-3 space-y-2" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Pill size={14} style={{ color: "#4c6ef5" }} />
                    <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>{item.medicineName}</p>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>{item.strength} · {item.form}</span>
                </div>
                <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-50">
                    <Trash2 size={13} style={{ color: "#ef4444" }} />
                </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#64748b" }}>Dosage</label>
                    <select value={item.dosage} onChange={e => onChange("dosage", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none"
                        style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1a1f36" }}>
                        {DOSAGE_OPTIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#64748b" }}>Frequency</label>
                    <select value={item.frequency} onChange={e => onChange("frequency", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none"
                        style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1a1f36" }}>
                        {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#64748b" }}>Duration</label>
                    <select value={item.duration} onChange={e => onChange("duration", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none"
                        style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1a1f36" }}>
                        {DUR_OPTIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "#64748b" }}>Qty</label>
                    <input type="number" min={1} max={999} value={item.quantity}
                        onChange={e => onChange("quantity", parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none"
                        style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1a1f36" }} />
                </div>
            </div>
            <input type="text" placeholder="Special instructions (e.g. take after meals)…"
                value={item.instructions} onChange={e => onChange("instructions", e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border text-xs outline-none"
                style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1a1f36" }} />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PrescriptionsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [history, setHistory] = useState<SavedRx[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sent, setSent] = useState(false);
    const [err, setErr] = useState("");

    // Form state
    const [patientId, setPatientId] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [rxItems, setRxItems] = useState<PrescriptionItem[]>([]);
    const [medSearch, setMedSearch] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [histTab, setHistTab] = useState<"all" | "pending" | "dispensed">("all");

    useEffect(() => {
        const load = async () => {
            const [pr, rxr] = await Promise.all([
                fetch("/api/patients", { cache: "no-store" }),
                fetch("/api/prescriptions", { cache: "no-store" }),
            ]);
            const pats = await pr.json();
            setPatients(pats.map((p: any) => ({ id: p.patientId ?? p.id, name: p.name, disease: p.disease, riskLevel: p.riskLevel })));
            const rxRes = await rxr.json();
            if (Array.isArray(rxRes)) setHistory(rxRes);
            setLoading(false);
        };
        load();
    }, []);

    const selectedPatient = patients.find(p => p.id === patientId);

    const filteredMeds = useMemo(() => PHARMACY_INVENTORY.filter(m => {
        const matchSearch = m.name.toLowerCase().includes(medSearch.toLowerCase()) || m.category.toLowerCase().includes(medSearch.toLowerCase());
        const matchCat = catFilter === "All" || m.category === catFilter;
        return matchSearch && matchCat;
    }), [medSearch, catFilter]);

    const addMed = (med: typeof PHARMACY_INVENTORY[0]) => {
        if (rxItems.some(i => i.medicineId === med.id)) return;
        setRxItems(prev => [...prev, {
            medicineId: med.id, medicineName: med.name, strength: med.strength, form: med.form,
            dosage: DOSAGE_OPTIONS[0], frequency: FREQ_OPTIONS[0], duration: DUR_OPTIONS[4],
            quantity: 1, instructions: "",
        }]);
    };

    const updateItem = (idx: number, field: string, val: string | number) => {
        setRxItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
    };

    const removeItem = (idx: number) => setRxItems(prev => prev.filter((_, i) => i !== idx));

    const handleSend = async () => {
        if (!patientId || rxItems.length === 0) {
            setErr("Please select a patient and add at least one medicine."); return;
        }
        setErr(""); setSaving(true);
        try {
            const res = await fetch("/api/prescriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId, patientName: selectedPatient?.name,
                    disease: selectedPatient?.disease,
                    doctorName: "Dr. Priya Nair",
                    items: rxItems, diagnosis, notes,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setHistory(prev => [data, ...prev]);
            setSent(true);
            // Reset form
            setPatientId(""); setDiagnosis(""); setNotes(""); setRxItems([]);
            setTimeout(() => setSent(false), 4000);
        } catch (e: any) { setErr(e.message); }
        finally { setSaving(false); }
    };

    const histFiltered = history.filter(rx => {
        if (histTab === "all") return true;
        if (histTab === "pending") return rx.status === "Pending";
        return rx.status === "Dispensed";
    });

    const categories = ["All", ...Array.from(new Set(PHARMACY_INVENTORY.map(m => m.category)))];

    if (loading) return (
        <div className="flex items-center justify-center h-full gap-3" style={{ color: "#8898aa" }}>
            <Loader2 size={22} className="spin" /> <span className="text-sm">Loading prescriptions…</span>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto" style={{ background: "#f8fafc" }}>
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
                style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>Prescriptions</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>Prescribe medicines · Shared with pharmacy · Saved to database</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "#e6f0ff", color: "#0052cc", border: "1px solid #91caff" }}>
                    <ExternalLink size={11} />
                    Pharmacy Portal: Connected (Static)
                </div>
            </div>

            <div className="p-6 grid grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 73px)" }}>
                {/* ── Left: Pharmacy Inventory ── */}
                <div className="col-span-1 flex flex-col gap-4">
                    <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <div className="px-4 py-3 border-b" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                            <p className="text-xs font-bold tracking-wider" style={{ color: "#64748b" }}>PHARMACY INVENTORY</p>
                            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{PHARMACY_INVENTORY.length} medicines available</p>
                        </div>
                        {/* Search + Category filter */}
                        <div className="p-3 space-y-2">
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                                <input type="text" placeholder="Search medicines…" value={medSearch} onChange={e => setMedSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none"
                                    style={{ borderColor: "#e2e8f0", color: "#1a1f36" }} />
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {categories.map(c => (
                                    <button key={c} onClick={() => setCatFilter(c)}
                                        className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                                        style={{
                                            background: catFilter === c ? "#4c6ef5" : "#f1f5f9",
                                            color: catFilter === c ? "#fff" : "#64748b"
                                        }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-3 pb-3 space-y-2 overflow-y-auto" style={{ maxHeight: 480 }}>
                            {filteredMeds.map(m => (
                                <MedCard key={m.id} med={m} onAdd={() => addMed(m)}
                                    alreadyAdded={rxItems.some(i => i.medicineId === m.id)} />
                            ))}
                            {filteredMeds.length === 0 && (
                                <p className="text-center py-8 text-xs" style={{ color: "#94a3b8" }}>No medicines match your search.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Middle: Write Prescription ── */}
                <div className="col-span-1 flex flex-col gap-4">
                    <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <div className="px-5 py-4 border-b"
                            style={{ borderColor: "#e2e8f0", background: "linear-gradient(135deg, #1a1f36 0%, #0f172a 100%)" }}>
                            <div className="flex items-center gap-2">
                                <Stethoscope size={16} style={{ color: "#818cf8" }} />
                                <p className="text-sm font-bold text-white">Write Prescription</p>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Dr. Priya Nair · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Patient selector */}
                            <div>
                                <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: "#374151" }}>
                                    <User size={12} /> Patient
                                </label>
                                <select value={patientId} onChange={e => setPatientId(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                                    style={{ borderColor: patientId ? "#4c6ef5" : "#e2e8f0", color: "#1a1f36" }}>
                                    <option value="">— Select Patient —</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                                </select>
                                {selectedPatient && (
                                    <div className="mt-2 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                                        style={{ background: "#eef2ff", color: "#4c6ef5" }}>
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4c6ef5" }} />
                                        {selectedPatient.disease} · {selectedPatient.riskLevel} Risk
                                    </div>
                                )}
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: "#374151" }}>Diagnosis / Chief Complaint</label>
                                <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2}
                                    placeholder="e.g. Poorly controlled hypertension with hyperlipidaemia…"
                                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                                    style={{ borderColor: "#e2e8f0", color: "#1a1f36" }} />
                            </div>

                            {/* Rx Items */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Pill size={13} style={{ color: "#4c6ef5" }} />
                                    <label className="text-xs font-bold" style={{ color: "#374151" }}>
                                        Prescribed Medicines ({rxItems.length})
                                    </label>
                                </div>
                                {rxItems.length === 0 ? (
                                    <div className="rounded-xl border-2 border-dashed p-6 text-center"
                                        style={{ borderColor: "#e2e8f0" }}>
                                        <Pill size={28} style={{ color: "#e2e8f0" }} className="mx-auto mb-2" />
                                        <p className="text-xs" style={{ color: "#94a3b8" }}>
                                            Tap a medicine in the inventory to add it here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {rxItems.map((it, idx) => (
                                            <RxItem key={it.medicineId} item={it}
                                                onChange={(f, v) => updateItem(idx, f, v)}
                                                onRemove={() => removeItem(idx)} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: "#374151" }}>Additional Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                    placeholder="Follow-up instructions, dietary advice…"
                                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
                                    style={{ borderColor: "#e2e8f0", color: "#1a1f36" }} />
                            </div>

                            {err && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                                    style={{ background: "#ffe3e3", color: "#c92a2a" }}>
                                    <AlertTriangle size={13} /> {err}
                                </div>
                            )}

                            {sent && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                                    style={{ background: "#d3f9d8", color: "#2f9e44" }}>
                                    <CheckCircle size={13} /> Prescription saved & shared with pharmacy!
                                </div>
                            )}

                            {/* CTA */}
                            <button onClick={handleSend} disabled={saving || rxItems.length === 0 || !patientId}
                                className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                                style={{
                                    background: "linear-gradient(135deg, #4c6ef5 0%, #7c3aed 100%)",
                                    boxShadow: rxItems.length && patientId ? "0 4px 16px rgba(76,110,245,0.4)" : "none",
                                }}>
                                {saving ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                                {saving ? "Sending to Pharmacy…" : "Send Prescription to Pharmacy"}
                            </button>
                            <p className="text-center text-xs" style={{ color: "#94a3b8" }}>
                                Prescription is saved to database and shared with the pharmacy portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Right: History ── */}
                <div className="col-span-1 flex flex-col gap-4">
                    <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <div className="px-4 py-3 border-b" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                            <p className="text-xs font-bold tracking-wider" style={{ color: "#64748b" }}>PRESCRIPTION HISTORY</p>
                            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{history.length} total prescriptions</p>
                        </div>
                        {/* Tabs */}
                        <div className="flex border-b" style={{ borderColor: "#e2e8f0" }}>
                            {(["all", "pending", "dispensed"] as const).map(t => (
                                <button key={t} onClick={() => setHistTab(t)}
                                    className="flex-1 py-2 text-xs font-semibold capitalize transition-all"
                                    style={{
                                        background: histTab === t ? "#eef2ff" : "#fff",
                                        color: histTab === t ? "#4c6ef5" : "#94a3b8",
                                        borderBottom: histTab === t ? "2px solid #4c6ef5" : "none"
                                    }}>
                                    {t} ({
                                        t === "all" ? history.length :
                                            history.filter(r => r.status.toLowerCase() === t).length
                                    })
                                </button>
                            ))}
                        </div>

                        <div className="divide-y overflow-y-auto" style={{ borderColor: "#f1f5f9", maxHeight: 600 }}>
                            {histFiltered.length === 0 ? (
                                <div className="py-12 text-center">
                                    <FileText size={32} style={{ color: "#e2e8f0" }} className="mx-auto mb-2" />
                                    <p className="text-xs" style={{ color: "#94a3b8" }}>No prescriptions yet</p>
                                </div>
                            ) : histFiltered.map(rx => (
                                <div key={rx.prescriptionId} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: "#1a1f36" }}>{rx.patientName}</p>
                                            <p className="text-xs" style={{ color: "#94a3b8" }}>{rx.prescriptionId}</p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                            style={{
                                                background: rx.status === "Dispensed" ? "#d3f9d8" : rx.status === "Cancelled" ? "#ffe3e3" : "#fff3bf",
                                                color: rx.status === "Dispensed" ? "#2f9e44" : rx.status === "Cancelled" ? "#c92a2a" : "#b45309",
                                            }}>
                                            {rx.status}
                                        </span>
                                    </div>
                                    {rx.diagnosis && <p className="text-xs mb-2 italic" style={{ color: "#64748b" }}>{rx.diagnosis}</p>}
                                    <div className="space-y-1">
                                        {rx.items.slice(0, 3).map((it: PrescriptionItem, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "#374151" }}>
                                                <Pill size={10} style={{ color: "#4c6ef5" }} />
                                                <span className="font-medium">{it.medicineName}</span>
                                                <span style={{ color: "#94a3b8" }}>{it.dosage} · {it.frequency}</span>
                                            </div>
                                        ))}
                                        {rx.items.length > 3 && (
                                            <p className="text-xs" style={{ color: "#94a3b8" }}>+{rx.items.length - 3} more medicines</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1 text-xs" style={{ color: "#94a3b8" }}>
                                            <Clock size={10} />{new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </div>
                                        {rx.pharmacyShared && (
                                            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#0052cc" }}>
                                                <ExternalLink size={10} /> Sent to Pharmacy
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
