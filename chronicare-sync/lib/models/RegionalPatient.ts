import mongoose, { Schema, Document, Model } from "mongoose";

/** 
 * Stores the 1000-row Excel dataset for regional analytics aggregation.
 * Separate collection so it doesn't interfere with the doctor's patient list.
 */
export interface IRegionalPatient extends Document {
    patientId: string;
    name: string;
    age: number;
    gender: string;
    disease: string;
    riskLevel: string;
    state: string;
    city: string;
    heartRate: number;
    systolicBP: number;
    diastolicBP: number;
    cholesterol: number;
    hba1c: number;
    bmi: number;
    lastVisit: string;
    nextAppt: string;
}

const RegionalPatientSchema = new Schema<IRegionalPatient>({
    patientId: { type: String, required: true, unique: true },
    name: String,
    age: Number,
    gender: String,
    disease: String,
    riskLevel: String,
    state: { type: String, index: true },
    city: String,
    heartRate: Number,
    systolicBP: Number,
    diastolicBP: Number,
    cholesterol: Number,
    hba1c: Number,
    bmi: Number,
    lastVisit: String,
    nextAppt: String,
});

RegionalPatientSchema.index({ state: 1, disease: 1, riskLevel: 1 });
RegionalPatientSchema.index({ city: 1 });

const RegionalPatient: Model<IRegionalPatient> =
    mongoose.models.RegionalPatient ||
    mongoose.model<IRegionalPatient>("RegionalPatient", RegionalPatientSchema);

export default RegionalPatient;
