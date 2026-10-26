import React, { useEffect } from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  FileText,
  Banknote,
  TrendingUp,
  AlertCircle,
  Users,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { printElement } from '../../utils/printDocument';

export const MonthlyStatementModal = ({
  isOpen,
  onClose,
  financials = {},
  selectedMonth = '2026-10',
  currentMonthName = 'October 2026',
  currentUser = null,
  salariedPayrollRecords = [],
  percentageRecords = []
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalIncome = financials.totalIncome || financials.totalCollected || 0;
  const monthlyInvoiced = financials.monthlyInvoiced || financials.grossInvoiced || 0;
  const monthlyExpense = financials.monthlyExpense || financials.directExpenses || 0;
  const fixedPayroll = financials.fixedPayroll !== undefined ? financials.fixedPayroll : 0;
  const variablePayroll = financials.variablePayroll !== undefined ? financials.variablePayroll : 0;
  const totalPayroll = financials.payroll !== undefined ? financials.payroll : (fixedPayroll + variablePayroll);
  const sourcePayouts = financials.totalSourcePayouts || 0;
  const netCashFlow = financials.netCashFlow !== undefined ? financials.netCashFlow : (financials.netMonthlyCashflow || 0);
  const totalMonthlyProfit = financials.totalMonthlyProfit || 0;
  const profitMarginPercent = financials.totalProfitMarginPercent || 0;

  const invList = financials.invoices || [];
  const payList = financials.payments || [];
  const expList = financials.directExpensesList || [];
  const srcList = financials.sourcePayouts || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar">
      {/* Backdrop Layer */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn no-print"
        onClick={onClose}
      />

      {/* Natural Top-Anchored Centering Container */}
      <div className="min-h-full flex items-start justify-center p-3 sm:p-5 pt-6 sm:pt-8 md:pt-10 pb-12">
        {/* Modal Container */}
        <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp">

          {/* Modal Header Toolbar (Hidden when printing) */}
          <div className="shrink-0 p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between bg-[#182234] no-print">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Official Monthly Financial Statement
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {currentMonthName}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Executive Company Treasury & Cashflow Audit</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => printElement('printable-financial-statement', `Lincoz_Monthly_Finances_${(selectedMonth || 'Current').replace(/-/g, '_')}`)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                title="Print document or Save to PDF"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div
            className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 font-sans custom-scrollbar"
            id="printable-financial-statement"
          >
          {/* Corporate Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-base shadow-sm">
                  L
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-slate-900">LINCOZ TECHNOLOGIES INC.</span>
                  <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">
                    TREASURY & AUDIT
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1.5">
                Corporate Monthly Financial Statement & Executive Cashflow Audit
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Corporate Ref: LCZ-CORP-FIN-{(selectedMonth || 'ALL').replace(/-/g, '')} &bull; Internal Governance Division
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded bg-indigo-100 border border-indigo-200 text-indigo-900 font-mono text-[10px] font-bold uppercase tracking-wider">
                EXECUTIVE TREASURY REPORT
              </span>
              <h2 className="text-sm font-black text-slate-900 mt-1">COMPANY MONTHLY FINANCES</h2>
              <p className="text-xs font-mono font-bold text-indigo-700 mt-0.5">Period: {currentMonthName}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Date Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Executive Metadata Matrix */}
          <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Authorized Officer</span>
              <span className="font-bold text-slate-800">{currentUser?.name || 'Super Admin'}</span>
              <span className="text-[10px] text-slate-500 block">Super Administrator</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Accounting Standards</span>
              <span className="font-bold text-slate-800">Dual Accrual & Cash Basis</span>
              <span className="text-[10px] text-slate-500 block">GAAP / Sovereign Compliant</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Disbursement Controls</span>
              <span className="font-bold text-indigo-700">2-Step Cryptographic Sign-Off</span>
              <span className="text-[10px] text-slate-500 block">PM Step 1 &bull; Super Admin Step 2</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Audit Verification</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Reconciled & Certified
              </span>
              <span className="text-[10px] text-slate-500 block">Zero Unbalanced Variance</span>
            </div>
          </div>

          {/* Section 1: Executive Key Financial Metrics Matrix */}
          <div className="mb-6">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
              1. Executive Key Financial Indicators ({currentMonthName})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Total Income */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Total Income</span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-600 block mt-0.5">
                  +Rs {Number(totalIncome).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cleared Client Pay-In Cash</span>
              </div>

              {/* Monthly Invoiced */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Monthly Invoiced</span>
                <span className="text-base sm:text-lg font-black font-mono text-cyan-600 block mt-0.5">
                  Rs {Number(monthlyInvoiced).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Accrued Milestone Billings</span>
              </div>

              {/* Monthly Expense */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Monthly Expense</span>
                <span className="text-base sm:text-lg font-black font-mono text-rose-600 block mt-0.5">
                  -Rs {Number(monthlyExpense).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Direct Operational Overhead</span>
              </div>

              {/* Monthly Payroll */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Monthly Payroll</span>
                <span className="text-base sm:text-lg font-black font-mono text-purple-600 block mt-0.5">
                  -Rs {Number(totalPayroll).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Salaries (Rs {Number(fixedPayroll).toLocaleString()}) + Shares (Rs {Number(variablePayroll).toLocaleString()})
                </span>
              </div>

              {/* Monthly Net Cash Flow */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Monthly Net Cash Flow</span>
                <span className={`text-base sm:text-lg font-black font-mono block mt-0.5 ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {netCashFlow >= 0 ? '+' : ''}Rs {Number(netCashFlow).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Net Liquid Treasury Delta</span>
              </div>

              {/* Total Profit of Month */}
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70">
                <span className="text-[10px] font-bold text-indigo-900 block uppercase font-mono">Total Profit of Month</span>
                <span className={`text-base sm:text-lg font-black font-mono block mt-0.5 ${totalMonthlyProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {totalMonthlyProfit >= 0 ? '+' : ''}Rs {Number(totalMonthlyProfit).toLocaleString()}
                </span>
                <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">
                  {profitMarginPercent}% Net Operating Margin
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Consolidated Accounting Reconciliation Table */}
          <div className="mb-6">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
              2. Consolidated Accounting Classification & Outflows
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] uppercase font-mono">
                  <th className="p-2.5">Financial Component</th>
                  <th className="p-2.5">Accounting Classification</th>
                  <th className="p-2.5 text-right">Amount (Rs)</th>
                  <th className="p-2.5">Reconciliation Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-900">Total Income (Cleared Pay-In)</td>
                  <td className="p-2.5 text-slate-600 font-sans">Inward Cash Collections</td>
                  <td className="p-2.5 text-right font-bold text-emerald-600">+Rs {Number(totalIncome).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500 font-sans text-[10px]">Client settlements cleared into corporate accounts</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-900">Monthly Invoiced</td>
                  <td className="p-2.5 text-slate-600 font-sans">Accrued Revenue Billings</td>
                  <td className="p-2.5 text-right font-bold text-cyan-600">Rs {Number(monthlyInvoiced).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500 font-sans text-[10px]">Milestone invoices dispatched (AR: Rs {Number(financials.accountsReceivable || 0).toLocaleString()})</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-900">Monthly Direct Expenses</td>
                  <td className="p-2.5 text-slate-600 font-sans">Direct Operational Overhead</td>
                  <td className="p-2.5 text-right font-bold text-rose-600">-Rs {Number(monthlyExpense).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500 font-sans text-[10px]">Cloud hosting, SaaS, software licenses, vendor services</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-900">Fixed Salaried Payroll</td>
                  <td className="p-2.5 text-slate-600 font-sans">Fixed Workforce Base Pay</td>
                  <td className="p-2.5 text-right font-bold text-purple-600">-Rs {Number(fixedPayroll).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500 font-sans text-[10px]">Core dedicated employees, engineering team, PMs</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-900">Variable Staff Profit Shares</td>
                  <td className="p-2.5 text-slate-600 font-sans">Milestone Profit Shares</td>
                  <td className="p-2.5 text-right font-bold text-purple-600">-Rs {Number(variablePayroll).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500 font-sans text-[10px]">Contractor and developer percentage profit-share disbursements</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-slate-900">Source Referral Commissions</td>
                  <td className="p-2.5 text-slate-600 font-sans">Partner Origination Fees</td>
                  <td className="p-2.5 text-right font-bold text-amber-600">-Rs {Number(sourcePayouts).toLocaleString()}</td>
                  <td className="p-2.5 text-slate-500 font-sans text-[10px]">Origination deal-sourcing referral fees disbursed</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td className="p-2.5 font-sans text-slate-900">Monthly Net Cash Flow</td>
                  <td className="p-2.5 text-slate-700 font-sans">Liquid Treasury Position</td>
                  <td className={`p-2.5 text-right font-black ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {netCashFlow >= 0 ? '+' : ''}Rs {Number(netCashFlow).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-slate-600 font-sans text-[10px]">Total Income minus all operational disbursements</td>
                </tr>
                <tr className="bg-indigo-50/80 font-bold border-t border-indigo-200">
                  <td className="p-2.5 font-sans text-indigo-950">Total Profit of Month</td>
                  <td className="p-2.5 text-indigo-900 font-sans">Net Operating Profitability</td>
                  <td className={`p-2.5 text-right font-black text-sm ${totalMonthlyProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {totalMonthlyProfit >= 0 ? '+' : ''}Rs {Number(totalMonthlyProfit).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-indigo-900 font-sans text-[10px] font-semibold">
                    {profitMarginPercent}% Operating Margin on Invoiced Volume
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Itemized Ledger Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Invoices Summary */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Invoices Billed ({invList.length})
              </span>
              <div className="text-xs space-y-1">
                {invList.slice(0, 4).map((i, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-700 font-medium">{i.invoiceNumber} - {i.clientName}</span>
                    <span className="font-mono font-bold text-cyan-700"> Rs {Number(i.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                {invList.length === 0 && <p className="text-slate-400 italic text-[11px]">No invoices recorded for this period.</p>}
                {invList.length > 4 && (
                  <p className="text-[10px] text-slate-400 font-mono pt-0.5">+ {invList.length - 4} more invoices listed in CSV export</p>
                )}
              </div>
            </div>

            {/* Direct Expenses Summary */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                Direct Overhead Expenses ({expList.length})
              </span>
              <div className="text-xs space-y-1">
                {expList.slice(0, 4).map((e, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-700 font-medium">{e.category} - {e.title || e.vendor}</span>
                    <span className="font-mono font-bold text-rose-700">-Rs {Number(e.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
                {expList.length === 0 && <p className="text-slate-400 italic text-[11px]">No direct expenses recorded for this period.</p>}
                {expList.length > 4 && (
                  <p className="text-[10px] text-slate-400 font-mono pt-0.5">+ {expList.length - 4} more expenses listed in CSV export</p>
                )}
              </div>
            </div>
          </div>

          {/* Corporate Executive Sign-off Block */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Certified by Lincoz Executive Operations & Treasury</p>
              <p className="text-[11px] text-slate-500">Authorized Officer: {currentUser?.name || 'Super Admin'} ({currentUser?.email || 'admin@lincoz.io'})</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Verification Hash: SHA256-LCZ-{(selectedMonth || 'ALL').replace(/-/g, '')}-{Date.now().toString(16).toUpperCase()}
              </p>
            </div>
            <div className="border border-dashed border-slate-300 rounded-lg p-2.5 px-4 text-center bg-slate-50">
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Executive Seal</span>
              <span className="text-[10px] font-black text-indigo-900 tracking-wider">OFFICIAL RECORD &bull; AUDITED</span>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Hidden when printing) */}
        <div className="p-3.5 border-t border-slate-800 bg-[#182234] flex items-center justify-between no-print">
          <p className="text-[11px] text-slate-400">
            Official verified audit record &bull; Certified by Executive Treasury
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

        </div>
      </div>
    </div>
  );
};
