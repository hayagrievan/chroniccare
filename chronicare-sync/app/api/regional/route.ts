import { NextRequest, NextResponse } from "next/server";
import path from "path";
import * as xlsx from "xlsx";

interface RegionalRecord {
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

let cachedRecords: RegionalRecord[] | null = null;

function loadRegionalRecords(): RegionalRecord[] {
    if (cachedRecords) return cachedRecords;

    const xlsxPath = path.join(process.cwd(), "public", "Healthcare_Hackathon_Dataset.xlsx");
    const wb = xlsx.readFile(xlsxPath);
    const rawRows: any[] = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

    cachedRecords = rawRows.map(row => ({
        patientId: String(row.Patient_ID || ""),
        name: String(row.Name || ""),
        age: Number(row.Age || 0),
        gender: String(row.Gender || ""),
        disease: String(row.Disease || ""),
        riskLevel: String(row.Risk_Level || ""),
        state: String(row.State || ""),
        city: String(row.City || ""),
        heartRate: Number(row.Heart_Rate || 0),
        systolicBP: Number(row.Systolic_BP || 0),
        diastolicBP: Number(row.Diastolic_BP || 0),
        cholesterol: Number(row.Cholesterol || 0),
        hba1c: Number(row.HbA1c || 0),
        bmi: Number(row.BMI || 0),
        lastVisit: String(row.Last_Visit || ""),
        nextAppt: String(row.Next_Appointment || "")
    }));

    return cachedRecords;
}

function getCounts<T extends string | number>(arr: any[], key: string): { _id: T; count: number }[] {
    const counts: Record<string, number> = {};
    for (const item of arr) {
        const val = item[key];
        counts[val] = (counts[val] || 0) + 1;
    }
    return Object.entries(counts).map(([id, count]) => ({ _id: id as unknown as T, count }));
}

/**
 * GET /api/regional
 * Query params: state, city, disease, riskLevel
 * Returns:
 *  - summary: { total, byDisease, byRisk, byState (top 10) }
 *  - rows: raw paginated patient rows (max 200)
 *  - filters: { states[], cities[], diseases[], riskLevels[] }
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const state = searchParams.get("state") || "";
        const city = searchParams.get("city") || "";
        const disease = searchParams.get("disease") || "";
        const riskLevel = searchParams.get("riskLevel") || "";

        const allRecords = loadRegionalRecords();

        // Match filter
        const filtered = allRecords.filter(row => {
            if (state && row.state !== state) return false;
            if (city && row.city !== city) return false;
            if (disease && row.disease !== disease) return false;
            if (riskLevel && row.riskLevel !== riskLevel) return false;
            return true;
        });

        // 1. total count
        const total = filtered.length;

        // 2. byDisease
        const byDisease = getCounts<string>(filtered, "disease");
        byDisease.sort((a, b) => b.count - a.count);

        // 3. byRisk
        const byRisk = getCounts<string>(filtered, "riskLevel");

        // 4. byState
        const byState = getCounts<string>(filtered, "state");
        byState.sort((a, b) => b.count - a.count);
        const topState = byState.slice(0, 15);

        // 5. byCity
        const byCity = getCounts<string>(filtered, "city");
        byCity.sort((a, b) => b.count - a.count);
        const topCity = byCity.slice(0, 20);

        // 6. avgMetrics
        let avgMetrics: any = {};
        if (total > 0) {
            let sumHR = 0, sumSBP = 0, sumDBP = 0, sumChol = 0, sumHba1c = 0, sumBMI = 0;
            for (const r of filtered) {
                sumHR += r.heartRate;
                sumSBP += r.systolicBP;
                sumDBP += r.diastolicBP;
                sumChol += r.cholesterol;
                sumHba1c += r.hba1c;
                sumBMI += r.bmi;
            }
            avgMetrics = {
                avgHR: sumHR / total,
                avgSBP: sumSBP / total,
                avgDBP: sumDBP / total,
                avgChol: sumChol / total,
                avgHba1c: sumHba1c / total,
                avgBMI: sumBMI / total,
            };
        }

        // 7. byGender
        const byGender = getCounts<string>(filtered, "gender");

        // 8. ageGroups
        const ageGroupCounts: Record<number | string, number> = {
            0: 0,
            18: 0,
            35: 0,
            50: 0,
            65: 0,
            80: 0,
            "Other": 0
        };
        for (const r of filtered) {
            const age = r.age;
            if (age >= 0 && age < 18) ageGroupCounts[0]++;
            else if (age >= 18 && age < 35) ageGroupCounts[18]++;
            else if (age >= 35 && age < 50) ageGroupCounts[35]++;
            else if (age >= 50 && age < 65) ageGroupCounts[50]++;
            else if (age >= 65 && age < 80) ageGroupCounts[65]++;
            else if (age >= 80 && age < 120) ageGroupCounts[80]++;
            else ageGroupCounts["Other"]++;
        }
        const ageGroups = Object.entries(ageGroupCounts)
            .map(([id, count]) => {
                const numericId = id === "Other" ? id : Number(id);
                return { _id: numericId, count };
            })
            .filter(b => b.count > 0);

        // 9. diseaseRisk
        const diseaseRiskCounts: Record<string, number> = {};
        for (const r of filtered) {
            const key = `${r.disease}|||${r.riskLevel}`;
            diseaseRiskCounts[key] = (diseaseRiskCounts[key] || 0) + 1;
        }
        const diseaseRisk = Object.entries(diseaseRiskCounts).map(([key, count]) => {
            const [disease, risk] = key.split("|||");
            return {
                _id: { disease, risk },
                count
            };
        });

        // 10. rows limit 200
        const rows = filtered.slice(0, 200);

        // 11. filters
        const allStates = Array.from(new Set(allRecords.map(r => r.state))).sort();
        const filteredForCities = state ? allRecords.filter(r => r.state === state) : allRecords;
        const allCities = Array.from(new Set(filteredForCities.map(r => r.city))).sort();

        return NextResponse.json({
            total,
            byDisease,
            byRisk,
            byState: topState,
            byCity: topCity,
            avgMetrics,
            byGender,
            ageGroups,
            diseaseRisk,
            rows,
            filters: {
                states: allStates,
                cities: allCities,
                diseases: ["Heart", "BP", "Sugar", "Stress"],
                riskLevels: ["High", "Medium", "Low"],
            },
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
