import { useState, useEffect } from 'react';
import { getDashboard, getFilters } from '../api';

const riskColors = { 'On Track': '#22c55e', 'Behind': '#eab308', 'At Risk': '#f97316', 'Critical': '#ef4444' };

function KpiCard({ label, value, sub, mom }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 10, padding: '20px 24px', minWidth: 160 }}>
      <div style={{ color: '#94a3b8', fontSize: 13 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: '6px 0' }}>{value}</div>
        {mom != null && (
          <span style={{ fontSize: 13, fontWeight: 600, color: mom >= 0 ? '#22c55e' : '#ef4444' }}>
            {mom >= 0 ? '▲' : '▼'} {Math.abs(mom).toFixed(1)}%
          </span>
        )}
      </div>
      {sub && <div style={{ color: '#64748b', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [filters, setFilters] = useState({ months: [], districts: [], blocks: [], grades: [], subjects: [] });
  const [sel, setSel] = useState({ month: '', district: '', block: '', grade: '', subject: '' });
  const [data, setData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFilters().then(r => setFilters(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getDashboard(sel).then(r => { setData(r.data); setLoading(false); });

    // Fetch previous month data for MoM
    if (sel.month) {
      const months = filters.months;
      const idx = months.indexOf(sel.month);
      if (idx > 0) {
        const prevMonth = months[idx - 1];
        getDashboard({ ...sel, month: prevMonth }).then(r => setPrevData(r.data));
      } else {
        setPrevData(null);
      }
    } else {
      setPrevData(null);
    }
  }, [sel]);

  const pct = v => v != null ? (v * 100).toFixed(1) + '%' : '-';
  const mom = (curr, prev) => {
    if (!prev || curr == null || prev == null) return null;
    return (curr - prev) * 100;
  };

  return (
    <div>
      <h2 style={{ color: '#38bdf8', marginBottom: 16 }}>Program Dashboard</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'month', label: 'Month', options: filters.months },
          { key: 'district', label: 'District', options: filters.districts },
          { key: 'block', label: 'Block', options: filters.blocks },
          { key: 'grade', label: 'Grade', options: filters.grades || [] },
          { key: 'subject', label: 'Subject', options: filters.subjects || [] },
        ].map(({ key, label, options }) => (
          <select key={key} value={sel[key]} onChange={e => setSel(s => ({ ...s, [key]: e.target.value }))}
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
            <option value="">All {label}s</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <button onClick={() => setSel({ month: '', district: '', block: '', grade: '', subject: '' })}
          style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>
          Reset
        </button>
      </div>

      {loading ? <div style={{ color: '#64748b' }}>Loading...</div> : data && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <KpiCard label="Total Schools" value={data.totalSchools ?? '-'} />
            <KpiCard
              label="Participated"
              value={data.participated ?? '-'}
              sub={pct(data.participationRate)}
              mom={mom(data.participationRate, prevData?.participationRate)}
            />
            <KpiCard
              label="Evidence Submitted"
              value={data.evidenceSubmitted ?? '-'}
              sub={pct(data.evidenceRate)}
              mom={mom(data.evidenceRate, prevData?.evidenceRate)}
            />
            <KpiCard label="Total Enrollment" value={data.enrollment ?? '-'} />
            <KpiCard label="Attendance Rate" value={pct(data.attendanceRate)} />
            <KpiCard label="Overall Risk" value={data.riskStatus ?? '-'} />
          </div>

          {sel.month && prevData && (
            <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 16px', marginBottom: 20, color: '#94a3b8', fontSize: 13 }}>
              ℹ️ Arrows show change vs previous month
            </div>
          )}

          {/* Districts Table */}
          <h3 style={{ color: '#94a3b8', marginBottom: 12 }}>Districts by Risk</h3>
          <div style={{ overflowX: 'auto', marginBottom: 32 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: 10 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['District', 'Total Schools', 'Participated', 'Participation %', 'Evidence %', 'Risk', 'Why'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.districts || []).map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9' }}>{d.district}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{d.total}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{d.participated}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(d.participationRate)}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(d.evidenceRate)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: riskColors[d.riskStatus] + '22', color: riskColors[d.riskStatus],
                        borderRadius: 4, padding: '3px 10px', fontSize: 13, fontWeight: 600 }}>
                        {d.riskStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{d.riskReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Blocks Table */}
          <h3 style={{ color: '#94a3b8', marginBottom: 12 }}>Blocks by Risk</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: 10 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Block', 'Total Schools', 'Participated', 'Participation %', 'Attendance %', 'Risk'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.blocks || []).map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9' }}>{b.block}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{b.total}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{b.participated}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(b.participationRate)}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(b.attendanceRate)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: riskColors[b.riskStatus] + '22', color: riskColors[b.riskStatus],
                        borderRadius: 4, padding: '3px 10px', fontSize: 13, fontWeight: 600 }}>
                        {b.riskStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}