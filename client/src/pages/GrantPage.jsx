import { useState, useEffect } from 'react';
import axios from 'axios';
import { getGrants, getGrantList } from '../api';

const API = 'https://mantra4change-pbl.onrender.com';

export default function GrantPage() {
  const [grantList, setGrantList] = useState([]);
  const [sel, setSel] = useState({ grantId: '', month: '' });
  const [data, setData] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { getGrantList().then(r => setGrantList(r.data)); }, []);
  useEffect(() => {
    if (sel.grantId) getGrants(sel).then(r => setData(r.data));
  }, [sel]);

  const pct = v => v != null ? (v * 100).toFixed(1) + '%' : '-';

  return (
    <div>
      <h2 style={{ color: '#38bdf8', marginBottom: 16 }}>Grant Reports</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <select value={sel.grantId} onChange={e => setSel(s => ({ ...s, grantId: e.target.value }))}
          style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
          <option value="">Select Grant</option>
          {grantList.map(g => <option key={g.grantId} value={g.grantId}>{g.grantName} ({g.donor})</option>)}
        </select>
      </div>

      {data && (
        <>
          {(data.performance || []).map((p, i) => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ color: '#f1f5f9', margin: 0 }}>{p.grantName} — {p.reportingMonth}</h3>
                <span style={{ background: '#22c55e22', color: '#22c55e', borderRadius: 4, padding: '3px 10px', fontSize: 13 }}>{p.reportStatus}</span>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
                {[
                  ['PBL Completion', pct(p.pblCompletionRate)],
                  ['Evidence Rate', pct(p.evidenceRate)],
                  ['Attendance', pct(p.attendanceRate)],
                  ['Sampled Schools', p.sampledSchools],
                  ['Risk', p.riskStatus],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{label}</div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{val}</div>
                  </div>
                ))}
              </div>
              {p.milestoneSummary && (
                <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
                  <b>Milestones:</b> {p.milestoneSummary}
                </div>
              )}
              {p.draftReportText && (
                <div style={{ background: '#0f172a', borderRadius: 8, padding: 16, color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
                  {p.draftReportText}
                </div>
              )}
              <button
                onClick={async () => {
                  setGenerating(true);
                  setNarrative(null);
                  const r = await axios.post(`${API}/api/grant/narrative`, {
                    grantName: p.grantName, donor: p.donor, month: p.reportingMonth,
                    pblCompletionRate: p.pblCompletionRate, evidenceRate: p.evidenceRate,
                    attendanceRate: p.attendanceRate, sampledSchools: p.sampledSchools,
                    riskStatus: p.riskStatus, milestones: p.milestoneSummary
                  });
                  setNarrative(r.data);
                  setGenerating(false);
                }}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
                {generating ? 'Generating...' : '✨ Generate AI Narrative'}
              </button>
              {narrative && (
                <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 8, padding: 20 }}>
                  <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: 8 }}>AI Generated Narrative</div>
                  <div style={{ color: '#e2e8f0', lineHeight: 1.8, fontSize: 14 }}>{narrative.narrative}</div>
                  <div style={{ marginTop: 12, color: '#64748b', fontSize: 12 }}>
                    Facts used: PBL {(narrative.facts.pblCompletionRate * 100).toFixed(1)}% · Evidence {(narrative.facts.evidenceRate * 100).toFixed(1)}% · Attendance {(narrative.facts.attendanceRate * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          ))}

          {(data.finance || []).length > 0 && (
            <>
              <h3 style={{ color: '#94a3b8', marginBottom: 12 }}>Finance</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: 10 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['Month', 'Budget Line', 'Approved', 'Monthly Used', 'Cumulative', 'Utilization %'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.finance.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{f.reportingMonth}</td>
                      <td style={{ padding: '12px 16px', color: '#f1f5f9' }}>{f.budgetLine}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{f.approvedBudget}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{f.monthlyUtilized}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{f.cumulativeUtilized}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(f.utilizationRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {(data.media || []).length > 0 && (
            <>
              <h3 style={{ color: '#94a3b8', marginBottom: 16, marginTop: 24 }}>Evidence Gallery</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {data.media.map((m, i) => (
                  <div key={i} style={{ background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
                    <img
                      src={`${API}/images/${m.fileName}`}
                      alt={m.title}
                      style={{ width: '100%', height: 180, objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        {m.recordType?.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{m.title}</div>
                      {m.caption && <div style={{ color: '#94a3b8', fontSize: 12 }}>{m.caption}</div>}
                      <div style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>{m.district} · {m.month}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}