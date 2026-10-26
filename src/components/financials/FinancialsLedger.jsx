import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, RoleBadge, WorkModeBadge, CompBadge } from '../common/Badge';
import { DisbursementModal } from './DisbursementModal';
import { ProjectInvoiceModal } from './ProjectInvoiceModal';
import {
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Users,
  Building2,
  Briefcase,
  Percent,
  Calendar,
  Wallet,
  Calculator,
  UserCheck,
  FolderKanban,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Plus,
  Printer,
  Clock,
  X
} from 'lucide-react';
import { MonthlyStatementModal } from './MonthlyStatementModal';

export const FinancialsLedger = ({ onNavigateToPayinPayout }) => {
  const {
    getScopedFinancials,
    approvePayoutStep1,
    isSuperAdmin,
    isPM,
    isPartner,
    currentUser,
    projects,
    clients,
    users,
    clientInvoices = [],
    clientPayments = [],
    sourcePayouts = [],
    directExpensesList = [],
    selectedMonth,
    setSelectedMonth,
    availableMonths = []
  } = useApp();

  const financials = getScopedFinancials() || {};

  const [activeTable, setActiveTable] = useState('CLIENTS_SOURCES'); // 'CLIENTS_SOURCES' | 'EMPLOYEES' | 'PROJECT_EXPENSES' | 'COMPANY_WHOLE'
  const [selectedPayoutForSignoff, setSelectedPayoutForSignoff] = useState(null);
  const [selectedProjectForInvoice, setSelectedProjectForInvoice] = useState(null);
  const [employeeSubFilter, setEmployeeSubFilter] = useState('ALL'); // 'ALL' | 'SALARIED' | 'PERCENTAGE'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showMonthlyStatementModal, setShowMonthlyStatementModal] = useState(false);
  const [clientSourceFilter, setClientSourceFilter] = useState('CLIENT'); // 'CLIENT' | 'SOURCE' | 'ALL'

  // Client & Source directory separation
  const clientList = useMemo(() => (clients || []).filter(c => c.category !== 'FREELANCER'), [clients]);

  // Detailed client records with TCV, collections (paid inward), and remaining receivables
  const clientRecords = useMemo(() => {
    return clientList.map((c) => {
      const associatedProjs = (projects || []).filter(p => (c.associatedProjects || []).includes(p.id));
      const totalTcv = associatedProjs.reduce((sum, p) => sum + (p.totalContractValue || 0), 0);
      
      const clientInflows = (clientPayments || []).filter(pay => {
        const nameMatch = pay.clientName && c.name && pay.clientName.trim().toLowerCase() === c.name.trim().toLowerCase();
        const projMatch = (c.associatedProjects || []).includes(pay.projectId);
        return nameMatch || projMatch;
      }).reduce((sum, pay) => sum + (pay.amount || 0), 0);

      const paidAmount = clientInflows;
      const remainingAmount = Math.max(0, totalTcv - paidAmount);
      const paymentStatus = paidAmount >= totalTcv && totalTcv > 0 ? 'PAID' : paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID';

      return {
        ...c,
        associatedProjectsList: associatedProjs,
        totalTcv,
        totalDue: totalTcv,
        paidAmount,
        remainingAmount,
        paymentStatus
      };
    });
  }, [clientList, projects, clientPayments]);

  // Detailed source records with computed commission due, paid to source, and remaining to be paid
  const sourceRecords = useMemo(() => {
    const fromClients = (clients || []).filter(c => c.category === 'FREELANCER');
    const existingNames = new Set(fromClients.map(c => c.name.trim().toLowerCase()));

    // Also include any sources from sourcePayouts that might not be in clients directory
    const extraSources = [];
    (sourcePayouts || []).forEach(sp => {
      if (sp.sourceName && !existingNames.has(sp.sourceName.trim().toLowerCase())) {
        existingNames.add(sp.sourceName.trim().toLowerCase());
        extraSources.push({
          id: sp.sourceId || `src-ent-${sp.id}`,
          category: 'FREELANCER',
          name: sp.sourceName,
          email: `${sp.sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}@partner.network`,
          country: 'United States',
          percentage: 10.0,
          associatedProjects: sp.projectId ? [sp.projectId] : [],
          notes: 'Referral & origination partner'
        });
      }
    });

    const allSources = [...fromClients, ...extraSources];

    return allSources.map((s) => {
      const associatedProjs = (projects || []).filter(p => (s.associatedProjects || []).includes(p.id));
      const totalTcv = associatedProjs.reduce((sum, p) => sum + (p.totalContractValue || 0), 0);
      const commissionRate = s.percentage || 10.0;
      let totalDue = Math.round(totalTcv * (commissionRate / 100));

      // Calculate paid amounts from recorded source payouts
      const paidFromSourcePayouts = (sourcePayouts || []).filter(p => {
        const nameMatch = p.sourceName && s.name && p.sourceName.trim().toLowerCase() === s.name.trim().toLowerCase();
        const idMatch = p.sourceId === s.id;
        return (nameMatch || idMatch) && (p.status === 'DISBURSED' || p.status === 'PAID');
      }).reduce((sum, p) => sum + (p.amount || 0), 0);

      // Match from payout ledger if contractor / freelancer
      const paidFromLedger = (financials.allLedger || financials.ledger || []).filter(l => {
        const nameMatch = (l.contractorName && s.name && l.contractorName.trim().toLowerCase() === s.name.trim().toLowerCase()) ||
                          (l.employeeName && s.name && l.employeeName.trim().toLowerCase() === s.name.trim().toLowerCase());
        const idMatch = l.recipientId === s.id;
        return (nameMatch || idMatch) && (l.status === 'PAID' || l.disbursedAt);
      }).reduce((sum, l) => sum + (l.monthlyAmount || l.amount || 0), 0);

      const paidAmount = paidFromSourcePayouts + paidFromLedger;

      if (totalDue === 0 && paidAmount > 0) {
        totalDue = paidAmount;
      }

      const remainingAmount = Math.max(0, totalDue - paidAmount);

      let paymentStatus = 'UNPAID';
      if (paidAmount >= totalDue && totalDue > 0) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }

      return {
        ...s,
        associatedProjectsList: associatedProjs,
        totalTcv,
        commissionRate,
        totalDue,
        paidAmount,
        remainingAmount,
        paymentStatus
      };
    });
  }, [clients, projects, sourcePayouts, financials.allLedger, financials.ledger]);

  const displayClients = useMemo(() => {
    if (clientSourceFilter === 'CLIENT') return clientRecords;
    if (clientSourceFilter === 'SOURCE') return sourceRecords;
    return [...clientRecords, ...sourceRecords];
  }, [clientSourceFilter, clientRecords, sourceRecords]);

  const clientSourceSummary = useMemo(() => {
    const totalClientsTcv = clientRecords.reduce((sum, c) => sum + c.totalTcv, 0);
    const clientProjectsCount = clientRecords.reduce((sum, c) => sum + (c.associatedProjectsList?.length || 0), 0);
    const avgClientTcv = clientRecords.length > 0 ? Math.round(totalClientsTcv / clientRecords.length) : 0;
    const totalClientsPaid = clientRecords.reduce((sum, c) => sum + c.paidAmount, 0);
    const totalClientsRemaining = clientRecords.reduce((sum, c) => sum + c.remainingAmount, 0);

    const totalSourcesTcv = sourceRecords.reduce((sum, s) => sum + s.totalTcv, 0);
    const totalSourcesCommissionDue = sourceRecords.reduce((sum, s) => sum + s.totalDue, 0);
    const totalSourcesPaid = sourceRecords.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalSourcesRemaining = sourceRecords.reduce((sum, s) => sum + s.remainingAmount, 0);
    const paidSourcesCount = sourceRecords.filter(s => s.paymentStatus === 'PAID').length;
    const partialSourcesCount = sourceRecords.filter(s => s.paymentStatus === 'PARTIALLY_PAID').length;
    const unpaidSourcesCount = sourceRecords.filter(s => s.paymentStatus === 'UNPAID').length;

    return {
      clientCount: clientRecords.length,
      sourceCount: sourceRecords.length,
      clientProjectsCount,
      avgClientTcv,
      totalClientsTcv,
      totalClientsPaid,
      totalClientsRemaining,
      totalSourcesTcv,
      totalSourcesCommissionDue,
      totalSourcesPaid,
      totalSourcesRemaining,
      paidSourcesCount,
      partialSourcesCount,
      unpaidSourcesCount
    };
  }, [clientRecords, sourceRecords]);

  const formatCurrency = (val, prefixPlus = false) => {
    const num = Number(val || 0);
    if (num < 0) {
      return `-Rs ${Math.abs(num).toLocaleString()}`;
    }
    return `${prefixPlus && num > 0 ? '+' : ''}Rs ${num.toLocaleString()}`;
  };

  // Selected Month label helper
  const selectedMonthObj = availableMonths.find(m => m.id === selectedMonth) || { label: 'Current Month' };
  const currentMonthName = selectedMonthObj.label;

  // Month matching helper for payouts and payroll
  const matchesMonth = (dateStr) => {
    if (!selectedMonth || selectedMonth === 'ALL') return true;
    if (!dateStr) return true;
    return String(dateStr).slice(0, 7) === selectedMonth;
  };

  // Generate monthly salary records for salaried staff (On-Site & Remote)
  const salariedEmployees = (users || []).filter(u => u.compensationType !== 'PERCENTAGE' && u.role !== 'PARTNER');

  const salariedPayrollRecords = salariedEmployees.map((u) => {
    const defaultSalary = u.role === 'SUPER_ADMIN' ? 180000 : u.role === 'PROJECT_MANAGER' ? 135000 : 120000;
    const annualSalary = (u.salary !== undefined && u.salary !== null && !isNaN(Number(u.salary))) ? Number(u.salary) : defaultSalary;
    const monthlyAmount = Math.round(annualSalary / 12);

    // Find all matching disbursed salary payouts for this employee in selected period
    const matchingDisbursements = (financials.ledger || []).filter(l => {
      const isEmp = l.employeeId === u.id || l.contractorId === u.id;
      const isSal = l.isSalaried || l.payoutType === 'SALARIED' || l.agreementModel === 'FIXED_SALARY';
      if (!isEmp || !isSal) return false;
      if (l.status !== 'DISBURSED') return false;
      const dStr = l.month || l.payoutDate || l.date || l.step2AuthorizedAt;
      return matchesMonth(dStr);
    });

    const disbursedSum = matchingDisbursements.reduce((sum, l) => sum + (Number(l.calculatedPayoutAmount || l.amount) || 0), 0);
    
    // Initial/seed state: Alexander Wright (Admin) & Sarah Jenkins (PM) are seed-paid in current month if no other disbursed records
    const isSeedPaid = (u.id === 'usr-admin' || u.id === 'usr-pm') && matchingDisbursements.length === 0;
    const paidAmount = isSeedPaid ? monthlyAmount : disbursedSum;
    const remainingAmount = Math.max(0, monthlyAmount - paidAmount);

    let paymentStatus = 'UNPAID';
    if (paidAmount >= monthlyAmount && monthlyAmount > 0) {
      paymentStatus = 'PAID';
    } else if (paidAmount > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    const latestRef = matchingDisbursements[0]?.disbursementRef || (u.id === 'usr-admin' ? 'ACH-PAYROLL-9924' : (u.id === 'usr-pm' ? 'ACH-PAYROLL-9925' : ''));

    return {
      id: `salary-${u.id}-current`,
      isSalaried: true,
      employeeId: u.id,
      employeeName: u.name,
      avatar: u.avatar,
      email: u.email,
      workMode: u.workMode || 'ONSITE',
      role: u.role,
      title: u.title || (u.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Staff Engineer'),
      department: u.department || (u.role === 'PROJECT_MANAGER' ? 'Operations' : 'Engineering'),
      period: `Monthly Payroll (Rs {currentMonthName})`,
      annualSalary,
      monthlyAmount,
      totalDue: monthlyAmount,
      paidAmount,
      remainingAmount,
      compensationModel: 'FIXED_SALARY',
      paymentStatus,
      status: paymentStatus,
      disbursementChannel: 'Direct Deposit / Bank ACH',
      disbursementRef: latestRef
    };
  });

  // Percentage payout records from projects
  const percentageRecords = (financials.ledger || [])
    .filter(item => !(item.isSalaried || item.payoutType === 'SALARIED' || item.agreementModel === 'FIXED_SALARY'))
    .map(item => {
      const userObj = (users || []).find(u => u.id === item.contractorId);
      const proj = (projects || []).find(p => p.id === item.projectId);
      const projectTcv = item.projectTotalValue || proj?.totalContractValue || 120000;
      const percentage = item.agreementPercentage || 15.0;
      const totalCalculatedShare = item.totalProjectShare || Math.round(projectTcv * (percentage / 100));
      const milestoneAmount = Number(item.calculatedPayoutAmount || item.amount) || 0;

      // Find all disbursed milestone payouts for this contractor on this project
      const allDisbursedOnProj = (financials.ledger || []).filter(l => 
        l.contractorId === item.contractorId && 
        l.projectId === item.projectId && 
        l.status === 'DISBURSED' &&
        !(l.isSalaried || l.payoutType === 'SALARIED' || l.agreementModel === 'FIXED_SALARY')
      );
      const totalDisbursedOnProject = allDisbursedOnProj.reduce((sum, l) => sum + (Number(l.calculatedPayoutAmount || l.amount) || 0), 0);

      const totalDue = totalCalculatedShare > 0 ? totalCalculatedShare : milestoneAmount;
      const paidAmount = totalDisbursedOnProject;
      const remainingAmount = Math.max(0, totalDue - paidAmount);

      let paymentStatus = 'UNPAID';
      if (paidAmount >= totalDue && totalDue > 0) {
        paymentStatus = 'PAID';
      } else if (paidAmount > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }

      return {
        id: item.id,
        isSalaried: false,
        employeeId: item.contractorId,
        employeeName: item.contractorName,
        avatar: userObj?.avatar,
        email: userObj?.email || 'partner@lincoz.io',
        workMode: userObj?.workMode || 'REMOTE',
        role: userObj?.role || 'ONSITE_MEMBER',
        title: userObj?.title || 'Project Architect',
        department: userObj?.department || 'Engineering',
        period: item.deliverableTitle ? `${item.projectName} • ${item.deliverableTitle}` : item.projectName,
        projectName: item.projectName,
        deliverableTitle: item.deliverableTitle || 'Project Deliverable Settlement',
        projectTotalValue: projectTcv,
        agreementPercentage: percentage,
        totalProjectShare: totalCalculatedShare,
        totalDue,
        paidAmount,
        remainingAmount,
        monthlyAmount: milestoneAmount,
        compensationModel: 'WHOLE_PROJECT_SHARE',
        paymentStatus,
        status: paymentStatus,
        disbursementChannel: item.disbursementChannel || 'Wise Multi-Currency Wire',
        disbursementRef: item.disbursementRef
      };
    });

  // Sort helper: Strictly prioritize newly created records at the top of the list!
  const getSortTimestamp = (item) => {
    if (!item) return 0;
    if (item._createdTimestamp) return Number(item._createdTimestamp);
    if (item.id) {
      const match = String(item.id).match(/\d{10,}/);
      if (match) return Number(match[0]);
    }
    if (item.createdAt) {
      const t = new Date(item.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (item.step2AuthorizedAt) {
      const t = new Date(item.step2AuthorizedAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    const d = item.date || item.payoutDate || item.paymentDate || item.issueDate || item.expenseDate;
    if (d) {
      const t = new Date(d).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

  const sortByNewest = (a, b) => {
    const timeA = getSortTimestamp(a);
    const timeB = getSortTimestamp(b);
    if (timeA !== timeB) return timeB - timeA;
    const dateA = new Date(a.date || a.payoutDate || a.paymentDate || a.issueDate || 0).getTime();
    const dateB = new Date(b.date || b.payoutDate || b.paymentDate || b.issueDate || 0).getTime();
    return dateB - dateA;
  };

  // Combine employee pay records
  const allEmployeeRecords = [...salariedPayrollRecords, ...percentageRecords];

  // Executive summary metrics across all employee compensation
  const employeeCompensationSummary = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    allEmployeeRecords.forEach(item => {
      totalDue += (item.totalDue || 0);
      totalPaid += (item.paidAmount || 0);
      totalRemaining += (item.remainingAmount || 0);
      if (item.paymentStatus === 'PAID') paidCount++;
      else if (item.paymentStatus === 'PARTIALLY_PAID') partialCount++;
      else unpaidCount++;
    });

    return { totalDue, totalPaid, totalRemaining, paidCount, partialCount, unpaidCount, totalCount: allEmployeeRecords.length };
  }, [allEmployeeRecords]);

  const filteredEmployeeRecords = allEmployeeRecords
    .filter(item => {
      if (employeeSubFilter === 'SALARIED' && !item.isSalaried) return false;
      if (employeeSubFilter === 'PERCENTAGE' && item.isSalaried) return false;
      if (filterStatus === 'PAID' && item.paymentStatus !== 'PAID') return false;
      if (filterStatus === 'PARTIALLY_PAID' && item.paymentStatus !== 'PARTIALLY_PAID') return false;
      if (filterStatus === 'UNPAID' && item.paymentStatus !== 'UNPAID') return false;
      return true;
    })
    .sort(sortByNewest);

  // Calculate monthly total outflow stats
  const totalMonthlySalaries = salariedPayrollRecords.reduce((sum, r) => sum + r.monthlyAmount, 0);
  const totalSalariesPaid = salariedPayrollRecords.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalSalariesRemaining = salariedPayrollRecords.reduce((sum, r) => sum + r.remainingAmount, 0);
  const totalPercentagePayouts = percentageRecords.reduce((sum, r) => sum + r.monthlyAmount, 0);

  if (!financials.roleAllowed) {
    return (
      <div className="p-12 rounded-3xl bg-[#111827] border border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">Access Restricted by RBAC Policy</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {financials.message || 'Financial records and ledgers are restricted from this role.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Banknote className="w-6 h-6 text-emerald-400" />
            {isPartner() || currentUser.compensationType === 'PERCENTAGE' ? 'My Project Earnings Ledger' : 'Financial Logs'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isPartner() || currentUser.compensationType === 'PERCENTAGE'
              ? `Real-time records for ${currentMonthName}: tracking whole project percentage shares and settlements.`
              : `Monthly ledger for ${currentMonthName}: payroll, direct project expenses, and whole project share payouts.`}
          </p>
        </div>

        {/* Header Actions: Month Selector + Super Admin Download + Status Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Month Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-indigo-500/40 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#182234] text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Super Admin Executive Statement Action */}
          {isSuperAdmin() && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowMonthlyStatementModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
                title={`View & print official company monthly financial statement for ${currentMonthName}`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>
            </div>
          )}

          {activeTable === 'EMPLOYEES' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="NOT_PAID">Not Paid</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Top Metrics Cards */}
      {isPartner() || currentUser.compensationType === 'PERCENTAGE' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Monthly Earnings"
            value={`Rs ${(financials.totalEarned || 0).toLocaleString()}`}
            subtitle={`In ${currentMonthName}`}
            icon={Banknote}
            colorScheme="amber"
          />
          <StatsCard
            title="Settled & Paid"
            value={`Rs ${(financials.totalDisbursed || 0).toLocaleString()}`}
            subtitle={`Logged in ${currentMonthName}`}
            icon={CheckCircle2}
            colorScheme="emerald"
            badgeText="Paid"
          />
          <StatsCard
            title="Approved (Pending Release)"
            value={`Rs ${(financials.pendingDisbursement || 0).toLocaleString()}`}
            subtitle="Step-1 verified by PM"
            icon={FileCheck2}
            colorScheme="indigo"
          />
          <StatsCard
            title="Accruing (WIP)"
            value={`Rs ${(financials.unbilledAccruing || 0).toLocaleString()}`}
            subtitle="Active project delivery"
            icon={Sparkles}
            colorScheme="cyan"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Monthly Payroll"
            value={`Rs ${totalMonthlySalaries.toLocaleString()}/mo`}
            subtitle={`Paid: Rs ${totalSalariesPaid.toLocaleString()} • Rem: Rs ${totalSalariesRemaining.toLocaleString()}`}
            icon={Users}
            colorScheme="emerald"
          />
          <StatsCard
            title="Monthly Invoiced"
            value={`Rs ${(financials.grossInvoiced || 0).toLocaleString()}`}
            subtitle={`AR: Rs ${(financials.accountsReceivable || 0).toLocaleString()} in ${currentMonthName}`}
            icon={TrendingUp}
            colorScheme="cyan"
          />
          <StatsCard
            title="Monthly Direct Expenses"
            value={`Rs ${(financials.directExpenses || 0).toLocaleString()}`}
            subtitle={`Logged in ${currentMonthName}`}
            icon={AlertCircle}
            colorScheme="rose"
          />
          <StatsCard
            title="Monthly Net Cashflow"
            value={`Rs ${(financials.netMonthlyCashflow !== undefined ? financials.netMonthlyCashflow : ((financials.totalCollected || 0) - (financials.totalOutflows || 0))).toLocaleString()}`}
            subtitle={`Net margin after outflows (${currentMonthName})`}
            icon={Banknote}
            colorScheme={((financials.netMonthlyCashflow !== undefined ? financials.netMonthlyCashflow : ((financials.totalCollected || 0) - (financials.totalOutflows || 0))) >= 0) ? "emerald" : "rose"}
          />
        </div>
      )}

      {/* 4 TABLE SWITCHER BUTTONS (For Super Admin / PM) */}
      {(isSuperAdmin() || isPM()) && (
        <div className="table-switcher flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#111827] border border-slate-800 w-full sm:w-fit">
          <button
            onClick={() => setActiveTable('CLIENTS_SOURCES')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTable === 'CLIENTS_SOURCES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
              }`}
          >
            <Building2 className={`w-4 h-4 ${activeTable === 'CLIENTS_SOURCES' ? 'text-white' : 'text-slate-400'}`} />
            <span className={activeTable === 'CLIENTS_SOURCES' ? 'text-white' : ''}>1. Clients & Sources (Freelancers)</span>
          </button>

          <button
            onClick={() => setActiveTable('EMPLOYEES')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTable === 'EMPLOYEES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
              }`}
          >
            <Users className={`w-4 h-4 ${activeTable === 'EMPLOYEES' ? 'text-white' : 'text-slate-400'}`} />
            <span className={activeTable === 'EMPLOYEES' ? 'text-white' : ''}>2. All Employee Pays & Payroll</span>
          </button>

          {isSuperAdmin() && (
            <button
              onClick={() => setActiveTable('PROJECT_EXPENSES')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTable === 'PROJECT_EXPENSES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                }`}
            >
              <FolderKanban className={`w-4 h-4 ${activeTable === 'PROJECT_EXPENSES' ? 'text-white' : 'text-slate-400'}`} />
              <span className={activeTable === 'PROJECT_EXPENSES' ? 'text-white' : ''}>3. Project Financials</span>
            </button>
          )}

          {isSuperAdmin() && (
            <button
              onClick={() => setActiveTable('COMPANY_WHOLE')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTable === 'COMPANY_WHOLE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                }`}
            >
              <Briefcase className={`w-4 h-4 ${activeTable === 'COMPANY_WHOLE' ? 'text-white' : 'text-slate-400'}`} />
              <span className={activeTable === 'COMPANY_WHOLE' ? 'text-white' : ''}>4. Company Overall Financials</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TABLE 1: ALL EMPLOYEE PAYS (SALARIED MONTHLY & PERCENTAGE PROJECT SHARES) */}
      {/* ========================================================================= */}
      {activeTable === 'EMPLOYEES' && (
        <div className="space-y-4 animate-fadeIn">

          {/* Executive Compensation & Remaining Balance Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Compensation Due</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono"> Rs {employeeCompensationSummary.totalDue.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Fixed salaries + % project shares
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid (Disbursed)</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 font-mono"> Rs {employeeCompensationSummary.totalPaid.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400/80 mt-0.5 block font-mono">
                  {Math.round((employeeCompensationSummary.totalPaid / (employeeCompensationSummary.totalDue || 1)) * 100)}% Cleared
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/30 bg-amber-500/5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Remaining To Be Paid</p>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 font-mono"> Rs {employeeCompensationSummary.totalRemaining.toLocaleString()}
                </p>
                <span className="text-[10px] text-amber-400/80 mt-0.5 block">
                  Outstanding employee balance
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status Count</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    {employeeCompensationSummary.paidCount} Paid
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    {employeeCompensationSummary.partialCount} Partial
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                    {employeeCompensationSummary.unpaidCount} Unpaid
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                <Calculator className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Sub-Filters inside Employee Pays Table */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
            {/* Filter by Staff Compensation Type */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Staff Type:</span>
              <div className="flex items-center gap-1 bg-[#182234] p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setEmployeeSubFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${employeeSubFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  All Staff ({allEmployeeRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeSubFilter('SALARIED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${employeeSubFilter === 'SALARIED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Salaried ({salariedPayrollRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeSubFilter('PERCENTAGE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${employeeSubFilter === 'PERCENTAGE'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  % Share ({percentageRecords.length})
                </button>
              </div>
            </div>

            {/* Filter by Payment Status (Paid, Partially Paid, Unpaid) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Status:</span>
              <div className="flex items-center gap-1 bg-[#182234] p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  All Statuses
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('PAID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-400 hover:text-white'
                    }`}
                >
                  Paid ({employeeCompensationSummary.paidCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('PARTIALLY_PAID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'PARTIALLY_PAID'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-400 hover:text-white'
                    }`}
                >
                  Partially Paid ({employeeCompensationSummary.partialCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('UNPAID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${filterStatus === 'UNPAID'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-400 hover:text-white'
                    }`}
                >
                  Unpaid ({employeeCompensationSummary.unpaidCount})
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Employee & Role</th>
                    <th className="py-3.5 px-4">Compensation Structure</th>
                    <th className="py-3.5 px-4">Period / Project Scope</th>
                    <th className="py-3.5 px-4 text-right">Total Due</th>
                    <th className="py-3.5 px-4 text-right">Paid Amount</th>
                    <th className="py-3.5 px-4 text-right">Remaining Amount</th>
                    <th className="py-3.5 px-4 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {filteredEmployeeRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500 font-sans">
                        No employee pay records match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployeeRecords.map((item) => {
                      const isSalaried = item.isSalaried;

                      return (
                        <tr key={item.id} className="hover:bg-[#182234]/50 transition-colors">

                          {/* Employee */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              {item.avatar && (
                                <img
                                  src={item.avatar}
                                  alt={item.employeeName}
                                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-700"
                                />
                              )}
                              <div>
                                <span className="font-bold text-white block">
                                  {item.employeeName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <WorkModeBadge mode={item.workMode} />
                                  <span className="text-[10px] text-slate-400">{item.title}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Compensation Structure */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {isSalaried ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Fixed Monthly Salary
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono"> Rs {item.annualSalary.toLocaleString()}/yr Base
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  {item.agreementPercentage}% Project Share
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                  TCV: Rs {item.projectTotalValue.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Pay Period / Scope */}
                          <td className="py-4 px-4 max-w-xs">
                            <span className="font-semibold text-indigo-300 block truncate">
                              {item.period}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.disbursementChannel}
                            </span>
                          </td>

                          {/* Total Due Amount */}
                          <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                            <span className="text-sm font-bold text-white block"> Rs {item.totalDue.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {isSalaried ? '/ month' : 'Total Project Share'}
                            </span>
                          </td>

                          {/* Paid Amount */}
                          <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                            <span className={`text-sm font-bold block ${item.paidAmount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}> Rs {item.paidAmount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {item.paidAmount >= item.totalDue && item.totalDue > 0
                                ? '100% Cleared'
                                : item.paidAmount > 0
                                  ? `${Math.round((item.paidAmount / (item.totalDue || 1)) * 100)}% Cleared`
                                  : 'Zero Disbursed'}
                            </span>
                          </td>

                          {/* Remaining Amount */}
                          <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                            <span className={`text-sm font-black block ${item.remainingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}> Rs {item.remainingAmount.toLocaleString()}
                            </span>
                            <span className={`text-[10px] block font-sans ${item.remainingAmount === 0 ? 'text-emerald-400 font-semibold' : 'text-amber-400/80 font-medium'}`}>
                              {item.remainingAmount === 0 ? 'Fully Cleared' : 'To Be Paid'}
                            </span>
                          </td>

                          {/* Payment Status (Paid, Partially Paid, Unpaid) */}
                          <td className="py-4 px-4 text-right whitespace-nowrap font-sans">
                            {item.paymentStatus === 'PAID' && (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Paid
                                </span>
                                {item.disbursementRef && (
                                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Ref: {item.disbursementRef}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.paymentStatus === 'PARTIALLY_PAID' && (
                              <div className="flex flex-col items-end">
                                <button
                                  type="button"
                                  onClick={() => isSuperAdmin() && setSelectedPayoutForSignoff({
                                    id: item.id,
                                    contractorName: item.employeeName,
                                    calculatedPayoutAmount: item.remainingAmount,
                                    projectName: isSalaried ? 'Company Payroll' : item.projectName,
                                    deliverableTitle: isSalaried ? `${item.period} (Balance)` : (item.deliverableTitle || 'Project Share Settlement'),
                                    disbursementChannel: item.disbursementChannel
                                  })}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 transition-all ${
                                    isSuperAdmin() ? 'hover:bg-amber-500/25 hover:border-amber-400 cursor-pointer shadow-xs' : 'cursor-default'
                                  }`}
                                  title={isSuperAdmin() ? `Click to pay remaining balance (Rs ${item.remainingAmount.toLocaleString()})` : 'Partially paid'}
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  Partially Paid
                                </button>
                                <span className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                                  Rem: Rs {item.remainingAmount.toLocaleString()}
                                </span>
                              </div>
                            )}

                            {item.paymentStatus === 'UNPAID' && (
                              <div className="flex flex-col items-end">
                                <button
                                  type="button"
                                  onClick={() => isSuperAdmin() && setSelectedPayoutForSignoff({
                                    id: item.id,
                                    contractorName: item.employeeName,
                                    calculatedPayoutAmount: item.remainingAmount || item.totalDue,
                                    projectName: isSalaried ? 'Company Payroll' : item.projectName,
                                    deliverableTitle: isSalaried ? item.period : (item.deliverableTitle || 'Project Share Settlement'),
                                    disbursementChannel: item.disbursementChannel
                                  })}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 transition-all ${
                                    isSuperAdmin() ? 'hover:bg-rose-500/25 hover:border-rose-400 cursor-pointer shadow-xs' : 'cursor-default'
                                  }`}
                                  title={isSuperAdmin() ? `Click to record payment (Rs ${(item.remainingAmount || item.totalDue).toLocaleString()})` : 'Unpaid'}
                                >
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                  Unpaid
                                </button>
                                <span className="text-[10px] text-rose-400/90 font-mono mt-0.5">
                                  Due: Rs {item.totalDue.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TABLE 2: CLIENTS & SOURCES (FREELANCERS) LEDGER */}
      {/* ========================================================================= */}
      {activeTable === 'CLIENTS_SOURCES' && (
        <div className="space-y-4 animate-fadeIn">

          {/* Quick Metrics Strip Contextual to Client / Source View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {clientSourceFilter === 'CLIENT' ? (
              <>
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Client Accounts</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono">
                      {clientSourceSummary.clientCount}
                    </p>
                    <span className="text-[10px] text-blue-400 mt-0.5 block font-medium">Direct Enterprise Clients</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Portfolio TCV</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono"> Rs {clientSourceSummary.totalClientsTcv.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Total contractual project value</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <Banknote className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Client Projects</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5 font-mono">
                      {clientSourceSummary.clientProjectsCount}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                      Contracted delivery scope
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Contract Value</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono"> Rs {clientSourceSummary.avgClientTcv.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Average value per client account</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </>
            ) : clientSourceFilter === 'SOURCE' ? (
              <>
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Commission Due</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono"> Rs {clientSourceSummary.totalSourcesCommissionDue.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                      Across {clientSourceSummary.sourceCount} referral sources
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid To Sources</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 font-mono"> Rs {clientSourceSummary.totalSourcesPaid.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-400/80 mt-0.5 block font-mono">
                      {Math.round((clientSourceSummary.totalSourcesPaid / (clientSourceSummary.totalSourcesCommissionDue || 1)) * 100)}% Cleared
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/30 bg-amber-500/5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Remaining To Be Paid</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 font-mono"> Rs {clientSourceSummary.totalSourcesRemaining.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-amber-400/80 mt-0.5 block">
                      Outstanding referral partner balance
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Status Count</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {clientSourceSummary.paidSourcesCount} Paid
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                        {clientSourceSummary.partialSourcesCount} Partial
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                        {clientSourceSummary.unpaidSourcesCount} Unpaid
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <Calculator className="w-5 h-5" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Entities</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono">
                      {clientSourceSummary.clientCount + clientSourceSummary.sourceCount}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {clientSourceSummary.clientCount} Clients • {clientSourceSummary.sourceCount} Sources
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combined TCV Volume</p>
                    <p className="text-xl sm:text-2xl font-black text-white mt-0.5 font-mono"> Rs {clientSourceSummary.totalClientsTcv.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Total contractual project volume</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                    <Banknote className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Commission Paid</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 font-mono"> Rs {clientSourceSummary.totalSourcesPaid.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-400/80 mt-0.5 block font-mono">
                      Disbursed to origination partners
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/30 bg-amber-500/5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Source Remaining Due</p>
                    <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5 font-mono"> Rs {clientSourceSummary.totalSourcesRemaining.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-amber-400/80 mt-0.5 block">
                      Outstanding partner origination fees
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sub-Filter Controls: Client vs Source (Freelancer) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111827] border border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400">View Category:</span>
              <div className="category-switcher flex items-center gap-1 bg-[#182234] p-1 rounded-xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setClientSourceFilter('CLIENT')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    clientSourceFilter === 'CLIENT'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/30'
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 ${clientSourceFilter === 'CLIENT' ? 'text-white' : 'text-slate-400'}`} />
                  <span className={clientSourceFilter === 'CLIENT' ? 'text-white' : ''}>Client ({clientSourceSummary.clientCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientSourceFilter('SOURCE')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    clientSourceFilter === 'SOURCE'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400/30'
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 ${clientSourceFilter === 'SOURCE' ? 'text-white' : 'text-slate-400'}`} />
                  <span className={clientSourceFilter === 'SOURCE' ? 'text-white' : ''}>Source ({clientSourceSummary.sourceCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientSourceFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    clientSourceFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span className={clientSourceFilter === 'ALL' ? 'text-white' : ''}>All ({displayClients.length})</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{displayClients.length}</span> {clientSourceFilter === 'CLIENT' ? 'Client Accounts' : clientSourceFilter === 'SOURCE' ? 'Sources (Freelancers)' : 'Entities'}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">
                      {clientSourceFilter === 'CLIENT' ? 'Client Name & Contact' : clientSourceFilter === 'SOURCE' ? 'Source / Partner & Contact' : 'Entity & Name'}
                    </th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Country & Region</th>
                    <th className="py-3.5 px-4">
                      {clientSourceFilter === 'SOURCE' ? 'Referred Projects' : 'Associated Projects'}
                    </th>
                    {clientSourceFilter === 'SOURCE' ? (
                      <>
                        <th className="py-3.5 px-4">Commission Rate</th>
                        <th className="py-3.5 px-4 font-mono">Referred TCV</th>
                        <th className="py-3.5 px-4 font-mono">Total Due</th>
                        <th className="py-3.5 px-4 font-mono text-emerald-400">Paid Amount</th>
                        <th className="py-3.5 px-4 font-mono text-amber-400">Remaining to Pay</th>
                        <th className="py-3.5 px-4 text-right">Payment Status</th>
                      </>
                    ) : clientSourceFilter === 'CLIENT' ? (
                      <>
                        <th className="py-3.5 px-4">Commercial Agreement</th>
                        <th className="py-3.5 px-4 font-mono">Total Contract Value (TCV)</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3.5 px-4">Agreement / Rate</th>
                        <th className="py-3.5 px-4 font-mono">Total Due</th>
                        <th className="py-3.5 px-4 font-mono text-emerald-400">Paid Amount</th>
                        <th className="py-3.5 px-4 font-mono text-amber-400">Remaining</th>
                        <th className="py-3.5 px-4 text-right">Payment Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {displayClients.length === 0 ? (
                    <tr>
                      <td colSpan={clientSourceFilter === 'SOURCE' ? 10 : clientSourceFilter === 'CLIENT' ? 6 : 9} className="py-12 text-center text-slate-500">
                        No {clientSourceFilter === 'CLIENT' ? 'client accounts' : clientSourceFilter === 'SOURCE' ? 'sources (freelancers)' : 'entities'} found.
                      </td>
                    </tr>
                  ) : (
                    displayClients.map((c) => {
                      const isSource = c.category === 'FREELANCER';
                      const associatedProjs = c.associatedProjectsList || [];

                      return (
                        <tr key={c.id} className="hover:bg-[#182234]/50 transition-colors">

                          {/* Name & Contact */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-bold text-white block">{c.name}</span>
                            <span className="text-[11px] text-slate-400">{c.email || c.contactNumber || 'No email registered'}</span>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isSource
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              }`}>
                              {isSource ? 'Source (Freelancer)' : 'Client Account'}
                            </span>
                          </td>

                          {/* Country */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-300">
                            {c.country || 'Global'}
                          </td>

                          {/* Associated Projects */}
                          <td className="py-4 px-4 max-w-xs">
                            {associatedProjs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {associatedProjs.map(p => (
                                  <span key={p.id} className="px-2 py-0.5 rounded-md bg-[#182234] border border-slate-700 text-[10px] text-indigo-300 font-medium">
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px] italic">No active projects</span>
                            )}
                          </td>

                          {/* Source View Columns */}
                          {clientSourceFilter === 'SOURCE' && (
                            <>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-amber-400 font-bold">
                                {c.commissionRate}% of TCV
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300"> Rs {Number(c.totalTcv || 0).toLocaleString()}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-white font-bold"> Rs {Number(c.totalDue || 0).toLocaleString()}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-emerald-400 font-bold"> Rs {Number(c.paidAmount || 0).toLocaleString()}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono font-extrabold text-sm">
                                <span className={c.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-400'}> Rs {Number(c.remainingAmount || 0).toLocaleString()}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Client View Columns */}
                          {clientSourceFilter === 'CLIENT' && (
                            <>
                              <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-300">
                                Direct Enterprise Engagement
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-white font-bold"> Rs {Number(c.totalTcv || 0).toLocaleString()}
                              </td>
                            </>
                          )}

                          {/* Unified All View Columns */}
                          {clientSourceFilter === 'ALL' && (
                            <>
                              <td className="py-4 px-4 whitespace-nowrap font-mono">
                                {isSource ? (
                                  <span className="text-amber-400 font-bold">{c.commissionRate}% of TCV</span>
                                ) : (
                                  <span className="text-slate-300 font-medium">Direct Agreement</span>
                                )}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-white font-bold"> Rs {Number(c.totalDue || 0).toLocaleString()}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono text-emerald-400 font-bold"> Rs {Number(c.paidAmount || 0).toLocaleString()}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap font-mono font-extrabold text-sm">
                                <span className={c.remainingAmount > 0 ? 'text-amber-400' : 'text-slate-400'}> Rs {Number(c.remainingAmount || 0).toLocaleString()}
                                </span>
                              </td>
                            </>
                          )}

                          {/* Status (Only for Source & All views) */}
                          {clientSourceFilter !== 'CLIENT' && (
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              {c.paymentStatus === 'PAID' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                                  Paid
                                </span>
                              ) : c.paymentStatus === 'PARTIALLY_PAID' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
                                  Partially Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
                                  Unpaid
                                </span>
                              )}
                            </td>
                          )}

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TABLE 3: PROJECT EXPENSE & FINANCES (SUPER ADMIN EXCLUSIVE)               */}
      {/* ========================================================================= */}
      {activeTable === 'PROJECT_EXPENSES' && isSuperAdmin() && (
        <div className="space-y-4 animate-fadeIn">

          {/* Project Expenses Banner */}
          <div className="company-performance-banner relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 relative z-10 max-w-2xl">
              <div className="banner-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" /> Project Financials & Billing ({currentMonthName})
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Project Financials & Billing Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Project-by-project breakdown of total contract value (TCV), monthly invoiced billing, and pending accounts receivable (AR) for {currentMonthName}.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10 w-full md:w-auto justify-end">
              <div className="net-margin-card p-4 sm:p-5 px-6 rounded-2xl border text-right shadow-lg w-full md:w-auto bg-[#182234]/80 border-slate-700">
                <span className="net-margin-label text-[11px] uppercase font-bold block tracking-wider mb-0.5 text-slate-400">
                  Monthly Total Invoiced ({currentMonthName})
                </span>
                <span className="net-margin-value text-2xl sm:text-3xl font-mono font-black block text-cyan-400"> Rs {Number(financials.grossInvoiced || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold block mt-0.5 font-sans">
                  (${Number(financials.accountsReceivable || 0).toLocaleString()} Pending AR)
                </span>
              </div>
            </div>
          </div>

          {/* Project-by-Project Financial Ledger Table */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Project Name & Client</th>
                    <th className="py-3.5 px-4">Whole Project TCV</th>
                    <th className="py-3.5 px-4">Monthly Invoiced</th>
                    <th className="py-3.5 px-4">Monthly AR</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs font-mono">
                  {projects.map((proj) => {
                    const client = clients.find(c => c.id === proj.clientId || (c.associatedProjects || []).includes(proj.id));

                    // Month-filtered values
                    const projInvoices = (clientInvoices || []).filter(inv => inv.projectId === proj.id && (selectedMonth === 'ALL' || (inv.issueDate || inv.invoiceDate || inv.date || '').startsWith(selectedMonth)));
                    const projGrossInvoiced = projInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

                    const projPayments = (clientPayments || []).filter(pay => pay.projectId === proj.id && (selectedMonth === 'ALL' || (pay.paymentDate || pay.date || '').startsWith(selectedMonth)));
                    const projCollected = projPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    const projAR = Math.max(0, projGrossInvoiced - projCollected);

                    return (
                      <tr key={proj.id} className="hover:bg-[#182234]/50 transition-colors">
                        {/* Name & Client */}
                        <td className="py-4 px-4 whitespace-nowrap font-sans">
                          <span className="font-bold text-white block text-xs">{proj.name}</span>
                          <span className="text-[11px] text-indigo-400">{proj.clientName || client?.name || 'Enterprise Client'}</span>
                        </td>

                        {/* TCV */}
                        <td className="py-4 px-4 whitespace-nowrap text-slate-200 font-bold"> Rs {(proj.totalContractValue || 0).toLocaleString()}
                        </td>

                        {/* Gross Invoiced */}
                        <td className="py-4 px-4 whitespace-nowrap text-emerald-400 font-bold"> Rs {projGrossInvoiced.toLocaleString()}
                        </td>

                        {/* Accounts Receivable */}
                        <td className="py-4 px-4 whitespace-nowrap text-amber-400 font-medium"> Rs {projAR.toLocaleString()}
                        </td>

                        {/* Action: Direct Invoicing */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedProjectForInvoice(proj)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs transition-all shadow-sm shadow-indigo-600/30"
                            title={`Issue milestone invoice directly to ${proj.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Invoice Client
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Direct Project Invoicing Modal */}
          {selectedProjectForInvoice && (
            <ProjectInvoiceModal
              isOpen={!!selectedProjectForInvoice}
              onClose={() => setSelectedProjectForInvoice(null)}
              project={selectedProjectForInvoice}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TABLE 4: COMPANY OVERALL FINANCIALS (SUPER ADMIN EXCLUSIVE)               */}
      {/* ========================================================================= */}
      {activeTable === 'COMPANY_WHOLE' && isSuperAdmin() && (
        <div className="space-y-6 animate-fadeIn">

          {/* Company Summary Banner */}
          <div className="company-performance-banner relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 relative z-10 max-w-2xl">
              <div className="banner-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Executive Treasury Overview ({currentMonthName})
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Company Overall Financials & Net Profit
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Consolidated high-level financial overview for {currentMonthName}: Total revenue collections, milestone invoicing, operational expenses, workforce payroll, net cashflow, and total net profit.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowMonthlyStatementModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                title={`View & print certified corporate monthly statement for ${currentMonthName}`}
              >
                <Printer className="w-4 h-4" />
                <span>Print Statement</span>
              </button>

              <div className="net-margin-card p-4 sm:p-5 px-6 rounded-2xl border text-right shadow-lg w-full md:w-auto bg-[#182234]/80 border-slate-700">
                <span className="net-margin-label text-[11px] uppercase font-bold block tracking-wider mb-0.5 text-slate-400">
                  Total Profit ({currentMonthName})
                </span>
                <span className={`net-margin-value text-2xl sm:text-3xl font-mono font-black block ${(financials.totalMonthlyProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(financials.totalMonthlyProfit || 0) >= 0 ? '+' : ''}Rs {Number(financials.totalMonthlyProfit || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 font-sans">
                  ({financials.totalProfitMarginPercent || 0}% Net Operating Margin)
                </span>
              </div>
            </div>
          </div>

          {/* 6 Executive Indicators in List Format */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#182234]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Key Financial Metrics Breakdown ({currentMonthName})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct list of total income, billings, operational expenses, workforce payroll, net cashflow, and total profit.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-700 text-xs font-mono font-bold text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {currentMonthName}
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {/* 1. Total Income */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182234]/40 transition-colors">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Total Income</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Cleared Pay-In
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Cleared client pay-in collections deposited during {currentMonthName}.
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-400 block">
                    {formatCurrency(financials.totalIncome || financials.totalCollected, true)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans block">
                    Cash Inflows
                  </span>
                </div>
              </div>

              {/* 2. Monthly Invoiced */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182234]/40 transition-colors">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Monthly Invoiced</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Milestone Invoiced
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Gross contractual milestone billing (Outstanding AR: {formatCurrency(financials.accountsReceivable)}).
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-base sm:text-lg font-black font-mono text-cyan-400 block">
                    {formatCurrency(financials.monthlyInvoiced || financials.grossInvoiced)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans block">
                    Gross Billed
                  </span>
                </div>
              </div>

              {/* 3. Monthly Expense */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182234]/40 transition-colors">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Monthly Expense</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Direct Overhead
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Cloud infrastructure, software licenses, security audits, and vendor services.
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-base sm:text-lg font-black font-mono text-rose-400 block">
                    -{formatCurrency(financials.monthlyExpense || financials.directExpenses)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans block">
                    Operational Outflow
                  </span>
                </div>
              </div>

              {/* 4. Monthly Payroll */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182234]/40 transition-colors">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Monthly Payroll</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Payroll & Shares
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Salaries: {formatCurrency(financials.fixedPayroll || financials.totalMonthlySalaries)} | Contractor % Shares: {formatCurrency(financials.variablePayroll || financials.totalPercentagePayouts)}.
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-base sm:text-lg font-black font-mono text-purple-400 block">
                    -{formatCurrency(financials.payroll || financials.totalPayroll)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans block">
                    Workforce Compensation
                  </span>
                </div>
              </div>

              {/* 5. Net Cash Flow */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182234]/40 transition-colors bg-[#182234]/20">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${(financials.netCashFlow || 0) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Net Cash Flow</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${(financials.netCashFlow || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {(financials.netCashFlow || 0) >= 0 ? 'Positive Flow' : 'Deficit'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Actual liquid cash movement: Total Income minus all direct expenses, payroll, and partner payouts.
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className={`text-base sm:text-lg font-black font-mono block ${(financials.netCashFlow || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(financials.netCashFlow !== undefined ? financials.netCashFlow : (financials.netMonthlyCashflow || 0), true)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans block">
                    Liquid Balance
                  </span>
                </div>
              </div>

              {/* 6. Total Profit of Month */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#182234]/40 transition-colors bg-indigo-950/20 border-t border-indigo-500/20">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${(financials.totalMonthlyProfit || 0) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">Total Profit of Month</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${(financials.totalMonthlyProfit || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {financials.totalProfitMarginPercent || 0}% Operating Margin
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Operating Profit: Gross Invoiced minus Direct Expenses, Payroll, and Partner Fees.
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className={`text-lg sm:text-xl font-black font-mono block ${(financials.totalMonthlyProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(financials.totalMonthlyProfit, true)}
                  </span>
                  <span className="text-[11px] text-indigo-300 font-sans block font-semibold">
                    Net Profit
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Consolidated Corporate Financial Statement & Audit Reconciliation */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#182234]/40">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Corporate Financial Statement & Cashflow Reconciliation ({currentMonthName})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Itemized accounting reconciliation separating liquid cash movement from accrued operating income.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowMonthlyStatementModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="Print or Save PDF Statement"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Statement
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="p-3.5">Financial Component</th>
                    <th className="p-3.5">Accounting Classification</th>
                    <th className="p-3.5 text-right">Amount (Rs)</th>
                    <th className="p-3.5">Reconciliation Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {/* Total Income */}
                  <tr className="hover:bg-[#182234]/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      Total Income (Cleared Pay-In)
                    </td>
                    <td className="p-3.5 text-emerald-300 font-sans text-[11px]">Inward Cash Collections</td>
                    <td className="p-3.5 text-right text-emerald-400 font-bold text-sm">
                      +${Number(financials.totalIncome || financials.totalCollected || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-xs">
                      Liquid client settlements cleared into company accounts during {currentMonthName}.
                    </td>
                  </tr>

                  {/* Monthly Invoiced */}
                  <tr className="hover:bg-[#182234]/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                      Monthly Invoiced
                    </td>
                    <td className="p-3.5 text-cyan-300 font-sans text-[11px]">Accrued Revenue Billings</td>
                    <td className="p-3.5 text-right text-cyan-400 font-bold text-sm"> Rs {Number(financials.monthlyInvoiced || financials.grossInvoiced || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-xs">
                      Total milestone invoices billed (Outstanding Accounts Receivable: Rs {Number(financials.accountsReceivable || 0).toLocaleString()}).
                    </td>
                  </tr>

                  {/* Monthly Direct Expenses */}
                  <tr className="hover:bg-[#182234]/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                      Monthly Direct Expenses
                    </td>
                    <td className="p-3.5 text-rose-300 font-sans text-[11px]">Operational Overhead</td>
                    <td className="p-3.5 text-right text-rose-400 font-bold text-sm">
                      -${Number(financials.monthlyExpense || financials.directExpenses || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-xs">
                      Cloud hosting, SaaS subscriptions, software tools, security audits, and vendor services.
                    </td>
                  </tr>

                  {/* Fixed Salaried Payroll */}
                  <tr className="hover:bg-[#182234]/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                      Fixed Salaried Payroll
                    </td>
                    <td className="p-3.5 text-purple-300 font-sans text-[11px]">Fixed Staff Compensation</td>
                    <td className="p-3.5 text-right text-purple-400 font-bold text-sm">
                      -${Number(financials.fixedPayroll || financials.totalMonthlySalaries || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-xs">
                      Salaries for dedicated on-site and remote employees (Engineering, PMs, Super Admins).
                    </td>
                  </tr>

                  {/* Variable Staff Profit Shares */}
                  <tr className="hover:bg-[#182234]/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                      Variable Staff Profit Shares
                    </td>
                    <td className="p-3.5 text-purple-300 font-sans text-[11px]">Milestone Profit-Shares</td>
                    <td className="p-3.5 text-right text-purple-400 font-bold text-sm">
                      -${Number(financials.variablePayroll || financials.totalPercentagePayouts || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-xs">
                      Performance and milestone profit-sharing allocated to contractors and engineering partners.
                    </td>
                  </tr>

                  {/* Source Referral Fees */}
                  <tr className="hover:bg-[#182234]/40 transition-colors">
                    <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      Source & Referral Commissions
                    </td>
                    <td className="p-3.5 text-amber-300 font-sans text-[11px]">Partner Commissions</td>
                    <td className="p-3.5 text-right text-amber-400 font-bold text-sm">
                      -${Number(financials.totalSourcePayouts || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 font-sans text-xs">
                      Origination and deal-sourcing commission payout disbursed to verified partner sources.
                    </td>
                  </tr>

                  {/* Monthly Net Cash Flow */}
                  <tr className="bg-[#182234]/60 font-bold">
                    <td className="p-3.5 font-sans text-white text-xs flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      Monthly Net Cash Flow
                    </td>
                    <td className="p-3.5 text-slate-300 font-sans text-[11px]">Net Liquid Treasury Position</td>
                    <td className={`p-3.5 text-right font-black text-sm ${(financials.netCashFlow || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(financials.netCashFlow || 0) >= 0 ? '+' : ''}Rs {Number(financials.netCashFlow !== undefined ? financials.netCashFlow : financials.netMonthlyCashflow || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-300 font-sans text-xs">
                      Cleared Client Cash Inflows minus Direct Expenses, Payroll, Shares, and Source Disbursements.
                    </td>
                  </tr>

                  {/* Total Profit of that Month */}
                  <tr className="bg-indigo-950/40 font-bold border-t border-indigo-500/30">
                    <td className="p-3.5 font-sans text-white text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Total Profit of that Month
                    </td>
                    <td className="p-3.5 text-indigo-300 font-sans text-[11px]">Net Operating Profitability</td>
                    <td className={`p-3.5 text-right font-black text-base ${(financials.totalMonthlyProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(financials.totalMonthlyProfit || 0) >= 0 ? '+' : ''}Rs {Number(financials.totalMonthlyProfit || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-indigo-200 font-sans text-xs">
                      Gross Invoiced Revenue minus all Direct Expenses, Total Payroll, and Partner Fees ({financials.totalProfitMarginPercent || 0}% Operating Margin).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Settlement Modal */}
      {selectedPayoutForSignoff && (
        <DisbursementModal
          isOpen={!!selectedPayoutForSignoff}
          onClose={() => setSelectedPayoutForSignoff(null)}
          payoutItem={selectedPayoutForSignoff}
        />
      )}

      {/* Official Monthly Financial Statement Print/PDF Modal */}
      {showMonthlyStatementModal && (
        <MonthlyStatementModal
          isOpen={showMonthlyStatementModal}
          onClose={() => setShowMonthlyStatementModal(false)}
          financials={financials}
          selectedMonth={selectedMonth}
          currentMonthName={currentMonthName}
          currentUser={currentUser}
          salariedPayrollRecords={salariedPayrollRecords}
          percentageRecords={percentageRecords}
        />
      )}

    </div>
  );
};
