"use client";

import { useState, useEffect } from "react";
import { X, Search, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { mockPatients, Patient } from "@/lib/mockData";

interface SwitchDoctorModalProps {
    onClose: () => void;
    onTransfer: (patient: Patient) => void;
}

export default function SwitchDoctorModal({ onClose, onTransfer }: SwitchDoctorModalProps) {
    const [patientId, setPatientId] = useState("");
    const [allPatients, setAllPatients] = useState<Patient[]>(mockPatients);
    const [searchResult, setSearchResult] = useState<Patient | null | undefined>(undefined);
    const [transferred, setTransferred] = useState(false);

    useEffect(() => {
        const fetchAllPatients = async () => {
            try {
                const res = await fetch("/api/patients", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setAllPatients(data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch all patients:", err);
            }
        };
        fetchAllPatients();
    }, []);

    const handleSearch = () => {
        const found = allPatients.find(
            (p) => p.id.toLowerCase() === patientId.trim().toLowerCase()
        );
        setSearchResult(found || null);
        setTransferred(false);
    };

    const handleTransfer = () => {
        if (searchResult) {
            onTransfer(searchResult);
            setTransferred(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ background: "rgba(10, 37, 64, 0.6)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl fade-in"
                style={{ background: "#fff" }}
            >
                {/* Header */}
                <div
                    className="px-6 py-5 rounded-t-2xl"
                    style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                                <UserPlus size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Transfer Patient Records</h3>
                                <p className="text-xs text-white/70">Move patient to your care list</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X size={16} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: "#64748b" }}>
                            PATIENT UNIQUE ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="e.g. PAT-001, PAT-002..."
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                                style={{
                                    borderColor: "#e2e8f0",
                                    background: "#f8fafc",
                                    color: "#0a2540",
                                }}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={!patientId.trim()}
                                className="px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}
                            >
                                <Search size={16} />
                            </button>
                        </div>
                        <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                            Hint: Try PAT-001 through PAT-006
                        </p>
                    </div>

                    {/* Search Result */}
                    {searchResult === null && (
                        <div
                            className="flex items-center gap-3 rounded-xl p-4 fade-in"
                            style={{ background: "#fff1f0", border: "1px solid #ffccc7" }}
                        >
                            <AlertCircle size={16} style={{ color: "#ff4d4f" }} />
                            <p className="text-sm font-medium" style={{ color: "#ff4d4f" }}>
                                No patient found with ID &quot;{patientId}&quot;
                            </p>
                        </div>
                    )}

                    {searchResult && !transferred && (
                        <div
                            className="rounded-xl border fade-in overflow-hidden"
                            style={{ borderColor: "#b3d1ff" }}
                        >
                            <div className="px-4 py-2" style={{ background: "#e6f0ff" }}>
                                <p className="text-xs font-semibold" style={{ color: "#0052cc" }}>PATIENT FOUND</p>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                                            style={{ background: "#e6f0ff", color: "#0052cc" }}
                                        >
                                            {searchResult.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: "#0a2540" }}>{searchResult.name}</p>
                                            <p className="text-xs" style={{ color: "#64748b" }}>
                                                {searchResult.age}y · {searchResult.gender} · {searchResult.disease}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="text-xs px-2 py-1 rounded-full font-bold"
                                        style={{
                                            background: searchResult.riskLevel === "High" ? "#fff1f0" : searchResult.riskLevel === "Medium" ? "#fffbe6" : "#f6ffed",
                                            color: searchResult.riskLevel === "High" ? "#ff4d4f" : searchResult.riskLevel === "Medium" ? "#faad14" : "#52c41a",
                                        }}
                                    >
                                        {searchResult.riskLevel} Risk
                                    </span>
                                </div>
                                <div className="text-xs space-y-1" style={{ color: "#64748b" }}>
                                    <p>Current Doctor: <span className="font-medium" style={{ color: "#0a2540" }}>{searchResult.assignedDoctor}</span></p>
                                    <p>Last Visit: <span className="font-medium" style={{ color: "#0a2540" }}>{searchResult.lastVisit}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {transferred && (
                        <div
                            className="flex items-center gap-3 rounded-xl p-4 fade-in"
                            style={{ background: "#f6ffed", border: "1px solid #b7eb8f" }}
                        >
                            <CheckCircle size={16} style={{ color: "#52c41a" }} />
                            <p className="text-sm font-medium" style={{ color: "#52c41a" }}>
                                Records transferred successfully to Dr. Priya Nair!
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTransfer}
                        disabled={!searchResult || transferred}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #0052cc, #1a73e8)" }}
                    >
                        {transferred ? "✓ Transferred" : "Transfer Records"}
                    </button>
                </div>
            </div>
        </div>
    );
}
