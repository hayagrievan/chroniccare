import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrescriptionItem {
    medicineId: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
}

export interface IPrescription extends Document {
    prescriptionId: string;
    patientId: string;
    patientName: string;
    disease: string;
    doctorId: string;
    doctorName: string;
    items: IPrescriptionItem[];
    diagnosis: string;
    notes?: string;
    status: "Pending" | "Dispensed" | "Cancelled";
    pharmacyShared: boolean;
    sharedAt?: Date;
    createdAt: Date;
    updatedAt?: Date;
}

const ItemSchema = new Schema<IPrescriptionItem>({
    medicineId: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: String,
    frequency: String,
    duration: String,
    quantity: Number,
    instructions: String,
}, { _id: false });

const PrescriptionSchema = new Schema<IPrescription>({
    prescriptionId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, index: true },
    patientName: String,
    disease: String,
    doctorId: String,
    doctorName: String,
    items: [ItemSchema],
    diagnosis: String,
    notes: String,
    status: { type: String, enum: ["Pending", "Dispensed", "Cancelled"], default: "Pending" },
    pharmacyShared: { type: Boolean, default: false },
    sharedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

PrescriptionSchema.index({ patientId: 1, createdAt: -1 });
PrescriptionSchema.index({ status: 1 });

const Prescription: Model<IPrescription> =
    mongoose.models.Prescription ||
    mongoose.model<IPrescription>("Prescription", PrescriptionSchema);

export default Prescription;
