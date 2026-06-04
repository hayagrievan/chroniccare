import mongoose, { Schema, Document, Model } from "mongoose";

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type AlertStatus = "Active" | "Acknowledged" | "Resolved";

export interface IAlert extends Document {
    alertId: string;
    patientId: string;
    patientName: string;
    disease: string;
    riskLevel: string;
    type: string;
    message: string;
    metric?: string;
    value?: string;
    threshold?: string;
    severity: Severity;
    status: AlertStatus;
    doctor: string;
    resolvedAt?: Date;
    createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
    alertId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, index: true },
    patientName: String,
    disease: String,
    riskLevel: String,
    type: String,
    message: String,
    metric: String,
    value: String,
    threshold: String,
    severity: { type: String, enum: ["Critical", "High", "Medium", "Low"] },
    status: {
        type: String,
        enum: ["Active", "Acknowledged", "Resolved"],
        default: "Active",
    },
    doctor: String,
    resolvedAt: Date,
    createdAt: { type: Date, default: Date.now },
});

AlertSchema.index({ status: 1, createdAt: -1 });
AlertSchema.index({ severity: 1, status: 1 });

const Alert: Model<IAlert> =
    mongoose.models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);

export default Alert;
