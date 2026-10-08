/**
 * Executive Financial Export Utility for Lincoz Platform
 * Generates RFC-4180 compliant CSV exports with UTF-8 BOM for Microsoft Excel / Sheets compatibility.
 */

export const downloadCompanyMonthlyFinancesCSV = ({
  financials = {},
  selectedMonth = '2026-10',
  currentMonthName = 'October 2026',
  salariedPayrollRecords = [],
  percentageRecords = [],
  currentUser = null
}) => {
  const sanitize = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = [];

  // 1. Corporate Statement Identification Header
  rows.push(['LINCOZ TECHNOLOGIES INC. - EXECUTIVE MONTHLY FINANCIAL STATEMENT']);
  rows.push(['Reporting Period', currentMonthName]);
  rows.push(['Selected Month Key', selectedMonth || 'ALL']);
  rows.push(['Export Timestamp', new Date().toLocaleString()]);
  rows.push(['Authorized Super Admin', currentUser?.name || 'Super Admin', currentUser?.email || 'admin@lincoz.io', 'Role: Super Admin']);
  rows.push(['Corporate Audit Ref', `LCZ-FIN-${(selectedMonth || 'ALL').replace(/-/g, '')}-${Date.now().toString().slice(-6)}`]);
  rows.push([]);

  // 2. Executive Key Financial Metrics (Overall Company Financials)
  const totalIncome = financials.totalIncome || financials.totalCollected || 0;
  const monthlyInvoiced = financials.monthlyInvoiced || financials.grossInvoiced || 0;
  const monthlyExpense = financials.monthlyExpense || financials.directExpenses || 0;
  const fixedPayroll = financials.fixedPayroll || financials.totalMonthlySalaries || 0;
  const variablePayroll = financials.variablePayroll || financials.totalPercentagePayouts || 0;
  const sourceCommissions = financials.totalSourcePayouts || 0;
  const totalPayroll = financials.payroll || financials.totalPayroll || (fixedPayroll + variablePayroll);
  const netCashFlow = financials.netCashFlow !== undefined ? financials.netCashFlow : (financials.netMonthlyCashflow || 0);
  const totalMonthlyProfit = financials.totalMonthlyProfit || 0;
  const profitMarginPercent = financials.totalProfitMarginPercent || 0;

  rows.push(['=== 1. EXECUTIVE COMPANY OVERALL FINANCIALS SUMMARY ===']);
  rows.push(['Financial Metric', 'Accounting Nature', 'Amount (USD)', 'Notes & Cashflow Description']);
  rows.push([
    'Total Income (Cleared Pay-In)',
    'Inward Liquid Cash Collections',
    totalIncome,
    `Liquid client settlements cleared into company accounts during ${currentMonthName}`
  ]);
  rows.push([
    'Monthly Invoiced',
    'Accrued Revenue Billings',
    monthlyInvoiced,
    `Gross contractual milestone billing issued (Accounts Receivable: $${Number(financials.accountsReceivable || 0).toLocaleString()})`
  ]);
  rows.push([
    'Monthly Direct Expenses',
    'Operational Overhead Outflow',
    -monthlyExpense,
    'Cloud hosting, SaaS subscriptions, software tools, security audits, and vendor overhead'
  ]);
  rows.push([
    'Fixed Salaried Payroll',
    'Fixed Staff Compensation',
    -fixedPayroll,
    'Base salaries for core team members, engineers, PMs, and executive leadership'
  ]);
  rows.push([
    'Variable Staff Profit Shares',
    'Milestone Profit-Shares',
    -variablePayroll,
    'Performance and milestone profit-sharing allocated to contractors and engineering partners'
  ]);
  rows.push([
    'Source & Referral Commissions',
    'Partner Origination Commissions',
    -sourceCommissions,
    'Deal-sourcing commissions disbursed to verified referral partners'
  ]);
  rows.push([
    'Total Monthly Payroll',
    'Consolidated Workforce Compensation',
    -totalPayroll,
    'Combined Fixed Salaried Payroll and Variable Staff Profit Shares'
  ]);
  rows.push([
    'Monthly Net Cash Flow',
    'Net Liquid Treasury Movement',
    netCashFlow,
    'Total Income (Cleared Inflows) minus Direct Expenses, Total Payroll, and Source Commissions'
  ]);
  rows.push([
    'Total Profit of Month',
    'Net Operating Profitability',
    totalMonthlyProfit,
    `Gross Invoiced Revenue minus Direct Expenses, Total Payroll, and Partner Fees (${profitMarginPercent}% Operating Margin)`
  ]);
  rows.push([
    'Operating Profit Margin (%)',
    'Profitability Ratio',
    `${profitMarginPercent}%`,
    'Net Operating Profit divided by Gross Invoiced Revenue'
  ]);
  rows.push([]);

  // 3. Detailed Client Invoices
  rows.push(['=== 2. CLIENT MILESTONE INVOICES BILLED ===']);
  rows.push(['Invoice Number', 'Issue Date', 'Due Date', 'Client Organization', 'Project Name', 'Amount (USD)', 'Status', 'Notes']);
  const invList = financials.invoices || [];
  if (invList.length === 0) {
    rows.push(['No milestone invoices recorded for this period', '', '', '', '', 0, '', '']);
  } else {
    invList.forEach(inv => {
      rows.push([
        inv.invoiceNumber || inv.id || 'INV-UNSPECIFIED',
        inv.issueDate || inv.date || '',
        inv.dueDate || '',
        inv.clientName || 'Client Organization',
        inv.projectName || 'Project Delivery',
        inv.amount || 0,
        inv.status || 'PENDING',
        inv.notes || ''
      ]);
    });
  }
  rows.push([]);

  // 4. Detailed Client Pay-In Payments
  rows.push(['=== 3. CLIENT PAY-IN PAYMENTS (CLEARED INFLOWS) ===']);
  rows.push(['Payment Reference', 'Payment Date', 'Remitting Client', 'Project Name', 'Settlement Channel', 'Amount (USD)', 'Status']);
  const payList = financials.payments || [];
  if (payList.length === 0) {
    rows.push(['No cleared client pay-in payments recorded for this period', '', '', '', '', 0, '']);
  } else {
    payList.forEach(p => {
      rows.push([
        p.referenceNumber || p.id || 'TX-PAYIN-CLEARED',
        p.paymentDate || p.date || '',
        p.clientName || 'Client Organization',
        p.projectName || 'Project Delivery',
        p.paymentMethod || 'Bank Wire Transfer',
        p.amount || 0,
        'CLEARED & SETTLED'
      ]);
    });
  }
  rows.push([]);

  // 5. Detailed Direct Operational Expenses
  rows.push(['=== 4. DIRECT OPERATIONAL OVERHEAD EXPENSES ===']);
  rows.push(['Expense Reference', 'Expense Date', 'Expense Category', 'Vendor / Description', 'Payment Channel', 'Amount (USD)', 'Status']);
  const expList = financials.directExpensesList || [];
  if (expList.length === 0) {
    rows.push(['No direct operational expenses logged for this period', '', '', '', '', 0, '']);
  } else {
    expList.forEach(e => {
      rows.push([
        e.receiptRef || e.id || 'EXP-REF',
        e.expenseDate || e.date || '',
        e.category || 'Direct Overhead',
        e.title || e.vendor || e.description || 'Operational Expense',
        e.paymentMethod || 'Corporate Card / Wire',
        e.amount || 0,
        e.status || 'LOGGED'
      ]);
    });
  }
  rows.push([]);

  // 6. Fixed Salaried Workforce Payroll
  rows.push(['=== 5. FIXED SALARIED WORKFORCE PAYROLL ===']);
  rows.push(['Staff ID', 'Employee Name', 'Role Title', 'Department', 'Work Location', 'Annual Salary (USD)', 'Monthly Due (USD)', 'Paid Amount (USD)', 'Remaining Amount (USD)', 'Payment Status', 'Disbursement Channel']);
  if (salariedPayrollRecords.length === 0) {
    rows.push(['No salaried staff recorded', '', '', '', '', 0, 0, 0, 0, '', '']);
  } else {
    salariedPayrollRecords.forEach(s => {
      rows.push([
        s.employeeId || s.id,
        s.employeeName,
        s.title || s.role,
        s.department || 'Operations',
        s.workMode || 'ONSITE',
        s.annualSalary || 0,
        s.totalDue !== undefined ? s.totalDue : (s.monthlyAmount || 0),
        s.paidAmount !== undefined ? s.paidAmount : (s.status === 'PAID' ? s.monthlyAmount : 0),
        s.remainingAmount !== undefined ? s.remainingAmount : 0,
        s.paymentStatus || s.status || 'UNPAID',
        s.disbursementRef || s.disbursementChannel || 'ACH Direct Deposit'
      ]);
    });
  }
  rows.push([]);

  // 7. Variable Contractor & Milestone Profit Shares
  rows.push(['=== 6. VARIABLE STAFF & CONTRACTOR PROFIT SHARES ===']);
  rows.push(['Disbursement Ref', 'Staff Name', 'Project Name', 'Deliverable Scope', 'Contract Share %', 'Total Share Due (USD)', 'Paid Amount (USD)', 'Remaining Amount (USD)', 'Payment Status', 'Channel']);
  if (percentageRecords.length === 0) {
    rows.push(['No contractor profit shares logged for this period', '', '', '', '', 0, 0, 0, '', '']);
  } else {
    percentageRecords.forEach(p => {
      rows.push([
        p.disbursementRef || p.id,
        p.employeeName,
        p.projectName,
        p.deliverableTitle || '',
        `${p.agreementPercentage || 0}%`,
        p.totalDue !== undefined ? p.totalDue : (p.monthlyAmount || 0),
        p.paidAmount !== undefined ? p.paidAmount : 0,
        p.remainingAmount !== undefined ? p.remainingAmount : 0,
        p.paymentStatus || p.status || 'UNPAID',
        p.disbursementChannel || 'Wise Wire'
      ]);
    });
  }
  rows.push([]);

  // 8. Source & Referral Commissions
  rows.push(['=== 7. SOURCE & REFERRAL PARTNER COMMISSIONS ===']);
  rows.push(['Commission Ref', 'Payout Date', 'Referral Partner / Source', 'Associated Project', 'Payment Method', 'Amount (USD)', 'Status']);
  const srcList = financials.sourcePayouts || [];
  if (srcList.length === 0) {
    rows.push(['No partner referral commissions recorded for this period', '', '', '', '', 0, '']);
  } else {
    srcList.forEach(s => {
      rows.push([
        s.referenceNumber || s.id || 'SRC-COMMISSION-TX',
        s.payoutDate || s.date || '',
        s.sourceName || 'Partner',
        s.projectName || 'Project Delivery',
        s.paymentMethod || 'Direct Wire Transfer',
        s.amount || 0,
        s.status || 'DISBURSED'
      ]);
    });
  }

  // Prepend UTF-8 BOM so Excel opens with proper character rendering
  const csvContent = '\uFEFF' + rows
    .map(r => r.map(sanitize).join(','))
    .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const cleanMonth = (selectedMonth || 'ALL').replace(/-/g, '_');
  const filename = `Lincoz_Company_Finances_${cleanMonth}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { success: true, filename };
};
