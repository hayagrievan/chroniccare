import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThresholdSettings extends Document {
    doctorId: string;
    heartRate: number;
    systolicBP: number;
    spo2: number;
    glucose: number;
    updatedAt: Date;
}

const ThresholdSchema = new Schema<IThresholdSettings>({
    doctorId: { type: String, required: true, unique: true },
    heartRate: { type: Number, default: 90 },
    systolicBP: { type: Number, default: 140 },
    spo2: { type: Number, default: 95 },
    glucose: { type: Number, default: 180 },
    updatedAt: { type: Date, default: Date.now },
});

const ThresholdSettings: Model<IThresholdSettings> =
    mongoose.models.ThresholdSettings ||
    mongoose.model<IThresholdSettings>("ThresholdSettings", ThresholdSchema);

export default ThresholdSettings;
