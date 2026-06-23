const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Path to your CSV files
const DATA_DIR = path.join(__dirname, '../../data');

async function buildDatabase() {
  // Step A: Initialize sql.js
  const SQL = await initSqlJs();
  const db = new SQL.Database(); // creates empty in-memory DB

  // Step B: Read and run schema.sql to create tables
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.run(schema);

  // Step C: Load the 3 monthly PBL CSVs
  const pblFiles = [
    'PBL_School_Response_Data_July_2025.csv',
    'PBL_School_Response_Data_August_2025.csv',
    'PBL_School_Response_Data_September_2025.csv',
  ];

  for (const file of pblFiles) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const rows = parse(raw, { columns: true, skip_empty_lines: true });

    for (const row of rows) {
      db.run(`
        INSERT INTO pbl_responses (
          reporting_month, school_name, school_code,
          district, block,
          pbl_conducted, evidence_submitted,
          classes, subject,
          enroll_6, attend_6_science, attend_6_math,
          enroll_7, attend_7_science, attend_7_math,
          enroll_8, attend_8_science, attend_8_math,
          total_enrollment, total_attendance,
          attendance_rate, risk_status
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [
        row['Reporting Month'],
        row['What is the name of your school?'],
        row["What is your school's synthetic school code?"],
        row['What is the name of your district?'],
        row['Block Details'],
        row['Was the PBL project conducted in your school this month?'] === 'Yes' ? 1 : 0,
        row['Was evidence submitted for the completed PBL project?'] === 'Yes' ? 1 : 0,
        row['In which class/classes did you conduct the PBL project?'],
        row['Which subject do you teach?'],
        // Class 6
        parseFloat(row['Total number of students enrolled in Class 6, including all sections']) || 0,
        parseFloat(row['Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0.']) || 0,
        parseFloat(row['Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0.']) || 0,
        // Class 7
        parseFloat(row['Total number of students enrolled in Class 7, including all sections']) || 0,
        parseFloat(row['Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0.']) || 0,
        parseFloat(row['Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0.']) || 0,
        // Class 8
        parseFloat(row['Total number of students enrolled in Class 8, including all sections']) || 0,
        parseFloat(row['Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0.']) || 0,
        parseFloat(row['Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0.']) || 0,
        // Derived
        parseInt(row['Derived: Total enrollment across Classes 6-8']) || 0,
        parseInt(row['Derived: Total attendance across PBL Science and Math sessions']) || 0,
        parseFloat(row['Derived: Overall PBL attendance rate']) || 0,
        row['Derived: Risk status'],
      ]);
    }
  }
  console.log('✅ PBL responses seeded');

  // Step D: Load Grant Finance CSV
  const financeRaw = fs.readFileSync(path.join(DATA_DIR, '01_Grant_Profile_and_Finance.csv'), 'utf8');
  const financeRows = parse(financeRaw, { columns: true, skip_empty_lines: true });
  for (const row of financeRows) {
    db.run(`
      INSERT INTO grant_finance (
        grant_id, donor, grant_name, period_start, period_end,
        covered_districts, reporting_month, budget_line,
        approved_budget_units, monthly_utilized_units,
        cumulative_utilized_units, cumulative_utilization_rate, finance_note
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      row.grant_id, row.donor, row.grant_name,
      row.period_start, row.period_end, row.covered_districts,
      row.reporting_month, row.budget_line,
      parseFloat(row.approved_budget_units) || 0,
      parseFloat(row.monthly_utilized_units) || 0,
      parseFloat(row.cumulative_utilized_units) || 0,
      parseFloat(row.cumulative_utilization_rate) || 0,
      row.finance_note,
    ]);
  }
  console.log('✅ Grant finance seeded');

  // Step E: Load Grant Performance CSV
  const perfRaw = fs.readFileSync(path.join(DATA_DIR, '02_Grant_Performance_and_Report_Material.csv'), 'utf8');
  const perfRows = parse(perfRaw, { columns: true, skip_empty_lines: true });
  for (const row of perfRows) {
    db.run(`
      INSERT INTO grant_performance (
        grant_id, donor, grant_name, reporting_month,
        report_status, covered_districts, sampled_school_records,
        schools_completed_pbl, pbl_completion_rate,
        schools_with_evidence, evidence_submission_rate,
        total_enrollment, total_attendance, attendance_rate,
        risk_status, milestone_summary, draft_report_text
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      row.grant_id, row.donor, row.grant_name, row.reporting_month,
      row.report_status, row.covered_districts,
      parseInt(row.sampled_school_records) || 0,
      parseInt(row.schools_completed_pbl) || 0,
      parseFloat(row.pbl_completion_rate) || 0,
      parseInt(row.schools_with_evidence) || 0,
      parseFloat(row.evidence_submission_rate) || 0,
      parseInt(row.total_enrollment) || 0,
      parseInt(row.total_attendance) || 0,
      parseFloat(row.attendance_rate) || 0,
      row.risk_status, row.milestone_summary, row.draft_report_text,
    ]);
  }
  console.log('✅ Grant performance seeded');

  // Step F: Load Evidence/Media CSV
  const mediaRaw = fs.readFileSync(path.join(DATA_DIR, '03_Evidence_and_Media_Index.csv'), 'utf8');
  const mediaRows = parse(mediaRaw, { columns: true, skip_empty_lines: true });
  for (const row of mediaRows) {
    db.run(`
      INSERT INTO evidence_media (
        record_id, record_type, grant_id, donor,
        reporting_month, district, title,
        summary_or_caption, file_name, relative_path
      ) VALUES (?,?,?,?,?,?,?,?,?,?)
    `, [
      row.record_id, row.record_type, row.grant_id, row.donor,
      row.reporting_month, row.district, row.title,
      row.summary_or_caption, row.file_name, row.relative_path,
    ]);
  }
  console.log('✅ Evidence media seeded');

  // Step G: Export the database to a file so Express can load it
  const data = db.export(); // returns Uint8Array
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, 'pbl.db'), buffer);
  console.log('✅ Database saved to db/pbl.db');

  db.close();
}

buildDatabase().catch(console.error);