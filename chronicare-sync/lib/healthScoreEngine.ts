/**
 * healthScoreEngine.ts
 *
 * Clinically-guided Health Score Engine (0–100).
 * Uses Framingham Risk Score methodology + ADA diabetes indicators.
 * All scoring logic is deterministic, transparent, and explainable.
 */

import { Patient, ClinicalMetric } from "./mockData";

export interface HealthScoreBreakdown {
  totalScore: number;
  category: "Low Risk" | "Moderate Risk" | "High Risk";
  components: {
    bloodPressure: { score: number; maxScore: number; label: string };
    bloodSugar: { score: number; maxScore: number; label: string };
    cholesterol: { score: number; maxScore: number; label: string };
    heartRate: { score: number; maxScore: number; label: string };
    adherence: { score: number; maxScore: number; label: string };
    clinicalHistory: { score: number; maxScore: number; label: string };
  };
  explanation: string;
}

function getMetricValue(metrics: ClinicalMetric[], labels: string[]): number | null {
  for (const label of labels) {
    const m = metrics.find(
      (m) => m.label.toLowerCase().includes(label.toLowerCase())
    );
    if (m) {
      const val = parseFloat(m.value.replace(/[^0-9.]/g, ""));
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

function getMetricStatus(metrics: ClinicalMetric[], labels: string[]): string | null {
  for (const label of labels) {
    const m = metrics.find(
      (m) => m.label.toLowerCase().includes(label.toLowerCase())
    );
    if (m) return m.status;
  }
  return null;
}

/**
 * Compute Blood Pressure sub-score (max 25 pts deducted)
 */
function computeBPPenalty(metrics: ClinicalMetric[]): { penalty: number; label: string } {
  const systolic =
    getMetricValue(metrics, ["systolic bp", "systolic", "blood pressure"]) ||
    getMetricValue(metrics, ["bp"]);
  const bpStatus = getMetricStatus(metrics, ["systolic", "blood pressure", "bp"]);

  if (systolic === null && bpStatus === null) return { penalty: 0, label: "No BP data" };

  if (bpStatus === "critical" || (systolic && systolic > 160)) {
    return { penalty: 25, label: `Critically elevated (${systolic || "?"}+ mmHg)` };
  }
  if (bpStatus === "warning" || (systolic && systolic > 140)) {
    return { penalty: 15, label: `Elevated (${systolic || "?"}+ mmHg)` };
  }
  return { penalty: 0, label: "Normal" };
}

/**
 * Compute Blood Sugar / HbA1c sub-score (max 20 pts deducted)
 */
function computeGlucosePenalty(metrics: ClinicalMetric[]): { penalty: number; label: string } {
  const hba1c = getMetricValue(metrics, ["hb a1c", "hba1c", "a1c"]);
  const glucose = getMetricValue(metrics, ["fasting glucose", "glucose", "blood sugar", "post-prandial"]);
  const glucoseStatus = getMetricStatus(metrics, ["glucose", "blood sugar", "hba1c", "post-prandial"]);

  if (hba1c !== null) {
    if (hba1c >= 9) return { penalty: 20, label: `Very high HbA1c (${hba1c}%)` };
    if (hba1c >= 7.5) return { penalty: 12, label: `Above-target HbA1c (${hba1c}%)` };
    if (hba1c >= 6.5) return { penalty: 5, label: `Borderline HbA1c (${hba1c}%)` };
    return { penalty: 0, label: `HbA1c controlled (${hba1c}%)` };
  }

  if (glucose !== null) {
    if (glucose > 200) return { penalty: 20, label: `Very high glucose (${glucose} mg/dL)` };
    if (glucose > 140) return { penalty: 12, label: `Elevated glucose (${glucose} mg/dL)` };
    if (glucose > 100) return { penalty: 5, label: `Borderline glucose (${glucose} mg/dL)` };
    return { penalty: 0, label: "Normal glucose" };
  }

  if (glucoseStatus === "critical") return { penalty: 18, label: "Critical glucose level" };
  if (glucoseStatus === "warning") return { penalty: 10, label: "Elevated glucose" };
  return { penalty: 0, label: "No glucose data" };
}

/**
 * Compute Cholesterol sub-score (max 15 pts deducted)
 */
function computeCholesterolPenalty(metrics: ClinicalMetric[]): { penalty: number; label: string } {
  const totalChol = getMetricValue(metrics, ["cholesterol, total", "cholesterol"]);
  const ldl = getMetricValue(metrics, ["ldl cholesterol", "ldl"]);
  const cholStatus = getMetricStatus(metrics, ["cholesterol"]);

  if (totalChol !== null) {
    if (totalChol > 240) return { penalty: 15, label: `High cholesterol (${totalChol} mg/dL)` };
    if (totalChol > 200) return { penalty: 8, label: `Borderline cholesterol (${totalChol} mg/dL)` };
    return { penalty: 0, label: `Normal cholesterol (${totalChol} mg/dL)` };
  }
  if (ldl !== null && ldl > 130) return { penalty: 10, label: `Elevated LDL (${ldl} mg/dL)` };

  if (cholStatus === "critical") return { penalty: 15, label: "Critical cholesterol level" };
  if (cholStatus === "warning") return { penalty: 8, label: "Elevated cholesterol" };
  return { penalty: 0, label: "No cholesterol data" };
}

/**
 * Compute Heart Rate sub-score (max 10 pts deducted)
 */
function computeHeartRatePenalty(metrics: ClinicalMetric[]): { penalty: number; label: string } {
  const hr = getMetricValue(metrics, ["heart rate", "pulse rate", "pulse"]);
  const hrStatus = getMetricStatus(metrics, ["heart rate", "pulse rate"]);

  if (hr !== null) {
    if (hr > 110) return { penalty: 10, label: `Tachycardia (${hr} bpm)` };
    if (hr > 100) return { penalty: 7, label: `Elevated HR (${hr} bpm)` };
    if (hr > 90) return { penalty: 3, label: `High-normal HR (${hr} bpm)` };
    if (hr < 50) return { penalty: 8, label: `Bradycardia (${hr} bpm)` };
    return { penalty: 0, label: `Normal HR (${hr} bpm)` };
  }
  if (hrStatus === "critical") return { penalty: 10, label: "Critical heart rate" };
  if (hrStatus === "warning") return { penalty: 5, label: "Elevated heart rate" };
  return { penalty: 0, label: "No HR data" };
}

/**
 * Compute Adherence sub-score (max 20 pts deducted)
 */
function computeAdherencePenalty(adherenceScore: number): { penalty: number; label: string } {
  if (adherenceScore >= 90) return { penalty: 0, label: `Excellent adherence (${adherenceScore}%)` };
  if (adherenceScore >= 75) return { penalty: 8, label: `Good adherence (${adherenceScore}%)` };
  if (adherenceScore >= 60) return { penalty: 14, label: `Moderate adherence (${adherenceScore}%)` };
  if (adherenceScore >= 40) return { penalty: 18, label: `Poor adherence (${adherenceScore}%)` };
  return { penalty: 20, label: `Critical non-adherence (${adherenceScore}%)` };
}

/**
 * Compute Clinical History sub-score (max 10 pts deducted)
 */
function computeHistoryPenalty(patient: Patient): { penalty: number; label: string } {
  const criticalHistory = patient.historyTimeline?.filter(
    (h) => h.riskLevel === "High"
  ).length || 0;
  const hasMultiple = criticalHistory >= 3;
  const hasCritical = patient.clinicalMetrics?.some(m => m.status === "critical");

  if (hasCritical && hasMultiple) return { penalty: 10, label: `${criticalHistory} critical events, active critical metrics` };
  if (hasCritical) return { penalty: 7, label: "Active critical clinical metrics" };
  if (hasMultiple) return { penalty: 5, label: `${criticalHistory} high-risk history events` };
  if (criticalHistory > 0) return { penalty: 3, label: "Prior high-risk event" };
  return { penalty: 0, label: "Clean history" };
}

/**
 * Main function: compute health score for a patient
 */
export function computeHealthScore(patient: Patient, adherenceScore: number = 75): HealthScoreBreakdown {
  const bpPenalty = computeBPPenalty(patient.clinicalMetrics || []);
  const glucosePenalty = computeGlucosePenalty(patient.clinicalMetrics || []);
  const cholesterolPenalty = computeCholesterolPenalty(patient.clinicalMetrics || []);
  const heartRatePenalty = computeHeartRatePenalty(patient.clinicalMetrics || []);
  const adherencePenalty = computeAdherencePenalty(adherenceScore);
  const historyPenalty = computeHistoryPenalty(patient);

  const totalPenalty =
    bpPenalty.penalty +
    glucosePenalty.penalty +
    cholesterolPenalty.penalty +
    heartRatePenalty.penalty +
    adherencePenalty.penalty +
    historyPenalty.penalty;

  const totalScore = Math.max(0, Math.min(100, 100 - totalPenalty));

  let category: "Low Risk" | "Moderate Risk" | "High Risk";
  if (totalScore >= 80) category = "Low Risk";
  else if (totalScore >= 50) category = "Moderate Risk";
  else category = "High Risk";

  const explanation = generateScoreExplanation(totalScore, category, {
    bp: bpPenalty,
    glucose: glucosePenalty,
    cholesterol: cholesterolPenalty,
    heartRate: heartRatePenalty,
    adherence: adherencePenalty,
    history: historyPenalty,
  });

  return {
    totalScore,
    category,
    components: {
      bloodPressure: { score: 25 - bpPenalty.penalty, maxScore: 25, label: bpPenalty.label },
      bloodSugar: { score: 20 - glucosePenalty.penalty, maxScore: 20, label: glucosePenalty.label },
      cholesterol: { score: 15 - cholesterolPenalty.penalty, maxScore: 15, label: cholesterolPenalty.label },
      heartRate: { score: 10 - heartRatePenalty.penalty, maxScore: 10, label: heartRatePenalty.label },
      adherence: { score: 20 - adherencePenalty.penalty, maxScore: 20, label: adherencePenalty.label },
      clinicalHistory: { score: 10 - historyPenalty.penalty, maxScore: 10, label: historyPenalty.label },
    },
    explanation,
  };
}

function generateScoreExplanation(
  score: number,
  category: string,
  penalties: Record<string, { penalty: number; label: string }>
): string {
  const top = Object.entries(penalties)
    .filter(([, v]) => v.penalty > 0)
    .sort((a, b) => b[1].penalty - a[1].penalty)
    .slice(0, 2)
    .map(([, v]) => v.label.toLowerCase());

  if (top.length === 0) return `Health Score ${score}/100 — ${category}. All clinical indicators are within normal ranges.`;
  return `Health Score ${score}/100 — ${category}. Primary concerns: ${top.join("; ")}.`;
}
