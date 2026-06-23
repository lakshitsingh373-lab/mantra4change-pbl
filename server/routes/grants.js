const express = require('express');
const router = express.Router();
const { getDb } = require('../index');

router.get('/list', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT DISTINCT grant_id, grant_name, donor
      FROM grant_performance
      ORDER BY grant_name
    `);
    const rows = result[0]?.values || [];
    res.json(rows.map(r => ({ grantId: r[0], grantName: r[1], donor: r[2] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { grantId, month } = req.query;

    let perfWhere = `WHERE grant_id = '${grantId}'`;
    if (month) perfWhere += ` AND reporting_month = '${month}'`;

    const perfResult = db.exec(`
      SELECT grant_id, donor, grant_name, reporting_month, report_status,
        sampled_school_records, schools_completed_pbl, pbl_completion_rate,
        schools_with_evidence, evidence_submission_rate,
        attendance_rate, risk_status, milestone_summary, draft_report_text
      FROM grant_performance ${perfWhere}
      ORDER BY reporting_month
    `);

    const performance = (perfResult[0]?.values || []).map(r => ({
      grantId: r[0], donor: r[1], grantName: r[2], reportingMonth: r[3],
      reportStatus: r[4], sampledSchools: r[5],
      pblCompletionRate: r[7], evidenceRate: r[9],
      attendanceRate: r[10], riskStatus: r[11],
      milestoneSummary: r[12], draftReportText: r[13]
    }));

    let finWhere = `WHERE grant_id = '${grantId}'`;
    if (month) finWhere += ` AND reporting_month = '${month}'`;

    const finResult = db.exec(`
      SELECT reporting_month, budget_line, approved_budget_units,
        monthly_utilized_units, cumulative_utilized_units, cumulative_utilization_rate
      FROM grant_finance ${finWhere}
      ORDER BY reporting_month, budget_line
    `);

    const finance = (finResult[0]?.values || []).map(r => ({
      reportingMonth: r[0], budgetLine: r[1],
      approvedBudget: r[2], monthlyUtilized: r[3],
      cumulativeUtilized: r[4], utilizationRate: r[5]
    }));

    const mediaResult = db.exec(`
      SELECT record_id, record_type, title, summary_or_caption, file_name, district, reporting_month
      FROM evidence_media
      WHERE grant_id = '${grantId}'
      ORDER BY reporting_month, record_type
    `);

    const media = (mediaResult[0]?.values || []).map(r => ({
      recordId: r[0], recordType: r[1], title: r[2],
      caption: r[3], fileName: r[4], district: r[5], month: r[6]
    }));

    res.json({ performance, finance, media });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/narrative', async (req, res) => {
  try {
    const { generateNarrative } = require('../services/aiNarrative');
    const facts = req.body;
    const text = await generateNarrative(facts);
    res.json({ narrative: text, facts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;