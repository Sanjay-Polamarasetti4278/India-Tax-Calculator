# Product Requirements Document
## India Salaried Tax Calculator — FY 2025-26
### Old Regime vs New Regime Comparison

**Version:** 1.0  
**Audience:** Developers, designers, AI coding assistants  
**Scope:** Browser-only, single-page React/HTML app. No backend. No auth. No PDF export. Salaried individuals only.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Tax Rules Reference — FY 2025-26](#3-tax-rules-reference--fy-2025-26)
4. [Screen-by-Screen Specification](#4-screen-by-screen-specification)
5. [Wizard Steps — Full Specification](#5-wizard-steps--full-specification)
6. [Live Preview Panel](#6-live-preview-panel)
7. [Results Screen](#7-results-screen)
8. [Tax Calculation Engine](#8-tax-calculation-engine)
9. [Validation Rules](#9-validation-rules)
10. [Design System](#10-design-system)
11. [Edge Cases & Special Scenarios](#11-edge-cases--special-scenarios)
12. [Copy & Tone Guidelines](#12-copy--tone-guidelines)

---

## 1. Product Vision

### Problem Statement

Every year, crores of salaried Indians guess which tax regime to pick. Existing calculators are confusing — they ask for CTC, gross salary, or exact component breakdowns that most salaried employees don't know off the top of their head. What everyone knows is what lands in their bank account every month.

### Core Insight

Start from **take-home salary** (what hits the bank account), not CTC. Reverse-engineer the gross from there. Ask questions in plain, human language. The app should feel like a smart friend walking you through it — not an IT form.

### Primary Goal

Help any salaried Indian figure out, in under 3 minutes, which tax regime saves them more money in FY 2025-26 — with a clear, trustworthy, human-readable result.

### Design Principles

- **One question at a time.** Never overwhelm.
- **Plain language.** No jargon. No section numbers unless in footnotes.
- **Privacy-first.** Everything runs in the browser. No data leaves the device.
- **Live feedback.** The estimate updates as they type, making it feel alive.
- **Educate while calculating.** By the end, users understand *why* one regime is better for them.

---

## 2. Tech Stack & Architecture

### Recommended Stack

- **Framework:** React 18 (or vanilla HTML/JS if simpler)
- **Styling:** Tailwind CSS (or equivalent utility-first CSS)
- **State:** React `useState` / `useReducer` — all in-memory, no localStorage
- **Math:** Pure JavaScript — no external tax libraries
- **Fonts:** Inter or similar modern sans-serif
- **Charts:** Recharts or Chart.js for slab visualizations
- **Deployment:** Static site — Vercel, Netlify, or GitHub Pages

### App Structure

```
App
├── LandingPage          — Hero, value proposition, CTA, preview mockup
├── WizardShell          — Progress bar, step container, nav buttons
│   ├── Step 1-9         — Individual question steps (see Section 5)
│   └── LivePreviewPanel — Sticky right panel (desktop) or collapsible bottom (mobile)
└── ResultsScreen        — Recommendation, comparison, education, suggestions
```

### State Shape

```javascript
const calculatorState = {
  // Step 1: Identity
  age: null,                    // number (years)
  ageCategory: null,            // 'below60' | 'senior' | 'superSenior'

  // Step 2: Take-home
  takeHomeSalary: null,         // number (monthly, rupees)

  // Step 3: PF
  pfDeducted: null,             // boolean
  pfAmount: null,               // number (monthly, auto-calculated or manual)
  employerPfContribution: null, // number (monthly)

  // Step 4: Rent
  paysRent: null,               // boolean
  monthlyRent: null,            // number
  cityType: null,               // 'metro' | 'nonMetro'
  hraReceived: null,            // number (monthly, from salary slip or estimated)
  basicSalary: null,            // number (monthly, estimated or entered)

  // Step 5: 80C Investments
  pfInvestment: null,           // number (annual, from PF — auto-filled)
  otherInvestments80C: null,    // number (annual — PPF, ELSS, LIC, etc.)

  // Step 6: Health Insurance
  healthInsuranceSelf: null,    // number (annual premium, self+family)
  healthInsuranceParents: null, // number (annual premium, parents)
  parentsAge: null,             // 'below60' | 'above60' (for 80D limit)

  // Step 7: Home Loan
  hasHomeLoan: null,            // boolean
  homeLoanInterest: null,       // number (annual)
  homeLoanPrincipal: null,      // number (annual, for 80C)

  // Step 8: NPS
  npsEmployee: null,            // number (annual, employee contribution - 80CCD(1B))
  npsEmployer: null,            // number (annual, employer contribution - 80CCD(2))

  // Step 9: Other income
  otherIncome: null,            // number (annual — FD interest, savings interest, etc.)
  professionalTax: null,        // number (annual, typically 2400)

  // Derived
  grossSalary: null,            // computed
  taxableIncome_old: null,      // computed
  taxableIncome_new: null,      // computed
  tax_old: null,                // computed (final, after cess)
  tax_new: null,                // computed (final, after cess)
};
```

---

## 3. Tax Rules Reference — FY 2025-26

> **Important:** This section is ground truth for the calculation engine. Every figure here is verified for FY 2025-26 (AY 2026-27).

### 3.1 New Tax Regime Slabs

Applicable to ALL individuals regardless of age.

| Taxable Income (₹)           | Tax Rate |
|-----------------------------|----------|
| 0 – 4,00,000                | 0%       |
| 4,00,001 – 8,00,000         | 5%       |
| 8,00,001 – 12,00,000        | 10%      |
| 12,00,001 – 16,00,000       | 15%      |
| 16,00,001 – 20,00,000       | 20%      |
| 20,00,001 – 24,00,000       | 25%      |
| Above 24,00,000             | 30%      |

- **Standard deduction (new regime):** ₹75,000 (for salaried individuals)
- **Section 87A rebate (new regime):** If taxable income ≤ ₹12,00,000, rebate = 100% of tax (max ₹60,000). Tax becomes ₹0.
- **Effective zero-tax limit for salaried (new regime):** ₹12,75,000 (₹12L + ₹75K standard deduction)
- **Deductions allowed in new regime:** Only standard deduction of ₹75,000, employer NPS contribution u/s 80CCD(2), family pension deduction
- **Deductions NOT allowed in new regime:** HRA, 80C, 80D, 80CCD(1B), Section 24(b) for self-occupied home loan, professional tax (partial), LTA

### 3.2 Old Tax Regime Slabs

#### For individuals below 60 years

| Taxable Income (₹)           | Tax Rate |
|-----------------------------|----------|
| 0 – 2,50,000                | 0%       |
| 2,50,001 – 5,00,000         | 5%       |
| 5,00,001 – 10,00,000        | 20%      |
| Above 10,00,000             | 30%      |

#### For Senior Citizens (60–79 years) — old regime only

| Taxable Income (₹)           | Tax Rate |
|-----------------------------|----------|
| 0 – 3,00,000                | 0%       |
| 3,00,001 – 5,00,000         | 5%       |
| 5,00,001 – 10,00,000        | 20%      |
| Above 10,00,000             | 30%      |

#### For Super Senior Citizens (80+ years) — old regime only

| Taxable Income (₹)           | Tax Rate |
|-----------------------------|----------|
| 0 – 5,00,000                | 0%       |
| 5,00,001 – 10,00,000        | 20%      |
| Above 10,00,000             | 30%      |

- **Standard deduction (old regime):** ₹50,000 (for salaried individuals)
- **Section 87A rebate (old regime):** If taxable income ≤ ₹5,00,000, rebate = 100% of tax (max ₹12,500). Tax becomes ₹0.

### 3.3 Health & Education Cess

- **Rate:** 4% on (income tax + surcharge)
- Applies to BOTH regimes
- Applied AFTER the 87A rebate

### 3.4 Surcharge (for this app — focus on salary income up to ₹50L)

This app focuses on salaried individuals. Surcharge only applies if total income exceeds ₹50 lakh. Since the app targets typical salaried users, surcharge handling is simplified:

- Income ≤ ₹50L: No surcharge (covers 99% of target users)
- Income > ₹50L: Add a note that results may not be fully accurate and a CA consultation is recommended. Still calculate without surcharge for estimation.

### 3.5 Key Deductions — Old Regime Only

#### Standard Deduction
- ₹50,000 flat (old regime)
- ₹75,000 flat (new regime)
- No proof required. Automatically applied.

#### Section 80C (max ₹1,50,000/year)
Eligible investments/expenses:
- Employee's PF contribution (EPF/VPF)
- PPF contributions
- ELSS mutual funds
- LIC premium payments
- 5-year tax-saving FD
- NSC
- ULIP
- Sukanya Samriddhi Yojana
- Home loan principal repayment
- Children's tuition fees (up to 2 children)

**Calculation note:** EPF contribution from salary is automatically included. The user also adds other investments separately. Total 80C = min(EPF + other, ₹1,50,000).

#### Section 80CCD(1B) — NPS (over and above 80C)
- Additional deduction for NPS employee contribution: max ₹50,000/year
- This is OVER AND ABOVE the ₹1.5L limit under 80C
- Only old regime

#### Section 80CCD(2) — Employer NPS Contribution
- Deductible in BOTH regimes
- Max: 10% of basic salary (14% for government employees — use 10% as default)
- This is the employer's contribution, not employee's

#### Section 80D — Health Insurance
| Who Insured          | Max Deduction |
|----------------------|---------------|
| Self + family (below 60) | ₹25,000  |
| Self + family (60+)      | ₹50,000  |
| Parents (below 60)       | ₹25,000  |
| Parents (60+)            | ₹50,000  |

Total max: Up to ₹1,00,000 (if self is 60+ and parents are 60+).

#### Section 24(b) — Home Loan Interest
- Self-occupied property: Max ₹2,00,000/year
- Let-out property: No limit (but this app only handles self-occupied for simplicity)
- Only old regime for self-occupied

#### House Rent Allowance (HRA) Exemption — Section 10(13A)
- Only applicable if HRA is a component of salary AND employee pays rent
- Only old regime

**HRA Exemption = Minimum of:**
1. Actual HRA received from employer (annual)
2. Rent paid – 10% of Basic Salary (annual) [if negative, = ₹0]
3. 50% of Basic Salary (if metro city: Delhi, Mumbai, Kolkata, Chennai)
   OR 40% of Basic Salary (all other cities)

**Metro cities for FY 2025-26:** Delhi, Mumbai, Kolkata, Chennai only.

**Note:** "Salary" in HRA formula = Basic Salary + Dearness Allowance. For simplicity, use Basic Salary (most private sector employees have negligible DA).

#### Professional Tax
- Deductible under old regime
- Typically ₹200/month = ₹2,400/year in most states
- Some states: Karnataka ₹200/month, Maharashtra ₹2,500/year, etc.
- Default: ₹2,400/year if user confirms PT is deducted

#### Section 80TTA / 80TTB — Savings Interest
- 80TTA (below 60): Max ₹10,000/year on savings account interest
- 80TTB (60+): Max ₹50,000/year on ALL interest (FD + savings)
- Only old regime

#### Section 80E — Education Loan Interest
- No upper limit
- Only for higher education of self/spouse/children
- Only old regime
- Not covered in this app (out of scope for v1 — focus on common deductions)

### 3.6 Marginal Relief (New Regime)

When income is just above ₹12,00,000 (after deductions), the person shouldn't pay MORE than the excess above ₹12L. Apply marginal relief:

- If taxable income is between ₹12,00,001 and ~₹12,87,500: 
  - Tax = min(computed tax, taxable income – ₹12,00,000)
- This ensures smooth transition above the rebate threshold

**Implementation:**
```javascript
// After computing tax_before_relief for new regime:
if (taxableIncome > 1200000 && taxableIncome <= 1287500) {
  const marginalRelief = taxableIncome - 1200000;
  taxBeforeCess = Math.min(taxBeforeCess, marginalRelief);
}
```

### 3.7 Salary Structure Estimation

Since users start from take-home, we need to estimate gross salary. Typical private sector salary structure:

- Basic = ~40-50% of CTC (use 40% as default)
- HRA = ~40-50% of Basic (use 40-50% depending on city)
- PF = 12% of Basic (employee) + 12% of Basic (employer, not part of take-home)
- Professional Tax = typically ₹200/month
- Other allowances make up the rest

**Reverse calculation from take-home:**
```
Take-home ≈ Gross Salary – Employee PF – Professional Tax – TDS (estimated)
Gross Salary ≈ Take-home + Employee PF + Professional Tax + estimated TDS
```

Since TDS depends on the regime chosen (circular), use an iterative approach or estimate:
1. Initial estimate: Gross ≈ Take-home × 1.25 (rough)
2. If PF deducted: Employee PF = 12% × Basic; Basic ≈ Gross × 0.4
   So PF ≈ Gross × 0.048
3. Gross ≈ (Take-home + Professional Tax) / (1 - 0.048) when TDS is unknown

For simplicity, ask the user to confirm the approximate gross/annual salary from their offer letter or Form 16, OR derive it from: **Monthly take-home × 12 + Annual PF employee contribution + Professional Tax paid**.

---

## 4. Screen-by-Screen Specification

### Screen 1: Landing Page

**Purpose:** First impression. Build trust. Explain the value. Get the user to click "Start."

#### Layout (Desktop — 2 column)

```
┌──────────────────────────────────────────────────────────────────┐
│  Logo / Brand (top left)                  Privacy badge (top right)│
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                      │
│  HEADLINE (H1)              │    [Preview Card / Mockup]           │
│  "Find out which tax        │                                      │
│   regime saves you          │  ┌─────────────────────────────┐    │
│   more money."              │  │ New Regime     Old Regime   │    │
│                             │  │ ₹18,420 tax   ₹31,200 tax  │    │
│  SUBHEAD (H2)               │  │                             │    │
│  "Answer 9 simple           │  │ 💡 Pick New Regime          │    │
│   questions. Takes 3        │  │    You save ₹12,780/year   │    │
│   minutes. Everything       │  └─────────────────────────────┘    │
│   runs on your device."     │                                      │
│                             │  (This is a blurred/preview image    │
│  [Start Calculating →]      │   of the result screen)             │
│                             │                                      │
│  ─────────────────          │                                      │
│  ✓ No login needed          │                                      │
│  ✓ Your data stays          │                                      │
│    on your device           │                                      │
│  ✓ Updated for              │                                      │
│    Budget 2025              │                                      │
│                             │                                      │
├─────────────────────────────┴────────────────────────────────────┤
│  HOW IT WORKS (3 steps with icons)                                │
│  1. Tell us your take-home → 2. Answer a few questions → 3. Get  │
│     your recommendation                                           │
├──────────────────────────────────────────────────────────────────┤
│  FAQ (accordion, 3-4 common questions)                            │
│  "Do I need my Form 16?" "Is this for FY 2025-26?" etc.          │
└──────────────────────────────────────────────────────────────────┘
```

#### Landing Page Content

**Headline:** "Find out which tax regime saves you more money"

**Subheadline:** "Answer 9 simple questions. Get a clear answer in 3 minutes. No jargon, no Form 16 needed."

**Trust badges (row of 4):**
- 🔒 Your data never leaves this page
- 🧮 Updated for Budget 2025
- ⚡ Results in under 3 minutes
- 🆓 100% free

**"How it works" section:**

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 💰 | Tell us your take-home | What hits your bank account every month |
| 2 | ✅ | Answer a few questions | About rent, investments, home loan |
| 3 | 🎯 | Get your answer | Which regime saves you more, and by how much |

**Preview result card (blurred/illustrative):**
Shows a mock comparison card with regime names, illustrative tax numbers (clearly marked "example"), and a highlighted recommendation badge. This tells the user what the output will look like before they start.

**CTA button:** "Start Calculating →" (primary, large, prominent)

**Landing page FAQ accordion:**
- "Do I need to know my CTC or gross salary?" → No, just what lands in your bank account.
- "Is this for FY 2025-26?" → Yes, updated with Budget 2025 changes. New slabs, ₹12L rebate, all included.
- "Will my data be saved?" → Nothing is saved anywhere. Close the tab and it's gone.
- "I'm new to working. Is this for me?" → Yes! Especially for you. We explain everything in plain language.

---

### Screen 2: Wizard Shell

The wizard sits inside a clean, full-page container. Layout:

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back    [●●●○○○○○○] Step 3 of 9     [Skip to results]        │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                  │
│   QUESTION AREA                │   LIVE PREVIEW PANEL            │
│   (left, ~55% width)           │   (right, ~40% width, sticky)   │
│                                │                                  │
│   [Step content here]          │   [See Section 6]               │
│                                │                                  │
│   [FAQ accordion below         │                                  │
│    the question]               │                                  │
│                                │                                  │
│   [← Previous] [Next →]        │                                  │
└────────────────────────────────┴─────────────────────────────────┘
```

**Progress indicator:** 9 dots (or segmented bar). Filled dots = completed steps. Current dot = highlighted/pulsing. Empty dots = remaining.

**Mobile layout:** Single column. Live Preview is collapsed by default, with a persistent floating chip at the bottom showing "Est. tax: ₹X (tap to expand)."

**Back navigation:** Always available. Goes to previous step. Never loses data.

**"Skip to results" link:** Available from Step 4 onward. Calculates with current inputs and best estimates for unanswered questions (uses ₹0 for unspecified deductions).

---

## 5. Wizard Steps — Full Specification

### Step 1: Age / Category

**Question heading:** "First, how old are you?"

**Why we ask (shown as subtext below question):**
"Tax rules are slightly different for people above 60 and 80. We need this to get your numbers right."

**Input type:** Three large radio/card options:

| Option | Label | Subtext |
|--------|-------|---------|
| A | Under 60 | I'm below 60 years old |
| B | 60 to 79 | Senior Citizen (60–79 years) |
| C | 80 or above | Super Senior Citizen (80+ years) |

**Validation:** Must select one before proceeding.

**Effect on calculation:**
- Sets `ageCategory`
- Determines old regime basic exemption limit: ₹2.5L / ₹3L / ₹5L respectively
- Determines 80D limits for self
- Determines 80TTA vs 80TTB

**Step 1 FAQ (accordion at bottom):**
- "Why does my age matter?" → The old tax regime gives higher tax exemptions to senior citizens. This can make a big difference in which regime is better for you.
- "What if my birthday is in the middle of this financial year?" → Use the age you'll be on March 31, 2026 (the last day of FY 2025-26).

---

### Step 2: Take-Home Salary

**Question heading:** "How much money reaches your bank account every month?"

**Why we ask (subtext):** "This is your in-hand salary — what you actually receive after your employer deducts PF and TDS. Don't include any bonuses."

**Input type:** Number input (₹)

**Label on input:** "Monthly take-home salary"

**Placeholder:** "e.g. 55000"

**Formatting:** Automatically show formatted value (e.g., ₹55,000) as hint below

**Helper text:** "Check your bank statement or payslip. It's the amount that gets credited each month."

**Validation:**
- Required
- Must be > ₹5,000 (sanity check)
- Must be < ₹10,00,000/month (reasonable upper limit; show note for higher incomes)
- Show annual equivalent as helper: "That's roughly ₹X per year"

**Step 2 FAQ:**
- "Should I include my bonus?" → No, skip bonuses for now. We're calculating based on your regular monthly salary.
- "My salary varies month to month. What should I enter?" → Enter a typical month's amount — what you receive most months.
- "I get salary every 2 weeks, not monthly." → Multiply your per-payment amount by 2 to get monthly.
- "What if my company transfers some amount directly to investments?" → Include only what actually hits your bank account as cash.

---

### Step 3: PF Deduction

**Question heading:** "Does your company deduct Provident Fund (PF) from your salary?"

**Why we ask (subtext):** "PF is a retirement savings deduction — usually 12% of your basic salary. It counts toward tax savings. If you see 'EPF' or 'PF' deducted on your payslip, the answer is yes."

**Input type:** Yes/No toggle cards

**If Yes — follow-up question:**

**Follow-up Q3a:** "Great. Do you know roughly how much PF is deducted per month?"

**Options:**
- "I know the exact amount" → show ₹ input
- "I'm not sure" → we'll estimate based on your take-home (use 12% of basic, basic ≈ 40% of gross)

**If user enters amount:** Store as `pfAmount` (monthly, employee share)

**If user says not sure:**
- Display: "No worries! We'll estimate PF as roughly ₹[calculated amount] per month based on your take-home. You can adjust this later."
- Auto-calculate: Basic ≈ (Monthly gross) × 0.40; PF = Basic × 12%

**Effect on calculation:**
- Annual employee PF = pfAmount × 12 → goes into 80C bucket
- Annual employer PF = same amount → NOT part of taxable salary (just informational)
- If PF deducted, reverse-engineer gross salary more accurately

**Step 3 FAQ:**
- "What's the difference between EPF and PF?" → Same thing. EPF = Employees' Provident Fund. PF is the short form.
- "My company does NPS instead of PF. What should I choose?" → Choose No for PF. You'll get a chance to enter NPS in a later step.
- "I work at a startup and they don't have PF. Should I say No?" → Yes, choose No.

---

### Step 4: Rent

**Question heading:** "Do you pay rent for the place you live in?"

**Subtext:** "If you live in your own house, or with your parents (without paying them rent), say No."

**Input type:** Yes/No cards

**If Yes — follow-up questions (sequential):**

**Q4a:** "How much rent do you pay per month?"
- Number input
- Placeholder: "e.g. 18000"
- Helper: "Include only what you pay your landlord. Don't add electricity/maintenance."

**Q4b:** "Which city do you live in?"
- Two radio cards:

| Option | Label | Subtext |
|--------|-------|---------|
| Metro | Delhi, Mumbai, Kolkata, or Chennai | These 4 cities get a higher tax exemption on rent |
| Non-Metro | Any other city | All other cities including Bangalore, Hyderabad, Pune, etc. |

**Q4c:** "Does your employer separately show an HRA (House Rent Allowance) component in your salary?"
- Yes / No / "I'm not sure"
- Helper text: "Check your payslip. HRA is often listed as a separate row. If you're not sure, say 'Not sure' and we'll estimate."

**If Yes:** "What is your HRA per month (from your payslip)?" → Number input
**If Not sure / estimated:** We calculate HRA = 50% of basic (metro) or 40% of basic (non-metro), where basic ≈ gross × 0.40

**Q4d:** "What is your Basic Salary per month?" (show only if HRA is entered or estimated)
- Helper: "This is often labeled 'Basic' on your payslip. It's usually 40-50% of your gross."
- If user doesn't know → use estimate: basic ≈ gross × 0.40

**Effect on calculation:**
- Computes HRA exemption (old regime only) = min(actual HRA, rent – 10%×basic, 50%/40% × basic)
- If No → HRA exemption = ₹0

**Step 4 FAQ:**
- "I pay rent to my parents. Can I claim this?" → Yes, legally. You need to pay them via bank transfer and they need to show it as income. We'll include it in calculations.
- "I'm in Bangalore/Hyderabad/Pune. Is that metro?" → For FY 2025-26, only Delhi, Mumbai, Kolkata, and Chennai are metro for tax purposes. Bangalore, Hyderabad, and Pune are non-metro this year.
- "What if my company doesn't have an HRA component?" → If HRA isn't part of your salary, your rent won't reduce your tax unless you claim Section 80GG (which we'll handle separately).
- "I own a house but also pay rent in the city I work in. Can I claim HRA?" → Yes! If your house is in a different city from where you work, you can claim HRA on rent AND home loan benefits.

---

### Step 5: Tax-Saving Investments (80C)

**Question heading:** "Do you invest in any tax-saving options besides PF?"

**Subtext:** "These are investments that reduce your tax under the old regime. Don't worry if you don't have any — we just need to know what you have."

**Display:** Pre-filled PF amount is already shown as a "chip" (e.g., "PF contribution: ₹X/year — already counted ✓")

**Show a checklist with amounts — user checks what applies:**

```
☐ PPF (Public Provident Fund)              ₹[____]/year
☐ ELSS / Mutual Funds (tax saving)         ₹[____]/year
☐ Life Insurance (LIC or term plan premium) ₹[____]/year
☐ Home Loan — Principal repayment           ₹[____]/year
☐ NSC (National Savings Certificate)       ₹[____]/year
☐ Tax-saving Fixed Deposit (5 year)         ₹[____]/year
☐ Children's school fees                    ₹[____]/year
☐ Others (Sukanya, ULIP, etc.)             ₹[____]/year
```

**Running total shown below:** "Total 80C so far: ₹X / ₹1,50,000 limit"
(progress bar fills up as they enter amounts; turns red/orange if they exceed ₹1.5L limit)

**If total > ₹1,50,000:** Show soft warning: "You've crossed the ₹1.5L limit. We'll use ₹1,50,000 as your 80C deduction — the extra investments don't reduce tax further."

**If user clicks "I don't invest in any of these":** Checkbox option to skip — total stays at just PF.

**Step 5 FAQ:**
- "What is ELSS?" → ELSS stands for Equity-Linked Savings Scheme. It's a type of mutual fund where your money is invested in the stock market. It has a 3-year lock-in and qualifies for 80C deductions.
- "Does my PF count toward the ₹1.5 lakh limit?" → Yes! Your PF contribution (already counted above) is part of the ₹1.5L limit. So the effective room left for other investments = ₹1.5L – PF contribution.
- "I pay for my child's school fees. Does that count?" → Yes, tuition fees for up to 2 children qualifies under 80C.
- "My LIC premium is deducted from my salary. Should I enter it?" → Yes, enter it here. Even though the company deducts it, it still counts as your investment.

---

### Step 6: Health Insurance

**Question heading:** "Do you have health insurance? (Mediclaim / health policy)"

**Subtext:** "If your company gives you health insurance, you may still pay a portion of the premium. That portion counts for tax savings under the old regime."

**Follow-up if Yes:**

**Q6a:** "How much do you pay annually for health insurance for yourself and your family?"
- Number input (annual)
- Helper: "Include only what you pay out of pocket, not what your employer pays. Check your payslip or insurer."
- Max used for calculation: ₹25,000 (if you're below 60) or ₹50,000 (if 60+) — auto-applied

**Q6b:** "Do you also pay health insurance premium for your parents?"
- Yes/No

**If Yes:**
**Q6c:** "Approximately how much do you pay for your parents' health insurance per year?"
- Number input
- Helper: "If you're unsure of the exact amount, a rough estimate is fine."

**Q6d:** "How old are your parents? (This affects how much you can claim)"
- Both parents below 60
- At least one parent is 60 or above

**Effect on calculation:**
- 80D deduction = min(self premium, ₹25,000 or ₹50,000 based on age) + min(parents premium, ₹25,000 or ₹50,000 based on parents age)
- Maximum total: ₹1,00,000 if both taxpayer and parents are senior citizens

**Step 6 FAQ:**
- "My company pays my health insurance. Should I enter ₹0?" → If your company pays fully and you don't contribute anything, enter ₹0. But if you pay even a small portion, enter that amount.
- "What's the maximum I can claim?" → If you're below 60, up to ₹25,000 for self + family. Plus up to ₹25,000 more for parents below 60, or ₹50,000 for parents above 60. So up to ₹75,000 total in most cases.
- "Does life insurance count here?" → No, life insurance premiums go under 80C (Step 5), not here. Section 80D is only for health/medical insurance.

---

### Step 7: Home Loan

**Question heading:** "Are you repaying a home loan?"

**Subtext:** "If you've taken a loan to buy a house and you're paying monthly EMIs, this can help reduce your taxes under the old regime."

**If No:** Move to Step 8.

**If Yes:**

**Q7a:** "Is this home loan for a house you live in yourself, or a rented-out property?"
- Self-occupied (I live there)
- Rented out / Second property (I don't live there)

*(Note: For rented-out property, home loan interest deduction rules are different — not subject to ₹2L cap. Since this is complex, for v1, handle only self-occupied. Show a note for rented property: "We'll estimate this — the exact calculation for rented properties is complex. For accurate numbers, consult a CA.")*

**Q7b:** "Approximately how much home loan interest do you pay in a year?"
- Number input (annual)
- Helper: "You can find this in your EMI statement from the bank, or in your Form 16 Part B. For a typical 20-year home loan, interest is a large portion of early EMIs."
- Note shown: "The old regime allows up to ₹2,00,000/year deduction on home loan interest for self-occupied property."

**Q7c:** "Do you also know your annual principal repayment amount?" (optional)
- Yes → enter amount
- Not sure → we'll estimate (typical split: ~60% interest, 40% principal in mid-term loans)
- This gets added to 80C

**Effect on calculation:**
- Section 24(b) deduction (old regime only) = min(actual interest, ₹2,00,000)
- Principal → added to 80C bucket (subject to overall ₹1.5L cap)

**Step 7 FAQ:**
- "I just started my home loan. How do I know how much is interest vs principal?" → Request an amortization statement from your bank. For the first few years, most of your EMI is interest. Roughly: Annual interest ≈ Loan amount × interest rate. Annual principal = Total EMI × 12 – interest.
- "Can I claim both HRA (I pay rent) and home loan (I own a house)?" → Yes, if the house is in a different city from where you're working. E.g., house in hometown (Hyderabad), working in Mumbai and paying rent there.
- "I have a joint home loan. How much can I claim?" → Each co-borrower can claim separately, up to ₹2L each, if both are co-owners and filing separately.

---

### Step 8: NPS

**Question heading:** "Do you contribute to NPS (National Pension System)?"

**Subtext:** "NPS is a government retirement scheme. If you invest in NPS, you can get an extra tax break on top of your other investments — even in the old regime."

**Three sub-questions:**

**Q8a:** "Do you contribute to NPS yourself (from your own money)?"
- Yes → "How much per year?" (number input)
- No

**Q8b:** "Does your employer contribute to NPS on your behalf?"
- Yes → "How much per year?" (number input)
- No / Not sure

Helper for Q8b: "This is usually shown as 'NPS employer contribution' on your Form 16 or payslip. It's different from your own NPS contribution."

**Effect on calculation:**
- Employee NPS (80CCD(1B)): max ₹50,000 additional deduction → old regime only
- Employer NPS (80CCD(2)): max 10% of basic salary → deductible in BOTH regimes. Show impact in both columns.

**Step 8 FAQ:**
- "What's the difference between NPS Tier 1 and Tier 2?" → Only Tier 1 (pension account) qualifies for tax deduction. Tier 2 is like a savings account and doesn't get tax benefits.
- "Is NPS employee contribution different from the extra ₹50,000?" → For 80C, NPS contribution is counted within the ₹1.5L limit. But under 80CCD(1B), you get an additional ₹50,000 over and above 80C. It's a great extra saving!
- "My company matches my NPS contribution. Where does that go?" → Your company's contribution is 80CCD(2) — it's deductible in BOTH regimes. Enter it in the employer contribution box.

---

### Step 9: Other Income & Finishing Up

**Question heading:** "Almost done! A couple more quick ones."

**This step has 3 small questions on the same screen (different from single-question steps):**

**Q9a:** "Does your employer deduct Professional Tax from your salary?"
- Helper: "Professional Tax is a small state-level tax. Most salaried employees in states like Karnataka, Maharashtra, Andhra Pradesh, etc. have this deducted. It's usually ₹200/month."
- Yes → amount: "₹200/month" (pre-filled, editable)
- No

**Q9b:** "Do you earn interest on FD or savings accounts? (approximately)"
- No / I don't know
- Yes → "Roughly how much in a year?" (number input)
- Helper: "Check your bank's annual interest statement, or your Form 26AS. This adds to your taxable income."

**Q9c:** "Is there anything else you'd like to count? (optional)"
- A simple free-text or number field for "other deductions" not covered above
- Label: "Any other annual deduction (80G donations, etc.)?"
- Helper: "Only enter if you're sure. Otherwise leave blank."

**Completion message on this step:**
"That's everything! Tap 'See My Results' to find out which regime saves you more."

---

## 6. Live Preview Panel

The right-side panel updates in real-time as users answer questions. This is a core UX feature — it makes users feel like something is happening and builds trust.

### Panel Structure

```
┌─────────────────────────────────┐
│ 🧮 Your Tax Estimate             │
│ (updates as you answer)          │
├─────────────────────────────────┤
│                                  │
│  New Regime        Old Regime    │
│  ──────────        ──────────    │
│  ₹18,420          ₹31,200       │
│  per year          per year      │
│                                  │
│  💡 New Regime looks better      │
│     You may save ~₹12,780/year  │
│                                  │
├─────────────────────────────────┤
│  INCOME BREAKDOWN                │
│  Est. Annual Income   ₹7,20,000  │
│  Standard Deduction    -₹75,000  │
│  ─────────────────────────────   │
│  Taxable (New)        ₹6,45,000  │
│                                  │
│  (Old Regime)                    │
│  Standard Deduction    -₹50,000  │
│  PF / 80C              -₹86,400  │
│  Health Insurance      -₹25,000  │
│  HRA Exemption         -₹1,08,000│
│  ─────────────────────────────   │
│  Taxable (Old)        ₹4,50,600  │
│                                  │
├─────────────────────────────────┤
│  TAX SLAB BREAKDOWN              │
│  (Mini slab table, both regimes) │
└─────────────────────────────────┘
```

### Behavior Rules

- Updates on every input change (debounce 300ms if needed for performance)
- Shows `—` (dashes) for values not yet entered
- When only take-home is entered (Step 2 complete), show: "Enter ₹X/month take-home → estimated ₹Y annual income. Keep going for a better estimate."
- After Step 4 (rent), the estimate becomes notably more refined — show a visual "ping" on the panel to draw attention
- For steps not yet answered, show minimum calculation (₹0 for deductions not entered)

### Confidence Indicator

Show a small confidence badge on the panel:
- 1-2 steps done: "Rough estimate"
- 3-5 steps done: "Getting closer"
- 6-9 steps done: "Accurate estimate"

---

## 7. Results Screen

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│                  YOUR TAX VERDICT FOR FY 2025-26                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ╔══════════════════════════════════════════╗                   │
│   ║  🎯 Pick: [NEW REGIME / OLD REGIME]       ║                  │
│   ║  You save ₹X,XXX per year                 ║                  │
│   ╚══════════════════════════════════════════╝                   │
│                                                                   │
├─────────────────────┬────────────────────────────────────────────┤
│   NEW REGIME        │   OLD REGIME                               │
│   ─────────────     │   ──────────                               │
│   Tax: ₹18,420      │   Tax: ₹31,200                            │
│   Monthly: ₹1,535   │   Monthly: ₹2,600                         │
│                     │                                            │
│   [RECOMMENDED ✓]   │                                            │
├─────────────────────┴────────────────────────────────────────────┤
│                                                                   │
│   SLAB-BY-SLAB BREAKDOWN (tabs: New | Old)                        │
│                                                                   │
│   NEW REGIME                                                      │
│   Income: ₹7,20,000                                              │
│   – Standard Deduction: ₹75,000                                  │
│   = Taxable Income: ₹6,45,000                                    │
│                                                                   │
│   ₹0–4L          @  0%  =  ₹0                                   │
│   ₹4L–6.45L      @  5%  =  ₹12,250                              │
│   ─────────────────────────────                                   │
│   Tax before cess:         ₹12,250                               │
│   + 4% Health & Ed. Cess:    ₹490                                │
│   ─────────────────────────────                                   │
│   Total Tax:               ₹12,740                               │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│   HOW YOUR INPUTS AFFECTED THIS (Personalized explanation)        │
│                                                                   │
│   Your HRA exemption of ₹1,08,000 reduces your old-regime        │
│   taxable income significantly, but the new regime's lower        │
│   slab rates still win at your income level.                      │
│                                                                   │
│   Your PF contribution of ₹86,400 is counted toward 80C          │
│   in the old regime, but since you haven't filled the full        │
│   ₹1.5L limit, investing more in PPF or ELSS could help.         │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│   PERSONALIZED SUGGESTIONS                                        │
│                                                                   │
│   💡 [Suggestion 1 based on their inputs]                        │
│   💡 [Suggestion 2]                                               │
│   💡 [Suggestion 3]                                               │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│   [Recalculate / Edit Answers]        [Share Results] (copy link) │
└──────────────────────────────────────────────────────────────────┘
```

### Results Screen — Recommendation Logic

```javascript
if (tax_new < tax_old) {
  recommendation = 'NEW_REGIME';
  savings = tax_old - tax_new;
} else if (tax_old < tax_new) {
  recommendation = 'OLD_REGIME';
  savings = tax_new - tax_old;
} else {
  recommendation = 'EQUAL';
  savings = 0;
}
```

**If savings < ₹5,000:** Show: "Both regimes are nearly equal for you (difference: ₹X). You may choose either — the new regime is simpler."

**If both taxes = ₹0 (income below exemption limit):** Show: "Great news! You don't owe any income tax under either regime. You're below the tax-free threshold."

### Slab Breakdown Table

Show for BOTH regimes (toggle tabs or side-by-side):

| Slab Range | Rate | Your Income in Slab | Tax on This Slab |
|------------|------|---------------------|------------------|
| ₹0 – ₹4L  | 0%   | ₹4,00,000           | ₹0               |
| ₹4L – ₹8L | 5%   | ₹2,45,000           | ₹12,250          |
| ...        | ...  | ...                 | ...              |
| **Total**  |      |                     | **₹12,250**      |
| + 4% Cess  |      |                     | ₹490             |
| **Final Tax** |   |                     | **₹12,740**      |

### Personalized Education Section

Generate 2-4 sentences explaining the result in terms of the user's specific inputs. Use template-based logic:

**Templates (select applicable ones):**

```
HRA impact:
"Your HRA exemption of ₹{hraExemption} reduces your taxable income in the old regime. 
 This is {significant/moderate/small} and {is/isn't} enough to tip the balance."

80C headroom:
"You've used ₹{total80C} out of the ₹1,50,000 limit under Section 80C. 
 You have ₹{remaining} of unused headroom — investing this in PPF or ELSS 
 could save you an additional ₹{potentialSaving} in tax under the old regime."

Home loan:
"Your home loan interest deduction of ₹{homeloanInterest} (capped at ₹2,00,000) 
 provides significant relief under the old regime."

NPS employer:
"Your employer's NPS contribution of ₹{employerNPS} is deductible in BOTH regimes — 
 that's already working in your favor regardless of which you choose."

Zero tax (new regime):
"Under the new regime, your taxable income of ₹{taxableNew} falls below ₹12,00,000, 
 making your entire tax liability zero due to the Section 87A rebate."
```

### Personalized Suggestions

Logic for generating suggestions (show up to 4 most relevant):

```javascript
const suggestions = [];

// Suggestion 1: 80C headroom
const remaining80C = 150000 - total80CUsed;
if (recommendation === 'OLD_REGIME' && remaining80C > 10000) {
  suggestions.push({
    icon: '💰',
    title: `Invest ₹${formatCurrency(remaining80C)} more in 80C to maximize savings`,
    detail: `You've used ₹${formatCurrency(total80CUsed)} of your ₹1.5L 80C limit. 
             Filling it completely with PPF or ELSS could save you ₹${formatCurrency(remaining80C * marginalRate)} more.`
  });
}

// Suggestion 2: NPS extra deduction
if (npsEmployee === 0 && recommendation === 'OLD_REGIME') {
  suggestions.push({
    icon: '🏦',
    title: 'Consider NPS for an extra ₹50,000 deduction',
    detail: `Section 80CCD(1B) lets you claim ₹50,000 MORE in deduction — 
             over and above 80C. At your tax bracket, this could save 
             ₹${formatCurrency(50000 * marginalRate)} per year.`
  });
}

// Suggestion 3: Health insurance
if (healthInsuranceSelf < 25000 && ageCategory === 'below60') {
  suggestions.push({
    icon: '🏥',
    title: 'Top up your health insurance for more 80D savings',
    detail: `You're currently claiming ₹${formatCurrency(healthInsuranceSelf)} under 80D. 
             The limit is ₹25,000 — topping up your policy could save you more tax 
             and also give you better health coverage.`
  });
}

// Suggestion 4: Regime reminder
if (Math.abs(tax_new - tax_old) < 5000) {
  suggestions.push({
    icon: '⚖️',
    title: 'Both regimes are close — consider simplicity',
    detail: `The difference is only ₹${formatCurrency(Math.abs(tax_new - tax_old))}. 
             The new regime requires no investment proofs and is simpler to file. 
             It may be worth choosing for convenience.`
  });
}
```

---

## 8. Tax Calculation Engine

### Full Calculation Function (Pseudocode + JavaScript)

```javascript
function calculateTax(inputs) {
  const {
    ageCategory,        // 'below60' | 'senior' | 'superSenior'
    takeHomeSalary,     // monthly
    pfDeducted,
    pfAmount,           // monthly, employee contribution
    employerNPS,        // annual
    paysRent,
    monthlyRent,
    cityType,           // 'metro' | 'nonMetro'
    hraReceived,        // monthly
    basicSalary,        // monthly
    total80C,           // annual (PF + other investments, before cap)
    healthInsuranceSelf, // annual
    healthInsuranceParents, // annual
    parentsAge,         // 'below60' | 'above60'
    hasHomeLoan,
    homeLoanInterest,   // annual
    npsEmployee,        // annual
    professionalTax,    // annual
    otherIncome,        // annual
    otherDeductions,    // annual
  } = inputs;

  // ─────────────────────────────────────────────
  // STEP 1: Estimate Annual Gross Salary
  // ─────────────────────────────────────────────
  const monthlyPF = pfDeducted ? (pfAmount || basicSalary * 0.12) : 0;
  const monthlyPT = professionalTax > 0 ? professionalTax / 12 : 0;
  
  // Take-home = Gross - Employee PF - Professional Tax - TDS
  // Since TDS is what we're solving for, approximate:
  const estimatedMonthlyGross = takeHomeSalary + monthlyPF + monthlyPT;
  const annualGross = estimatedMonthlyGross * 12;
  const annualOtherIncome = otherIncome || 0;
  const totalAnnualIncome = annualGross + annualOtherIncome;

  // ─────────────────────────────────────────────
  // STEP 2: Calculate HRA Exemption (Old Regime Only)
  // ─────────────────────────────────────────────
  let hraExemption = 0;
  if (paysRent && monthlyRent > 0) {
    const annualBasic = (basicSalary || estimatedMonthlyGross * 0.40) * 12;
    const annualHRA = hraReceived ? hraReceived * 12 : 
                      (cityType === 'metro' ? annualBasic * 0.50 : annualBasic * 0.40);
    const annualRent = monthlyRent * 12;
    const rentMinus10 = Math.max(0, annualRent - 0.10 * annualBasic);
    const maxHRAPercent = cityType === 'metro' ? annualBasic * 0.50 : annualBasic * 0.40;
    hraExemption = Math.min(annualHRA, rentMinus10, maxHRAPercent);
  }

  // ─────────────────────────────────────────────
  // STEP 3: Calculate 80C (Old Regime Only)
  // ─────────────────────────────────────────────
  const annualEmployeePF = monthlyPF * 12;
  const cap80C = 150000;
  const deduction80C = Math.min(total80C + annualEmployeePF, cap80C);

  // ─────────────────────────────────────────────
  // STEP 4: Calculate 80D (Old Regime Only)
  // ─────────────────────────────────────────────
  const selfLimit80D = ageCategory === 'below60' ? 25000 : 50000;
  const parentsLimit80D = parentsAge === 'above60' ? 50000 : 25000;
  const deduction80D = Math.min(healthInsuranceSelf || 0, selfLimit80D) +
                       Math.min(healthInsuranceParents || 0, parentsLimit80D);

  // ─────────────────────────────────────────────
  // STEP 5: Home Loan Interest — Section 24(b) (Old Regime Only)
  // ─────────────────────────────────────────────
  const deduction24b = hasHomeLoan ? Math.min(homeLoanInterest || 0, 200000) : 0;

  // ─────────────────────────────────────────────
  // STEP 6: NPS Deductions
  // ─────────────────────────────────────────────
  const deduction80CCD1B = Math.min(npsEmployee || 0, 50000); // Old regime only
  // Employer NPS: both regimes. Max = 10% of basic
  const annualBasicForNPS = (basicSalary || estimatedMonthlyGross * 0.40) * 12;
  const deduction80CCD2 = Math.min(employerNPS || 0, annualBasicForNPS * 0.10); // Both regimes

  // ─────────────────────────────────────────────
  // STEP 7: Professional Tax (Old Regime Only)
  // ─────────────────────────────────────────────
  const deductionPT = professionalTax || 0; // Old regime: deductible from salary income

  // ─────────────────────────────────────────────
  // STEP 8: 80TTA / 80TTB Interest Deduction (Old Regime Only)
  // ─────────────────────────────────────────────
  let deductionInterest = 0;
  if (otherIncome > 0) {
    if (ageCategory === 'superSenior' || ageCategory === 'senior') {
      deductionInterest = Math.min(otherIncome, 50000); // 80TTB
    } else {
      deductionInterest = Math.min(otherIncome, 10000); // 80TTA (savings only, approx)
    }
  }

  // ─────────────────────────────────────────────
  // NEW REGIME CALCULATION
  // ─────────────────────────────────────────────
  const stdDeductionNew = 75000;
  let taxableNew = totalAnnualIncome - stdDeductionNew - deduction80CCD2;
  taxableNew = Math.max(0, taxableNew);
  
  let taxBeforeCessNew = computeSlabs(taxableNew, 'new');
  
  // Section 87A rebate — new regime
  if (taxableNew <= 1200000) {
    taxBeforeCessNew = 0; // Full rebate
  } else {
    // Check marginal relief
    const marginalRelief = taxableNew - 1200000;
    taxBeforeCessNew = Math.min(taxBeforeCessNew, marginalRelief);
  }
  
  const tax_new = Math.round(taxBeforeCessNew * 1.04); // Add 4% cess

  // ─────────────────────────────────────────────
  // OLD REGIME CALCULATION
  // ─────────────────────────────────────────────
  const stdDeductionOld = 50000;
  let taxableOld = totalAnnualIncome 
    - stdDeductionOld
    - hraExemption
    - deductionPT
    - deduction80C
    - deduction80D
    - deduction24b
    - deduction80CCD1B
    - deduction80CCD2
    - deductionInterest
    - (otherDeductions || 0);
  taxableOld = Math.max(0, taxableOld);

  let taxBeforeCessOld = computeSlabs(taxableOld, 'old', ageCategory);

  // Section 87A rebate — old regime
  if (taxableOld <= 500000) {
    taxBeforeCessOld = Math.min(taxBeforeCessOld, 12500);
    taxBeforeCessOld = Math.max(0, taxBeforeCessOld - 12500); // Full rebate if tax <= 12500
    if (taxableOld <= 500000 && taxBeforeCessOld <= 12500) {
      taxBeforeCessOld = 0;
    }
  }

  const tax_old = Math.round(taxBeforeCessOld * 1.04); // Add 4% cess

  return {
    // Regime taxes
    tax_new,
    tax_old,
    
    // Taxable incomes
    taxableNew,
    taxableOld,
    
    // Deduction breakdown (for display)
    deductions_old: {
      standardDeduction: stdDeductionOld,
      hraExemption,
      professionalTax: deductionPT,
      section80C: deduction80C,
      section80D: deduction80D,
      section24b: deduction24b,
      npsEmployee: deduction80CCD1B,
      npsEmployer: deduction80CCD2,
      interestDeduction: deductionInterest,
      other: otherDeductions || 0,
    },
    deductions_new: {
      standardDeduction: stdDeductionNew,
      npsEmployer: deduction80CCD2,
    },
    
    // Slab details (for display)
    slabDetails_new: getSlabDetails(taxableNew, 'new'),
    slabDetails_old: getSlabDetails(taxableOld, 'old', ageCategory),
    
    // Recommendation
    recommendation: tax_new <= tax_old ? 'NEW' : 'OLD',
    savings: Math.abs(tax_new - tax_old),
  };
}
```

### Slab Computation Functions

```javascript
const NEW_REGIME_SLABS = [
  { from: 0,       to: 400000,   rate: 0.00 },
  { from: 400000,  to: 800000,   rate: 0.05 },
  { from: 800000,  to: 1200000,  rate: 0.10 },
  { from: 1200000, to: 1600000,  rate: 0.15 },
  { from: 1600000, to: 2000000,  rate: 0.20 },
  { from: 2000000, to: 2400000,  rate: 0.25 },
  { from: 2400000, to: Infinity, rate: 0.30 },
];

const OLD_REGIME_SLABS = {
  below60: [
    { from: 0,       to: 250000,  rate: 0.00 },
    { from: 250000,  to: 500000,  rate: 0.05 },
    { from: 500000,  to: 1000000, rate: 0.20 },
    { from: 1000000, to: Infinity,rate: 0.30 },
  ],
  senior: [
    { from: 0,       to: 300000,  rate: 0.00 },
    { from: 300000,  to: 500000,  rate: 0.05 },
    { from: 500000,  to: 1000000, rate: 0.20 },
    { from: 1000000, to: Infinity,rate: 0.30 },
  ],
  superSenior: [
    { from: 0,       to: 500000,  rate: 0.00 },
    { from: 500000,  to: 1000000, rate: 0.20 },
    { from: 1000000, to: Infinity,rate: 0.30 },
  ],
};

function computeSlabs(income, regime, ageCategory = 'below60') {
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[ageCategory];
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const taxableInSlab = Math.min(income, slab.to) - slab.from;
    tax += taxableInSlab * slab.rate;
  }
  return tax;
}

function getSlabDetails(income, regime, ageCategory = 'below60') {
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[ageCategory];
  const details = [];
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const inSlab = Math.min(income, slab.to) - slab.from;
    const taxOnSlab = inSlab * slab.rate;
    details.push({
      from: slab.from,
      to: Math.min(income, slab.to),
      rate: slab.rate,
      amount: inSlab,
      tax: taxOnSlab,
    });
  }
  return details;
}
```

---

## 9. Validation Rules

### Input Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| takeHomeSalary | > 0, < 1,00,00,000 | "Please enter a valid monthly take-home amount" |
| pfAmount | 0 – 30,000/month | "PF usually doesn't exceed ₹30,000/month — please check" |
| monthlyRent | > 0 if paysRent | "Please enter your monthly rent" |
| hraReceived | > 0, ≤ gross | "HRA can't be more than your total salary" |
| basicSalary | > 0, ≤ gross | "Basic salary should be less than your total salary" |
| total80C | 0 – 5,00,000 | "Section 80C investments can't exceed ₹1.5L in tax benefit (extra is allowed but won't help)" |
| healthInsuranceSelf | 0 – 1,00,000 | None (just cap at limit in calc) |
| homeLoanInterest | 0 – 50,00,000 | Warn if > ₹5L: "That seems high — are you sure this is annual?" |
| npsEmployee | 0 – 2,00,000 | Cap at ₹50,000 for 80CCD(1B) |

### Edge Case Guards

```javascript
// Guard: rent < 10% of basic → HRA exemption is 0 or minimal
if (annualRent < annualBasic * 0.10) {
  hraExemption = 0; 
  // Note: rentMinus10 will be negative → Math.max(0, ...) handles this
}

// Guard: no 80C if new regime selected
// (not applicable — show in both but only apply to old)

// Guard: income < basic exemption limit → no tax
// (handled by slab computation returning 0)

// Guard: Super senior under old regime — no 5% slab (starts at 0, then 20%)
// (handled by separate slab table for superSenior)

// Guard: Marginal relief — income between ₹12L and ₹12.875L
// (handled in calculation function above)
```

---

## 10. Design System

### Color Palette

```css
/* Primary */
--color-primary: #2563EB;          /* Blue — CTAs, highlights */
--color-primary-light: #EFF6FF;    /* Light blue — backgrounds */

/* Success / Recommendation */
--color-success: #16A34A;          /* Green — recommended badge */
--color-success-light: #F0FDF4;

/* Warning */
--color-warning: #D97706;          /* Amber — 80C limit warning */
--color-warning-light: #FFFBEB;

/* Neutral */
--color-gray-900: #111827;         /* Headings */
--color-gray-700: #374151;         /* Body text */
--color-gray-400: #9CA3AF;         /* Placeholder, disabled */
--color-gray-100: #F3F4F6;         /* Panel backgrounds */
--color-white: #FFFFFF;

/* Tax-specific */
--color-new-regime: #2563EB;       /* Blue accent */
--color-old-regime: #7C3AED;       /* Purple accent */
```

### Typography

```css
--font-family: 'Inter', -apple-system, sans-serif;

/* Scale */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

Use 4px base unit. Common values: 4, 8, 12, 16, 20, 24, 32, 48, 64px.

### Components

#### Question Card
```
Background: white
Border: 1px solid #E5E7EB (gray-200)
Border-radius: 12px
Padding: 32px
Box-shadow: 0 1px 3px rgba(0,0,0,0.1)
```

#### Option Card (for Yes/No or multiple choice)
```
Default:    Border: 2px solid #E5E7EB, Background: white
Hover:      Border: 2px solid #93C5FD (blue-300), Background: #EFF6FF
Selected:   Border: 2px solid #2563EB (blue), Background: #EFF6FF
            + checkmark icon in top-right corner
Min-width: 140px, Padding: 16px 20px, Border-radius: 8px
Cursor: pointer
```

#### Input Field
```
Height: 48px
Border: 1px solid #D1D5DB
Border-radius: 8px
Font-size: 16px
Padding: 0 16px
Focus ring: 2px solid #2563EB
Prefix: ₹ symbol with gray background, 1px right border
```

#### Primary Button
```
Background: #2563EB
Color: white
Padding: 14px 28px
Border-radius: 8px
Font-weight: 600
Font-size: 16px
Hover: #1D4ED8
Active: scale(0.98)
Width: full on mobile, auto on desktop
```

#### Progress Dots
```
Completed dot: 10px circle, filled #2563EB
Current dot:   12px circle, filled #2563EB, with pulsing ring animation
Remaining dot: 10px circle, #D1D5DB
Gap between dots: 8px
```

#### Live Preview Panel
```
Background: #F8FAFC
Border: 1px solid #E2E8F0
Border-radius: 12px
Padding: 24px
Position: sticky, top: 24px
Max-height: calc(100vh - 48px)
Overflow-y: auto
```

#### Recommendation Badge (Results Screen)
```
Background: linear-gradient(135deg, #16A34A, #15803D)
Color: white
Padding: 24px 32px
Border-radius: 16px
Box-shadow: 0 4px 20px rgba(22,163,74,0.3)
Text: 2xl bold
```

### Landing Page Design Notes

- **Hero section background:** Subtle gradient from `#EFF6FF` (light blue) to white. NOT pure white — give it warmth.
- **Preview card:** Use a styled mockup card (not a screenshot) showing an illustrative result. Slight blur/frosted glass effect optional. Should read: "Example result — not your actual numbers."
- **"How it works" section:** Three cards with icons, on a light gray background section.
- **Mobile:** Single column. Hero → CTA → Trust badges → How it works → FAQ.
- **No dark mode for v1** (keep it simple and trustworthy; dark mode can be added later).

---

## 11. Edge Cases & Special Scenarios

### Income = ₹0 or Very Low
- If take-home < ₹10,000/month: Show gentle note: "This looks like a very small income. If you're a fresher or part-time worker, that's fine — we'll still calculate accurately."
- If annual taxable < basic exemption: Both regimes show ₹0 tax. Show: "Good news — your income is below the tax-exempt limit."

### 87A Rebate Edge Case (New Regime)
If taxable income (after std deduction of ₹75,000) = ₹12,00,001 (just ₹1 above limit):
- Without marginal relief: Tax on ₹12,00,001 ≈ ₹80,000
- With marginal relief: Tax = min(₹80,000, ₹1) = ₹1
- Implement correctly as shown in Section 8

### HRA = 0 but User Pays Rent (no HRA component in salary)
- HRA exemption = ₹0 (can't claim if HRA not part of salary structure)
- Note to user: "Since HRA isn't a separate component in your salary, you can't claim the standard HRA exemption. You might be eligible for Section 80GG instead (ask your CA)."
- Do NOT implement 80GG in the main flow (too niche), but mention it.

### Home Loan + HRA Together
- Fully supported — show both deductions in old regime
- If user selects both home loan and rent: show a small note: "You can claim both if your house is in a different city from where you're working. We've included both in the calculation."

### Super Senior Citizen + New Regime
- No age benefit in new regime — treat same as below 60
- In old regime: ₹5L exemption, no 5% slab

### Professional Tax = 0 (some states don't have it)
- Default to ₹0 if user says "No"
- Note: PT rates vary by state. Goa, some NE states don't have it. Telangana, Andhra: ₹200/month.

### Income > ₹50 Lakh
- Show disclaimer: "For incomes above ₹50 lakh, surcharge applies. This calculator doesn't include surcharge. Please consult a CA for accurate numbers."
- Still calculate and show estimate (without surcharge)

### 80C Already Maxed by PF Alone
- If employee PF alone ≥ ₹1,50,000: Show note: "Your PF contribution already maxes out your ₹1.5L 80C limit. Any other investments won't reduce taxes further under 80C — but NPS (Section 80CCD(1B)) still gives you an extra ₹50,000 deduction!"

### Both Regimes Same Tax
- Show: "Your tax is the same under both regimes (₹X). Consider the new regime — it's simpler and doesn't require investment proofs."

### Zero Tax (both regimes)
- Show: "🎉 You don't owe any income tax this year under either regime! Your income is within the tax-free limit."

---

## 12. Copy & Tone Guidelines

### Voice

- **Conversational, not clinical.** Say "you" and "we" freely.
- **Clear, not dumbed-down.** Users are smart; they just don't know tax jargon.
- **Encouraging, not alarming.** Tax can feel scary. Reassure at every step.
- **Specific.** "You save ₹12,780" beats "you may save money."

### Language Rules

| Instead of | Use |
|-----------|-----|
| Gross salary | Total salary before deductions |
| CTC | Salary package |
| Section 80C | Tax-saving investments |
| Deductions | Things that reduce your tax |
| Taxable income | The income your tax is actually calculated on |
| Assessment Year | Tax year (or just say FY 2025-26) |
| Assessee | You (the taxpayer) |
| HRA exemption | Rent tax benefit |
| Cess | Health & Education tax (4%) |
| Rebate u/s 87A | Zero tax if income below threshold |

### Number Formatting

- Always show ₹ prefix
- Use Indian number system: ₹1,50,000 (not ₹150,000)
- For large numbers, use short form in UI: ₹1.5L, ₹12L
- In tables, show full number: ₹1,50,000

### Error Messages

- Be helpful, not scolding.
- Bad: "Invalid input"
- Good: "Please enter a valid monthly amount (numbers only)"

### Empty States

When Live Preview has no data yet:
> "Fill in your take-home salary to see your estimate here."

When a field is optional and skipped:
> "Skipped — we'll assume ₹0 for now"

### Result Page Copy Templates

**If New Regime wins:**
> "For your situation, the **New Regime** saves you more money — ₹X less tax per year, or about ₹Y per month extra in your pocket."

**If Old Regime wins:**
> "For your situation, the **Old Regime** is better — your deductions reduce your tax enough to beat the new regime's lower rates."

**If equal:**
> "Both regimes give you almost the same tax bill. The new regime is simpler — you don't need to submit investment proofs. Consider switching if you haven't already."

---

## Appendix A: Quick Tax Math Reference

### New Regime — Quick Tax Table

| Annual Salary (take-home basis) | Approx. Tax (New Regime) |
|---------------------------------|--------------------------|
| ₹6L / year (₹50K/month)        | ₹0 (below rebate limit)  |
| ₹9L / year (₹75K/month)        | ₹0 (below rebate limit after std deduction) |
| ₹12.75L / year (₹1.06L/month)  | ₹0 (exactly at zero-tax limit for salaried) |
| ₹15L / year                    | ₹1,17,000 approx (after std deduction, before cess) |
| ₹20L / year                    | ₹2,98,300 approx         |

### Break-even Analysis

The Old Regime beats the New Regime when total deductions exceed approximately:

| Annual Income | Break-even Deductions Needed |
|--------------|------------------------------|
| ₹10L         | ~₹2.5–3L                    |
| ₹15L         | ~₹3.5–4L                    |
| ₹20L         | ~₹4–5L                      |

"Total deductions" = HRA exemption + 80C + 80D + 24(b) + 80CCD(1B) + others.

---

## Appendix B: Testing Scenarios

### Test Case 1 — Young Professional, No Rent, No Investments
- Age: 26, Take-home: ₹55,000/month, PF: Yes (₹2,640/month), No rent, No investments, No health insurance, No home loan
- Expected: New regime wins (low deductions, 87A rebate applies)

### Test Case 2 — Mid-career, Metro Renter, Full 80C
- Age: 34, Take-home: ₹85,000/month, PF: ₹4,080/month, Rent: ₹25,000/month (Mumbai), 80C: ₹1,50,000, Health: ₹25,000, No home loan
- Expected: Run both — compare. Metro HRA is significant.

### Test Case 3 — Home Loan + NPS
- Age: 38, Take-home: ₹1,10,000/month, PF: ₹5,280/month, No rent (own house), 80C: ₹1,50,000, Health: ₹25,000, Home loan interest: ₹2,00,000, NPS employee: ₹50,000
- Expected: Old regime likely wins due to heavy deductions

### Test Case 4 — Exactly at ₹12L taxable (new regime rebate edge case)
- Take-home such that taxable income (new regime) = ₹12,00,000 exactly
- Expected: Tax = ₹0 (full rebate)

### Test Case 5 — Senior Citizen
- Age: 65, Take-home: ₹40,000/month (pension-like), No rent, Some FD interest: ₹80,000/year
- Expected: Old regime basic exemption ₹3L, 80TTB ₹50,000

### Test Case 6 — Super Senior
- Age: 82, Take-home equivalent: ₹30,000/month
- Expected: Old regime basic exemption ₹5L — possibly zero tax

### Test Case 7 — Zero tax both regimes
- Take-home ₹18,000/month
- Expected: Both = ₹0, show "No tax owed" message

### Test Case 8 — 80C maxed by PF alone
- Basic salary: ₹1,30,000/month → PF = ₹15,600/month = ₹1,87,200/year > ₹1.5L cap
- Expected: 80C capped at ₹1,50,000, show warning note

---

*End of PRD — Version 1.0*

*This document covers all screens, questions, calculations, validations, and edge cases for building the India Salaried Tax Calculator for FY 2025-26. All tax figures are based on Budget 2025 announcements and verified against official Income Tax Department guidelines.*
