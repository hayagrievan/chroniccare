"use client";

import { XAIFeatureContribution } from "@/lib/mockData";

interface XAIBarChartProps {
  contributions: XAIFeatureContribution[];
  title?: string;
  maxItems?: number;
}

export default function XAIBarChart({ contributions, title = "Risk Contribution Factors", maxItems = 6 }: XAIBarChartProps) {
  const displayed = contributions.slice(0, maxItems);

  const getImpactColor = (impact: "positive" | "negative" | "neutral") => {
    if (impact === "negative") return { bar: "#c92a2a", bg: "#ffe3e3", text: "#c92a2a" };
    if (impact === "positive") return { bar: "#2f9e44", bg: "#d3f9d8", text: "#2f9e44" };
    return { bar: "#64748b", bg: "#f1f5f9", text: "#64748b" };
  };

  return (
    <div>
      {title && (
        <p className="text-xs font-bold uppercase mb-3" style={{ color: "#8898aa", letterSpacing: "0.08em" }}>
          {title}
        </p>
      )}
      <div className="space-y-2.5">
        {displayed.map((c, i) => {
          const colors = getImpactColor(c.impact);
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: "#1a1f36" }}>{c.feature}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "#8898aa" }}>{c.value}</span>
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {c.contribution}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "#e8ecf4" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${c.contribution}%`,
                    background: `linear-gradient(90deg, ${colors.bar}cc, ${colors.bar})`,
                    transition: `width 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s`,
                    boxShadow: `0 0 6px ${colors.bar}44`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs mt-3" style={{ color: "#8898aa" }}>
        ✦ SHAP-style feature attribution — higher % = stronger influence on risk prediction
      </p>
    </div>
  );
}
