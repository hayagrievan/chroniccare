import { NextRequest, NextResponse } from "next/server";
import { getAppointments, saveAppointments } from "@/lib/jsonDb";

/** PATCH /api/appointments/[id] — update appointment status */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status, notes } = await req.json();

        const appointments = getAppointments();
        const apptIndex = appointments.findIndex(a => a.appointmentId === id);

        if (apptIndex === -1) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (status) appointments[apptIndex].status = status;
        if (notes !== undefined) appointments[apptIndex].notes = notes;

        saveAppointments(appointments);
        return NextResponse.json(appointments[apptIndex]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/** DELETE /api/appointments/[id] — cancel an appointment */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const appointments = getAppointments();
        const apptIndex = appointments.findIndex(a => a.appointmentId === id);

        if (apptIndex !== -1) {
            appointments[apptIndex].status = "Cancelled";
            saveAppointments(appointments);
        }
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
