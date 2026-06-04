import { NextRequest, NextResponse } from "next/server";
import {
    getPatients, savePatients,
    getAppointments, saveAppointments,
    getPrescriptions, savePrescriptions,
    getAlerts, saveAlerts
} from "@/lib/jsonDb";

/** DELETE /api/patients/[id] — remove patient and associated records from JSON files */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Delete patient from patients.json
        const patients = getPatients();
        const updatedPatients = patients.filter((p: any) => p.id !== id && p.patientId !== id);
        savePatients(updatedPatients);

        // 2. Cascade delete associated appointments
        const appointments = getAppointments();
        const updatedAppointments = appointments.filter((a: any) => a.patientId !== id);
        saveAppointments(updatedAppointments);

        // 3. Cascade delete associated prescriptions
        const prescriptions = getPrescriptions();
        const updatedPrescriptions = prescriptions.filter((pr: any) => pr.patientId !== id);
        savePrescriptions(updatedPrescriptions);

        // 4. Cascade delete associated alerts
        const alerts = getAlerts();
        const updatedAlerts = alerts.filter((al: any) => al.patientId !== id);
        saveAlerts(updatedAlerts);

        return NextResponse.json({ message: "Patient deleted", id, dbDeleted: false });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
