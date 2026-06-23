const express = require('express');
const router = express.Router();
const { getDb } = require('../index');
const { classifyRisk, getRiskColor } = require('../services/riskEngine');

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { month } = req.query;

    const where = month ? `WHERE reporting_month = '${month}'` : '';

    const result = db.exec(`
      SELECT district,
        COUNT(DISTINCT school_code) as total,
        SUM(pbl_conducted) as participated,
        SUM(evidence_submitted) as evidence,
        SUM(total_enrollment) as enrollment,
        SUM(total_attendance) as attendance
      FROM pbl_responses ${where}
      GROUP BY district
      ORDER BY (CAST(SUM(pbl_conducted) AS REAL) / COUNT(DISTINCT school_code)) DESC
    `);

    const rows = result[0]?.values || [];
    const districts = rows.map(r => {
      const participationRate = r[1] ? r[2] / r[1] : 0;
      const evidenceRate = r[2] ? r[3] / r[2] : 0;
      const attendanceRate = r[4] ? r[5] / r[4] : 0;
      const status = classifyRisk(participationRate);
      return {
        district: r[0], total: r[1], participated: r[2],
        evidence: r[3], enrollment: r[4], attendance: r[5],
        participationRate, evidenceRate, attendanceRate,
        riskStatus: status, riskColor: getRiskColor(status)
      };
    });

    const onTrack = districts.filter(d => d.riskStatus === 'On Track');
    const critical = districts.filter(d => d.riskStatus === 'Critical' || d.riskStatus === 'At Risk');

    res.json({
      month,
      totalDistricts: districts.length,
      onTrack: onTrack.length,
      atRisk: critical.length,
      topPerformers: districts.slice(0, 3),
      needsAttention: [...districts].sort((a, b) => a.participationRate - b.participationRate).slice(0, 3),
      allDistricts: districts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;