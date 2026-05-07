import React, { useState } from 'react';
import { calculateTax } from './taxEngine';
import ResultsPage from './ResultsPage';

// ── Theme Context ─────────────────────────────────────────────────
export const ThemeContext = React.createContext('light');

function useTheme() { return React.useContext(ThemeContext); }

// ── Theme Toggle Button ───────────────────────────────────────────
function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-300"
      style={{
        background: theme === 'light' ? '#f1f5f9' : '#1f2937',
        color: theme === 'light' ? '#475569' : '#9ca3af',
        border: theme === 'light' ? '1.5px solid #e2e8f0' : '1.5px solid #374151',
      }}
    >
      <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
      <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}

// ── Landing Page ──────────────────────────────────────────────────
function LandingPage({ onStart, theme, setTheme }) {
  const [openFaq, setOpenFaq] = useState(null);
  const d = theme === 'dark';

  const faqs = [
    { q: "Do I need to know my CTC or gross salary?", a: "No, just what lands in your bank account." },
    { q: "Is this for FY 2025-26?", a: "Yes, updated with Budget 2025 changes. New slabs, 12L rebate, all included." },
    { q: "Will my data be saved?", a: "Nothing is saved anywhere. Close the tab and it is gone." },
    { q: "I'm new to working. Is this for me?", a: "Yes! Especially for you. We explain everything in plain language." }
  ];

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: d ? '#030712' : '#f8fafc', color: d ? '#e5e7eb' : '#1e293b' }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
        <div className="text-xl font-bold flex items-center gap-2" style={{ color: d ? '#60a5fa' : '#1d4ed8' }}>
          <span className="text-2xl">🇮🇳</span> TaxCalc
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium flex items-center gap-1" style={{ color: d ? '#9ca3af' : '#64748b' }}>
            <span>🔒</span> Privacy First
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: d ? '#1e3a5f' : '#dbeafe', color: d ? '#60a5fa' : '#1d4ed8' }}>
            ✅ Updated for Budget 2025
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: d ? '#f9fafb' : '#0f172a' }}>
            Find out which tax regime saves you more money.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl" style={{ color: d ? '#9ca3af' : '#475569' }}>
            Answer 9 simple questions. Get a clear answer in 3 minutes. No jargon, no Form 16 needed.
          </p>
          <button
            onClick={onStart}
            className="text-lg w-full md:w-auto px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', boxShadow: '0 8px 24px rgba(29,78,216,0.35)' }}
          >
            Start Calculating <span className="ml-2">→</span>
          </button>
          <div className="flex flex-wrap gap-4 text-sm font-medium pt-2" style={{ color: d ? '#6b7280' : '#64748b' }}>
            {['🔒 Data never leaves this page', '🧮 Updated for Budget 2025', '⚡ Results in 3 minutes', '🆓 100% free'].map((t, i) => (
              <div key={i} className="flex items-center gap-1">{t}</div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-md relative">
          <div className="rounded-2xl shadow-xl p-6 relative z-10" style={{ background: d ? '#111827' : '#ffffff', border: `1.5px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold tracking-widest uppercase" style={{ color: d ? '#6b7280' : '#94a3b8' }}>Example Result</h3>
            </div>
            <div className="flex justify-between items-center mb-8 pb-8" style={{ borderBottom: `1px solid ${d ? '#1f2937' : '#f1f5f9'}` }}>
              <div className="text-center">
                <div className="text-sm mb-1" style={{ color: d ? '#6b7280' : '#94a3b8' }}>New Regime</div>
                <div className="text-xl font-bold" style={{ color: '#10b981' }}>₹18,420</div>
              </div>
              <div className="text-4xl">⚖️</div>
              <div className="text-center">
                <div className="text-sm mb-1" style={{ color: d ? '#6b7280' : '#94a3b8' }}>Old Regime</div>
                <div className="text-xl font-bold" style={{ color: '#8b5cf6' }}>₹31,200</div>
              </div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: d ? '#064e3b' : '#f0fdf4', border: `1px solid ${d ? '#10b981' : '#86efac'}` }}>
              <div className="font-bold text-lg mb-1" style={{ color: '#10b981' }}>💡 Pick New Regime</div>
              <div className="text-sm" style={{ color: d ? '#a7f3d0' : '#15803d' }}>You save ₹12,780/year</div>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-3xl rounded-full -z-10 pointer-events-none" style={{ background: 'rgba(59,130,246,0.08)' }} />
        </div>
      </main>

      {/* How it works */}
      <section className="py-16 transition-colors duration-300" style={{ background: d ? '#0f172a' : '#f1f5f9', borderTop: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: d ? '#f9fafb' : '#0f172a' }}>How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: "💰", title: "Tell us your take-home", desc: "What hits your bank account every month" },
              { step: 2, icon: "✅", title: "Answer a few questions", desc: "About rent, investments, home loan" },
              { step: 3, icon: "🎯", title: "Get your answer", desc: "Which regime saves you more, and by how much" }
            ].map((item) => (
              <div key={item.step} className="p-8 rounded-2xl text-center transition-colors duration-300" style={{ background: d ? '#111827' : '#ffffff', border: `1.5px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: d ? '#f9fafb' : '#0f172a' }}>{item.step}. {item.title}</h3>
                <p style={{ color: d ? '#6b7280' : '#64748b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: d ? '#f9fafb' : '#0f172a' }}>Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden transition-colors duration-300" style={{ border: `1.5px solid ${d ? '#1f2937' : '#e2e8f0'}`, background: d ? '#111827' : '#ffffff' }}>
              <button className="w-full text-left px-6 py-4 font-semibold text-lg flex justify-between items-center" style={{ color: d ? '#e5e7eb' : '#1e293b' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span style={{ color: d ? '#6b7280' : '#94a3b8' }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="px-6 pb-4" style={{ color: d ? '#9ca3af' : '#475569' }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Shared Components ─────────────────────────────────────────────
function StepCard({ children, theme }) {
  const d = theme === 'dark';
  return (
    <div className="rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors" style={{ background: d ? '#111827' : '#ffffff', border: `1.5px solid ${d ? '#1f2937' : '#e2e8f0'}`, boxShadow: d ? 'none' : '0 1px 8px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  );
}

function YesNo({ value, onYes, onNo, theme }) {
  const d = theme === 'dark';
  return (
    <div className="flex gap-4 mb-8">
      {[{ val: true, label: 'Yes', fn: onYes }, { val: false, label: 'No', fn: onNo }].map(opt => (
        <label key={String(opt.val)} className="flex-1 rounded-xl p-4 cursor-pointer text-center font-bold text-lg transition-all"
          style={{
            border: value === opt.val ? '2px solid #3b82f6' : `2px solid ${d ? '#1f2937' : '#e2e8f0'}`,
            background: value === opt.val ? (d ? '#1e3a5f' : '#eff6ff') : (d ? '#0f172a' : '#f8fafc'),
            color: value === opt.val ? '#3b82f6' : (d ? '#9ca3af' : '#64748b'),
          }}>
          <input type="radio" className="hidden" checked={value === opt.val} onChange={opt.fn} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function DarkInput({ value, onChange, placeholder, theme }) {
  const d = theme === 'dark';
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span style={{ color: d ? '#6b7280' : '#94a3b8' }}>₹</span>
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-3 rounded-lg outline-none text-lg transition-all"
        style={{ background: d ? '#0f172a' : '#f8fafc', border: `1.5px solid ${d ? '#374151' : '#cbd5e1'}`, color: d ? '#f9fafb' : '#1e293b' }}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onFocus={e => e.target.style.border = '1.5px solid #3b82f6'}
        onBlur={e => e.target.style.border = `1.5px solid ${d ? '#374151' : '#cbd5e1'}`}
      />
    </div>
  );
}

function NoteBox({ children, theme }) {
  const d = theme === 'dark';
  return (
    <div className="text-xs p-4 rounded-lg" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}`, color: d ? '#6b7280' : '#64748b' }}>
      {children}
    </div>
  );
}

function Label({ children, theme }) {
  const d = theme === 'dark';
  return <label className="block text-sm font-medium mb-2" style={{ color: d ? '#9ca3af' : '#475569' }}>{children}</label>;
}

function Heading({ children, theme }) {
  const d = theme === 'dark';
  return <h2 className="text-2xl font-bold mb-2" style={{ color: d ? '#f9fafb' : '#0f172a' }}>{children}</h2>;
}

function SubText({ children, theme }) {
  const d = theme === 'dark';
  return <p className="text-sm mb-8" style={{ color: d ? '#9ca3af' : '#475569' }}>{children}</p>;
}

// ── Steps ─────────────────────────────────────────────────────────
function Step1({ state, updateState, theme }) {
  const d = theme === 'dark';
  const options = [
    { id: 'below60', label: 'Under 60', subtext: "I'm below 60 years old" },
    { id: 'senior', label: '60 to 79', subtext: 'Senior Citizen (60-79 years)' },
    { id: 'superSenior', label: '80 or above', subtext: 'Super Senior Citizen (80+ years)' }
  ];
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>First, how old are you?</Heading>
      <SubText theme={theme}>Tax rules are slightly different for people above 60 and 80. We need this to get your numbers right.</SubText>
      <div className="space-y-4 mb-8">
        {options.map(opt => (
          <label key={opt.id} className="block rounded-xl p-4 cursor-pointer transition-all"
            style={{ border: state.ageCategory === opt.id ? '2px solid #3b82f6' : `2px solid ${d ? '#1f2937' : '#e2e8f0'}`, background: state.ageCategory === opt.id ? (d ? '#1e3a5f' : '#eff6ff') : (d ? '#0f172a' : '#f8fafc') }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg" style={{ color: d ? '#f9fafb' : '#1e293b' }}>{opt.label}</div>
                <div className="text-sm" style={{ color: d ? '#6b7280' : '#64748b' }}>{opt.subtext}</div>
              </div>
              <input type="radio" className="w-5 h-5" checked={state.ageCategory === opt.id} onChange={() => updateState({ ageCategory: opt.id })} />
            </div>
          </label>
        ))}
      </div>
      <NoteBox theme={theme}><strong>💡 Note:</strong> Use the age you will be on March 31, 2026.</NoteBox>
    </StepCard>
  );
}

function Step2({ state, updateState, theme }) {
  const d = theme === 'dark';
  const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>How much money reaches your bank account every month?</Heading>
      <SubText theme={theme}>Your in-hand salary after PF and TDS deductions. Do not include bonuses.</SubText>
      <Label theme={theme}>Monthly take-home salary</Label>
      <DarkInput theme={theme} value={state.takeHomeSalary} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ takeHomeSalary: val ? parseInt(val, 10) : null }); }} placeholder="e.g. 55000" />
      {state.takeHomeSalary > 0 && <p className="mt-2 text-sm font-medium" style={{ color: '#3b82f6' }}>That is roughly {fmt(state.takeHomeSalary * 12)} per year</p>}
      <div className="mt-6"><NoteBox theme={theme}><strong>💡 Salary varies?</strong> Enter a typical month — what you receive most months.</NoteBox></div>
    </StepCard>
  );
}

function Step3({ state, updateState, theme }) {
  const d = theme === 'dark';
  const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);
  const estBasic = (state.takeHomeSalary || 0) * 1.25 * 0.40;
  const estPf = Math.round(estBasic * 0.12);
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Does your company deduct Provident Fund (PF)?</Heading>
      <SubText theme={theme}>If you see EPF or PF on your payslip, the answer is yes.</SubText>
      <YesNo theme={theme} value={state.pfDeducted} onYes={() => updateState({ pfDeducted: true })} onNo={() => updateState({ pfDeducted: false, pfAmount: null })} />
      {state.pfDeducted === true && (
        <div className="animate-in fade-in duration-300 p-6 rounded-xl" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
          <Label theme={theme}>How much PF is deducted per month?</Label>
          <DarkInput theme={theme} value={state.pfAmount} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ pfAmount: val ? parseInt(val, 10) : null }); }} placeholder={`e.g. ${estPf}`} />
          {!state.pfAmount && <div className="mt-3 text-sm p-3 rounded-lg" style={{ background: d ? '#1e3a5f' : '#eff6ff', color: d ? '#93c5fd' : '#1d4ed8' }}><strong>Not sure?</strong> Leave it blank. We will estimate as roughly <strong>{fmt(estPf)}/month</strong>.</div>}
        </div>
      )}
    </StepCard>
  );
}

function Step4({ state, updateState, theme }) {
  const d = theme === 'dark';
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Do you pay rent?</Heading>
      <SubText theme={theme}>If you live in your own house or with parents without paying rent, say No.</SubText>
      <YesNo theme={theme} value={state.paysRent} onYes={() => updateState({ paysRent: true })} onNo={() => updateState({ paysRent: false, monthlyRent: null, cityType: null, hraReceived: null, basicSalary: null })} />
      {state.paysRent === true && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div><Label theme={theme}>Monthly rent amount</Label><DarkInput theme={theme} value={state.monthlyRent} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ monthlyRent: val ? parseInt(val, 10) : null }); }} placeholder="e.g. 18000" /></div>
          <div>
            <Label theme={theme}>Which city do you live in?</Label>
            <div className="flex gap-4">
              {[{ id: 'metro', label: 'Metro', sub: 'Delhi, Mumbai, Kolkata, Chennai' }, { id: 'nonMetro', label: 'Non-Metro', sub: 'Bangalore, Pune, Hyderabad etc.' }].map(c => (
                <label key={c.id} className="flex-1 rounded-xl p-3 cursor-pointer transition-all" style={{ border: state.cityType === c.id ? '2px solid #3b82f6' : `2px solid ${d ? '#1f2937' : '#e2e8f0'}`, background: state.cityType === c.id ? (d ? '#1e3a5f' : '#eff6ff') : (d ? '#0f172a' : '#f8fafc') }}>
                  <div className="font-semibold" style={{ color: d ? '#f9fafb' : '#1e293b' }}>{c.label}</div>
                  <div className="text-xs" style={{ color: d ? '#6b7280' : '#64748b' }}>{c.sub}</div>
                  <input type="radio" className="hidden" checked={state.cityType === c.id} onChange={() => updateState({ cityType: c.id })} />
                </label>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl space-y-4" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
            <div><Label theme={theme}>Monthly HRA amount (Leave blank to estimate)</Label><DarkInput theme={theme} value={state.hraReceived} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ hraReceived: val ? parseInt(val, 10) : null }); }} placeholder="Monthly HRA" /></div>
            <div><Label theme={theme}>Monthly Basic Salary (Leave blank to estimate)</Label><DarkInput theme={theme} value={state.basicSalary} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ basicSalary: val ? parseInt(val, 10) : null }); }} placeholder="Monthly Basic" /></div>
          </div>
        </div>
      )}
    </StepCard>
  );
}

function Step5({ state, updateState, theme }) {
  const d = theme === 'dark';
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Do you invest in tax-saving options besides PF?</Heading>
      <SubText theme={theme}>PPF, ELSS Mutual Funds, Life Insurance, or children tuition fees (Section 80C).</SubText>
      <YesNo theme={theme} value={state.pfInvestment} onYes={() => updateState({ pfInvestment: true })} onNo={() => updateState({ pfInvestment: false, otherInvestments80C: null })} />
      {state.pfInvestment === true && (
        <div className="animate-in fade-in duration-300 p-6 rounded-xl" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
          <Label theme={theme}>Total invested annually (excluding PF)</Label>
          <DarkInput theme={theme} value={state.otherInvestments80C} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ otherInvestments80C: val ? parseInt(val, 10) : null }); }} placeholder="e.g. 50000" />
          <div className="mt-3 text-xs" style={{ color: d ? '#6b7280' : '#64748b' }}><strong>Note:</strong> Max under 80C is 1.5 Lakhs including PF. Capped automatically.</div>
        </div>
      )}
    </StepCard>
  );
}

function Step6({ state, updateState, theme }) {
  const d = theme === 'dark';
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Do you have health insurance? (Mediclaim)</Heading>
      <SubText theme={theme}>Only include premiums you pay out of pocket — not free corporate insurance.</SubText>
      <YesNo theme={theme} value={state.hasHealthInsurance} onYes={() => updateState({ hasHealthInsurance: true })} onNo={() => updateState({ hasHealthInsurance: false, healthInsuranceSelf: null, healthInsuranceParents: null, parentsAge: null, paysParentsInsurance: false })} />
      {state.hasHealthInsurance === true && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div><Label theme={theme}>Annual premium for Self, Spouse and Children</Label><DarkInput theme={theme} value={state.healthInsuranceSelf} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ healthInsuranceSelf: val ? parseInt(val, 10) : null }); }} placeholder="e.g. 15000" /></div>
          <div className="p-5 rounded-xl space-y-4" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
            <Label theme={theme}>Do you also pay health insurance for your parents?</Label>
            <div className="flex gap-4">
              {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(opt => (
                <label key={String(opt.val)} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" className="w-4 h-4" checked={state.paysParentsInsurance === opt.val} onChange={() => updateState({ paysParentsInsurance: opt.val, ...(opt.val === false ? { healthInsuranceParents: null, parentsAge: null } : {}) })} />
                  <span style={{ color: d ? '#e5e7eb' : '#1e293b' }}>{opt.label}</span>
                </label>
              ))}
            </div>
            {state.paysParentsInsurance === true && (
              <div className="pt-4 space-y-4 animate-in fade-in" style={{ borderTop: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
                <div><Label theme={theme}>Annual premium for Parents</Label><DarkInput theme={theme} value={state.healthInsuranceParents} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ healthInsuranceParents: val ? parseInt(val, 10) : null }); }} placeholder="e.g. 25000" /></div>
                <div>
                  <Label theme={theme}>Are any of your parents aged 60 or above?</Label>
                  <div className="flex gap-4">
                    {[{ val: 'above60', label: 'Yes (Senior Citizen)' }, { val: 'below60', label: 'No' }].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" className="w-4 h-4" checked={state.parentsAge === opt.val} onChange={() => updateState({ parentsAge: opt.val })} />
                        <span style={{ color: d ? '#e5e7eb' : '#1e293b' }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </StepCard>
  );
}

function Step7({ state, updateState, theme }) {
  const d = theme === 'dark';
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Are you repaying a home loan?</Heading>
      <SubText theme={theme}>You can claim a deduction on the interest portion of your EMI (Section 24b).</SubText>
      <YesNo theme={theme} value={state.hasHomeLoan} onYes={() => updateState({ hasHomeLoan: true })} onNo={() => updateState({ hasHomeLoan: false, homeLoanInterest: null })} />
      {state.hasHomeLoan === true && (
        <div className="animate-in fade-in duration-300 p-6 rounded-xl" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
          <Label theme={theme}>Total Interest paid annually</Label>
          <DarkInput theme={theme} value={state.homeLoanInterest} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ homeLoanInterest: val ? parseInt(val, 10) : null }); }} placeholder="e.g. 180000" />
          <div className="mt-3 text-xs" style={{ color: d ? '#6b7280' : '#64748b' }}><strong>Note:</strong> Max deduction for interest is 2 Lakhs per year.</div>
        </div>
      )}
    </StepCard>
  );
}

function Step8({ state, updateState, theme }) {
  const d = theme === 'dark';
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Do you contribute to NPS?</Heading>
      <SubText theme={theme}>Employer NPS contributions save tax in BOTH old and new regimes!</SubText>
      <YesNo theme={theme} value={state.contributesNPS} onYes={() => updateState({ contributesNPS: true })} onNo={() => updateState({ contributesNPS: false, npsEmployee: null, employerNPS: null })} />
      {state.contributesNPS === true && (
        <div className="p-5 rounded-xl space-y-4 animate-in fade-in duration-300" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
          <div>
            <Label theme={theme}>Your Voluntary Contribution (Self)</Label>
            <p className="text-xs mb-2" style={{ color: d ? '#6b7280' : '#64748b' }}>Claim up to 50,000 extra under Sec 80CCD(1B) in Old Regime.</p>
            <DarkInput theme={theme} value={state.npsEmployee} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ npsEmployee: val ? parseInt(val, 10) : null }); }} placeholder="Annual self contribution" />
          </div>
          <div className="pt-4" style={{ borderTop: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
            <Label theme={theme}>Employer Contribution</Label>
            <p className="text-xs mb-2" style={{ color: d ? '#6b7280' : '#64748b' }}>This saves tax in the New Regime too!</p>
            <DarkInput theme={theme} value={state.employerNPS} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ employerNPS: val ? parseInt(val, 10) : null }); }} placeholder="Annual employer contribution" />
          </div>
        </div>
      )}
    </StepCard>
  );
}

function Step9({ state, updateState, theme }) {
  const d = theme === 'dark';
  return (
    <StepCard theme={theme}>
      <Heading theme={theme}>Almost done! A couple more quick ones.</Heading>
      <SubText theme={theme}>Any extra income and professional tax to make your calculation perfect.</SubText>
      <div className="space-y-8">
        <div>
          <Label theme={theme}>Any other income? (e.g. Bank Interest, Freelance)</Label>
          <p className="text-xs mb-3" style={{ color: d ? '#6b7280' : '#64748b' }}>80TTA/80TTB exemptions applied automatically for Old Regime.</p>
          <DarkInput theme={theme} value={state.otherIncome} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ otherIncome: val ? parseInt(val, 10) : null }); }} placeholder="Total annual other income" />
        </div>
        <div className="pt-6" style={{ borderTop: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
          <Label theme={theme}>Professional Tax (PT)</Label>
          <p className="text-xs mb-3" style={{ color: d ? '#6b7280' : '#64748b' }}>Many states deduct around 200/month (max 2,500/year). Check your payslip.</p>
          <DarkInput theme={theme} value={state.professionalTax} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); updateState({ professionalTax: val ? parseInt(val, 10) : null }); }} placeholder="Annual Professional Tax (e.g. 2500)" />
        </div>
      </div>
    </StepCard>
  );
}

// ── Live Preview Panel ────────────────────────────────────────────
function LivePreviewPanel({ state, theme }) {
  const d = theme === 'dark';
  const formatCurrency = (num) => {
    if (num === null || num === undefined) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };
  const taxResults = calculateTax(state);
  const totalOldDeductions = taxResults ? Object.values(taxResults.oldRegimeDeductions).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="rounded-xl p-6 sticky top-6 transition-colors duration-300" style={{ background: d ? '#111827' : '#ffffff', border: `1.5px solid ${d ? '#1f2937' : '#e2e8f0'}`, boxShadow: d ? 'none' : '0 1px 8px rgba(0,0,0,0.06)' }}>
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: d ? '#e5e7eb' : '#1e293b' }}>
        <span>🧮</span> Your Tax Summary
      </h3>
      {!state.takeHomeSalary ? (
        <div className="h-64 rounded-lg flex items-center justify-center text-sm p-4 text-center" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1.5px dashed ${d ? '#374151' : '#cbd5e1'}`, color: d ? '#6b7280' : '#94a3b8' }}>
          Fill in your take-home salary to see your estimate here.
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-lg p-3 text-center" style={{ background: d ? '#1e3a5f' : '#eff6ff', border: `1px solid ${d ? '#1d4ed8' : '#bfdbfe'}` }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: d ? '#60a5fa' : '#1d4ed8' }}>Estimated Annual Gross</div>
            <div className="text-xl font-bold" style={{ color: d ? '#f9fafb' : '#1e293b' }}>{formatCurrency(taxResults?.annualGross)}</div>
          </div>
          <div className="text-sm space-y-2 py-2" style={{ borderBottom: `1px solid ${d ? '#1f2937' : '#f1f5f9'}` }}>
            <div className="flex justify-between" style={{ color: d ? '#9ca3af' : '#64748b' }}>
              <span>Total Deductions (Old)</span>
              <span className="font-medium" style={{ color: '#ef4444' }}>-{formatCurrency(totalOldDeductions)}</span>
            </div>
            <div className="flex justify-between" style={{ color: d ? '#9ca3af' : '#64748b' }}>
              <span>Taxable Income (New)</span>
              <span className="font-medium" style={{ color: d ? '#e5e7eb' : '#1e293b' }}>{formatCurrency(taxResults?.newRegimeTaxable)}</span>
            </div>
            <div className="flex justify-between" style={{ color: d ? '#9ca3af' : '#64748b' }}>
              <span>Taxable Income (Old)</span>
              <span className="font-medium" style={{ color: d ? '#e5e7eb' : '#1e293b' }}>{formatCurrency(taxResults?.oldRegimeTaxable)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
              <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: d ? '#6b7280' : '#94a3b8' }}>New Tax</div>
              <div className="text-lg font-bold" style={{ color: '#10b981' }}>{formatCurrency(taxResults?.newRegimeTax)}</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: d ? '#0f172a' : '#f8fafc', border: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
              <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: d ? '#6b7280' : '#94a3b8' }}>Old Tax</div>
              <div className="text-lg font-bold" style={{ color: '#8b5cf6' }}>{formatCurrency(taxResults?.oldRegimeTax)}</div>
            </div>
          </div>
          {taxResults?.savings > 0 && (
            <div className="rounded-lg p-3 text-center" style={{ background: d ? '#064e3b' : '#f0fdf4', border: `1px solid ${d ? '#10b981' : '#86efac'}` }}>
              <div className="text-sm font-bold" style={{ color: '#10b981' }}>
                💡 Pick {taxResults.recommendation === 'NEW_REGIME' ? 'New' : 'Old'} Regime
              </div>
              <div className="text-xs mt-1" style={{ color: d ? '#a7f3d0' : '#15803d' }}>
                You save <strong>{formatCurrency(taxResults.savings)}</strong>/year
              </div>
            </div>
          )}
          <div className="text-xs text-center italic mt-2" style={{ color: d ? '#4b5563' : '#94a3b8' }}>Details update automatically as you type.</div>
        </div>
      )}
    </div>
  );
}

// ── Wizard Shell ──────────────────────────────────────────────────
function WizardShell({ onBack, theme, setTheme }) {
  const d = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const totalSteps = 9;

  const [calculatorState, setCalculatorState] = useState({
    age: null, ageCategory: null, takeHomeSalary: null,
    pfDeducted: null, pfAmount: null, employerPfContribution: null,
    paysRent: null, monthlyRent: null, cityType: null, hraReceived: null, basicSalary: null,
    pfInvestment: null, otherInvestments80C: null,
    healthInsuranceSelf: null, healthInsuranceParents: null, parentsAge: null,
    hasHomeLoan: null, homeLoanInterest: null, homeLoanPrincipal: null,
    npsEmployee: null, employerNPS: null, otherIncome: null, professionalTax: null
  });

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(p => p + 1); else setShowResults(true); };
  const handleSkipToResults = () => setShowResults(true);
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(p => p - 1); else onBack(); };
  const updateState = (updates) => setCalculatorState(prev => ({ ...prev, ...updates }));

  if (showResults) {
    return <ResultsPage state={calculatorState} theme={theme} onRestart={() => { setShowResults(false); setCurrentStep(1); }} />;
  }

  const renderStep = () => {
    const props = { state: calculatorState, updateState, onNext: handleNext, theme };
    switch (currentStep) {
      case 1: return <Step1 {...props} />;
      case 2: return <Step2 {...props} />;
      case 3: return <Step3 {...props} />;
      case 4: return <Step4 {...props} />;
      case 5: return <Step5 {...props} />;
      case 6: return <Step6 {...props} />;
      case 7: return <Step7 {...props} />;
      case 8: return <Step8 {...props} />;
      case 9: return <Step9 {...props} />;
      default: return <Step1 {...props} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: d ? '#030712' : '#f8fafc' }}>
      <header className="py-4 px-4 flex items-center justify-between transition-colors duration-300" style={{ background: d ? '#0f172a' : '#ffffff', borderBottom: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
        <button onClick={handlePrevious} className="font-medium transition-colors" style={{ color: d ? '#6b7280' : '#64748b' }}>← Back</button>
        <div className="flex-1 flex justify-center items-center gap-2 max-w-sm mx-auto">
          {[...Array(totalSteps)].map((_, i) => {
            const s = i + 1;
            const done = s < currentStep;
            const cur = s === currentStep;
            return (
              <div key={i} className={`rounded-full transition-all duration-300 ${cur ? 'animate-pulse' : ''}`}
                style={{ width: cur ? '12px' : '10px', height: cur ? '12px' : '10px', background: cur || done ? '#3b82f6' : (d ? '#1f2937' : '#e2e8f0'), boxShadow: cur ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none' }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm" style={{ color: d ? '#4b5563' : '#94a3b8' }}>Step {currentStep} of {totalSteps}</div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-5xl">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">{renderStep()}</div>
          <div className="mt-8 flex justify-between items-center pt-6" style={{ borderTop: `1px solid ${d ? '#1f2937' : '#e2e8f0'}` }}>
            <button onClick={handlePrevious} className="px-6 py-2 rounded-lg font-medium transition-colors" style={{ color: d ? '#6b7280' : '#64748b', background: d ? '#111827' : '#f1f5f9' }}>← Previous</button>
            <div className="flex gap-4 items-center">
              {currentStep >= 4 && (
                <button onClick={handleSkipToResults} className="text-sm font-medium" style={{ color: d ? '#4b5563' : '#94a3b8' }}>Skip to results</button>
              )}
              <button onClick={handleNext} className="py-2 px-8 rounded-xl font-bold transition-all" style={{ background: '#1d4ed8', color: '#fff' }}>
                {currentStep === totalSteps ? 'See My Results' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:w-[350px] xl:w-[400px]">
          <LivePreviewPanel state={calculatorState} theme={theme} />
        </div>
      </main>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────
function App() {
  const [started, setStarted] = useState(false);
  const [theme, setTheme] = useState('light'); // light is default

  return (
    <ThemeContext.Provider value={theme}>
      {started ? (
        <WizardShell onBack={() => setStarted(false)} theme={theme} setTheme={setTheme} />
      ) : (
        <LandingPage onStart={() => setStarted(true)} theme={theme} setTheme={setTheme} />
      )}
    </ThemeContext.Provider>
  );
}

export default App;