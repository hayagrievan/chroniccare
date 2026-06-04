/**
 * Seed script: populates MongoDB with
 *   - doctor's patients from data/patients.json
 *   - 1000-row regional dataset from public/Healthcare_Hackathon_Dataset.xlsx
 *   - initial appointments
 *   - initial alerts
 *
 * Run: npx tsx scripts/seed.ts
 */

import mongoose from "mongoose";
import path from "path";
import fs from "fs";
// @ts-ignore — xlsx types bundled at runtime by tsx
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xlsx = require("xlsx");

// ── Point directly at models so we don't need Next.js imports ────────────────
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chronicare";

// ── Inline minimal schemas for the seed script ───────────────────────────────
async function main() {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected ✓");

    // ── Schemas ──────────────────────────────────────────────────────────────
    const MetricSchema = new mongoose.Schema({ label: String, value: String, unit: String, trend: String, status: String }, { _id: false });
    const TimelineSchema = new mongoose.Schema({ date: String, title: String, summary: String, riskLevel: String, doctor: String }, { _id: false });

    const PatientModel = mongoose.models.Patient || mongoose.model("Patient", new mongoose.Schema({
        patientId: { type: String, unique: true }, name: String, age: Number, gender: String,
        disease: String, riskLevel: String, state: String, city: String, phone: String,
        email: String, address: String, assignedDoctor: String, profileImage: String,
        clinicalMetrics: [MetricSchema], suggestedActions: [String], historyTimeline: [TimelineSchema],
        uploadedReports: Array, llmSummary: String, riskReason: String, extractedText: String,
        lastVisit: String, nextAppointment: String, createdAt: { type: Date, default: Date.now },
    }));

    const AppointmentModel = mongoose.models.Appointment || mongoose.model("Appointment", new mongoose.Schema({
        appointmentId: { type: String, unique: true }, patientId: String, patientName: String,
        disease: String, riskLevel: String, date: String, time: String, type: String,
        status: { type: String, default: "Confirmed" }, doctor: String, notes: String,
        createdAt: { type: Date, default: Date.now },
    }));

    const AlertModel = mongoose.models.Alert || mongoose.model("Alert", new mongoose.Schema({
        alertId: { type: String, unique: true }, patientId: String, patientName: String,
        disease: String, riskLevel: String, type: String, message: String,
        metric: String, value: String, threshold: String,
        severity: String, status: { type: String, default: "Active" },
        doctor: String, resolvedAt: Date, createdAt: { type: Date, default: Date.now },
    }));

    const RegionalModel = mongoose.models.RegionalPatient || mongoose.model("RegionalPatient", new mongoose.Schema({
        patientId: { type: String, unique: true }, name: String, age: Number, gender: String,
        disease: String, riskLevel: String, state: String, city: String,
        heartRate: Number, systolicBP: Number, diastolicBP: Number,
        cholesterol: Number, hba1c: Number, bmi: Number, lastVisit: String, nextAppt: String,
    }));

    // ── 1. Seed doctor's patients ─────────────────────────────────────────────
    const patientsFile = path.join(process.cwd(), "data", "patients.json");
    const patients: any[] = JSON.parse(fs.readFileSync(patientsFile, "utf-8"));

    let patCount = 0;
    for (const p of patients) {
        await PatientModel.findOneAndUpdate(
            { patientId: p.id },
            { ...p, patientId: p.id },
            { upsert: true, new: true }
        );
        patCount++;
    }
    console.log(`✓ Seeded ${patCount} doctor patients`);

    // ── 2. Seed regional dataset from Excel ───────────────────────────────────
    const xlsxPath = path.join(process.cwd(), "public", "Healthcare_Hackathon_Dataset.xlsx");
    const wb = xlsx.readFile(xlsxPath);
    const rows: any[] = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    let regCount = 0;
    for (const row of rows) {
        await RegionalModel.findOneAndUpdate(
            { patientId: row.Patient_ID },
            {
                patientId: row.Patient_ID,
                name: row.Name,
                age: row.Age,
                gender: row.Gender,
                disease: row.Disease,
                riskLevel: row.Risk_Level,
                state: row.State,
                city: row.City,
                heartRate: row.Heart_Rate,
                systolicBP: row.Systolic_BP,
                diastolicBP: row.Diastolic_BP,
                cholesterol: row.Cholesterol,
                hba1c: row.HbA1c,
                bmi: row.BMI,
                lastVisit: row.Last_Visit,
                nextAppt: row.Next_Appointment,
            },
            { upsert: true }
        );
        regCount++;
    }
    console.log(`✓ Seeded ${regCount} regional patients from Excel`);

    // ── 3. Seed initial appointments ──────────────────────────────────────────
    const initialAppts = [
        { appointmentId: "A001", patientId: "PAT-005", patientName: "Ravi Chandrasekaran", disease: "Heart", riskLevel: "High", date: "2026-02-27", time: "09:00", type: "Urgent Review", status: "Confirmed", doctor: "Dr. Priya Nair" },
        { appointmentId: "A002", patientId: "PAT-003", patientName: "Venkatesh Iyer", disease: "BP", riskLevel: "High", date: "2026-02-27", time: "10:30", type: "Follow-up", status: "Confirmed", doctor: "Dr. Priya Nair" },
        { appointmentId: "A003", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", date: "2026-02-27", time: "12:00", type: "Cardiac Check", status: "Pending", doctor: "Dr. Priya Nair" },
        { appointmentId: "A004", patientId: "PAT-002", patientName: "Meera Krishnamurthy", disease: "Sugar", riskLevel: "Medium", date: "2026-02-27", time: "14:30", type: "Diabetes Review", status: "Completed", doctor: "Dr. Priya Nair" },
        { appointmentId: "A005", patientId: "PAT-004", patientName: "Lakshmi Patel", disease: "Stress", riskLevel: "Low", date: "2026-02-28", time: "09:30", type: "Counselling", status: "Confirmed", doctor: "Dr. Priya Nair" },
        { appointmentId: "A006", patientId: "PAT-006", patientName: "Divya Menon", disease: "Sugar", riskLevel: "Low", date: "2026-03-01", time: "11:00", type: "Routine Check", status: "Confirmed", doctor: "Dr. Priya Nair" },
        { appointmentId: "A007", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", date: "2026-03-05", time: "10:00", type: "Echo follow-up", status: "Confirmed", doctor: "Dr. Priya Nair" },
        { appointmentId: "A008", patientId: "PAT-002", patientName: "Meera Krishnamurthy", disease: "Sugar", riskLevel: "Medium", date: "2026-03-10", time: "15:00", type: "HbA1c Review", status: "Pending", doctor: "Dr. Priya Nair" },
    ];

    for (const a of initialAppts) {
        await AppointmentModel.findOneAndUpdate({ appointmentId: a.appointmentId }, a, { upsert: true });
    }
    console.log(`✓ Seeded ${initialAppts.length} appointments`);

    // ── 4. Seed initial alerts ────────────────────────────────────────────────
    const initialAlerts = [
        { alertId: "ALT-001", patientId: "PAT-005", patientName: "Ravi Chandrasekaran", disease: "Heart", riskLevel: "High", type: "Vital Sign", message: "SpO2 dropped to 93% — below critical threshold of 94%.", metric: "SpO2", value: "93%", threshold: "< 94%", severity: "Critical", status: "Active", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-002", patientId: "PAT-003", patientName: "Venkatesh Iyer", disease: "BP", riskLevel: "High", type: "Hypertensive Crisis", message: "Blood pressure 168/104 mmHg — Stage 2 hypertension.", metric: "Systolic BP", value: "168 mmHg", threshold: "> 160 mmHg", severity: "Critical", status: "Active", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-003", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", type: "Cardiac Alert", message: "Troponin I elevated at 0.12 ng/mL — active myocardial injury suspected.", metric: "Troponin I", value: "0.12 ng/mL", threshold: "> 0.04 ng/mL", severity: "High", status: "Acknowledged", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-004", patientId: "PAT-002", patientName: "Meera Krishnamurthy", disease: "Sugar", riskLevel: "Medium", type: "Glucose Alert", message: "Post-prandial glucose at 210 mg/dL — above 180 mg/dL target.", metric: "Post-prandial Glucose", value: "210 mg/dL", threshold: "> 180 mg/dL", severity: "Medium", status: "Active", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-005", patientId: "PAT-001", patientName: "Arjun Sharma", disease: "Heart", riskLevel: "High", type: "Missed Medication", message: "Metoprolol dose not recorded today.", severity: "Medium", status: "Active", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-006", patientId: "PAT-004", patientName: "Lakshmi Patel", disease: "Stress", riskLevel: "Low", type: "Wellness Alert", message: "GAD-7 anxiety score increased to 14.", severity: "Low", status: "Acknowledged", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-007", patientId: "PAT-003", patientName: "Venkatesh Iyer", disease: "BP", riskLevel: "High", type: "Lab Result", message: "Potassium level 3.4 mEq/L — below normal range.", metric: "Potassium", value: "3.4 mEq/L", threshold: "< 3.5 mEq/L", severity: "High", status: "Resolved", doctor: "Dr. Priya Nair" },
        { alertId: "ALT-008", patientId: "PAT-005", patientName: "Ravi Chandrasekaran", disease: "Heart", riskLevel: "High", type: "BNP Elevation", message: "BNP at 520 pg/mL — suggests acute heart failure.", metric: "BNP", value: "520 pg/mL", threshold: "> 400 pg/mL", severity: "Critical", status: "Active", doctor: "Dr. Priya Nair" },
    ];

    for (const a of initialAlerts) {
        await AlertModel.findOneAndUpdate({ alertId: a.alertId }, a, { upsert: true });
    }
    console.log(`✓ Seeded ${initialAlerts.length} alerts`);

    await mongoose.disconnect();
    console.log("\n🎉 Seed complete! All collections populated.");
}

main().catch(err => { console.error("Seed failed:", err); process.exit(1); });
