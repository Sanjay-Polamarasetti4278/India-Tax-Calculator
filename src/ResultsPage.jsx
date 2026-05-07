import React, { useState } from 'react';
import { calculateTax } from './taxEngine';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const fmtShort = (n) => {
  if (!n) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

function Section({ label, children }) {
  return (
    <div className="mb-2">
      <div className="text-xs font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: '#6b7280' }}>{label}</div>
      <div className="pl-3 space-y-1" style={{ borderLeft: '2px solid #374151' }}>{children}</div>
    </div>
  );
}

function Row({ label, sub, amount, color, bold }) {
  if (!amount && amount !== 0) return null;
  return (
    <div className="flex justify-between items-start py-1.5">
      <div>
        <div className={`text-sm ${bold ? 'font-bold' : 'font-medium'}`} style={{ color: color || '#e5e7eb' }}>{label}</div>
        {sub && <div className="text-xs" style={{ color: '#6b7280' }}>{sub}</div>}
      </div>
      <span className="text-sm font-semibold whitespace-nowrap ml-4" style={{ color: color || '#e5e7eb' }}>{amount}</span>
    </div>
  );
}

// ── Simple Bar Chart ──────────────────────────────────────────────
function BarChart({ newTax, oldTax, newIncome, oldIncome }) {
  const maxTax = Math.max(newTax, oldTax, 1);
  const maxIncome = Math.max(newIncome, oldIncome, 1);
  const newWins = newTax <= oldTax;

  const Bar = ({ value, max, color, label, sublabel }) => {
    const pct = Math.round((value / max) * 100);
    return (
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="text-xs font-semibold" style={{ color: '#9ca3af' }}>{fmtShort(value)}</div>
        <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: '120px', background: '#1f2937' }}>
          <div
            className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
            style={{ height: `${pct}%`, background: color, opacity: 0.9 }}
          />
        </div>
        <div className="text-xs font-bold text-center" style={{ color: '#e5e7eb' }}>{label}</div>
        <div className="text-xs text-center" style={{ color: '#6b7280' }}>{sublabel}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>💸 Tax Payable Comparison</div>
        <div className="flex gap-4 items-end">
          <Bar value={newTax} max={maxTax} color={newWins ? '#10b981' : '#6366f1'} label="New Regime" sublabel={newWins ? '✅ Lower Tax' : ''} />
          <Bar value={oldTax} max={maxTax} color={!newWins ? '#10b981' : '#8b5cf6'} label="Old Regime" sublabel={!newWins ? '✅ Lower Tax' : ''} />
        </div>
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>💰 Net Income After Tax</div>
        <div className="flex gap-4 items-end">
          <Bar value={newIncome} max={maxIncome} color="#3b82f6" label="New Regime" sublabel="" />
          <Bar value={oldIncome} max={maxIncome} color="#a855f7" label="Old Regime" sublabel="" />
        </div>
      </div>
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────
function DonutChart({ tax, gross, label, color }) {
  const pct = gross > 0 ? Math.round((tax / gross) * 100) : 0;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1f2937" strokeWidth="14" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fill="#e5e7eb" fontSize="20" fontWeight="bold">{pct}%</text>
        <text x="70" y="82" textAnchor="middle" fill="#6b7280" fontSize="10">of income</text>
      </svg>
      <div className="text-sm font-semibold" style={{ color: '#e5e7eb' }}>{label}</div>
      <div className="text-xs" style={{ color: color }}>{fmt(tax)} tax</div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────
function KpiCard({ icon, title, value, sub, highlight, badge }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden"
      style={{
        background: highlight ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' : '#111827',
        border: highlight ? '1.5px solid #10b981' : '1.5px solid #1f2937',
      }}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#10b981', color: '#fff' }}>
          {badge}
        </span>
      )}
      <div className="text-2xl">{icon}</div>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>{title}</div>
      <div className="text-xl font-bold" style={{ color: highlight ? '#34d399' : '#e5e7eb' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: '#9ca3af' }}>{sub}</div>}
    </div>
  );
}

// ── Analytical Dashboard ──────────────────────────────────────────
function AnalyticalDashboard({ r, state }) {
  const newWins = r.newRegimeTax < r.oldRegimeTax;
  const tie = r.newRegimeTax === r.oldRegimeTax;
  const diff = Math.abs(r.oldRegimeTax - r.newRegimeTax);
  const netNew = r.annualGross - r.newRegimeTax;
  const netOld = r.annualGross - r.oldRegimeTax;
  const newTaxPct = r.annualGross > 0 ? ((r.newRegimeTax / r.annualGross) * 100).toFixed(1) : 0;
  const oldTaxPct = r.annualGross > 0 ? ((r.oldRegimeTax / r.annualGross) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '1.5px solid #312e81' }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📊</span>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#e5e7eb' }}>Analytical Dashboard</h2>
            <p className="text-sm" style={{ color: '#6b7280' }}>Your personalised tax breakdown — at a glance</p>
          </div>
        </div>
        <div
          className="mt-4 rounded-xl p-4 flex items-center gap-4"
          style={{ background: newWins ? '#064e3b' : tie ? '#1f2937' : '#2e1065', border: `1.5px solid ${newWins ? '#10b981' : tie ? '#374151' : '#7c3aed'}` }}
        >
          <span className="text-4xl">{tie ? '⚖️' : newWins ? '🏆' : '🎯'}</span>
          <div>
            <div className="text-lg font-bold" style={{ color: newWins ? '#34d399' : tie ? '#9ca3af' : '#c4b5fd' }}>
              {tie ? "It's a Tie!" : newWins ? 'New Regime is Better for You' : 'Old Regime is Better for You'}
            </div>
            <div className="text-sm" style={{ color: '#9ca3af' }}>
              {tie ? 'Both regimes give the same tax. Go with New - it is simpler.' : `You save ${fmt(diff)} every year by choosing the ${newWins ? 'New' : 'Old'} Regime`}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>⭐ Key Highlights</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <KpiCard icon="🆕" title="New Regime Tax" value={fmt(r.newRegimeTax)} sub={`${newTaxPct}% of your income`} highlight={newWins} badge={newWins ? 'BEST' : null} />
          <KpiCard icon="🏛️" title="Old Regime Tax" value={fmt(r.oldRegimeTax)} sub={`${oldTaxPct}% of your income`} highlight={!newWins && !tie} badge={!newWins && !tie ? 'BEST' : null} />
          <KpiCard icon="💰" title="You Save" value={tie ? '₹0' : fmt(diff)} sub={tie ? 'Both are equal' : `Every year with ${newWins ? 'New' : 'Old'} Regime`} highlight={diff > 0} />
          <KpiCard icon="📈" title="Net Income (New)" value={fmtShort(netNew)} sub="After paying new regime tax" />
          <KpiCard icon="📈" title="Net Income (Old)" value={fmtShort(netOld)} sub="After paying old regime tax" />
          <KpiCard icon="🎯" title="Recommended" value={tie ? 'Either' : newWins ? 'New Regime' : 'Old Regime'} sub="Based on your inputs" highlight />
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1.5px solid #1f2937' }}>
          <BarChart newTax={r.newRegimeTax} oldTax={r.oldRegimeTax} newIncome={netNew} oldIncome={netOld} />
        </div>

        {/* Donut Charts */}
        <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1.5px solid #1f2937' }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>🍩 Tax as % of Gross Income</div>
          <div className="flex justify-around">
            <DonutChart tax={r.newRegimeTax} gross={r.annualGross} label="New Regime" color={newWins ? '#10b981' : '#6366f1'} />
            <DonutChart tax={r.oldRegimeTax} gross={r.annualGross} label="Old Regime" color={!newWins && !tie ? '#10b981' : '#8b5cf6'} />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1.5px solid #1f2937' }}>
        <div className="px-6 py-4" style={{ background: '#0f172a', borderBottom: '1px solid #1f2937' }}>
          <h3 className="text-base font-bold" style={{ color: '#e5e7eb' }}>📋 Simple Comparison Table</h3>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Everything side by side — no jargon</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <th className="p-4 text-left text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>What</th>
                <th className="p-4 text-right text-xs uppercase tracking-wider" style={{ color: '#10b981' }}>🆕 New Regime</th>
                <th className="p-4 text-right text-xs uppercase tracking-wider" style={{ color: '#a78bfa' }}>🏛️ Old Regime</th>
                <th className="p-4 text-right text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Gross Income', new: r.annualGross, old: r.annualGross, diff: null },
                { label: 'Total Deductions', new: r.newRegimeDeductions.standard + (r.newRegimeDeductions.employerNPS || 0), old: Object.values(r.oldRegimeDeductions).reduce((a, b) => a + b, 0), diff: true },
                { label: 'Taxable Income', new: r.newRegimeTaxable, old: r.oldRegimeTaxable, diff: true },
                { label: 'Tax Payable', new: r.newRegimeTax, old: r.oldRegimeTax, diff: true, highlight: true },
                { label: 'Net Take-Home', new: netNew, old: netOld, diff: true },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1f2937', background: row.highlight ? '#0f172a' : 'transparent' }}>
                  <td className="p-4 font-medium" style={{ color: '#e5e7eb' }}>{row.label}</td>
                  <td className="p-4 text-right font-semibold" style={{ color: row.highlight ? (newWins ? '#34d399' : '#e5e7eb') : '#e5e7eb' }}>{fmt(row.new)}</td>
                  <td className="p-4 text-right font-semibold" style={{ color: row.highlight ? (!newWins && !tie ? '#c4b5fd' : '#e5e7eb') : '#e5e7eb' }}>{fmt(row.old)}</td>
                  <td className="p-4 text-right font-semibold" style={{ color: '#60a5fa' }}>
                    {row.diff === null ? '—' : row.diff ? fmt(Math.abs(row.new - row.old)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plain Language Summary */}
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1.5px solid #1f2937' }}>
        <h3 className="text-base font-bold mb-4" style={{ color: '#e5e7eb' }}>💬 In Plain Language</h3>
        <div className="space-y-3">
          {[
            { icon: '📥', text: `Your gross annual income is ${fmt(r.annualGross)}` },
            { icon: '📤', text: `New Regime deducts ${fmt(r.newRegimeDeductions.standard + (r.newRegimeDeductions.employerNPS || 0))} — Old Regime deducts ${fmt(Object.values(r.oldRegimeDeductions).reduce((a, b) => a + b, 0))}` },
            { icon: '🧮', text: `After deductions, your taxable income is ${fmt(r.newRegimeTaxable)} (New) vs ${fmt(r.oldRegimeTaxable)} (Old)` },
            { icon: '💸', text: `You pay ${fmt(r.newRegimeTax)} tax in New Regime and ${fmt(r.oldRegimeTax)} in Old Regime` },
            { icon: tie ? '⚖️' : '🎉', text: tie ? 'Both regimes result in the same tax — pick New Regime for simplicity' : `By choosing the ${newWins ? 'New' : 'Old'} Regime, you keep ${fmt(diff)} MORE in your pocket every year` },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: '#0f172a' }}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm" style={{ color: '#d1d5db' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Results Page ─────────────────────────────────────────────
export default function ResultsPage({ state, onRestart, theme = 'light' }) {
  const d = theme === 'dark';
  const r = calculateTax(state);
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'dashboard'
  const newWins = r.newRegimeTax < r.oldRegimeTax;
  const diff = Math.abs(r.oldRegimeTax - r.newRegimeTax);
  const tie = r.newRegimeTax === r.oldRegimeTax;
  const od = r.oldRegimeDeductions;
  const netNew = r.annualGross - r.newRegimeTax;
  const netOld = r.annualGross - r.oldRegimeTax;

  return (
    <div className="min-h-screen animate-in fade-in duration-500 transition-all" style={{ background: d ? '#030712' : '#f8fafc', color: d ? '#e5e7eb' : '#1e293b' }}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Tab Switcher */}
        <div className="flex rounded-2xl p-1 gap-1" style={{ background: d ? '#111827' : '#f1f5f9', border: `1.5px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
          <button
            onClick={() => setActiveTab('results')}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: activeTab === 'results' ? '#1d4ed8' : 'transparent',
              color: activeTab === 'results' ? '#fff' : (d ? '#9ca3af' : '#64748b'),
            }}
          >
            📋 My Results
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: activeTab === 'dashboard' ? '#1d4ed8' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : (d ? '#9ca3af' : '#64748b'),
            }}
          >
            📊 Analytical Dashboard
          </button>
        </div>

        {/* ── RESULTS TAB ── */}
        {activeTab === 'results' && (
          <div className="space-y-8">
            {/* Banner */}
            <div
              className="p-8 rounded-2xl text-center shadow-xl"
              style={{
                background: tie
                  ? 'linear-gradient(135deg, #374151, #1f2937)'
                  : newWins
                    ? 'linear-gradient(135deg, #064e3b, #065f46)'
                    : 'linear-gradient(135deg, #2e1065, #4c1d95)',
                border: `1.5px solid ${tie ? '#374151' : newWins ? '#10b981' : '#7c3aed'}`,
              }}
            >
              <div className="text-4xl mb-3">{tie ? '⚖️' : newWins ? '🏆' : '🎯'}</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#f9fafb' }}>
                {tie ? "It's a Tie!" : newWins ? 'New Regime Wins for You' : 'Old Regime Wins for You'}
              </h1>
              <p className="text-lg" style={{ color: '#d1d5db' }}>
                {tie ? 'Both regimes result in the same tax.' : `Choose the ${newWins ? 'New' : 'Old'} Regime — save ${fmt(diff)} every year.`}
              </p>
            </div>

            {/* Side-by-side Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* NEW REGIME */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#111827',
                  border: `2px solid ${newWins ? '#10b981' : '#1f2937'}`,
                }}
              >
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: newWins ? '#064e3b' : '#0f172a' }}>
                  <h2 className="text-xl font-bold" style={{ color: '#f9fafb' }}>🆕 New Regime</h2>
                  {newWins && <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#10b981', color: '#fff' }}>RECOMMENDED</span>}
                </div>
                <div className="px-6 py-4">
                  <Row label="Gross Annual Income" sub="Take-home × 12 + PF + PT estimates" amount={fmt(r.annualGross)} bold />
                  <Section label="Deductions from Gross">
                    <Row label="Standard Deduction" sub="Flat allowance (Sec 16-ia)" amount={`-${fmt(r.newRegimeDeductions.standard)}`} color="#f87171" />
                    {r.newRegimeDeductions.employerNPS > 0 && <Row label="Employer NPS (80CCD-2)" sub="Employer's NPS share" amount={`-${fmt(r.newRegimeDeductions.employerNPS)}`} color="#f87171" />}
                  </Section>
                  <div className="flex justify-between items-center rounded-lg px-4 py-3 my-3" style={{ background: '#1e3a5f', border: '1px solid #1d4ed8' }}>
                    <div><div className="text-sm font-bold" style={{ color: '#93c5fd' }}>Taxable Income</div><div className="text-xs" style={{ color: '#60a5fa' }}>After deductions</div></div>
                    <span className="text-lg font-bold" style={{ color: '#bfdbfe' }}>{fmt(r.newRegimeTaxable)}</span>
                  </div>
                  <Section label="Tax Computation">
                    <Row label="Tax as per slabs" amount={fmt(r.newRegimeBaseTax)} />
                    {r.newRegimeRebate > 0 && <Row label="Rebate u/s 87A (income ≤ ₹12L)" amount={`-${fmt(r.newRegimeRebate)}`} color="#34d399" />}
                    {r.newRegimeMarginalRelief > 0 && <Row label="Marginal Relief" amount={`-${fmt(r.newRegimeMarginalRelief)}`} color="#34d399" />}
                    <Row label="Health & Education Cess (4%)" amount={fmt(r.newRegimeCess)} />
                  </Section>
                  <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '2px solid #1f2937' }}>
                    <span className="text-base font-bold" style={{ color: '#f9fafb' }}>Total Tax Payable</span>
                    <span className="text-2xl font-bold" style={{ color: newWins ? '#34d399' : '#f9fafb' }}>{fmt(r.newRegimeTax)}</span>
                  </div>
                </div>
              </div>

              {/* OLD REGIME */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#111827',
                  border: `2px solid ${!newWins && !tie ? '#7c3aed' : '#1f2937'}`,
                }}
              >
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: !newWins && !tie ? '#2e1065' : '#0f172a' }}>
                  <h2 className="text-xl font-bold" style={{ color: '#f9fafb' }}>🏛️ Old Regime</h2>
                  {!newWins && !tie && <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#7c3aed', color: '#fff' }}>RECOMMENDED</span>}
                </div>
                <div className="px-6 py-4">
                  <Row label="Gross Annual Income" sub="Take-home × 12 + PF + PT estimates" amount={fmt(r.annualGross)} bold />
                  <Section label="Deductions from Gross">
                    <Row label="Standard Deduction" sub="Flat allowance (Sec 16-ia)" amount={`-${fmt(od.standard)}`} color="#f87171" />
                    {od.hra > 0 && <Row label="HRA Exemption" sub="House Rent Allowance (Sec 10-13A)" amount={`-${fmt(od.hra)}`} color="#f87171" />}
                    {od.sec80c > 0 && <Row label="80C Investments" sub="PF + ELSS + PPF + LIC (max ₹1.5L)" amount={`-${fmt(od.sec80c)}`} color="#f87171" />}
                    {od.sec80d > 0 && <Row label="Health Insurance (80D)" sub="Mediclaim premiums" amount={`-${fmt(od.sec80d)}`} color="#f87171" />}
                    {od.sec24b > 0 && <Row label="Home Loan Interest (Sec 24b)" sub="Interest on EMI (max ₹2L/yr)" amount={`-${fmt(od.sec24b)}`} color="#f87171" />}
                    {od.nps80ccd1b > 0 && <Row label="NPS Self (80CCD-1B)" sub="Your voluntary NPS" amount={`-${fmt(od.nps80ccd1b)}`} color="#f87171" />}
                    {od.employerNPS > 0 && <Row label="Employer NPS (80CCD-2)" sub="Employer NPS" amount={`-${fmt(od.employerNPS)}`} color="#f87171" />}
                    {od.other > 0 && <Row label="Prof. Tax + 80TTA/TTB" sub="State tax + savings interest" amount={`-${fmt(od.other)}`} color="#f87171" />}
                  </Section>
                  <div className="flex justify-between items-center rounded-lg px-4 py-3 my-3" style={{ background: '#1a0533', border: '1px solid #4c1d95' }}>
                    <div><div className="text-sm font-bold" style={{ color: '#c4b5fd' }}>Taxable Income</div><div className="text-xs" style={{ color: '#a78bfa' }}>After all deductions</div></div>
                    <span className="text-lg font-bold" style={{ color: '#ddd6fe' }}>{fmt(r.oldRegimeTaxable)}</span>
                  </div>
                  <Section label="Tax Computation">
                    <Row label="Tax as per slabs" amount={fmt(r.oldRegimeBaseTax)} />
                    {r.oldRegimeRebate > 0 && <Row label="Rebate u/s 87A (income ≤ ₹5L)" amount={`-${fmt(r.oldRegimeRebate)}`} color="#34d399" />}
                    {r.oldRegimeMarginalRelief > 0 && <Row label="Marginal Relief" amount={`-${fmt(r.oldRegimeMarginalRelief)}`} color="#34d399" />}
                    <Row label="Health & Education Cess (4%)" amount={fmt(r.oldRegimeCess)} />
                  </Section>
                  <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '2px solid #1f2937' }}>
                    <span className="text-base font-bold" style={{ color: '#f9fafb' }}>Total Tax Payable</span>
                    <span className="text-2xl font-bold" style={{ color: !newWins && !tie ? '#c4b5fd' : '#f9fafb' }}>{fmt(r.oldRegimeTax)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1.5px solid #1f2937' }}>
              <div className="px-6 py-4" style={{ background: '#0f172a', borderBottom: '1px solid #1f2937' }}>
                <h3 className="text-lg font-bold" style={{ color: '#f9fafb' }}>📊 Side-by-Side Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1f2937' }}>
                      <th className="p-4 text-left text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Category</th>
                      <th className="p-4 text-right text-xs uppercase tracking-wider" style={{ color: '#10b981' }}>🆕 New Regime</th>
                      <th className="p-4 text-right text-xs uppercase tracking-wider" style={{ color: '#a78bfa' }}>🏛️ Old Regime</th>
                      <th className="p-4 text-right text-xs uppercase tracking-wider" style={{ color: '#6b7280' }}>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { cat: 'Gross Income', nv: r.annualGross, ov: r.annualGross },
                      { cat: 'Total Deductions', nv: r.newRegimeDeductions.standard + (r.newRegimeDeductions.employerNPS || 0), ov: od.standard + od.hra + od.sec80c + od.sec80d + od.sec24b + od.nps80ccd1b + od.employerNPS + od.other },
                      { cat: 'Taxable Income', nv: r.newRegimeTaxable, ov: r.oldRegimeTaxable },
                      { cat: 'Total Tax Payable', nv: r.newRegimeTax, ov: r.oldRegimeTax, bold: true },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1f2937', background: row.bold ? '#0f172a' : 'transparent' }}>
                        <td className="p-4 font-medium" style={{ color: '#e5e7eb' }}>{row.cat}</td>
                        <td className="p-4 text-right font-semibold" style={{ color: row.bold ? (newWins ? '#34d399' : '#e5e7eb') : '#e5e7eb' }}>{fmt(row.nv)}</td>
                        <td className="p-4 text-right font-semibold" style={{ color: row.bold ? (!newWins && !tie ? '#c4b5fd' : '#e5e7eb') : '#e5e7eb' }}>{fmt(row.ov)}</td>
                        <td className="p-4 text-right font-semibold" style={{ color: '#60a5fa' }}>{row.nv === row.ov ? '—' : `Save ${fmt(Math.abs(row.nv - row.ov))}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendation */}
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{
                background: '#111827',
                border: `2px solid ${newWins ? '#10b981' : tie ? '#374151' : '#7c3aed'}`,
              }}
            >
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#f9fafb' }}>🎯 Our Recommendation</h3>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Based on the details you entered</p>
              </div>
              {tie ? (
                <p style={{ color: '#d1d5db' }}>Both regimes give the same tax. Choose <strong>New Regime</strong> — simpler, no investment tracking needed.</p>
              ) : (
                <>
                  <div
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-lg shadow"
                    style={{ background: newWins ? '#10b981' : '#7c3aed', color: '#fff' }}
                  >
                    {newWins ? '🆕 Go with New Regime' : '🏛️ Go with Old Regime'}
                    <span className="text-sm font-normal opacity-90">— Save {fmt(diff)}/year</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(newWins ? [
                      '✅ Higher standard deduction: ₹75,000 vs ₹50,000',
                      '✅ Lower slab rates suit your income level',
                      '✅ Full ₹12L rebate under Sec 87A',
                      '✅ No investment proof or tracking needed',
                    ] : [
                      '✅ Your total deductions (HRA, 80C, 80D) are high',
                      '✅ Home loan interest benefit under Sec 24(b)',
                      '✅ Extra NPS deduction under Sec 80CCD(1B)',
                      '✅ Combined exemptions significantly lower taxable income',
                    ]).map((point, i) => (
                      <div key={i} className="p-3 rounded-lg text-sm font-medium" style={{ background: newWins ? '#064e3b' : '#2e1065', color: newWins ? '#a7f3d0' : '#ddd6fe' }}>
                        {point}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-4 flex gap-2 text-xs" style={{ background: '#1c1710', border: '1px solid #92400e', color: '#fcd34d' }}>
                    <span className="text-base">⚠️</span>
                    <span><strong>Important:</strong> This is an estimate. Please consult your employer's payroll team or a CA before making a final decision.</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center pb-8">
              <button
                onClick={onRestart}
                className="py-3 px-10 text-lg font-semibold rounded-xl transition-all"
                style={{ background: '#1d4ed8', color: '#fff' }}
              >
                🔄 Recalculate / Start Over
              </button>
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            <AnalyticalDashboard r={r} state={state} />
            <div className="flex justify-center pb-8">
              <button
                onClick={onRestart}
                className="py-3 px-10 text-lg font-semibold rounded-xl transition-all"
                style={{ background: '#1d4ed8', color: '#fff' }}
              >
                🔄 Recalculate / Start Over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}