# ChronicCare Sync

> **A high-fidelity healthcare management platform** for doctors to track chronic disease patients and government admins to monitor regional disease trends — powered by **Groq AI** (llama-3.3-70b-versatile).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [Data Architecture](#data-architecture)
- [Backend API Routes](#backend-api-routes)
- [PDF Report Upload](#pdf-report-upload)
- [Adding Patients / Modifying Data](#adding-patients--modifying-data)
- [Design System](#design-system)
- [Known Limitations / Notes](#known-limitations--notes)

---

## Overview

ChronicCare Sync is a **Next.js 16** frontend + backend platform with:

| Portal | Users | Key Features |
|---|---|---|
| **Doctor Portal** | Clinicians | Patient list, appointments, health monitoring, AI clinical analysis, PDF report upload |
| **Government Portal** | Health ministry staff | Regional analytics, disease trends, alert management |

Authentication is **mock-based** (no real auth server). Demo credentials are built in.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom CSS design tokens |
| Charts | Recharts |
| Icons | Lucide React |
| AI / LLM | Groq SDK — `llama-3.3-70b-versatile` |
| PDF Parsing | `pdf-parse` (server-side Node.js, text-based PDFs) |
| Data Storage | Local JSON files (`/data/`) — no database |

---

## Project Structure

```
chronicare-sync/
├── app/
│   ├── api/
│   │   ├── analyze-patient/   # POST — Groq clinical analysis from patient metrics
│   │   │   └── route.ts
│   │   ├── chat/              # POST — Groq streaming chat (patient context aware)
│   │   │   └── route.ts
│   │   └── upload-report/     # POST — PDF upload → pdf-parse → Groq extraction
│   │       └── route.ts
│   ├── globals.css            # Pastel design system tokens + utility classes
│   ├── layout.tsx
│   └── page.tsx               # Auth state + route switch
│
├── components/
│   ├── LoginPage.tsx           # Sign In / Create Account
│   ├── Sidebar.tsx             # Role-aware sidebar nav
│   ├── DoctorDashboard.tsx     # Patient overview + search/filter
│   ├── PatientCard.tsx         # Patient list card (compact + full)
│   ├── PatientDetail.tsx       # Split-screen: PDF viewer + AI analysis + upload
│   ├── SwitchDoctorModal.tsx   # Transfer patient modal
│   ├── AdminDashboard.tsx      # Regional analytics overview
│   ├── MyPatientsPage.tsx      # Sortable patient table + expandable rows
│   ├── AppointmentsPage.tsx    # Calendar + booking modal
│   ├── HealthMonitoringPage.tsx# Live vitals + threshold sliders + alert feed
│   ├── DiseaseTrendsPage.tsx   # Area chart + heatmap + time filters
│   ├── AlertManagementPage.tsx # Tabbed inbox + acknowledge/resolve
│   └── SettingsPage.tsx        # Profile, Notifications, Security, Appearance
│
├── data/                       # ⭐ Edit these JSON files to add/modify data
│   ├── patients.json           # All patient records
│   └── adminStats.json         # Admin stats, region data, disease trends
│
├── lib/
│   └── mockData.ts             # Type definitions + JSON data loaders
│
├── .env.local                  # ← YOU MUST CREATE THIS (see below)
├── .env.local.example          # Template
└── README.md
```

---

## Quick Start

### 1. Clone / open the project

```bash
cd "c:\Dev\health companinion\chronicare-sync"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Groq API key (see [Environment Variables](#environment-variables)).

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Demo login

| Role | Email | Password |
|---|---|---|
| Doctor | `doctor@hospital.com` | `demo1234` |
| Govt Admin | `admin@health.gov` | `demo1234` |

> Any email **containing "admin"** → Admin portal. Any other email → Doctor portal.

---

## Environment Variables

Create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### Getting a Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Go to **API Keys** → **Create API Key**
4. Copy the key into `.env.local`
5. Restart the dev server: `npm run dev`

> **Without a key:** The app works in "offline mode" — patient cards and dashboards display mock data. The Clinical Metrics tab shows a cached summary. PDF upload still extracts text but skips Groq analysis.

---

## Features

### Doctor Portal

#### Patient Overview  
- Patient cards with name, age, disease chip, risk badge (pastel High/Medium/Low)
- Search by name or Patient ID
- Filter by risk level + disease type
- Click any card to open the **Patient Detail** split-screen

#### Patient Detail (split-screen)
- **Left panel:** Auto-generated medical report letter (hospital letterhead, clinical findings)
- **Right panel — 4 tabs:**
  1. **Clinical** — shimmer-loading Groq AI summary, metric grid, risk assessment, suggested actions, Re-analyze button
  2. **History** — expandable visit timeline
  3. **AI Chat** — streaming chat with patient context (Groq llama-3.3-70b)
  4. **Reports** — PDF upload, extraction results (see [PDF Report Upload](#pdf-report-upload))

#### My Patients  
Sortable table with expandable rows showing inline metrics and AI summary.

#### Appointments  
Interactive month calendar with risk-colored appointment dots, day-detail panel, Book Appointment modal.

#### Health Monitoring  
Live vitals sparkline charts (simulated), configurable alert thresholds via sliders, real-time alert feed.

### Government Portal

#### Regional Analytics  
Stat cards, state/city dropdowns, district risk-ratio table.

#### Disease Trends  
Time-range filters (7d / 30d / 90d / 1yr), toggle-able area chart by disease, regional bar chart, color-coded heatmap.

#### Alert Management  
Tabbed inbox (All / Critical / Pending / Resolved), one-click Acknowledge / Resolve / Escalate, alert statistics.

### Settings  
5 sub-sections: Profile (photo, bio, contact), Notifications (7 toggles), Security (password, 2FA, sessions), Appearance (theme, density, font size, accent), Danger Zone.

---

## Data Architecture

All runtime data lives in **plain JSON files** under `/data/`. No database is required.

### `data/patients.json`

Array of patient objects. Each patient has:

```json
{
  "id": "PAT-001",
  "name": "Arjun Sharma",
  "age": 58,
  "gender": "Male",
  "disease": "Heart",
  "riskLevel": "High",
  "phone": "+91 98765 43210",
  "email": "arjun.sharma@email.com",
  "address": "...",
  "lastVisit": "2026-02-20",
  "nextAppointment": "2026-03-05",
  "assignedDoctor": "Dr. Priya Nair",
  "profileImage": "",
  "uploadedReports": [],
  "clinicalMetrics": [
    { "label": "Heart Rate", "value": "94", "unit": "bpm", "trend": "up", "status": "warning" }
  ],
  "suggestedActions": ["..."],
  "historyTimeline": [
    { "date": "Feb 20, 2026", "title": "...", "summary": "...", "riskLevel": "High", "doctor": "..." }
  ],
  "llmSummary": "Cached AI summary shown as fallback when Groq is unavailable."
}
```

**Valid values:**
- `disease`: `"Heart"` | `"BP"` | `"Sugar"` | `"Stress"`
- `riskLevel`: `"High"` | `"Medium"` | `"Low"`
- `gender`: `"Male"` | `"Female"`
- `trend`: `"up"` | `"down"` | `"stable"`
- `status`: `"normal"` | `"warning"` | `"critical"`

### `data/adminStats.json`

Contains: `adminStats`, `regionOptions`, `diseasePrevalenceData`, `growthTrendData`, `districtData`.

### `lib/mockData.ts`

Thin TypeScript module that:
1. Defines all interfaces (`Patient`, `ClinicalMetric`, `UploadedReport`, etc.)
2. Imports and re-exports data from the JSON files

**Do not add raw data here** — keep all data in the JSON files.

---

## Backend API Routes

All routes are Next.js App Router API handlers under `app/api/`.

### `POST /api/analyze-patient`

**Purpose:** Send patient metrics to Groq and get a clinical analysis.

**Request body:**
```json
{ "patient": { ...Patient object... } }
```

**Response:**
```json
{
  "summary": "Clinical narrative...",
  "riskLevel": "High",
  "riskReason": "Explanation...",
  "suggestedActions": ["action1", "action2"]
}
```

**Model:** `llama-3.3-70b-versatile` · Temperature: 0.3

---

### `POST /api/chat`

**Purpose:** Streaming patient-context-aware clinical chat.

**Request body:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "patientContext": { ...Patient object... }
}
```

**Response:** `text/plain` streaming (ReadableStream), token by token.

**Model:** `llama-3.3-70b-versatile` · Temperature: 0.4 · Streaming: true

---

### `POST /api/upload-report`

**Purpose:** Upload a patient's medical PDF, extract text, and run Groq analysis.

**Request:** `multipart/form-data`
- `file` — PDF file (max 10 MB, text-based PDFs only)
- `patientId` — Patient ID string

**Processing pipeline:**
1. Validate file type + size
2. `pdf-parse` → extract raw text from PDF
3. Groq `llama-3.3-70b-versatile` → parse text into structured JSON
4. Return combined result

**Response:**
```json
{
  "filename": "patient_report.pdf",
  "uploadedAt": "2026-02-27T14:30:00Z",
  "extractedText": "...",
  "patientId": "PAT-001",
  "wordCount": 423,
  "groqAnalysis": {
    "summary": "...",
    "riskLevel": "High",
    "riskReason": "...",
    "suggestedActions": ["..."],
    "extractedMetrics": [
      { "label": "Blood Pressure", "value": "148", "unit": "mmHg", "trend": "up", "status": "critical" }
    ]
  }
}
```

**Error responses:**
- `400` — No file provided
- `400` — Not a PDF
- `422` — Image-only (scanned) PDF — upload a text-based PDF
- `422` — PDF text too short / empty
- `500` — Internal error

---

## PDF Report Upload

The **Reports tab** in Patient Detail supports:

1. **Drag & drop** or **click to browse** a `.pdf` file
2. File is sent to `/api/upload-report`
3. Server extracts text using `pdf-parse`
4. Extracted text is sent to Groq for structured extraction
5. Results appear as an expandable card with:
   - AI Summary
   - Extracted clinical metrics (color-coded by status)
   - Suggested actions (ordered by urgency)

### Requirements for PDF Upload

| Requirement | Detail |
|---|---|
| File type | `.pdf` only |
| Max size | 10 MB |
| PDF type | **Text-based** (typed/digital PDFs). Scanned/image PDFs are not supported — the text extraction will fail. |
| GROQ_API_KEY | Required for AI extraction. Without it, only raw extracted text is returned. |

### How to Convert Scanned PDFs

If you have image/scanned PDFs, first run them through an OCR tool:
- [Adobe Acrobat](https://acrobat.adobe.com) → Export as Searchable PDF
- [iLovePDF](https://www.ilovepdf.com/ocr-pdf) (online, free)
- Tesseract OCR (open source, CLI)

---

## Adding Patients / Modifying Data

### Add a new patient

Edit `data/patients.json` — add a new object to the array:

```json
{
  "id": "PAT-007",
  "name": "New Patient Name",
  "age": 45,
  "gender": "Female",
  "disease": "BP",
  "riskLevel": "Medium",
  "phone": "+91 99999 99999",
  "email": "patient@email.com",
  "address": "City, State",
  "lastVisit": "2026-02-27",
  "nextAppointment": "2026-03-15",
  "assignedDoctor": "Dr. Priya Nair",
  "profileImage": "",
  "uploadedReports": [],
  "clinicalMetrics": [
    { "label": "Systolic BP", "value": "145", "unit": "mmHg", "trend": "up", "status": "warning" }
  ],
  "suggestedActions": ["Schedule BP monitoring"],
  "historyTimeline": [],
  "llmSummary": "Fallback summary shown when Groq is unavailable."
}
```

Save the file — **no rebuild needed**, the dev server hot-reloads.

### Modify admin/trend data

Edit `data/adminStats.json` — change values in `diseasePrevalenceData`, `growthTrendData`, or `districtData` arrays.

---

## Design System

The app uses a **pastel design token system** defined in `app/globals.css`.

| Token | Value | Used For |
|---|---|---|
| `--blue-deep` | `#3b5bdb` | Sidebar gradient start |
| `--blue-mid` | `#4c6ef5` | Primary buttons, links |
| `--blue-pastel` | `#dbe4ff` | Chips, backgrounds |
| `--red-pastel` | `#ffe3e3` | High risk badges |
| `--amber-pastel` | `#fff3bf` | Medium risk, warnings |
| `--green-pastel` | `#d3f9d8` | Low risk, normal status |
| `--purple-pastel` | `#e5dbff` | BP disease chip |
| `--teal-pastel` | `#c5f6fa` | Stress disease chip |
| `--bg-canvas` | `#f4f6fb` | Page background |

**CSS utility classes:**
- `.shimmer` — animated skeleton loader
- `.ai-cursor` — blinking cursor for streaming text
- `.card-hover` — translateY lift on hover
- `.btn-primary` — periwinkle gradient button with shadow
- `.fade-in` — opacity + translateY entrance animation
- `.glass-card` — frosted glass background
- `.page-header` — white-to-blue gradient header

---

## Known Limitations / Notes

1. **No persistent database.** Uploaded reports are stored in React component state (lost on page refresh). To persist, integrate a database (PostgreSQL, Supabase, MongoDB) and update the upload-report route to write to it.

2. **Authentication is mocked.** No real session, JWT, or OAuth. For production, integrate NextAuth.js or Clerk.

3. **Scanned PDFs are not supported.** Only text-based (digitally created) PDFs work with pdf-parse. For scanned documents, add Tesseract.js or an OCR API (e.g., AWS Textract, Google DocumentAI).

4. **The Groq API key is required** for AI features. All pages remain fully navigable and usable with mock data without it.

5. **Rate limits.** Groq free tier has rate limits. If you see 429 errors, add a delay or upgrade to a paid Groq plan.

6. **Data/patients.json is the source of truth.** Any UI changes to patient data (uploaded reports, new metrics) are not written back to the JSON file — they live in React state. To persist UI changes, add a PATCH/POST API route that writes to the JSON file or a database.
