import { useState, useEffect } from 'react';
import { getSummary, getFilters } from '../api';

const riskColors = { 'On Track': '#22c55e', 'Behind': '#eab308', 'At Risk': '#f97316', 'Critical': '#ef4444' };

export default function SummaryPage() {
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => { getFilters().then(r => setMonths(r.data.months)); }, []);
  useEffect(() => { getSummary({ month }).then(r => setData(r.data)); }, [month]);

  const pct = v => v != null ? (v * 100).toFixed(1) + '%' : '-';

  return (
    <div>
      <h2 style={{ color: '#38bdf8', marginBottom: 16 }}>Monthly Review Summary</h2>
      <select value={month} onChange={e => setMonth(e.target.value)}
        style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px', marginBottom: 24 }}>
        <option value="">All Months</option>
        {months.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      {data && (
        <>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Districts', value: data.totalDistricts },
              { label: 'On Track', value: data.onTrack, color: '#22c55e' },
              { label: 'At Risk / Critical', value: data.atRisk, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#1e293b', borderRadius: 10, padding: '20px 24px', minWidth: 160 }}>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: color || '#f1f5f9' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 20 }}>
              <h3 style={{ color: '#22c55e', marginBottom: 12 }}>Top Performers</h3>
              {(data.topPerformers || []).map((d, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{d.district}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Participation: {pct(d.participationRate)} · Evidence: {pct(d.evidenceRate)}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#1e293b', borderRadius: 10, padding: 20 }}>
              <h3 style={{ color: '#ef4444', marginBottom: 12 }}>Needs Attention</h3>
              {(data.needsAttention || []).map((d, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{d.district}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Participation: {pct(d.participationRate)} · Risk: <span style={{ color: riskColors[d.riskStatus] }}>{d.riskStatus}</span></div>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ color: '#94a3b8', marginBottom: 12 }}>All Districts</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: 10 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['District', 'Schools', 'Participation %', 'Evidence %', 'Attendance %', 'Risk'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.allDistricts || []).map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '12px 16px', color: '#f1f5f9' }}>{d.district}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{d.total}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(d.participationRate)}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(d.evidenceRate)}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{pct(d.attendanceRate)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: riskColors[d.riskStatus] + '22', color: riskColors[d.riskStatus], borderRadius: 4, padding: '3px 10px', fontSize: 13, fontWeight: 600 }}>
                      {d.riskStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}