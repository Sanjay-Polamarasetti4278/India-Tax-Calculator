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
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[ageCategory || 'below60'];
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const taxableInSlab = Math.min(income, slab.to) - slab.from;
    tax += taxableInSlab * slab.rate;
  }
  return tax;
}

export function getSlabDetails(income, regime, ageCategory = 'below60') {
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[ageCategory || 'below60'];
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

export function calculateTax(inputs) {
  const {
    ageCategory = 'below60',
    takeHomeSalary = 0,
    pfDeducted = false,
    pfAmount = 0,
    employerNPS = 0,
    paysRent = false,
    monthlyRent = 0,
    cityType = 'nonMetro',
    hraReceived = 0,
    basicSalary = 0,
    otherInvestments80C = 0,
    healthInsuranceSelf = 0,
    healthInsuranceParents = 0,
    parentsAge = 'below60',
    hasHomeLoan = false,
    homeLoanInterest = 0,
    npsEmployee = 0,
    professionalTax = 0,
    otherIncome = 0,
    otherDeductions = 0,
  } = inputs;

  if (!takeHomeSalary) {
    return null;
  }

  // ─────────────────────────────────────────────
  // STEP 1: Estimate Annual Gross Salary
  // ─────────────────────────────────────────────
  // If basicSalary isn't explicitly provided, estimate it
  const estBasicSalary = basicSalary || (takeHomeSalary * 1.25 * 0.40);
  const monthlyPF = pfDeducted ? (pfAmount || estBasicSalary * 0.12) : 0;
  const monthlyPT = professionalTax > 0 ? professionalTax / 12 : 0;
  
  // Take-home = Gross - Employee PF - Professional Tax - TDS
  // Since TDS is what we're solving for, approximate initially:
  const estimatedMonthlyGross = takeHomeSalary + monthlyPF + monthlyPT;
  const annualGross = estimatedMonthlyGross * 12;
  const annualOtherIncome = otherIncome || 0;
  const totalAnnualIncome = annualGross + annualOtherIncome;

  // ─────────────────────────────────────────────
  // STEP 2: Calculate HRA Exemption (Old Regime Only)
  // ─────────────────────────────────────────────
  let hraExemption = 0;
  if (paysRent && monthlyRent > 0) {
    const annualBasic = estBasicSalary * 12;
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
  const total80C = otherInvestments80C || 0;
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
  const annualBasicForNPS = estBasicSalary * 12;
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
  let newRegimeBaseTax = taxBeforeCessNew;
  let newRegimeRebate = 0;
  let newRegimeMarginalRelief = 0;
  
  // Section 87A rebate — new regime
  if (taxableNew <= 1200000) {
    newRegimeRebate = taxBeforeCessNew;
    taxBeforeCessNew = 0; // Full rebate
  } else {
    // Check marginal relief
    const marginalRelief = taxableNew - 1200000;
    if (taxBeforeCessNew > marginalRelief) {
      newRegimeMarginalRelief = taxBeforeCessNew - marginalRelief;
      taxBeforeCessNew = marginalRelief;
    }
  }
  
  const tax_new = Math.round(taxBeforeCessNew * 1.04); // Add 4% cess
  const newRegimeCess = tax_new - Math.round(taxBeforeCessNew);

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
  let oldRegimeBaseTax = taxBeforeCessOld;
  let oldRegimeRebate = 0;
  let oldRegimeMarginalRelief = 0;

  // Section 87A rebate — old regime
  if (taxableOld <= 500000) {
    oldRegimeRebate = Math.min(taxBeforeCessOld, 12500);
    taxBeforeCessOld = Math.max(0, taxBeforeCessOld - 12500); // Full rebate if tax <= 12500
  }

  const tax_old = Math.round(taxBeforeCessOld * 1.04); // Add 4% cess
  const oldRegimeCess = tax_old - Math.round(taxBeforeCessOld);

  return {
    annualGross,
    // Legacy support for LivePreviewPanel
    tax_new,
    tax_old,
    recommendation: tax_new <= tax_old ? 'NEW_REGIME' : 'OLD_REGIME',
    savings: Math.abs(tax_new - tax_old),

    // Detailed New Regime
    newRegimeTax: tax_new,
    newRegimeTaxable: taxableNew,
    newRegimeBaseTax: newRegimeBaseTax,
    newRegimeRebate: newRegimeRebate,
    newRegimeMarginalRelief: newRegimeMarginalRelief,
    newRegimeCess: newRegimeCess,
    newRegimeDeductions: {
      standard: stdDeductionNew,
      employerNPS: deduction80CCD2
    },

    // Detailed Old Regime
    oldRegimeTax: tax_old,
    oldRegimeTaxable: taxableOld,
    oldRegimeBaseTax: oldRegimeBaseTax,
    oldRegimeRebate: oldRegimeRebate,
    oldRegimeMarginalRelief: oldRegimeMarginalRelief,
    oldRegimeCess: oldRegimeCess,
    oldRegimeDeductions: {
      standard: stdDeductionOld,
      hra: hraExemption,
      sec80c: deduction80C,
      sec80d: deduction80D,
      sec24b: deduction24b,
      nps80ccd1b: deduction80CCD1B,
      employerNPS: deduction80CCD2,
      other: deductionPT + deductionInterest + (otherDeductions || 0)
    }
  };
}
