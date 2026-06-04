"use client";

import { useState, useEffect } from "react";
import { mockPatients, Patient, phrnRegistry } from "@/lib/mockData";
import PatientCard from "./PatientCard";
import PatientDetail from "./PatientDetail";
import SwitchDoctorModal from "./SwitchDoctorModal";
import {
    Search,
    Filter,
    UserPlus,
    Bell,
    ChevronDown,
    AlertTriangle,
    Brain,
    Shield,
} from "lucide-react";

export default function DoctorDashboard() {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRisk, setFilterRisk] = useState<"All" | "High" | "Medium" | "Low">("All");
    const [filterDisease, setFilterDisease] = useState("All");
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [patients, setPatients] = useState<Patient[]>(mockPatients);

    useEffect(() => {
        const syncPatients = async () => {
            try {
                const res = await fetch("/api/patients", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setPatients(data);
                    }
                }
            } catch (err) {
                console.error("Failed to sync patients:", err);
            }
        };
        syncPatients();
    }, []);

    const filtered = patients.filter((p) => {
        const phrnEntry = phrnRegistry.find(r => r.patientId === p.id);
        const matchSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (phrnEntry?.phrn || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchRisk = filterRisk === "All" || p.riskLevel === filterRisk;
        const matchDisease = filterDisease === "All" || p.disease === filterDisease;
        return matchSearch && matchRisk && matchDisease;
    });

    const highRiskCount = patients.filter((p) => p.riskLevel === "High").length;

    return (
        <div className="flex h-full">
            {/* Left Panel - Patient List */}
            <div
                className={`flex flex-col h-full transition-all duration-300 ${selectedPatient ? "w-80 min-w-80" : "w-full"
                    }`}
                style={{ borderRight: selectedPatient ? "1px solid #e2e8f0" : "none" }}
            >
                {/* Header */}
                <div className="px-6 py-5 page-header">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: "#1a1f36" }}>
                                Patient Overview
                            </h1>
                            <p className="text-sm" style={{ color: "#64748b" }}>
                                {patients.length} patients assigned · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {highRiskCount > 0 && (
                                <div
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold pulse-alert"
                                    style={{ background: "#ffe3e3", color: "#c92a2a", border: "1px solid #ffa8a8" }}
                                >
                                    <AlertTriangle size={12} />
                                    {highRiskCount} High Risk
                                </div>
                            )}
                            <button
                                onClick={() => setShowSwitchModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #4c6ef5, #748ffc)" }}
                            >
                                <UserPlus size={14} />
                                Transfer
                            </button>
                            <button className="relative p-2 rounded-lg" style={{ background: "#f1f5f9" }}>
                                <Bell size={16} style={{ color: "#64748b" }} />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#ff4d4f" }}></span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or PHRN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border outline-none transition-all"
                            style={{
                                borderColor: "#e2e8f0",
                                background: "#f8fafc",
                                color: "#0a2540",
                            }}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value as any)}
                                className="w-full appearance-none px-3 py-2 text-xs rounded-lg border cursor-pointer outline-none"
                                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                            >
                                <option value="All">All Risk Levels</option>
                                <option value="High">High Risk</option>
                                <option value="Medium">Medium Risk</option>
                                <option value="Low">Low Risk</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94a3b8" }} />
                        </div>
                        <div className="relative flex-1">
                            <select
                                value={filterDisease}
                                onChange={(e) => setFilterDisease(e.target.value)}
                                className="w-full appearance-none px-3 py-2 text-xs rounded-lg border cursor-pointer outline-none"
                                style={{ borderColor: "#e2e8f0", background: "#f8fafc", color: "#0a2540" }}
                            >
                                <option value="All">All Conditions</option>
                                <option value="Heart">Heart</option>
                                <option value="BP">Blood Pressure</option>
                                <option value="Sugar">Diabetes</option>
                                <option value="Stress">Stress</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94a3b8" }} />
                        </div>
                    </div>
                </div>

                {/* Patient Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Filter size={48} style={{ color: "#cbd5e0" }} className="mx-auto mb-3" />
                            <p className="text-sm font-medium" style={{ color: "#64748b" }}>No patients match your filters</p>
                        </div>
                    ) : (
                        filtered.map((patient) => (
                            <PatientCard
                                key={patient.id}
                                patient={patient}
                                isSelected={selectedPatient?.id === patient.id}
                                onClick={() =>
                                    setSelectedPatient(
                                        selectedPatient?.id === patient.id ? null : patient
                                    )
                                }
                                compact={!!selectedPatient}
                            />
                        ))
                    )}
                </div>

                {/* Footer Stats */}
                <div
                    className="px-4 py-3 flex justify-around text-center"
                    style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}
                >
                    <div>
                        <p className="text-lg font-bold" style={{ color: "#c92a2a" }}>{patients.filter((p) => p.riskLevel === "High").length}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>High Risk</p>
                    </div>
                    <div style={{ borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }} className="px-6">
                        <p className="text-lg font-bold" style={{ color: "#e67700" }}>{patients.filter((p) => p.riskLevel === "Medium").length}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>Medium Risk</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold" style={{ color: "#2f9e44" }}>{patients.filter((p) => p.riskLevel === "Low").length}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>Low Risk</p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Patient Detail */}
            {selectedPatient && (
                <div className="flex-1 overflow-hidden fade-in">
                    <PatientDetail
                        patient={selectedPatient}
                        onClose={() => setSelectedPatient(null)}
                    />
                </div>
            )}

            {showSwitchModal && (
                <SwitchDoctorModal
                    onClose={() => setShowSwitchModal(false)}
                    onTransfer={(patient: Patient) => {
                        if (patient && !patients.find((p) => p.id === patient.id)) {
                            setPatients((prev) => [...prev, patient]);
                        }
                        setShowSwitchModal(false);
                    }}
                />
            )}
        </div>
    );
}
