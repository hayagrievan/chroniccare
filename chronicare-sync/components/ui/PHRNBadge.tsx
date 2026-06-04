"use client";

import { useState } from "react";
import { Copy, CheckCircle, Shield } from "lucide-react";

interface PHRNBadgeProps {
  phrn: string;
  size?: "sm" | "md" | "lg";
  showCopy?: boolean;
  showIcon?: boolean;
}

export default function PHRNBadge({ phrn, size = "md", showCopy = true, showIcon = true }: PHRNBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phrn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const sizeStyles = {
    sm: { padding: "2px 8px", fontSize: "10px", iconSize: 10, gap: 4 },
    md: { padding: "4px 12px", fontSize: "12px", iconSize: 12, gap: 6 },
    lg: { padding: "6px 16px", fontSize: "14px", iconSize: 14, gap: 8 },
  };

  const s = sizeStyles[size];

  return (
    <div
      className="inline-flex items-center rounded-xl font-mono font-bold cursor-pointer select-none group transition-all hover:opacity-90"
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        gap: s.gap,
        background: "linear-gradient(135deg, #1e3a5f, #3b5bdb)",
        color: "#fff",
        border: "1px solid rgba(116,143,252,0.4)",
        boxShadow: "0 2px 8px rgba(59,91,219,0.25)",
        letterSpacing: "0.04em",
      }}
      onClick={showCopy ? handleCopy : undefined}
      title={showCopy ? "Click to copy PHRN" : phrn}
    >
      {showIcon && <Shield size={s.iconSize} style={{ opacity: 0.8 }} />}
      <span>{phrn}</span>
      {showCopy && (
        copied
          ? <CheckCircle size={s.iconSize} style={{ color: "#51cf66" }} />
          : <Copy size={s.iconSize} style={{ opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
