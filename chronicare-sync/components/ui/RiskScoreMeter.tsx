"use client";

interface RiskScoreMeterProps {
  score: number;        // 0–100
  riskLevel?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RiskScoreMeter({ score, riskLevel, showLabel = true, size = "md" }: RiskScoreMeterProps) {
  const clamp = Math.max(0, Math.min(100, score));
  
  const sizeStyles = {
    sm: { height: 8, fontSize: "10px" },
    md: { height: 12, fontSize: "12px" },
    lg: { height: 16, fontSize: "14px" },
  };
  const s = sizeStyles[size];

  const getZone = (s: number) => {
    if (s < 35) return { label: "Low Risk", color: "#2f9e44", bgTrack: "#d3f9d8" };
    if (s < 65) return { label: "Moderate Risk", color: "#e67700", bgTrack: "#fff3bf" };
    return { label: "High Risk", color: "#c92a2a", bgTrack: "#ffe3e3" };
  };

  const zone = getZone(clamp);
  const level = riskLevel || zone.label;

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span style={{ fontSize: s.fontSize, color: "#525f7f", fontWeight: 600 }}>{level}</span>
          <span style={{ fontSize: s.fontSize, color: zone.color, fontWeight: 900 }}>{clamp}/100</span>
        </div>
      )}
      <div className="relative rounded-full overflow-hidden" style={{ height: s.height, background: "#e8ecf4" }}>
        {/* Zone backgrounds */}
        <div className="absolute inset-0 flex">
          <div style={{ width: "35%", background: "#d3f9d8" }} />
          <div style={{ width: "30%", background: "#fff3bf" }} />
          <div style={{ width: "35%", background: "#ffe3e3" }} />
        </div>
        {/* Value bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${clamp}%`,
            background: `linear-gradient(90deg, #2f9e44, ${clamp > 65 ? "#c92a2a" : clamp > 35 ? "#e67700" : "#2f9e44"})`,
            transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: `0 0 8px ${zone.color}55`,
          }}
        />
        {/* Tick marks at 35% and 65% */}
        <div className="absolute inset-y-0" style={{ left: "35%", width: "2px", background: "rgba(255,255,255,0.8)" }} />
        <div className="absolute inset-y-0" style={{ left: "65%", width: "2px", background: "rgba(255,255,255,0.8)" }} />
      </div>
      <div className="flex justify-between" style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>
        <span>LOW</span>
        <span>MODERATE</span>
        <span>HIGH</span>
      </div>
    </div>
  );
}
