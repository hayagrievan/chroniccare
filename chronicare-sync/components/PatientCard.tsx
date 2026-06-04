"use client";

import { Patient, adherenceRecords } from "@/lib/mockData";
import { Activity, Heart, Brain, Droplets } from "lucide-react";
import { computeAdherenceScore } from "@/lib/adherenceCalculator";
import { computeHealthScore } from "@/lib/healthScoreEngine";
import { predictRisk } from "@/lib/mlRiskEngine";

interface PatientCardProps {
    patient: Patient;
    isSelected: boolean;
    onClick: () => void;
    compact: boolean;
}

const diseaseConfig = {
    Heart: { icon: Heart, color: "#c92a2a", bg: "#ffe3e3", border: "#ffa8a8", label: "Cardiac" },
    BP: { icon: Activity, color: "#6741d9", bg: "#e5dbff", border: "#b197fc", label: "Hypertension" },
    Sugar: { icon: Droplets, color: "#e67700", bg: "#fff3bf", border: "#ffd43b", label: "Diabetes" },
    Stress: { icon: Brain, color: "#0c8599", bg: "#c5f6fa", border: "#66d9e8", label: "Stress Disorder" },
};

const riskConfig = {
    High: { bg: "#ffe3e3", text: "#c92a2a", border: "#ffa8a8", label: "HIGH RISK" },
    Medium: { bg: "#fff3bf", text: "#e67700", border: "#ffd43b", label: "MEDIUM" },
    Low: { bg: "#d3f9d8", text: "#2f9e44", border: "#8ce99a", label: "LOW RISK" },
};

export default function PatientCard({ patient, isSelected, onClick, compact }: PatientCardProps) {
    const dc = diseaseConfig[patient.disease];
    const DIcon = dc.icon;
    const rc = riskConfig[patient.riskLevel];

    const patientRecords = adherenceRecords.filter(r => r.patientId === patient.id);
    const adherenceScore = computeAdherenceScore(patient.id, patientRecords).overallScore;
    const healthScore = computeHealthScore(patient, adherenceScore).totalScore;
    const riskScore = predictRisk(patient, adherenceScore).riskScore;

    if (compact) {
        return (
            <button onClick={onClick}
                className="w-full text-left rounded-2xl p-3 transition-all duration-200 border card-hover"
                style={{
                    background: isSelected ? dc.bg : "#fff",
                    borderColor: isSelected ? dc.border : "#e8ecf4",
                    boxShadow: isSelected ? `0 0 0 2px ${dc.border}` : "none",
                }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: dc.bg, color: dc.color }}>
                        {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#1a1f36" }}>{patient.name}</p>
                        <p className="text-xs truncate" style={{ color: "#8898aa" }}>{patient.age}y · {dc.label}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0" style={{ fontSize: "9px", background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                        {rc.label}
                    </span>
                </div>
            </button>
        );
    }

    return (
        <button onClick={onClick}
            className="w-full text-left rounded-2xl p-4 transition-all duration-200 border card-hover"
            style={{
                background: isSelected ? dc.bg : "#fff",
                borderColor: isSelected ? dc.color + "60" : "#e8ecf4",
                boxShadow: isSelected ? `0 0 0 2px ${dc.border}, 0 4px 16px ${dc.color}18` : "0 1px 4px rgba(0,0,0,0.04)",
            }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black shadow-sm"
                        style={{ background: isSelected ? "rgba(255,255,255,0.7)" : dc.bg, color: dc.color }}>
                        {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                        <p className="font-semibold text-sm" style={{ color: "#1a1f36" }}>{patient.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs" style={{ color: "#8898aa" }}>
                                {patient.age}y · {patient.gender}
                            </span>
                            {patient.phrn && (
                                <span className="font-mono text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "#eef2ff", color: "#4c6ef5", fontSize: "9px", border: "1px solid #dbe4ff" }}>
                                    {patient.phrn}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                    {rc.label}
                </span>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: isSelected ? "rgba(255,255,255,0.65)" : dc.bg, color: dc.color }}>
                    <DIcon size={11} />
                    {dc.label}
                </div>
                <div className="text-right">
                    <p className="text-xs" style={{ color: "#8898aa" }}>Last Visit</p>
                    <p className="text-xs font-semibold" style={{ color: "#525f7f" }}>
                        {new Date(patient.lastVisit).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t text-center text-xs" style={{ borderColor: "#f1f5f9" }}>
                <div>
                    <p className="font-black text-sm" style={{ color: healthScore >= 80 ? "#2f9e44" : healthScore >= 50 ? "#e67700" : "#c92a2a" }}>{healthScore}</p>
                    <p style={{ color: "#8898aa" }}>Health</p>
                </div>
                <div style={{ borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }} className="px-5">
                    <p className="font-black text-sm" style={{ color: rc.text }}>{riskScore}</p>
                    <p style={{ color: "#8898aa" }}>Risk Score</p>
                </div>
                <div>
                    <p className="font-black text-sm" style={{ color: adherenceScore >= 80 ? "#2f9e44" : adherenceScore >= 60 ? "#e67700" : "#c92a2a" }}>{adherenceScore}%</p>
                    <p style={{ color: "#8898aa" }}>Adherence</p>
                </div>
            </div>
        </button>
    );
}
