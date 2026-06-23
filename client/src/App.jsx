import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import GrantPage from './pages/GrantPage';
import SummaryPage from './pages/SummaryPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
        <nav style={{ background: '#1e293b', padding: '12px 24px', display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#38bdf8', marginRight: 16 }}>Mantra4Change PBL</span>
          {[
            { to: '/', label: 'Dashboard' },
            { to: '/summary', label: 'Review Summary' },
            { to: '/grants', label: 'Grant Reports' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end style={({ isActive }) => ({
              color: isActive ? '#38bdf8' : '#94a3b8',
              textDecoration: 'none', fontWeight: 500, padding: '6px 12px',
              borderRadius: 6, background: isActive ? '#0f172a' : 'transparent'
            })}>{label}</NavLink>
          ))}
        </nav>
        <div style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/grants" element={<GrantPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}