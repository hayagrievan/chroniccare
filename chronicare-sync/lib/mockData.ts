/**
 * mockData.ts
 *
 * Type definitions + data loaders that read from the JSON data files in /data/.
 * To add/modify patients or admin stats, edit the JSON files directly — no TypeScript changes needed.
 */
import patientsJson from "@/data/patients.json";
import adminJson from "@/data/adminStats.json";
import phrnJson from "@/data/phrn-registry.json";
import consentJson from "@/data/consent-logs.json";
import adherenceJson from "@/data/adherence-records.json";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RiskLevel = "High" | "Medium" | "Low";
export type DiseaseType = "Heart" | "BP" | "Sugar" | "Stress";
export type AdherenceStatus = "taken" | "missed" | "skipped" | "pending";

export interface ClinicalMetric {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "normal" | "warning" | "critical";
}

export interface HistoryEntry {
  date: string;
  title: string;
  summary: string;
  riskLevel: RiskLevel;
  doctor: string;
}

export interface UploadedReport {
  filename: string;
  uploadedAt: string;
  extractedText: string;
  structuredData?: {
    diagnoses?: string[];
    medications?: string[];
    bloodPressure?: string;
    bloodSugar?: string;
    hba1c?: string;
    cholesterol?: string;
    heartRate?: string;
    clinicalFindings?: string[];
    doctorRecommendations?: string[];
  };
  groqAnalysis: {
    summary: string;
    riskLevel: RiskLevel;
    riskReason: string;
    suggestedActions: string[];
    extractedMetrics: ClinicalMetric[];
  } | null;
}

export interface HealthScoreHistory {
  date: string;
  score: number;
  riskLevel: RiskLevel;
}

export interface XAIFeatureContribution {
  feature: string;
  contribution: number; // percentage 0-100
  value: string;
  impact: "positive" | "negative" | "neutral";
}

export interface XAIResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  confidence: number; // 0-100
  contributions: XAIFeatureContribution[];
  explanation: string;
}

export interface ProgressionForecast {
  currentRisk: RiskLevel;
  threeMonthProjection: RiskLevel;
  sixMonthProjection: RiskLevel;
  trend: "improving" | "stable" | "deteriorating";
  forecastText: string;
  keyFactors: string[];
}

export interface MedicationDose {
  medicineId: string;
  medicineName: string;
  dose: string;
  scheduled: string;
  status: AdherenceStatus;
  recordedAt: string | null;
}

export interface AdherenceRecord {
  recordId: string;
  patientId: string;
  phrn: string;
  date: string;
  medications: MedicationDose[];
}

export interface ConsentLog {
  consentId: string;
  patientId: string;
  phrn: string;
  doctorId: string;
  doctorName: string;
  status: "Pending" | "Approved" | "Revoked" | "Expired";
  requestedAt: string;
  approvedAt: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
  purpose: string;
}

export interface PHRNRecord {
  phrn: string;
  patientId: string;
  patientName: string;
  issuedDate: string;
  isActive: boolean;
  country: string;
  year: string;
}

export interface Patient {
  id: string;
  phrn?: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  disease: DiseaseType;
  riskLevel: RiskLevel;
  phone: string;
  email: string;
  address: string;
  lastVisit: string;
  nextAppointment: string;
  assignedDoctor: string;
  profileImage: string;
  uploadedReports: UploadedReport[];
  clinicalMetrics: ClinicalMetric[];
  suggestedActions: string[];
  historyTimeline: HistoryEntry[];
  llmSummary: string;
  // ChronicCare AI additions
  healthScore?: number;
  adherenceScore?: number;
  riskScore?: number;
  healthScoreHistory?: HealthScoreHistory[];
  extractedText?: string;
  riskReason?: string;
}

// ─── Patient data ─────────────────────────────────────────────────────────────

export const mockPatients: Patient[] = (patientsJson as Patient[]).map(p => {
  // Attach PHRN from registry
  const phrnEntry = (phrnJson as PHRNRecord[]).find(r => r.patientId === p.id);
  return { ...p, phrn: phrnEntry?.phrn };
});

// ─── PHRN Registry ───────────────────────────────────────────────────────────

export const phrnRegistry: PHRNRecord[] = phrnJson as PHRNRecord[];

// ─── Consent Logs ────────────────────────────────────────────────────────────

export const consentLogs: ConsentLog[] = consentJson as ConsentLog[];

// ─── Adherence Records ───────────────────────────────────────────────────────

export const adherenceRecords: AdherenceRecord[] = adherenceJson as AdherenceRecord[];

// ─── Admin data ───────────────────────────────────────────────────────────────

export const regionOptions = adminJson.regionOptions as {
  states: string[];
  cities: Record<string, string[]>;
};
export const diseasePrevalenceData = adminJson.diseasePrevalenceData;
export const growthTrendData = adminJson.growthTrendData;
export const adminStats = adminJson.adminStats;
export const districtData = adminJson.districtData;
