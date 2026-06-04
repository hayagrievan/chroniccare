import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
    patientId: string;
    name: string;
    age: number;
    gender: string;
    disease: string;
    riskLevel: string;
    state?: string;
    city?: string;
    phone?: string;
    email?: string;
    address?: string;
    assignedDoctor?: string;
    profileImage?: string;
    clinicalMetrics: Array<{
        label: string;
        value: string;
        unit: string;
        trend: string;
        status: string;
    }>;
    suggestedActions: string[];
    historyTimeline: Array<{
        date: string;
        title?: string;
        summary?: string;
        riskLevel?: string;
        doctor?: string;
    }>;
    uploadedReports: Array<{
        fileName: string;
        uploadedAt: string;
        summary?: string;
    }>;
    llmSummary?: string;
    riskReason?: string;
    extractedText?: string;
    lastVisit: string;
    nextAppointment: string;
    createdAt: Date;
}

const MetricSchema = new Schema({
    label: String,
    value: String,
    unit: String,
    trend: { type: String, enum: ["up", "down", "stable"], default: "stable" },
    status: { type: String, enum: ["normal", "warning", "critical"], default: "normal" },
}, { _id: false });

const TimelineSchema = new Schema({
    date: String,
    title: String,
    summary: String,
    riskLevel: String,
    doctor: String,
}, { _id: false });

const PatientSchema = new Schema<IPatient>({
    patientId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: Number,
    gender: String,
    disease: { type: String, enum: ["Heart", "BP", "Sugar", "Stress"] },
    riskLevel: { type: String, enum: ["High", "Medium", "Low"] },
    state: String,
    city: String,
    phone: String,
    email: String,
    address: String,
    assignedDoctor: String,
    profileImage: String,
    clinicalMetrics: [MetricSchema],
    suggestedActions: [String],
    historyTimeline: [TimelineSchema],
    uploadedReports: { type: mongoose.Schema.Types.Mixed, default: [] },
    llmSummary: String,
    riskReason: String,
    extractedText: String,
    lastVisit: String,
    nextAppointment: String,
    createdAt: { type: Date, default: Date.now },
});

PatientSchema.index({ disease: 1, riskLevel: 1, state: 1, city: 1 });

const Patient: Model<IPatient> =
    mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
