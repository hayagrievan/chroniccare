import { Prescription, DashboardStats, Patient } from '@/types';
import api from './api';

export const pharmacyService = {
    async getPendingPrescriptions(): Promise<Prescription[]> {
        const response = await api.get<Prescription[]>('/api/prescriptions');
        return response.data;
    },

    async dispensePrescription(id: string): Promise<Prescription> {
        const response = await api.patch<Prescription>(`/api/prescriptions/${id}/dispense`);
        return response.data;
    },

    async getDashboardStats(): Promise<DashboardStats> {
        // Derive stats from current pending prescriptions + a quick all-prescriptions call
        const pending = await api.get<Prescription[]>('/api/prescriptions');

        // For dispensed-today and patients served, call all prescriptions (any status)
        // via a generic endpoint; if not available fall back to just pending count
        let dispensedToday = 0;
        let patientsServed = 0;
        try {
            const allResp = await api.get<Prescription[]>('/api/prescriptions/all');
            const all = allResp.data;
            const today = new Date().toDateString();
            dispensedToday = all.filter(
                (p) =>
                    p.status === 'Dispensed' &&
                    p.updatedAt &&
                    new Date(p.updatedAt).toDateString() === today
            ).length;
            patientsServed = new Set(
                all.filter((p) => p.status === 'Dispensed').map((p) => p.patientId)
            ).size;
        } catch {
            // /api/prescriptions/all not yet implemented – derive from pending only
        }

        return {
            totalPending: pending.data.length,
            totalDispensedToday: dispensedToday,
            totalPatientsServed: patientsServed,
        };
    },

    async searchPatient(uid: string): Promise<{ patient: Patient | null; prescriptions: Prescription[] }> {
        const response = await api.get<{ patient: Patient | null; prescriptions: Prescription[] }>(
            `/api/patients/search?uid=${encodeURIComponent(uid)}`
        );
        return response.data;
    },
};
