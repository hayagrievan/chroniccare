/**
 * adherenceCalculator.ts
 *
 * Medication adherence intelligence engine.
 * Computes adherence scores at daily, weekly, and monthly levels.
 * Generates alerts and refill compliance indicators.
 */

import { AdherenceRecord, MedicationDose } from "./mockData";

export interface AdherenceScoreResult {
  patientId: string;
  overallScore: number;       // 0–100
  dailyScore: number;         // Today's score
  weeklyScore: number;        // Last 7 days
  monthlyScore: number;       // Last 30 days
  missedDoseRate: number;     // % doses missed
  skippedDoseRate: number;    // % doses skipped
  takenDoseRate: number;      // % doses taken on time
  missedStreak: number;       // Consecutive missed days
  alerts: AdherenceAlert[];
  trend: "improving" | "stable" | "declining";
  lastUpdated: string;
}

export interface AdherenceAlert {
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  triggerDate: string;
}

/**
 * Compute adherence score from a list of adherence records
 */
export function computeAdherenceScore(
  patientId: string,
  records: AdherenceRecord[]
): AdherenceScoreResult {
  const patientRecords = records
    .filter(r => r.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (patientRecords.length === 0) {
    return buildEmptyResult(patientId);
  }

  const now = new Date();
  const last7 = patientRecords.filter(r => daysBetween(new Date(r.date), now) <= 7);
  const last30 = patientRecords.filter(r => daysBetween(new Date(r.date), now) <= 30);
  const today = patientRecords.find(r => r.date === now.toISOString().split("T")[0]);

  const weeklyDoses = flatDoses(last7);
  const monthlyDoses = flatDoses(last30);
  const todayDoses = today ? today.medications : [];

  const weeklyScore = computeRateScore(weeklyDoses);
  const monthlyScore = computeRateScore(monthlyDoses);
  const dailyScore = todayDoses.length > 0 ? computeRateScore(todayDoses) : weeklyScore;

  // Overall: weighted 50% monthly, 30% weekly, 20% daily
  const overallScore = Math.round(monthlyScore * 0.5 + weeklyScore * 0.3 + dailyScore * 0.2);

  // Rates
  const allDoses = flatDoses(patientRecords);
  const taken = allDoses.filter(d => d.status === "taken").length;
  const missed = allDoses.filter(d => d.status === "missed").length;
  const skipped = allDoses.filter(d => d.status === "skipped").length;
  const total = taken + missed + skipped;

  const takenRate = total > 0 ? Math.round((taken / total) * 100) : 100;
  const missedRate = total > 0 ? Math.round((missed / total) * 100) : 0;
  const skippedRate = total > 0 ? Math.round((skipped / total) * 100) : 0;

  // Missed streak: consecutive days with any missed dose
  const missedStreak = computeMissedStreak(patientRecords);

  // Trend: compare last 7 days vs previous 7 days
  const older7 = patientRecords.filter(r => {
    const d = daysBetween(new Date(r.date), now);
    return d > 7 && d <= 14;
  });
  const olderScore = computeRateScore(flatDoses(older7));
  let trend: "improving" | "stable" | "declining" = "stable";
  if (weeklyScore > olderScore + 5) trend = "improving";
  else if (weeklyScore < olderScore - 5) trend = "declining";

  // Alerts
  const alerts = generateAlerts(overallScore, missedStreak, missedRate, weeklyScore);

  return {
    patientId,
    overallScore,
    dailyScore,
    weeklyScore,
    monthlyScore,
    missedDoseRate: missedRate,
    skippedDoseRate: skippedRate,
    takenDoseRate: takenRate,
    missedStreak,
    alerts,
    trend,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Compute refill compliance score (pharmacy-side)
 */
export function computeRefillCompliance(
  prescriptionDate: string,
  refillDate: string | null,
  durationDays: number
): { score: number; status: "on-time" | "late" | "missed"; daysDiff: number } {
  if (!refillDate) {
    return { score: 0, status: "missed", daysDiff: -1 };
  }
  const expected = new Date(prescriptionDate);
  expected.setDate(expected.getDate() + durationDays);
  const actual = new Date(refillDate);
  const daysDiff = Math.round((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 2) return { score: 100, status: "on-time", daysDiff };
  if (daysDiff <= 7) return { score: 75, status: "late", daysDiff };
  return { score: 40, status: "late", daysDiff };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flatDoses(records: AdherenceRecord[]): MedicationDose[] {
  return records.flatMap(r => r.medications || []);
}

function computeRateScore(doses: MedicationDose[]): number {
  const actionable = doses.filter(d => d.status !== "pending");
  if (actionable.length === 0) return 100;
  const taken = actionable.filter(d => d.status === "taken").length;
  return Math.round((taken / actionable.length) * 100);
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function computeMissedStreak(records: AdherenceRecord[]): number {
  let streak = 0;
  for (const record of records) {
    const hasMissed = record.medications.some(m => m.status === "missed");
    if (hasMissed) streak++;
    else break;
  }
  return streak;
}

function generateAlerts(
  overallScore: number,
  missedStreak: number,
  missedRate: number,
  weeklyScore: number
): AdherenceAlert[] {
  const alerts: AdherenceAlert[] = [];
  const today = new Date().toISOString().split("T")[0];

  if (overallScore < 50) {
    alerts.push({
      severity: "critical",
      message: `Adherence critically low (${overallScore}%). Immediate intervention required.`,
      triggerDate: today,
    });
  } else if (overallScore < 70) {
    alerts.push({
      severity: "high",
      message: `Adherence below threshold (${overallScore}%). Patient needs follow-up.`,
      triggerDate: today,
    });
  }

  if (missedStreak >= 3) {
    alerts.push({
      severity: missedStreak >= 5 ? "critical" : "high",
      message: `${missedStreak} consecutive days with missed doses detected.`,
      triggerDate: today,
    });
  }

  if (missedRate > 30) {
    alerts.push({
      severity: "medium",
      message: `High missed dose rate (${missedRate}%). Counselling recommended.`,
      triggerDate: today,
    });
  }

  if (weeklyScore < overallScore - 15) {
    alerts.push({
      severity: "medium",
      message: "Adherence declining this week vs. overall average.",
      triggerDate: today,
    });
  }

  return alerts;
}

function buildEmptyResult(patientId: string): AdherenceScoreResult {
  return {
    patientId,
    overallScore: 100,
    dailyScore: 100,
    weeklyScore: 100,
    monthlyScore: 100,
    missedDoseRate: 0,
    skippedDoseRate: 0,
    takenDoseRate: 100,
    missedStreak: 0,
    alerts: [],
    trend: "stable",
    lastUpdated: new Date().toISOString(),
  };
}
