import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
    appointmentId: string;
    patientId: string;
    patientName: string;
    disease: string;
    riskLevel: string;
    date: string;
    time: string;
    type: string;
    status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
    doctor: string;
    notes?: string;
    createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
    appointmentId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    disease: String,
    riskLevel: String,
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: String,
    status: {
        type: String,
        enum: ["Confirmed", "Pending", "Completed", "Cancelled"],
        default: "Confirmed",
    },
    doctor: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
});

AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ patientId: 1, date: 1 });

const Appointment: Model<IAppointment> =
    mongoose.models.Appointment ||
    mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
