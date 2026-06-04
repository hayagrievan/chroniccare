"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import {
    Users, AlertTriangle, Stethoscope, MapPin, TrendingUp,
    AlertCircle, ChevronDown, Activity, RefreshCw, Loader2,
} from "lucide-react";

const COLORS = { Heart: "#ff4d4f", BP: "#7c3aed", Sugar: "#faad14", Stress: "#0052cc" };

interface RegionalData {
    total: number;
    byDisease: { _id: string; count: number }[];
    byRisk: { _id: string; count: number }[];
    byState: { _id: string; count: number }[];
    byCity: { _id: string; count: number }[];
    avgMetrics: { avgHR: number; avgSBP: number; avgChol: number; avgHba1c: number; avgBMI: number };
    byGender: { _id: string; count: number }[];
    ageGroups: { _id: number; count: number }[];
    diseaseRisk: { _id: { disease: string; risk: string }; count: number }[];
    rows: any[];
    filters: { states: string[]; cities: string[]; diseases: string[]; riskLevels: string[] };
}

function StatCard({ icon, label, value, change, c }: { icon: React.ReactNode; label: string; value: string; change: string; c: string }) {
    return (
        <div className={`${c} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.2)" }}>{icon}</div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.2)" }}>{change}</span>
                </div>
                <p className="text-3xl font-black">{value}</p>
                <p className="text-sm text-white/80 mt-1">{label}</p>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl p-3 shadow-xl border text-xs" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <p className="font-bold mb-2" style={{ color: "#0a2540" }}>{label}</p>
            {payload.map((e: any) => (
                <div key={e.name} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    <span style={{ color: "#64748b" }}>{e.name}:</span>
                    <span className="font-semibold" style={{ color: "#0a2540" }}>{(e.value || 0).toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

function FilterSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
    return (
        <div className="relative">
            <select value={value} onChange={e => onChange(e.target.value)}
                className="appearance-none pr-8 pl-3 py-2 text-sm rounded-xl border cursor-pointer outline-none font-medium"
                style={{ borderColor: "#b3d1ff", background: "#e6f0ff", color: "#0052cc" }}>
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#0052cc" }} />
        </div>
    );
}

export default function AdminDashboard() {
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [disease, setDisease] = useState("");
    const [riskLevel, setRisk] = useState("");
    const [data, setData] = useState<RegionalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (state) params.set("state", state);
        if (city) params.set("city", city);
        if (disease) params.set("disease", disease);
        if (riskLevel) params.set("riskLevel", riskLevel);
        try {
            const res = await fetch(`/api/regional?${params}`, { cache: "no-store" });
            const d = await res.json();
            setData(d);
            setLastUpdated(new Date().toLocaleTimeString("en-IN"));
        } finally { setLoading(false); }
    }, [state, city, disease, riskLevel]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // When state changes, clear city filter
    const handleStateChange = (v: string) => { setState(v); setCity(""); };

    // Build chart-friendly disease data from API
    const diseaseBarData = data?.byState?.slice(0, 8).map(s => {
        const row: any = { region: s._id };
        // We don't have per-state per-disease split in this facet — show state count breakdown
        row.Count = s.count;
        return row;
    }) ?? [];

    const diseasePieData = data?.byDisease?.map(d => ({
        name: d._id, value: d.count,
        color: (COLORS as any)[d._id] ?? "#94a3b8",
    })) ?? [];

    const riskBarData = data?.byRisk?.map(r => ({
        risk: r._id, count: r.count,
        fill: r._id === "High" ? "#ff4d4f" : r._id === "Medium" ? "#faad14" : "#52c41a",
    })) ?? [];

    const cityData = data?.byCity?.slice(0, 8).map(c => ({ city: c._id, patients: c.count })) ?? [];

    const highRisk = data?.byRisk?.find(r => r._id === "High")?.count ?? 0;
    const criticalDisease = data?.byDisease?.[0]?._id ?? "—";

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <div>
                    <h1 className="text-xl font-bold" style={{ color: "#0a2540" }}>Government Health Analytics</h1>
                    <p className="text-sm" style={{ color: "#64748b" }}>Regional Disease Surveillance · 1,000-patient Excel dataset</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: "#f1f5f9", color: "#64748b" }}>
                        <RefreshCw size={12} className={loading ? "spin" : ""} />
                        {lastUpdated ? `Updated: ${lastUpdated}` : "Loading…"}
                    </button>
                    {highRisk > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse"
                            style={{ background: "#fff1f0", color: "#ff4d4f", border: "1px solid #ffccc7" }}>
                            <AlertCircle size={12} /> {highRisk.toLocaleString("en-IN")} High-Risk Patients
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard icon={<Users size={20} />} label="Total Patients Monitored" value={(data?.total ?? 0).toLocaleString("en-IN")} change="Excel dataset" c="stat-card-blue" />
                    <StatCard icon={<AlertTriangle size={20} />} label="High-Risk Patients" value={highRisk.toLocaleString("en-IN")} change={`${data ? ((highRisk / data.total) * 100).toFixed(1) : 0}%`} c="stat-card-red" />
                    <StatCard icon={<Stethoscope size={20} />} label="Top Disease" value={criticalDisease} change="Most cases" c="stat-card-green" />
                    <StatCard icon={<Activity size={20} />} label="Districts / Cities" value={(data?.filters?.cities?.length ?? 0).toString()} change="Unique cities" c="stat-card-purple" />
                </div>

                {/* Filters: Regional Health Insights */}
                <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={18} style={{ color: "#0052cc" }} />
                            <h2 className="text-base font-bold" style={{ color: "#0a2540" }}>Regional Health Insights</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#e6f0ff", color: "#0052cc" }}>
                                Live from DB
                            </span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <FilterSelect value={state} onChange={handleStateChange} options={data?.filters?.states ?? []} placeholder="All States" />
                            <FilterSelect value={city} onChange={setCity} options={data?.filters?.cities ?? []} placeholder="All Cities" />
                            <FilterSelect value={disease} onChange={setDisease} options={data?.filters?.diseases ?? []} placeholder="All Diseases" />
                            <FilterSelect value={riskLevel} onChange={setRisk} options={data?.filters?.riskLevels ?? []} placeholder="All Risk Levels" />
                            {(state || city || disease || riskLevel) && (
                                <button onClick={() => { setState(""); setCity(""); setDisease(""); setRisk(""); }}
                                    className="px-3 py-2 text-xs rounded-xl font-semibold"
                                    style={{ background: "#fff1f0", color: "#ff4d4f" }}>
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-3" style={{ color: "#8898aa" }}>
                            <Loader2 size={18} className="spin" /> <span className="text-sm">Loading regional data…</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Disease distribution pie */}
                            <div>
                                <p className="text-xs font-bold mb-3" style={{ color: "#64748b" }}>DISEASE DISTRIBUTION</p>
                                <div className="flex items-center gap-6">
                                    <ResponsiveContainer width={160} height={160}>
                                        <PieChart>
                                            <Pie data={diseasePieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                                                {diseasePieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                            </Pie>
                                            {/* <Tooltip formatter={(v: any) => [v.toLocaleString(), ""]} /> */}
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2">
                                        {diseasePieData.map(d => (
                                            <div key={d.name} className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                                    <span className="text-sm font-medium" style={{ color: "#374151" }}>{d.name}</span>
                                                </div>
                                                <span className="text-sm font-bold" style={{ color: d.color }}>{d.value.toLocaleString("en-IN")}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Risk breakdown bar */}
                            <div>
                                <p className="text-xs font-bold mb-3" style={{ color: "#64748b" }}>RISK LEVEL BREAKDOWN</p>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={riskBarData} barCategoryGap="30%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="risk" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {riskBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Top States */}
                    <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <h3 className="font-bold text-sm mb-1" style={{ color: "#0a2540" }}>Top States by Patient Load</h3>
                        <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>Active filter: {state || "All states"}</p>
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 size={18} className="spin" style={{ color: "#94a3b8" }} /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data?.byState?.slice(0, 8).map(s => ({ state: s._id.slice(0, 10), count: s.count })) ?? []} barCategoryGap="25%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="state" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#0052cc" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Top Cities */}
                    <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                        <h3 className="font-bold text-sm mb-1" style={{ color: "#0a2540" }}>Top Cities by Patient Count</h3>
                        <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>Active filter: {city || "All cities"} · {state || "All states"}</p>
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 size={18} className="spin" style={{ color: "#94a3b8" }} /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={cityData.map(c => ({ city: c.city.slice(0, 10), patients: c.patients }))} barCategoryGap="25%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="city" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="patients" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Patient table */}
                <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-sm" style={{ color: "#0a2540" }}>Patient Records</h3>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>Showing up to 200 matching records (total: {data?.total ?? 0})</p>
                        </div>
                    </div>
                    <div className="overflow-auto rounded-xl border" style={{ borderColor: "#e2e8f0", maxHeight: 320 }}>
                        <table className="w-full text-xs">
                            <thead className="sticky top-0" style={{ background: "#f8fafc" }}>
                                <tr>
                                    {["Patient ID", "Age", "Gender", "Disease", "Risk", "State", "City", "Heart Rate", "Systolic BP", "HbA1c", "BMI"].map(h => (
                                        <th key={h} className="px-3 py-2.5 text-left font-semibold whitespace-nowrap" style={{ color: "#64748b" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(data?.rows ?? []).map((r: any, i: number) => (
                                    <tr key={r.patientId} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                                        <td className="px-3 py-2 font-medium" style={{ color: "#4c6ef5" }}>{r.patientId}</td>
                                        <td className="px-3 py-2" style={{ color: "#64748b" }}>{r.age}</td>
                                        <td className="px-3 py-2" style={{ color: "#64748b" }}>{r.gender}</td>
                                        <td className="px-3 py-2">
                                            <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: ((COLORS as any)[r.disease] ?? "#94a3b8") + "20", color: (COLORS as any)[r.disease] ?? "#64748b" }}>
                                                {r.disease}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="px-2 py-0.5 rounded-full font-semibold"
                                                style={{
                                                    background: r.riskLevel === "High" ? "#fff1f0" : r.riskLevel === "Medium" ? "#fffbe6" : "#f6ffed",
                                                    color: r.riskLevel === "High" ? "#ff4d4f" : r.riskLevel === "Medium" ? "#faad14" : "#52c41a"
                                                }}>
                                                {r.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2" style={{ color: "#64748b" }}>{r.state}</td>
                                        <td className="px-3 py-2" style={{ color: "#64748b" }}>{r.city}</td>
                                        <td className="px-3 py-2 font-medium" style={{ color: "#1a1f36" }}>{r.heartRate}</td>
                                        <td className="px-3 py-2 font-medium" style={{ color: r.systolicBP > 140 ? "#ff4d4f" : "#1a1f36" }}>{r.systolicBP}</td>
                                        <td className="px-3 py-2 font-medium" style={{ color: r.hba1c > 6.5 ? "#faad14" : "#1a1f36" }}>{r.hba1c}</td>
                                        <td className="px-3 py-2 font-medium" style={{ color: r.bmi > 30 ? "#ff4d4f" : "#1a1f36" }}>{r.bmi}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Avg Metrics row */}
                {data?.avgMetrics && (
                    <div className="grid grid-cols-5 gap-3">
                        {[
                            { label: "Avg Heart Rate", val: data.avgMetrics.avgHR?.toFixed(0), unit: "bpm", warn: 90 },
                            { label: "Avg Systolic BP", val: data.avgMetrics.avgSBP?.toFixed(0), unit: "mmHg", warn: 130 },
                            { label: "Avg Cholesterol", val: data.avgMetrics.avgChol?.toFixed(0), unit: "mg/dL", warn: 200 },
                            { label: "Avg HbA1c", val: data.avgMetrics.avgHba1c?.toFixed(1), unit: "%", warn: 6.5 },
                            { label: "Avg BMI", val: data.avgMetrics.avgBMI?.toFixed(1), unit: "", warn: 25 },
                        ].map(m => (
                            <div key={m.label} className="rounded-2xl p-4 border text-center" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                                <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>{m.label}</p>
                                <p className="text-2xl font-black" style={{ color: parseFloat(m.val ?? "0") > m.warn ? "#ff4d4f" : "#4c6ef5" }}>
                                    {m.val}<span className="text-sm font-normal ml-1" style={{ color: "#94a3b8" }}>{m.unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
