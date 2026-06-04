"use client";

interface AdherenceRingProps {
  score: number;       // 0–100
  size?: number;       // px, default 100
  label?: string;
  showScore?: boolean;
}

export default function AdherenceRing({ score, size = 100, label = "Adherence", showScore = true }: AdherenceRingProps) {
  const clamp = Math.max(0, Math.min(100, score));
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp / 100) * circumference;

  const color =
    clamp >= 90 ? "#2f9e44" :
    clamp >= 75 ? "#51cf66" :
    clamp >= 60 ? "#e67700" :
    clamp >= 40 ? "#ff6b6b" :
    "#c92a2a";

  const bg =
    clamp >= 90 ? "#d3f9d8" :
    clamp >= 75 ? "#ebfbee" :
    clamp >= 60 ? "#fff3bf" :
    clamp >= 40 ? "#ffe3e3" :
    "#ffd6d6";

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e8ecf4" strokeWidth={10}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)",
              filter: `drop-shadow(0 0 4px ${color}66)`,
            }}
          />
        </svg>
        {showScore && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: size * 0.22, fontWeight: 900, color, lineHeight: 1 }}>{clamp}</p>
            <p style={{ fontSize: size * 0.10, color: "#8898aa", fontWeight: 600 }}>%</p>
          </div>
        )}
      </div>
      {label && (
        <p className="text-xs font-semibold text-center" style={{ color: "#525f7f" }}>{label}</p>
      )}
    </div>
  );
}
