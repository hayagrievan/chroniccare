import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

const PATIENTS_FILE = path.join(DATA_DIR, "patients.json");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");
const ALERTS_FILE = path.join(DATA_DIR, "alerts.json");
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, "prescriptions.json");
const THRESHOLDS_FILE = path.join(DATA_DIR, "thresholds.json");
const PHRN_FILE = path.join(DATA_DIR, "phrn-registry.json");
const CONSENT_FILE = path.join(DATA_DIR, "consent-logs.json");
const ADHERENCE_FILE = path.join(DATA_DIR, "adherence-records.json");
const AUDIT_FILE = path.join(DATA_DIR, "audit-log.json");

// Helper to ensure data dir exists
function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Initial Data
const INITIAL_APPTS = [
    { appointmentId: "A001", patientId: "PAT-005", patientName: "Ravi Chandrasekaran", disease: "Heart", riskLevel: "High", date: "2026-02-27", time: "09:00", type: "Urgent Review", status: "Confirmed", doctor: "Dr. Priya Nair" },
    { appointmentId: "A002", patientId: "PAT-003", patientName: "Venkatesh Iyer", disease: "BP", riskLevel: "High", date: "2026-02-27", time: "10:30", type: "Follow-up", status: "Confirmed", doctor: "Dr. Priya Nair" },
    { appointmentId: "A003", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", date: "2026-02-27", time: "12:00", type: "Cardiac Check", status: "Pending", doctor: "Dr. Priya Nair" },
    { appointmentId: "A004", patientId: "PAT-002", patientName: "Meera Krishnamurthy", disease: "Sugar", riskLevel: "Medium", date: "2026-02-27", time: "14:30", type: "Diabetes Review", status: "Completed", doctor: "Dr. Priya Nair" },
    { appointmentId: "A005", patientId: "PAT-004", patientName: "Lakshmi Patel", disease: "Stress", riskLevel: "Low", date: "2026-02-28", time: "09:30", type: "Counselling", status: "Confirmed", doctor: "Dr. Priya Nair" },
    { appointmentId: "A006", patientId: "PAT-006", patientName: "Divya Menon", disease: "Sugar", riskLevel: "Low", date: "2026-03-01", time: "11:00", type: "Routine Check", status: "Confirmed", doctor: "Dr. Priya Nair" },
    { appointmentId: "A007", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", date: "2026-03-05", time: "10:00", type: "Echo follow-up", status: "Confirmed", doctor: "Dr. Priya Nair" },
    { appointmentId: "A008", patientId: "PAT-002", patientName: "Meera Krishnamurthy", disease: "Sugar", riskLevel: "Medium", date: "2026-03-10", time: "15:00", type: "HbA1c Review", status: "Pending", doctor: "Dr. Priya Nair" }
];

const INITIAL_ALERTS = [
    { alertId: "ALT-001", patientId: "PAT-005", patientName: "Ravi Chandrasekaran", disease: "Heart", riskLevel: "High", type: "Vital Sign", message: "SpO2 dropped to 93% — below critical threshold of 94%.", metric: "SpO2", value: "93%", threshold: "< 94%", severity: "Critical", status: "Active", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T09:00:00.000Z" },
    { alertId: "ALT-002", patientId: "PAT-003", patientName: "Venkatesh Iyer", disease: "BP", riskLevel: "High", type: "Hypertensive Crisis", message: "Blood pressure 168/104 mmHg — Stage 2 hypertension.", metric: "Systolic BP", value: "168 mmHg", threshold: "> 160 mmHg", severity: "Critical", status: "Active", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T10:30:00.000Z" },
    { alertId: "ALT-003", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", type: "Cardiac Alert", message: "Troponin I elevated at 0.12 ng/mL — active myocardial injury suspected.", metric: "Troponin I", value: "0.12 ng/mL", threshold: "> 0.04 ng/mL", severity: "High", status: "Acknowledged", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T12:00:00.000Z" },
    { alertId: "ALT-004", patientId: "PAT-002", patientName: "Meera Krishnamurthy", disease: "Sugar", riskLevel: "Medium", type: "Glucose Alert", message: "Post-prandial glucose at 210 mg/dL — above 180 mg/dL target.", metric: "Post-prandial Glucose", value: "210 mg/dL", threshold: "> 180 mg/dL", severity: "Medium", status: "Active", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T14:30:00.000Z" },
    { alertId: "ALT-005", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", type: "Missed Medication", message: "Metoprolol dose not recorded today.", severity: "Medium", status: "Active", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T15:00:00.000Z" },
    { alertId: "ALT-006", patientId: "PAT-004", patientName: "Lakshmi Patel", disease: "Stress", riskLevel: "Low", type: "Wellness Alert", message: "GAD-7 anxiety score increased to 14.", severity: "Low", status: "Acknowledged", doctor: "Dr. Priya Nair", createdAt: "2026-02-28T09:30:00.000Z" },
    { alertId: "ALT-007", patientId: "PAT-003", patientName: "Venkatesh Iyer", disease: "BP", riskLevel: "High", type: "Lab Result", message: "Potassium level 3.4 mEq/L — below normal range.", metric: "Potassium", value: "3.4 mEq/L", threshold: "< 3.5 mEq/L", severity: "High", status: "Resolved", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T16:00:00.000Z" },
    { alertId: "ALT-008", patientId: "PAT-005", patientName: "Ravi Chandrasekaran", disease: "Heart", riskLevel: "High", type: "BNP Elevation", message: "BNP at 520 pg/mL — suggests acute heart failure.", metric: "BNP", value: "520 pg/mL", threshold: "> 400 pg/mL", severity: "Critical", status: "Active", doctor: "Dr. Priya Nair", createdAt: "2026-02-27T17:00:00.000Z" }
];

const DEFAULT_THRESHOLDS = {
    doctorId: "dr-priya-nair",
    heartRate: 90,
    systolicBP: 140,
    spo2: 95,
    glucose: 180
};

export function getPatients(): any[] {
    ensureDir();
    if (!fs.existsSync(PATIENTS_FILE)) {
        return [];
    }
    const raw = fs.readFileSync(PATIENTS_FILE, "utf-8");
    return JSON.parse(raw);
}

export function savePatients(list: any[]) {
    ensureDir();
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function getAppointments(): any[] {
    ensureDir();
    if (!fs.existsSync(APPOINTMENTS_FILE)) {
        fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(INITIAL_APPTS, null, 2), "utf-8");
        return INITIAL_APPTS;
    }
    const raw = fs.readFileSync(APPOINTMENTS_FILE, "utf-8");
    return JSON.parse(raw);
}

export function saveAppointments(list: any[]) {
    ensureDir();
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function getAlerts(): any[] {
    ensureDir();
    if (!fs.existsSync(ALERTS_FILE)) {
        fs.writeFileSync(ALERTS_FILE, JSON.stringify(INITIAL_ALERTS, null, 2), "utf-8");
        return INITIAL_ALERTS;
    }
    const raw = fs.readFileSync(ALERTS_FILE, "utf-8");
    return JSON.parse(raw);
}

export function saveAlerts(list: any[]) {
    ensureDir();
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function getPrescriptions(): any[] {
    ensureDir();
    if (!fs.existsSync(PRESCRIPTIONS_FILE)) {
        fs.writeFileSync(PRESCRIPTIONS_FILE, JSON.stringify([], null, 2), "utf-8");
        return [];
    }
    const raw = fs.readFileSync(PRESCRIPTIONS_FILE, "utf-8");
    return JSON.parse(raw);
}

export function savePrescriptions(list: any[]) {
    ensureDir();
    fs.writeFileSync(PRESCRIPTIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function getThresholds(): any {
    ensureDir();
    if (!fs.existsSync(THRESHOLDS_FILE)) {
        fs.writeFileSync(THRESHOLDS_FILE, JSON.stringify(DEFAULT_THRESHOLDS, null, 2), "utf-8");
        return DEFAULT_THRESHOLDS;
    }
    const raw = fs.readFileSync(THRESHOLDS_FILE, "utf-8");
    return JSON.parse(raw);
}

export function saveThresholds(data: any) {
    ensureDir();
    fs.writeFileSync(THRESHOLDS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── PHRN Registry ──────────────────────────────────────────────────────────

export function getPHRNRegistry(): any[] {
    ensureDir();
    if (!fs.existsSync(PHRN_FILE)) return [];
    return JSON.parse(fs.readFileSync(PHRN_FILE, "utf-8"));
}

export function savePHRNRegistry(list: any[]) {
    ensureDir();
    fs.writeFileSync(PHRN_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function lookupByPHRN(phrn: string): any | null {
    const registry = getPHRNRegistry();
    return registry.find((r: any) => r.phrn === phrn) || null;
}

// ─── Consent Logs ───────────────────────────────────────────────────────────

export function getConsentLogs(): any[] {
    ensureDir();
    if (!fs.existsSync(CONSENT_FILE)) return [];
    return JSON.parse(fs.readFileSync(CONSENT_FILE, "utf-8"));
}

export function saveConsentLogs(list: any[]) {
    ensureDir();
    fs.writeFileSync(CONSENT_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// ─── Adherence Records ──────────────────────────────────────────────────────

export function getAdherenceRecords(): any[] {
    ensureDir();
    if (!fs.existsSync(ADHERENCE_FILE)) return [];
    return JSON.parse(fs.readFileSync(ADHERENCE_FILE, "utf-8"));
}

export function saveAdherenceRecords(list: any[]) {
    ensureDir();
    fs.writeFileSync(ADHERENCE_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export function getAdherenceByPatient(patientId: string): any[] {
    return getAdherenceRecords().filter((r: any) => r.patientId === patientId);
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

const INITIAL_AUDIT: any[] = [];

export function getAuditLog(): any[] {
    ensureDir();
    if (!fs.existsSync(AUDIT_FILE)) {
        fs.writeFileSync(AUDIT_FILE, JSON.stringify(INITIAL_AUDIT, null, 2), "utf-8");
        return INITIAL_AUDIT;
    }
    return JSON.parse(fs.readFileSync(AUDIT_FILE, "utf-8"));
}

export function appendAuditEvent(event: any) {
    ensureDir();
    const log = getAuditLog();
    log.unshift({ ...event, timestamp: new Date().toISOString() });
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(log.slice(0, 500), null, 2), "utf-8");
}

