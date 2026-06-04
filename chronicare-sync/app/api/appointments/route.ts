import { NextRequest, NextResponse } from "next/server";
import { getAppointments, saveAppointments } from "@/lib/jsonDb";

/** GET /api/appointments — list all appointments sorted by date */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const patientId = searchParams.get("patientId");
        
        let appointments = getAppointments();
        if (patientId) {
            appointments = appointments.filter(a => a.patientId === patientId);
        }
        
        // Sort by date (ascending) and time (ascending)
        appointments.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });

        return NextResponse.json(appointments, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** POST /api/appointments — create a new appointment */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { patientId, patientName, disease, riskLevel, date, time, type, doctor, notes } = body;

        if (!patientId || !patientName || !date || !time) {
            return NextResponse.json({ error: "Missing required fields: patientId, patientName, date, time" }, { status: 400 });
        }

        const appointmentId = `A-${Date.now()}`;
        const newAppt = {
            appointmentId,
            patientId,
            patientName,
            disease: disease || "",
            riskLevel: riskLevel || "Medium",
            date,
            time,
            type: type || "Routine Check",
            status: "Confirmed",
            doctor: doctor || "Dr. Priya Nair",
            notes: notes || "",
            createdAt: new Date().toISOString()
        };

        const appointments = getAppointments();
        appointments.push(newAppt);
        saveAppointments(appointments);

        return NextResponse.json(newAppt, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
