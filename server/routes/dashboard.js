const express = require('express');
const router = express.Router();
const { getDb } = require('../index');
const { classifyRisk, getRiskColor } = require('../services/riskEngine');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { month, district, block, grade, subject } = req.query;

    let where = 'WHERE 1=1';
    if (month) where += ` AND reporting_month = '${month}'`;
    if (district) where += ` AND district = '${district}'`;
    if (block) where += ` AND block = '${block}'`;
    if (grade) where += ` AND classes LIKE '%${grade}%'`;
    if (subject) where += ` AND subject = '${subject}'`;

    const result = db.exec(`
      SELECT
        COUNT(DISTINCT school_code) as total_schools,
        COUNT(DISTINCT CASE WHEN pbl_conducted = 1 THEN school_code END) as participated,
        COUNT(DISTINCT CASE WHEN evidence_submitted = 1 THEN school_code END) as evidence,
        AVG(total_enrollment) as enrollment,
        AVG(attendance_rate) as avg_attendance
      FROM pbl_responses ${where}
    `);

    const row = result[0]?.values[0];
    if (!row) return res.json({});

    const [total, participated, evidence, enrollment, avgAttendance] = row;
    const participationRate = total ? participated / total : 0;
    const evidenceRate = participated ? evidence / participated : 0;

    const districtResult = db.exec(`
      SELECT district,
        COUNT(DISTINCT school_code) as total,
        COUNT(DISTINCT CASE WHEN pbl_conducted = 1 THEN school_code END) as participated,
        COUNT(DISTINCT CASE WHEN evidence_submitted = 1 THEN school_code END) as evidence,
        AVG(attendance_rate) as avg_attendance
      FROM pbl_responses ${where}
      GROUP BY district
    `);

    const districts = (districtResult[0]?.values || []).map(d => {
      const rate = d[1] ? d[2] / d[1] : 0;
      const evidRate = d[2] ? d[3] / d[2] : 0;
      const status = classifyRisk(rate);
      const reasons = [];
      if (rate < 0.75) reasons.push(`Participation ${(rate*100).toFixed(1)}%`);
      if (evidRate < 0.75) reasons.push(`Evidence ${(evidRate*100).toFixed(1)}%`);
      if (d[4] < 0.60) reasons.push(`Attendance ${(d[4]*100).toFixed(1)}%`);
      return {
        district: d[0], total: d[1], participated: d[2],
        participationRate: rate, evidenceRate: evidRate,
        attendanceRate: d[4], riskStatus: status,
        riskColor: getRiskColor(status),
        riskReason: reasons.join(' · ') || 'All metrics on track'
      };
    });

    const blockResult = db.exec(`
      SELECT block,
        COUNT(DISTINCT school_code) as total,
        COUNT(DISTINCT CASE WHEN pbl_conducted = 1 THEN school_code END) as participated,
        AVG(attendance_rate) as avg_attendance
      FROM pbl_responses ${where}
      GROUP BY block
      ORDER BY (CAST(COUNT(DISTINCT CASE WHEN pbl_conducted = 1 THEN school_code END) AS REAL) / COUNT(DISTINCT school_code)) ASC
    `);

    const blocks = (blockResult[0]?.values || []).map(b => {
      const rate = b[1] ? b[2] / b[1] : 0;
      const status = classifyRisk(rate);
      return {
        block: b[0], total: b[1], participated: b[2],
        participationRate: rate, attendanceRate: b[3],
        riskStatus: status
      };
    });

    res.json({
      totalSchools: total,
      participated,
      evidenceSubmitted: evidence,
      participationRate,
      evidenceRate,
      enrollment: Math.round(enrollment),
      attendanceRate: avgAttendance,
      riskStatus: classifyRisk(participationRate),
      districts,
      blocks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/filters', async (req, res) => {
  try {
    const db = await getDb();
    const months = db.exec(`SELECT DISTINCT reporting_month FROM pbl_responses ORDER BY reporting_month`);
    const districts = db.exec(`SELECT DISTINCT district FROM pbl_responses ORDER BY district`);
    const blocks = db.exec(`SELECT DISTINCT block FROM pbl_responses ORDER BY block`);
    const subjects = db.exec(`SELECT DISTINCT subject FROM pbl_responses WHERE subject IS NOT NULL ORDER BY subject`);

    res.json({
      months: months[0]?.values.map(r => r[0]) || [],
      districts: districts[0]?.values.map(r => r[0]) || [],
      blocks: blocks[0]?.values.map(r => r[0]) || [],
      grades: ['Class 6', 'Class 7', 'Class 8'],
      subjects: subjects[0]?.values.map(r => r[0]) || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;