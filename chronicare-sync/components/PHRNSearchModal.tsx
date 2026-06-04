"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Shield, AlertTriangle, CheckCircle, User, Activity } from "lucide-react";
import PHRNBadge from "./ui/PHRNBadge";

interface PHRNSearchModalProps {
  onClose: () => void;
  onPatientFound: (patient: any) => void;
}

export default function PHRNSearchModal({ onClose, onPatientFound }: PHRNSearchModalProps) {
  const [phrn, setPhrn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const formatPHRN = (raw: string) => {
    // Auto-format as PHRN-IND-2026-XXXXXX
    const stripped = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (stripped.startsWith("PHRN")) {
      return raw.toUpperCase();
    }
    return raw.toUpperCase();
  };

  const handleSearch = async () => {
    const formatted = phrn.trim().toUpperCase();
    if (!formatted) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/phrn?phrn=${encodeURIComponent(formatted)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "PHRN not found in registry");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    High: { bg: "#ffe3e3", color: "#c92a2a", border: "#ffa8a8" },
    Medium: { bg: "#fff3bf", color: "#e67700", border: "#ffd43b" },
    Low: { bg: "#d3f9d8", color: "#2f9e44", border: "#8ce99a" },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl fade-in"
        style={{ background: "#fff", border: "1px solid #e8ecf4", margin: "0 16px" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
          style={{ background: "linear-gradient(135deg, #1e3a5f, #3b5bdb)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">PHRN Patient Lookup</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Enter Patient Health Reference Number</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input
                ref={inputRef}
                type="text"
                value={phrn}
                onChange={(e) => { setPhrn(formatPHRN(e.target.value)); setError(""); setResult(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="PHRN-IND-2026-000001"
                className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm font-mono outline-none transition-all"
                style={{
                  borderColor: error ? "#ffa8a8" : "#e2e8f0",
                  background: "#f8fafc",
                  color: "#1a1f36",
                  letterSpacing: "0.04em",
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !phrn.trim()}
              className="px-5 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:opacity-90 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #3b5bdb, #4c6ef5)", boxShadow: "0 4px 12px rgba(59,91,219,0.3)" }}
            >
              {loading ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
              {loading ? "Searching..." : "Lookup"}
            </button>
          </div>

          {/* Sample PHRNs hint */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["PHRN-IND-2026-000001", "PHRN-IND-2026-000002", "PHRN-IND-2026-000003"].map(p => (
              <button
                key={p}
                onClick={() => { setPhrn(p); setError(""); setResult(null); }}
                className="text-xs px-2 py-0.5 rounded-lg font-mono transition-all hover:opacity-80"
                style={{ background: "#eef2ff", color: "#4c6ef5", border: "1px solid #c7d2fe" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: "#ffe3e3", color: "#c92a2a" }}>
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mx-5 mb-5 rounded-2xl border overflow-hidden fade-in" style={{ borderColor: "#e8ecf4" }}>
            <div className="px-4 py-3" style={{ background: "#f8f9ff", borderBottom: "1px solid #e8ecf4" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} style={{ color: "#2f9e44" }} />
                  <p className="text-xs font-bold" style={{ color: "#2f9e44" }}>PHRN Verified</p>
                </div>
                <PHRNBadge phrn={result.phrn} size="sm" />
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shrink-0"
                  style={{
                    background: riskColors[result.patient?.riskLevel as "High" | "Medium" | "Low"]?.bg || "#f1f5f9",
                    color: riskColors[result.patient?.riskLevel as "High" | "Medium" | "Low"]?.color || "#475569",
                  }}
                >
                  {result.patient?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: "#1a1f36" }}>{result.patient?.name}</p>
                  <p className="text-sm" style={{ color: "#525f7f" }}>
                    {result.patient?.age}y · {result.patient?.gender} · {result.patient?.disease}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: riskColors[result.patient?.riskLevel as "High" | "Medium" | "Low"]?.bg,
                        color: riskColors[result.patient?.riskLevel as "High" | "Medium" | "Low"]?.color,
                      }}
                    >
                      {result.patient?.riskLevel} Risk
                    </span>
                    <span className="text-xs" style={{ color: "#8898aa" }}>
                      Dr. {result.patient?.assignedDoctor}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { onPatientFound(result.patient); onClose(); }}
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #4c6ef5, #7c3aed)" }}
              >
                <User size={14} /> Open Patient Record
              </button>
            </div>
          </div>
        )}

        <div className="px-5 pb-4">
          <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
            🔒 PHRN lookup is RBAC-secured and audit-logged · Press Esc to close
          </p>
        </div>
      </div>
    </div>
  );
}
