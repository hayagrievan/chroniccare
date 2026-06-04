"use client";

import { useEffect, useRef } from "react";

interface HealthScoreGaugeProps {
  score: number;        // 0–100
  size?: number;        // px diameter, default 160
  showLabel?: boolean;
}

export default function HealthScoreGauge({ score, size = 160, showLabel = true }: HealthScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Arc parameters
  const radius = (size / 2) - 16;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 12;

  // Semi-circle arc: from 180° to 360° (bottom half excluded)
  const startAngle = 210;
  const endAngle = 330; // 300° total sweep
  const totalSweep = 300;
  const sweepAngle = (clampedScore / 100) * totalSweep;

  function polarToXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startDeg: number, endDeg: number, r: number) {
    const start = polarToXY(startDeg, r);
    const end = polarToXY(endDeg, r);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  // Color zones
  const getColor = (s: number) => {
    if (s >= 80) return "#2f9e44";   // Green — Low Risk
    if (s >= 50) return "#e67700";   // Amber — Moderate
    return "#c92a2a";                 // Red — High Risk
  };

  const getCategory = (s: number) => {
    if (s >= 80) return "Low Risk";
    if (s >= 50) return "Moderate Risk";
    return "High Risk";
  };

  const trackPath = describeArc(startAngle, startAngle + totalSweep, radius);
  const valuePath = sweepAngle > 0 ? describeArc(startAngle, startAngle + sweepAngle, radius) : "";
  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size}`}>
        {/* Zone segments */}
        {/* Red zone: 0-49 */}
        <path
          d={describeArc(startAngle, startAngle + (49 / 100) * totalSweep, radius)}
          fill="none" stroke="#ffe3e3" strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Amber zone: 50-79 */}
        <path
          d={describeArc(startAngle + (50 / 100) * totalSweep, startAngle + (79 / 100) * totalSweep, radius)}
          fill="none" stroke="#fff3bf" strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Green zone: 80-100 */}
        <path
          d={describeArc(startAngle + (80 / 100) * totalSweep, startAngle + totalSweep, radius)}
          fill="none" stroke="#d3f9d8" strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Track */}
        <path
          d={trackPath}
          fill="none" stroke="#e8ecf4" strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc — animated */}
        {valuePath && (
          <path
            d={valuePath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}55)`,
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        )}

        {/* Score text */}
        <text
          x={cx} y={cy + 10}
          textAnchor="middle"
          fontSize={size * 0.22}
          fontWeight="900"
          fill={color}
        >
          {clampedScore}
        </text>
        <text
          x={cx} y={cy + 28}
          textAnchor="middle"
          fontSize={size * 0.08}
          fill="#8898aa"
          fontWeight="600"
        >
          / 100
        </text>
      </svg>
      {showLabel && (
        <div className="mt-1 text-center">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: clampedScore >= 80 ? "#d3f9d8" : clampedScore >= 50 ? "#fff3bf" : "#ffe3e3",
              color,
            }}
          >
            {getCategory(clampedScore)}
          </span>
        </div>
      )}
    </div>
  );
}
