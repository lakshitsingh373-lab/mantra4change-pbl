CREATE TABLE IF NOT EXISTS pbl_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporting_month TEXT,
  school_name TEXT,
  school_code TEXT,
  district TEXT,
  block TEXT,
  pbl_conducted INTEGER,      -- 1 = Yes, 0 = No
  evidence_submitted INTEGER, -- 1 = Yes, 0 = No
  classes TEXT,
  subject TEXT,
  enroll_6 INTEGER,
  attend_6_science REAL,
  attend_6_math REAL,
  enroll_7 INTEGER,
  attend_7_science REAL,
  attend_7_math REAL,
  enroll_8 INTEGER,
  attend_8_science REAL,
  attend_8_math REAL,
  total_enrollment INTEGER,
  total_attendance INTEGER,
  attendance_rate REAL,
  risk_status TEXT
);

CREATE TABLE IF NOT EXISTS grant_finance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grant_id TEXT,
  donor TEXT,
  grant_name TEXT,
  period_start TEXT,
  period_end TEXT,
  covered_districts TEXT,
  reporting_month TEXT,
  budget_line TEXT,
  approved_budget_units REAL,
  monthly_utilized_units REAL,
  cumulative_utilized_units REAL,
  cumulative_utilization_rate REAL,
  finance_note TEXT
);

CREATE TABLE IF NOT EXISTS grant_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grant_id TEXT,
  donor TEXT,
  grant_name TEXT,
  reporting_month TEXT,
  report_status TEXT,
  covered_districts TEXT,
  sampled_school_records INTEGER,
  schools_completed_pbl INTEGER,
  pbl_completion_rate REAL,
  schools_with_evidence INTEGER,
  evidence_submission_rate REAL,
  total_enrollment INTEGER,
  total_attendance INTEGER,
  attendance_rate REAL,
  risk_status TEXT,
  milestone_summary TEXT,
  draft_report_text TEXT
);

CREATE TABLE IF NOT EXISTS evidence_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_id TEXT,
  record_type TEXT,
  grant_id TEXT,
  donor TEXT,
  reporting_month TEXT,
  district TEXT,
  title TEXT,
  summary_or_caption TEXT,
  file_name TEXT,
  relative_path TEXT
);