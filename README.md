# Mantra4Change PBL Program Intelligence & Grant Reporting Assistant

## Setup Instructions

### Prerequisites
- Node.js v18+
- npm

### Installation

1. Clone the repository
2. Install server dependencies:

cd server
npm install

3. Seed the database:

node db/seed.js

4. Start the server:

node index.js

5. Install client dependencies:

cd ../client
npm install

6. Start the frontend:

npm run dev

7. Open http://localhost:5173

### Environment Variables
Create server/.env with:

GROQ_API_KEY=your_groq_api_key_here

---

## Architecture Overview

mantra4change-pbl/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # DashboardPage, SummaryPage, GrantPage
│       └── api.js   # Axios API calls
├── server/          # Node.js + Express backend
│   ├── db/
│   │   ├── schema.sql   # SQLite table definitions
│   │   └── seed.js      # CSV to sql.js database builder
│   ├── routes/
│   │   ├── dashboard.js # Program review API
│   │   ├── summary.js   # Monthly review summary API
│   │   └── grants.js    # Grant reporting API
│   ├── services/
│   │   ├── riskEngine.js    # Deterministic risk classification
│   │   └── aiNarrative.js   # AI narrative generation via Groq
│   └── index.js     # Express server entry point
└── data/            # Source CSV files and images

Frontend: React with Vite, axios for API calls
Backend: Node.js + Express REST API
Database: sql.js (SQLite in-memory, loaded from .db file on startup)
AI: Groq API (llama-3.1-8b-instant) for grant narrative generation

---

## Data Model

### pbl_responses
School-level monthly PBL survey responses. One row per teacher/subject/month submission.
Key fields: school_code, district, block, reporting_month, pbl_conducted, evidence_submitted, attendance_rate

### grant_finance
Budget utilization per grant per month per budget line.
Key fields: grant_id, reporting_month, budget_line, approved_budget_units, cumulative_utilization_rate

### grant_performance
Grant-level monthly performance metrics.
Key fields: grant_id, pbl_completion_rate, evidence_submission_rate, risk_status, milestone_summary

### evidence_media
Linked media assets (photos, news clips, recognition records) per grant.
Key fields: grant_id, record_type, file_name, district

---

## Risk Classification Logic

Implemented in server/services/riskEngine.js

Status       | Threshold
-------------|---------------------------
On Track     | >= 75% participation
Behind       | 60% to below 75%
At Risk      | 35% to below 60%
Critical     | below 35%

Risk is calculated from participation rate (schools that conducted PBL divided by total schools).
The Why column shows which specific metrics triggered the risk flag.

---

## AI Workflow

Flow: Deterministic metrics → Structured facts → Groq LLM → Grant narrative

1. User selects grant and month
2. Backend computes: PBL completion %, evidence %, attendance %, milestones, risk status
3. Facts sent to Groq with strict prompt: use ONLY these facts, do not invent numbers
4. Generated narrative displayed alongside source facts for traceability

Graceful fallback: If AI is disabled, the fact panel (metrics, finance table, milestones, evidence gallery) still works fully without any AI call.

---

## Assumptions

- Multiple CSV rows per school per month (one per teacher/subject) — participation counted using COUNT(DISTINCT school_code) to avoid double-counting
- Attendance rate stored as a decimal (0-1) in the database
- Risk classification based on participation rate as the primary indicator
- Evidence rate calculated as: schools with evidence divided by schools that participated
- Grade filter uses LIKE matching on the classes field

---

## Limitations

- sql.js loads the entire database into memory — suitable for this dataset size but not for production scale
- No authentication or user management
- AI narrative depends on Groq availability with no retry logic
- Images served as static files from server/public/images

---

## Production Readiness Notes

- Replace sql.js with PostgreSQL or Supabase for persistence and scalability
- Add authentication (JWT or session-based)
- Move AI calls to a queue to handle rate limits
- Add input sanitization to prevent SQL injection in filter params
- Deploy frontend to Vercel or Netlify, backend to Railway or Render

---

## Future Improvements

- Export grant reports to PDF or DOCX
- Recommended actions per district/block with owner and due date
- Trend charts showing month-over-month movement visually
- Email alerts for districts that drop to Critical risk
- Mobile-responsive design