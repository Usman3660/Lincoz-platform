import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { secureRandomInt } from '../../utils/cryptoUtils';
import { StatsCard } from '../common/StatsCard';
import { StatusBadge, RoleBadge, CompBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Banknote,
  Plus,
  Filter,
  Search,
  Building2,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Percent,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  FolderKanban,
  Printer,
  X
} from 'lucide-react';
import { printElement } from '../../utils/printDocument';

export const PayinPayoutManager = () => {
  const {
    projects,
    users,
    clients,
    currentUser,
    selectedMonth,
    setSelectedMonth,
    availableMonths = [],
    clientInvoices = [],
    clientPayments = [],
    sourcePayouts = [],
    directExpensesList = [],
    expenseCategories = [],
    payoutLedger = [],
    addClientInvoice,
    addClientPayment,
    addSourcePayout,
    addPercentagePayout,
    addDirectExpense,
    addExpenseCategory,
    deleteTransaction,
    isSuperAdmin,
    getScopedFinancials
  } = useApp();

  // Navigation and Filter States
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INVOICES' | 'PAYMENTS_IN' | 'SOURCE_FEES' | 'PERCENTAGE_PAYOUTS' | 'DIRECT_EXPENSES'
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeSubFilter, setEmployeeSubFilter] = useState('ALL'); // 'ALL' | 'PERCENTAGE' | 'SALARIED'
  const [employeePayoutType, setEmployeePayoutType] = useState('PERCENTAGE'); // 'PERCENTAGE' | 'SALARIED'

  const percentageUsers = useMemo(() => {
    const list = (users || []).filter(u => u.compensationType === 'PERCENTAGE' || u.role === 'PARTNER');
    return list.length > 0 ? list : (users || []);
  }, [users]);

  const salariedUsers = useMemo(() => {
    const list = (users || []).filter(u => u.compensationType !== 'PERCENTAGE' && u.role !== 'PARTNER');
    return list.length > 0 ? list : (users || []);
  }, [users]);

  // List of all referral partners & origination sources across the system
  const availableSources = useMemo(() => {
    const list = [];
    const seenNames = new Set();

    // 1. Sources from clients directory where category === 'FREELANCER'
    (clients || []).forEach(c => {
      if (c.category === 'FREELANCER' && c.name && !seenNames.has(c.name.trim().toLowerCase())) {
        seenNames.add(c.name.trim().toLowerCase());
        list.push({
          id: c.id,
          name: c.name,
          percentage: c.percentage || 10,
          associatedProjects: c.associatedProjects || [],
          country: c.country || '',
          type: 'FREELANCER'
        });
      }
    });

    // 2. Sources from recorded source payouts
    (sourcePayouts || []).forEach(sp => {
      if (sp.sourceName && !seenNames.has(sp.sourceName.trim().toLowerCase())) {
        seenNames.add(sp.sourceName.trim().toLowerCase());
        list.push({
          id: sp.sourceId || `src-payout-${sp.id}`,
          name: sp.sourceName,
          percentage: sp.percentage || 10,
          associatedProjects: sp.projectId ? [sp.projectId] : [],
          country: '',
          type: 'PARTNER'
        });
      }
    });

    // 3. Fallback defaults if none registered yet
    if (list.length === 0) {
      list.push(
        { id: 'src-1', name: 'Nexus Lead Capital Ltd', percentage: 10, associatedProjects: [] },
        { id: 'src-2', name: 'HealthTech Ventures Alliance', percentage: 10, associatedProjects: [] },
        { id: 'src-3', name: 'SupplyChain Growth Partners', percentage: 10, associatedProjects: [] }
      );
    }

    return list;
  }, [clients, sourcePayouts]);

  // Modal Action State
  const [modalType, setModalType] = useState(null); // 'INVOICE' | 'PAYMENT' | 'SOURCE' | 'PERCENTAGE' | 'EXPENSE'

  // Printable Action Record State
  const [printRecord, setPrintRecord] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && printRecord) {
        setPrintRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [printRecord]);

  // Form States for Modals
  const [targetProjectId, setTargetProjectId] = useState(projects[0]?.id || '');
  const [expenseMonth, setExpenseMonth] = useState(selectedMonth !== 'ALL' ? selectedMonth : '2026-10');
  const [payrollMonth, setPayrollMonth] = useState(selectedMonth !== 'ALL' ? selectedMonth : '2026-10');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [contractorId, setContractorId] = useState('');
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [status, setStatus] = useState('PAID');
  const [notes, setNotes] = useState('');

  // Inline Category Creation State
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryError, setNewCategoryError] = useState('');

  // Invoice Cap & Budget Allowance Calculation for Selected Project
  const selectedInvoiceProj = useMemo(() => {
    return projects.find(p => p.id === targetProjectId) || null;
  }, [projects, targetProjectId]);

  const invoiceProjTcv = Number(selectedInvoiceProj?.totalContractValue) || 0;

  const invoiceProjAlreadyInvoiced = useMemo(() => {
    if (!targetProjectId) return 0;
    return (clientInvoices || [])
      .filter(i => i.projectId === targetProjectId)
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [clientInvoices, targetProjectId]);

  const invoiceRemainingCap = Math.max(0, invoiceProjTcv - invoiceProjAlreadyInvoiced);
  const invoiceAmountNum = Number(amount) || 0;
  const isInvoiceExceedingCap = modalType === 'INVOICE' && invoiceProjTcv > 0 && invoiceAmountNum > invoiceRemainingCap;
  const isFullyInvoiced = modalType === 'INVOICE' && invoiceProjTcv > 0 && invoiceRemainingCap === 0;
  const invoicedPercent = invoiceProjTcv > 0
    ? Math.round((invoiceProjAlreadyInvoiced / invoiceProjTcv) * 100)
    : 0;

  // Format record details for printing vouchers
  const getDocumentMeta = (doc) => {
    if (!doc) return null;
    const flowType = doc.flowType || (
      doc.invoiceNumber ? 'INVOICE' :
        doc.receiptRef ? 'DIRECT_EXPENSE' :
          doc.sourceName ? 'SOURCE_PAYOUT' :
            doc.contractorName ? 'PERCENTAGE_PAYOUT' :
              doc.paymentMethod ? 'PAYMENT_IN' : 'GENERAL'
    );

    switch (flowType) {
      case 'INVOICE':
        return {
          title: 'OFFICIAL CLIENT INVOICE',
          tag: 'Invoice Statement',
          refNo: doc.invoiceNumber || 'INV-2026-UNSPECIFIED',
          date: doc.issueDate || doc.date || new Date().toISOString().split('T')[0],
          dueDate: doc.dueDate || '2026-11-30',
          partyLabel: 'Billed Client',
          partyName: doc.clientName || 'Client Organization',
          project: doc.projectName || 'Project Delivery',
          amount: Number(doc.amount || 0),
          status: doc.status || 'PENDING',
          badgeColor: 'indigo',
          signatoryTitle: 'Financial Operations Controller',
          channel: 'Corporate Wire / Invoicing',
          notes: doc.notes || 'Official milestone billing statement dispatched to client organization.'
        };
      case 'PAYMENT_IN':
      case 'PAYMENT':
        return {
          title: 'OFFICIAL CLIENT PAYMENT SETTLEMENT RECEIPT',
          tag: 'Pay-In Cash Receipt',
          refNo: doc.referenceNumber || 'TX-PAYIN-CLEARED',
          date: doc.paymentDate || doc.date || new Date().toISOString().split('T')[0],
          partyLabel: 'Remitting Client',
          partyName: doc.clientName || 'Client Organization',
          project: doc.projectName || 'Project Delivery',
          amount: Number(doc.amount || 0),
          status: 'CLEARED & SETTLED',
          badgeColor: 'emerald',
          signatoryTitle: 'Treasury & Cashflow Auditor',
          channel: doc.paymentMethod || 'Bank Wire Transfer',
          notes: doc.notes || 'Inward cash payment verified and cleared into corporate ledger account.'
        };
      case 'SOURCE_PAYOUT':
      case 'SOURCE':
        return {
          title: 'SOURCE REFERRAL DISBURSEMENT VOUCHER',
          tag: 'Commission Payout Voucher',
          refNo: doc.referenceNumber || 'SRC-COMMISSION-TX',
          date: doc.payoutDate || doc.date || new Date().toISOString().split('T')[0],
          partyLabel: 'Referral Partner / Source',
          partyName: doc.sourceName || 'Referral Partner',
          project: doc.projectName || 'Project Delivery',
          amount: Number(doc.amount || 0),
          status: doc.status || 'DISBURSED',
          badgeColor: 'amber',
          signatoryTitle: 'Partner Alliance Director',
          channel: doc.paymentMethod || 'Direct Wire Transfer',
          notes: doc.notes || 'Origination and deal-sourcing commission payout disbursed per partner agreement.'
        };
      case 'PERCENTAGE_PAYOUT':
      case 'PERCENTAGE': {
        const isSal = doc.isSalaried || doc.payoutType === 'SALARIED' || doc.agreementModel === 'FIXED_SALARY';
        return {
          title: isSal ? 'STAFF MONTHLY SALARY PAYROLL VOUCHER' : 'CONTRACTOR PROFIT-SHARE SETTLEMENT VOUCHER',
          tag: isSal ? 'Monthly Salary Payroll Voucher' : 'Percentage Share Voucher',
          refNo: doc.disbursementRef || (isSal ? 'ACH-PAYROLL-SETTLEMENT' : 'TX-SHARE-SETTLEMENT'),
          date: doc.payoutDate || (doc.step2AuthorizedAt ? doc.step2AuthorizedAt.split('T')[0] : (doc.date || new Date().toISOString().split('T')[0])),
          partyLabel: isSal ? 'Salaried Employee / Staff' : 'Beneficiary Contractor / Engineer',
          partyName: doc.contractorName || doc.employeeName || 'Staff Member',
          project: doc.projectName || (isSal ? 'Company Payroll' : 'Project Delivery'),
          amount: Number(doc.calculatedPayoutAmount || doc.amount || 0),
          status: doc.status || 'DISBURSED',
          badgeColor: isSal ? 'emerald' : 'purple',
          signatoryTitle: 'Super Admin Executive Officer',
          channel: doc.disbursementChannel || (isSal ? 'Direct Deposit / Bank ACH' : 'Corporate Wire'),
          deliverable: doc.deliverableTitle || (isSal ? 'Monthly Salaried Payroll' : 'Project Engineering & Architecture Milestone'),
          agreementMeta: isSal ? 'Fixed Salaried Compensation' : `${doc.agreementPercentage || 15}% Share Model`,
          notes: doc.notes || (isSal ? 'Monthly fixed staff salary compensation disbursed.' : 'Contractual profit-share allocation authorized and disbursed upon verified delivery.')
        };
      }
      case 'DIRECT_EXPENSE':
      case 'EXPENSE':
      default: {
        const expMonth = doc.month || (doc.expenseDate || doc.date || '').slice(0, 7);
        const monthLabel = availableMonths.find(m => (m.id || m.value) === expMonth)?.label || expMonth || 'Monthly Operations';
        return {
          title: 'MONTHLY OPERATIONAL EXPENSE VOUCHER',
          tag: 'Monthly Expense Voucher',
          refNo: doc.receiptRef || 'REC-EXPENSE-OFFICIAL',
          date: doc.expenseDate || doc.date || new Date().toISOString().split('T')[0],
          partyLabel: 'Expense Category',
          partyName: doc.category || 'Operational Expense',
          vendor: doc.vendor || 'Operational Vendor',
          project: `Expense Month: ${monthLabel}`,
          amount: Number(doc.amount || 0),
          status: doc.status || 'PAID',
          badgeColor: 'rose',
          signatoryTitle: 'Chief Operations Officer',
          channel: 'Direct Corporate Settlement',
          notes: doc.notes || 'Direct monthly operational infrastructure expenditure incurred.'
        };
      }
    }
  };

  const handleSwitchEmployeePayoutType = (type) => {
    setEmployeePayoutType(type);
    if (type === 'PERCENTAGE') {
      const validProjId = targetProjectId !== 'INTERNAL' ? targetProjectId : (projects[0]?.id || '');
      setTargetProjectId(validProjId);
      const pUser = percentageUsers[0];
      if (pUser) {
        setContractorId(pUser.id);
        setDeliverableTitle('Project Architecture & Engineering Settlement');
        const proj = projects.find(p => p.id === validProjId) || projects[0];
        const pTcv = proj?.totalContractValue || 100000;
        const sharePct = pUser.percentage || 15.0;
        setAmount(String(Math.round(pTcv * (sharePct / 100) / 2)));
        setPaymentMethod('Wise Multi-Currency Wire');
      }
    } else {
      setTargetProjectId('INTERNAL');
      const sUser = salariedUsers[0];
      if (sUser) {
        setContractorId(sUser.id);
        const mObj = availableMonths.find(m => (m.id || m.value) === payrollMonth);
        const mLabel = mObj?.label || payrollMonth;
        setDeliverableTitle(`Monthly Payroll (${mLabel})`);
        const defSalary = sUser.role === 'SUPER_ADMIN' ? 180000 : sUser.role === 'PROJECT_MANAGER' ? 135000 : 120000;
        const annSal = (sUser.salary !== undefined && sUser.salary !== null && !isNaN(Number(sUser.salary))) ? Number(sUser.salary) : defSalary;
        const moSal = Math.round(annSal / 12);
        setAmount(String(moSal));
        setPaymentMethod('Direct Deposit / Bank ACH');
      }
    }
  };

  const handleContractorChange = (userId) => {
    setContractorId(userId);
    if (employeePayoutType === 'SALARIED') {
      const u = users.find(usr => usr.id === userId);
      if (u) {
        const defSalary = u.role === 'SUPER_ADMIN' ? 180000 : u.role === 'PROJECT_MANAGER' ? 135000 : 120000;
        const annSal = (u.salary !== undefined && u.salary !== null && !isNaN(Number(u.salary))) ? Number(u.salary) : defSalary;
        const moSal = Math.round(annSal / 12);
        setAmount(String(moSal));
      }
    } else {
      const u = users.find(usr => usr.id === userId);
      if (u) {
        const proj = projects.find(p => p.id === (targetProjectId !== 'INTERNAL' ? targetProjectId : projects[0]?.id)) || projects[0];
        const pTcv = proj?.totalContractValue || 100000;
        const sharePct = u.percentage || 15.0;
        setAmount(String(Math.round(pTcv * (sharePct / 100) / 2)));
      }
    }
  };

  const handleSourceSelect = (selectedName) => {
    setSourceName(selectedName);
    const src = availableSources.find(s => s.name === selectedName);
    if (src && targetProjectId) {
      const proj = projects.find(p => p.id === targetProjectId);
      const pTcv = proj?.totalContractValue || 0;
      const rate = src.percentage || 10;
      if (pTcv > 0) {
        setAmount(String(Math.round(pTcv * (rate / 100))));
      }
    }
  };

  // Open specific modal helper
  const handleOpenModal = (type, explicitProjectId = null, explicitEmployeeType = null) => {
    setModalType(type);

    if (explicitEmployeeType) {
      setEmployeePayoutType(explicitEmployeeType);
    }

    // Prioritize explicit project ID, then active selectedProjectId, then first available project
    if (explicitProjectId) {
      setTargetProjectId(explicitProjectId);
    } else if (selectedProjectId && selectedProjectId !== 'ALL') {
      setTargetProjectId(selectedProjectId);
    } else {
      setTargetProjectId(projects[0]?.id || '');
    }

    const defaultMonth = (selectedMonth && selectedMonth !== 'ALL') ? selectedMonth : '2026-10';
    setExpenseMonth(defaultMonth);
    setPayrollMonth(defaultMonth);
    setNotes('');
    setReferenceNumber('');
    setInvoiceNumber(`INV-2026-${secureRandomInt(100, 999)}`);

    const defaultDate = `${defaultMonth}-15`;
    setIssueDate(defaultDate);
    setDueDate(`${defaultMonth}-30`);
    setPaymentDate(defaultDate);
    setPaymentMethod('Bank Wire Transfer');
    setExpenseCategory(expenseCategories[0]?.name || '');
    setVendor('');
    setStatus(type === 'INVOICE' ? 'PENDING' : 'PAID');
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryError('');

    // Default source / contractor
    setIsCustomSource(false);
    const firstSource = (clients || []).find(c => c.category === 'FREELANCER') || availableSources[0];
    const initialSourceName = firstSource?.name || 'Nexus Lead Capital Ltd';
    setSourceName(initialSourceName);

    if (type === 'SOURCE') {
      const proj = projects.find(p => p.id === (explicitProjectId || targetProjectId || projects[0]?.id));
      const pTcv = proj?.totalContractValue || 0;
      const rate = firstSource?.percentage || 10;
      if (pTcv > 0) {
        setAmount(String(Math.round(pTcv * (rate / 100))));
      } else {
        setAmount('3500');
      }
    }

    const activeEmpType = explicitEmployeeType || employeePayoutType;
    if (type === 'PERCENTAGE' || type === 'EMPLOYEE') {
      if (activeEmpType === 'SALARIED') {
        setTargetProjectId('INTERNAL');
        const firstSal = salariedUsers[0];
        setContractorId(firstSal?.id || '');
        const mObj = availableMonths.find(m => (m.id || m.value) === defaultMonth);
        const mLabel = mObj?.label || defaultMonth;
        setDeliverableTitle(`Monthly Payroll (${mLabel})`);
        const defSalary = firstSal?.role === 'SUPER_ADMIN' ? 180000 : firstSal?.role === 'PROJECT_MANAGER' ? 135000 : 120000;
        const annSal = (firstSal?.salary !== undefined && firstSal?.salary !== null && !isNaN(Number(firstSal.salary))) ? Number(firstSal.salary) : defSalary;
        const moSal = Math.round(annSal / 12);
        setAmount(String(moSal));
        setPaymentMethod('Direct Deposit / Bank ACH');
        setPaymentDate(`${defaultMonth}-28`);
      } else {
        const firstPct = percentageUsers[0];
        setContractorId(firstPct?.id || '');
        setDeliverableTitle('Project Architecture & Engineering Settlement');
        const proj = projects.find(p => p.id === (explicitProjectId || selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id)) || projects[0];
        const pTcv = proj?.totalContractValue || 100000;
        const sharePct = firstPct?.percentage || 15.0;
        setAmount(String(Math.round(pTcv * (sharePct / 100) / 2)));
        setPaymentMethod('Wise Multi-Currency Wire');
      }
    } else {
      setAmount('');
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryError('');
  };

  const handleSaveInlineCategory = (e) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) {
      setNewCategoryError('Category name is required.');
      return;
    }
    const created = addExpenseCategory({
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim()
    });
    if (created && created.name) {
      setExpenseCategory(created.name);
    } else {
      setExpenseCategory(newCategoryName.trim());
    }
    setIsAddingNewCategory(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryError('');
  };

  // Form Submit Handler
  const handleSubmitModal = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (modalType !== 'EXPENSE' && !(modalType === 'PERCENTAGE' && employeePayoutType === 'SALARIED' && targetProjectId === 'INTERNAL') && !targetProjectId) {
      alert('Please select a target project.');
      return;
    }

    const selectedProj = modalType === 'EXPENSE' ? null : projects.find(p => p.id === targetProjectId);
    const projName = selectedProj?.name || (modalType === 'PERCENTAGE' && employeePayoutType === 'SALARIED' ? 'Company Payroll' : 'Project');
    const clientName = selectedProj?.clientName || 'Client Organization';

    if (modalType === 'INVOICE') {
      const totalContractVal = Number(selectedProj?.totalContractValue) || 0;
      const alreadyInvoiced = (clientInvoices || [])
        .filter(i => i.projectId === targetProjectId)
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      const remainingInvoicable = Math.max(0, totalContractVal - alreadyInvoiced);

      if (totalContractVal > 0 && Number(amount) > remainingInvoicable) {
        alert(
          `Cannot create invoice for Rs ${Number(amount).toLocaleString()}!\n\n` +
          `Project: ${projName}\n` +
          `Total Project Contract Value: Rs ${totalContractVal.toLocaleString()}\n` +
          `Already Invoiced: Rs ${alreadyInvoiced.toLocaleString()}\n` +
          `Remaining Invoicable Cap: Rs ${remainingInvoicable.toLocaleString()}\n\n` +
          `The total invoice of the project cannot exceed the total value of the project.`
        );
        return;
      }

      const effectiveIssueDate = issueDate || paymentDate || `${(selectedMonth && selectedMonth !== 'ALL') ? selectedMonth : '2026-10'}-15`;
      const res = addClientInvoice({
        projectId: targetProjectId,
        projectName: projName,
        clientName,
        invoiceNumber: invoiceNumber.trim(),
        amount: Number(amount),
        issueDate: effectiveIssueDate,
        dueDate,
        status,
        notes: notes.trim()
      });

      if (res && res.success === false) {
        alert(res.error);
        return;
      }

      if (effectiveIssueDate && selectedMonth !== 'ALL' && !effectiveIssueDate.startsWith(selectedMonth)) {
        setSelectedMonth(effectiveIssueDate.slice(0, 7));
      }
    } else if (modalType === 'PAYMENT') {
      addClientPayment({
        projectId: targetProjectId,
        projectName: projName,
        clientName,
        amount: Number(amount),
        paymentDate,
        date: paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || `TX-PAYIN-${Date.now().toString().slice(-4)}`,
        notes: notes.trim()
      });
      if (paymentDate && selectedMonth !== 'ALL' && !paymentDate.startsWith(selectedMonth)) {
        setSelectedMonth(paymentDate.slice(0, 7));
      }
      if (activeTab !== 'ALL') {
        setActiveTab('PAYMENTS_IN');
      }
    } else if (modalType === 'SOURCE') {
      const matchedSource = availableSources.find(s => s.name.trim().toLowerCase() === sourceName.trim().toLowerCase());
      addSourcePayout({
        projectId: targetProjectId,
        projectName: projName,
        sourceId: matchedSource?.id || null,
        sourceName: sourceName.trim() || 'Source Partner',
        amount: Number(amount),
        percentage: matchedSource?.percentage || 10,
        payoutDate: paymentDate,
        date: paymentDate,
        status: 'DISBURSED',
        paymentMethod,
        referenceNumber: referenceNumber.trim() || `SRC-TX-${Date.now().toString().slice(-4)}`,
        notes: notes.trim()
      });
      if (paymentDate && selectedMonth !== 'ALL' && !paymentDate.startsWith(selectedMonth)) {
        setSelectedMonth(paymentDate.slice(0, 7));
      }
      if (activeTab !== 'ALL') {
        setActiveTab('SOURCE_FEES');
      }
    } else if (modalType === 'PERCENTAGE') {
      if (employeePayoutType === 'SALARIED') {
        const targetContractorId = contractorId || salariedUsers[0]?.id || users[0]?.id;
        const contractorUser = users.find(u => u.id === targetContractorId);
        const pMonthObj = availableMonths.find(m => (m.id || m.value) === payrollMonth);
        const pMonthLabel = pMonthObj?.label || payrollMonth || 'Current Month';

        addPercentagePayout({
          projectId: 'INTERNAL',
          projectName: 'Company Payroll',
          contractorId: targetContractorId,
          contractorName: contractorUser?.name || 'Salaried Employee',
          employeeId: targetContractorId,
          employeeName: contractorUser?.name,
          deliverableTitle: `Monthly Payroll (${pMonthLabel})`,
          agreementModel: 'FIXED_SALARY',
          agreementPercentage: 0,
          projectTotalValue: 0,
          amount: Number(amount),
          calculatedPayoutAmount: Number(amount),
          payoutDate: paymentDate,
          date: paymentDate,
          month: payrollMonth,
          disbursementChannel: paymentMethod || 'Direct Deposit / Bank ACH',
          disbursementRef: referenceNumber.trim() || `ACH-PAYROLL-${Date.now().toString().slice(-4)}`,
          status: 'DISBURSED',
          notes: notes.trim() || 'Monthly salaried workforce disbursement.',
          isSalaried: true,
          payoutType: 'SALARIED'
        });
      } else {
        const targetContractorId = contractorId || percentageUsers[0]?.id || users[0]?.id;
        const contractorUser = users.find(u => u.id === targetContractorId);
        addPercentagePayout({
          projectId: targetProjectId,
          projectName: projName,
          contractorId: targetContractorId,
          contractorName: contractorUser?.name || 'Percentage-Based Employee',
          agreementPercentage: contractorUser?.percentage || 15.0,
          projectTotalValue: selectedProj?.totalContractValue || 100000,
          amount: Number(amount),
          payoutDate: paymentDate,
          date: paymentDate,
          month: paymentDate ? paymentDate.slice(0, 7) : undefined,
          deliverableTitle: deliverableTitle.trim() || 'Project Share Payout',
          disbursementChannel: paymentMethod,
          disbursementRef: referenceNumber.trim() || `TX-SHARE-${Date.now().toString().slice(-4)}`,
          status: 'DISBURSED',
          notes: notes.trim(),
          isSalaried: false,
          payoutType: 'PERCENTAGE'
        });
      }

      if (employeePayoutType === 'SALARIED' && payrollMonth && selectedMonth !== 'ALL' && selectedMonth !== payrollMonth) {
        setSelectedMonth(payrollMonth);
      } else if (paymentDate && selectedMonth !== 'ALL' && !paymentDate.startsWith(selectedMonth)) {
        setSelectedMonth(paymentDate.slice(0, 7));
      }
      if (activeTab !== 'ALL') {
        setActiveTab('PERCENTAGE_PAYOUTS');
      }
    } else if (modalType === 'EXPENSE') {
      const effectiveExpDate = paymentDate || (expenseMonth ? `${expenseMonth}-15` : new Date().toISOString().split('T')[0]);
      const targetMonth = expenseMonth || effectiveExpDate.slice(0, 7) || (selectedMonth !== 'ALL' ? selectedMonth : '2026-10');
      addDirectExpense({
        month: targetMonth,
        category: expenseCategory,
        vendor: vendor.trim() || 'Operational Vendor',
        amount: Number(amount),
        expenseDate: effectiveExpDate,
        date: effectiveExpDate,
        projectName: 'General Operations',
        projectId: 'GENERAL',
        receiptRef: referenceNumber.trim() || `REC-${secureRandomInt(1000, 9999)}`,
        status: 'PAID',
        notes: notes.trim()
      });
      if (targetMonth && selectedMonth !== 'ALL' && selectedMonth !== targetMonth) {
        setSelectedMonth(targetMonth);
      }
      // If a project filter was active, clear it so direct operational expense is in plain view
      if (selectedProjectId !== 'ALL') {
        setSelectedProjectId('ALL');
      }
      if (activeTab !== 'ALL') {
        setActiveTab('DIRECT_EXPENSES');
      }
    }

    handleCloseModal();
  };

  // Month filter matching helper
  const matchesMonth = (dateStr) => {
    if (!selectedMonth || selectedMonth === 'ALL') return true;
    if (!dateStr) return false;
    return dateStr.startsWith(selectedMonth);
  };

  // Aggregated Financial Metrics (Dynamically scoped by month and project)
  const currentSelectedMonthLabel = useMemo(() => {
    return availableMonths.find(m => m.id === selectedMonth || m.value === selectedMonth)?.label || selectedMonth;
  }, [availableMonths, selectedMonth]);

  const totalInvoiced = useMemo(() => {
    return clientInvoices.filter(i => {
      if (selectedProjectId !== 'ALL' && i.projectId !== selectedProjectId) return false;
      if (!matchesMonth(i.issueDate || i.date || i.invoiceDate)) return false;
      return true;
    }).reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [clientInvoices, selectedProjectId, selectedMonth]);

  const totalCollected = useMemo(() => {
    return clientPayments.filter(p => {
      if (selectedProjectId !== 'ALL' && p.projectId !== selectedProjectId) return false;
      if (!matchesMonth(p.paymentDate || p.date)) return false;
      return true;
    }).reduce((sum, pay) => sum + (pay.amount || 0), 0);
  }, [clientPayments, selectedProjectId, selectedMonth]);

  const totalSourcePayouts = useMemo(() => {
    return sourcePayouts.filter(s => {
      if (selectedProjectId !== 'ALL' && s.projectId !== selectedProjectId) return false;
      if (!matchesMonth(s.payoutDate || s.date)) return false;
      return true;
    }).reduce((sum, src) => sum + (src.amount || 0), 0);
  }, [sourcePayouts, selectedProjectId, selectedMonth]);

  const totalPercentagePayouts = useMemo(() => {
    return payoutLedger.filter(p => {
      if (selectedProjectId !== 'ALL' && p.projectId !== selectedProjectId) return false;
      const dateStr = p.payoutDate || p.date || (p.step2AuthorizedAt ? p.step2AuthorizedAt.split('T')[0] : (p.createdAt ? p.createdAt.split('T')[0] : '2026-10-01'));
      if (!matchesMonth(dateStr)) return false;
      return true;
    }).reduce((sum, p) => sum + (p.calculatedPayoutAmount || p.amount || 0), 0);
  }, [payoutLedger, selectedProjectId, selectedMonth]);

  const totalDirectExpenses = useMemo(() => {
    return directExpensesList.filter(e => {
      if (selectedProjectId !== 'ALL' && e.projectId && e.projectId !== 'GENERAL' && e.projectId !== selectedProjectId) return false;
      const monthVal = e.month || (e.expenseDate || e.date || '').slice(0, 7);
      if (selectedMonth && selectedMonth !== 'ALL' && monthVal !== selectedMonth) return false;
      return true;
    }).reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [directExpensesList, selectedProjectId, selectedMonth]);

  const totalOutflows = totalDirectExpenses + totalSourcePayouts + totalPercentagePayouts;

  const accountsReceivable = useMemo(() => {
    return clientInvoices.filter(i => {
      if (selectedProjectId !== 'ALL' && i.projectId !== selectedProjectId) return false;
      if (!matchesMonth(i.issueDate || i.date || i.invoiceDate)) return false;
      return i.status !== 'PAID';
    }).reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [clientInvoices, selectedProjectId, selectedMonth]);

  const netLiquidCash = totalCollected - totalOutflows;

  // Sort helper: Strictly prioritize newly created records at the very top of the list!
  const getSortTimestamp = (item) => {
    if (!item) return 0;
    // 1. Explicit millisecond timestamp if recorded upon creation
    if (item._createdTimestamp) return Number(item._createdTimestamp);

    // 2. Extract timestamp from ID if modern format (e.g. inv-1790..., payin-1790..., etc.)
    if (item.id) {
      const match = String(item.id).match(/\d{10,}/);
      if (match) return Number(match[0]);
    }

    // 3. Fallback to createdAt ISO timestamp
    if (item.createdAt) {
      const t = new Date(item.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }

    // 4. Fallback to step2AuthorizedAt
    if (item.step2AuthorizedAt) {
      const t = new Date(item.step2AuthorizedAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }

    // 5. Fallback to transaction date string (e.g. 2026-10-15)
    const dateStr = item.date || item.paymentDate || item.issueDate || item.payoutDate || item.expenseDate;
    if (dateStr) {
      const t = new Date(dateStr).getTime();
      if (!isNaN(t) && t > 0) return t;
    }

    return 0;
  };

  const sortByNewest = (a, b) => {
    const timeA = getSortTimestamp(a);
    const timeB = getSortTimestamp(b);
    if (timeA !== timeB) {
      return timeB - timeA; // Newly created records strictly on top!
    }
    // Tie-breaker: calendar date descending
    const dateA = new Date(a.date || a.paymentDate || a.issueDate || a.payoutDate || a.expenseDate || 0).getTime();
    const dateB = new Date(b.date || b.paymentDate || b.issueDate || b.payoutDate || b.expenseDate || 0).getTime();
    return dateB - dateA;
  };

  // Filtered Lists per Tab (Scoped by Month + Project + Search) - Sorted by Newest First
  const filteredInvoices = useMemo(() => {
    return clientInvoices
      .filter(item => {
        if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId) return false;
        if (!matchesMonth(item.issueDate || item.date || item.invoiceDate)) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.projectName?.toLowerCase().includes(q) ||
            item.invoiceNumber?.toLowerCase().includes(q) ||
            item.clientName?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort(sortByNewest);
  }, [clientInvoices, selectedProjectId, selectedMonth, searchQuery]);

  const filteredPayments = useMemo(() => {
    return clientPayments
      .filter(item => {
        if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId) return false;
        if (!matchesMonth(item.paymentDate || item.date)) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.projectName?.toLowerCase().includes(q) ||
            item.clientName?.toLowerCase().includes(q) ||
            item.referenceNumber?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort(sortByNewest);
  }, [clientPayments, selectedProjectId, selectedMonth, searchQuery]);

  const filteredSourcePayouts = useMemo(() => {
    return sourcePayouts
      .filter(item => {
        if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId) return false;
        if (!matchesMonth(item.payoutDate || item.date)) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.projectName?.toLowerCase().includes(q) ||
            item.sourceName?.toLowerCase().includes(q) ||
            item.referenceNumber?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort(sortByNewest);
  }, [sourcePayouts, selectedProjectId, selectedMonth, searchQuery]);

  const filteredPercentagePayouts = useMemo(() => {
    return payoutLedger
      .filter(item => {
        const isSal = item.isSalaried || item.payoutType === 'SALARIED' || item.agreementModel === 'FIXED_SALARY';
        if (employeeSubFilter === 'PERCENTAGE' && isSal) return false;
        if (employeeSubFilter === 'SALARIED' && !isSal) return false;
        if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId) return false;
        const dateStr = item.payoutDate || item.date || (item.step2AuthorizedAt ? item.step2AuthorizedAt.split('T')[0] : (item.createdAt ? item.createdAt.split('T')[0] : '2026-10-01'));
        if (!matchesMonth(dateStr)) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.projectName?.toLowerCase().includes(q) ||
            item.contractorName?.toLowerCase().includes(q) ||
            item.deliverableTitle?.toLowerCase().includes(q) ||
            item.disbursementRef?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort(sortByNewest);
  }, [payoutLedger, selectedProjectId, selectedMonth, searchQuery, employeeSubFilter]);

  const employeePayoutCounts = useMemo(() => {
    const list = payoutLedger.filter(item => {
      if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId) return false;
      const dateStr = item.payoutDate || item.date || (item.step2AuthorizedAt ? item.step2AuthorizedAt.split('T')[0] : (item.createdAt ? item.createdAt.split('T')[0] : '2026-10-01'));
      return matchesMonth(dateStr);
    });
    const total = list.length;
    const percentage = list.filter(item => !(item.isSalaried || item.payoutType === 'SALARIED' || item.agreementModel === 'FIXED_SALARY')).length;
    const salaried = list.filter(item => item.isSalaried || item.payoutType === 'SALARIED' || item.agreementModel === 'FIXED_SALARY').length;
    return { total, percentage, salaried };
  }, [payoutLedger, selectedProjectId, selectedMonth]);

  const filteredDirectExpenses = useMemo(() => {
    return directExpensesList
      .filter(item => {
        if (selectedProjectId !== 'ALL' && item.projectId && item.projectId !== 'GENERAL' && item.projectId !== selectedProjectId) return false;
        const monthVal = item.month || (item.expenseDate || item.date || '').slice(0, 7);
        if (selectedMonth && selectedMonth !== 'ALL' && monthVal !== selectedMonth) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.vendor?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            item.receiptRef?.toLowerCase().includes(q) ||
            (item.month && item.month.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort(sortByNewest);
  }, [directExpensesList, selectedProjectId, selectedMonth, searchQuery]);

  // Combined Unified Stream for 'ALL' - Sorted by Newest First
  const unifiedStream = useMemo(() => {
    const list = [
      ...clientInvoices.map(i => ({
        ...i,
        flowType: 'INVOICE',
        direction: 'NEUTRAL',
        date: i.issueDate || i.date,
        title: `Client Invoice #${i.invoiceNumber}`,
        subtitle: i.clientName,
        badgeText: 'Client Invoiced',
        badgeColor: 'indigo'
      })),
      ...clientPayments.map(p => ({
        ...p,
        flowType: 'PAYMENT_IN',
        direction: 'INWARD',
        date: p.paymentDate || p.date,
        title: `Client Pay-In: ${p.clientName || 'Direct Client'}`,
        subtitle: `Ref: ${p.referenceNumber || 'TX-PAYIN'} (${p.paymentMethod || 'Wire'})`,
        badgeText: 'Pay-In Received',
        badgeColor: 'emerald'
      })),
      ...sourcePayouts.map(s => ({
        ...s,
        flowType: 'SOURCE_PAYOUT',
        direction: 'OUTWARD',
        date: s.payoutDate || s.date,
        title: `Source Referral Fee: ${s.sourceName || 'Partner'}`,
        subtitle: `Ref: ${s.referenceNumber || 'Wire'}`,
        badgeText: 'Source Fee',
        badgeColor: 'amber'
      })),
      ...payoutLedger.map(pl => {
        const isSal = pl.isSalaried || pl.payoutType === 'SALARIED' || pl.agreementModel === 'FIXED_SALARY';
        return {
          ...pl,
          flowType: 'PERCENTAGE_PAYOUT',
          direction: 'OUTWARD',
          date: pl.payoutDate || pl.date || (pl.step2AuthorizedAt ? pl.step2AuthorizedAt.split('T')[0] : (pl.createdAt ? pl.createdAt.split('T')[0] : '2026-10-01')),
          amount: pl.calculatedPayoutAmount || pl.amount,
          title: isSal ? `Salary Payout: ${pl.contractorName || pl.employeeName || 'Staff'}` : `% Share Payout: ${pl.contractorName || 'Partner'}`,
          subtitle: pl.deliverableTitle || (isSal ? 'Monthly Payroll Settlement' : 'Project Share'),
          badgeText: isSal ? 'Salary Payroll' : '% Staff Share',
          badgeColor: isSal ? 'emerald' : 'purple'
        };
      }),
      ...directExpensesList.map(e => ({
        ...e,
        flowType: 'DIRECT_EXPENSE',
        direction: 'OUTWARD',
        date: e.expenseDate || e.date || (e.month ? `${e.month}-15` : '2026-10-15'),
        projectName: e.projectName || 'General Operations',
        title: `Monthly Expense: ${e.vendor || e.category}`,
        subtitle: `${e.category} (${e.receiptRef || 'Direct'})`,
        badgeText: 'Monthly Expense',
        badgeColor: 'rose'
      }))
    ];

    return list
      .filter(item => {
        if (item.flowType === 'DIRECT_EXPENSE') {
          if (selectedProjectId !== 'ALL' && item.projectId && item.projectId !== 'GENERAL' && item.projectId !== selectedProjectId) return false;
          const monthVal = item.month || (item.date || '').slice(0, 7);
          if (selectedMonth && selectedMonth !== 'ALL' && monthVal !== selectedMonth) return false;
        } else {
          if (selectedProjectId !== 'ALL' && item.projectId !== selectedProjectId) return false;
          if (!matchesMonth(item.date)) return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            (item.projectName && item.projectName.toLowerCase().includes(q)) ||
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
            (item.vendor && item.vendor.toLowerCase().includes(q)) ||
            (item.sourceName && item.sourceName.toLowerCase().includes(q)) ||
            (item.contractorName && item.contractorName.toLowerCase().includes(q)) ||
            (item.clientName && item.clientName.toLowerCase().includes(q)) ||
            (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q)) ||
            (item.receiptRef && item.receiptRef.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort(sortByNewest);
  }, [clientInvoices, clientPayments, sourcePayouts, payoutLedger, directExpensesList, selectedProjectId, selectedMonth, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Hero Header & 5 Quick Entry Action Buttons */}
      <div className="dashboard-hero-banner payin-payout-banner p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-[#111827] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="payin-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Financial Operations & Cashflow
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pay-In & Pay-Out Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
            </p>
          </div>

          {/* 5 Transaction Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenModal('INVOICE')}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> + Client Invoice
            </button>

            <button
              onClick={() => handleOpenModal('PAYMENT')}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> + Client Payment (Pay-In)
            </button>

            <button
              onClick={() => handleOpenModal('SOURCE')}
              className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" /> + Source Payout
            </button>

            <button
              onClick={() => handleOpenModal('PERCENTAGE')}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> + Employee Payout
            </button>

            <button
              onClick={() => handleOpenModal('EXPENSE')}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" /> + Direct Expense
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs, Month/Project Filters & Search Bar (Positioned Above Data) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#111827] border border-slate-800">

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#182234] p-1.5 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            All Entries ({unifiedStream.length})
          </button>
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'INVOICES'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            1. Client Invoices ({filteredInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS_IN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'PAYMENTS_IN'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            2. Client Pay-In ({filteredPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('SOURCE_FEES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'SOURCE_FEES'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            3. Source Fees ({filteredSourcePayouts.length})
          </button>
          <button
            onClick={() => setActiveTab('PERCENTAGE_PAYOUTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'PERCENTAGE_PAYOUTS'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            4. Employee Payouts ({employeePayoutCounts.total})
          </button>
          <button
            onClick={() => setActiveTab('DIRECT_EXPENSES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'DIRECT_EXPENSES'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            5. Direct Expenses ({filteredDirectExpenses.length})
          </button>
        </div>

        {/* Month Selector, Project Selector & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-[#182234] px-3 py-1.5 rounded-xl border border-indigo-500/40 text-xs shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.id || m.value} value={m.id || m.value} className="bg-[#182234]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selector */}
          <div className="flex items-center gap-1.5 bg-[#182234] px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#182234]">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#182234]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, vendor..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Flow KPI Metrics (Monthly or All Time Data Representation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title={selectedMonth === 'ALL' ? "Total Invoiced" : "Monthly Invoiced"}
          value={`Rs ${totalInvoiced.toLocaleString()}`}
          subtitle={selectedMonth === 'ALL' ? "Billed across all projects" : `Billed in ${currentSelectedMonthLabel}`}
          icon={FileText}
          colorScheme="indigo"
          badgeText={selectedMonth === 'ALL' ? "All Time" : "Month"}
        />
        <StatsCard
          title={selectedMonth === 'ALL' ? "Total Pay-In Received" : "Monthly Pay-In Received"}
          value={`Rs ${totalCollected.toLocaleString()}`}
          subtitle={selectedMonth === 'ALL' ? "Inward cash collected" : `Collected in ${currentSelectedMonthLabel}`}
          icon={ArrowDownLeft}
          colorScheme="emerald"
          badgeText="Pay-In"
        />
        <StatsCard
          title={selectedMonth === 'ALL' ? "Accounts Receivable" : "Month Pending AR"}
          value={`Rs ${accountsReceivable.toLocaleString()}`}
          subtitle={selectedMonth === 'ALL' ? "Pending from clients" : `Pending for ${currentSelectedMonthLabel}`}
          icon={Clock}
          colorScheme="amber"
          badgeText="Pending AR"
        />
        <StatsCard
          title={selectedMonth === 'ALL' ? "Total Pay-Out Disbursed" : "Monthly Pay-Outs"}
          value={`Rs ${totalOutflows.toLocaleString()}`}
          subtitle={selectedMonth === 'ALL' ? "Direct expenses, sources, & % shares" : `Outflows in ${currentSelectedMonthLabel}`}
          icon={ArrowUpRight}
          colorScheme="rose"
          badgeText="Outflows"
        />
        <StatsCard
          title={selectedMonth === 'ALL' ? "Net Cash Balance" : "Monthly Net Cash"}
          value={`Rs ${netLiquidCash.toLocaleString()}`}
          subtitle={selectedMonth === 'ALL' ? "Collected minus all outflows" : `Cashflow for ${currentSelectedMonthLabel}`}
          icon={Wallet}
          colorScheme={netLiquidCash >= 0 ? 'cyan' : 'rose'}
          badgeText={netLiquidCash >= 0 ? "Positive Flow" : "Deficit"}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. ALL UNIFIED TRANSACTIONS STREAM                                        */}
      {/* ========================================================================= */}
      {activeTab === 'ALL' && (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg animate-fadeIn">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234]/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              Unified Cashflow Stream ({unifiedStream.length} records)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Inflows & Outflows Ordered by Date
            </span>
          </div>

          {unifiedStream.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <p>No transactions matching the selected project or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Type & Channel</th>
                    <th className="p-3.5">Project</th>
                    <th className="p-3.5">Details / Party</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {unifiedStream.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-[#182234]/50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${tx.direction === 'INWARD'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : tx.direction === 'OUTWARD'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}>
                          {tx.direction === 'INWARD' && <ArrowDownLeft className="w-3 h-3" />}
                          {tx.direction === 'OUTWARD' && <ArrowUpRight className="w-3 h-3" />}
                          {tx.badgeText}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-white whitespace-nowrap">
                        {tx.projectName}
                      </td>
                      <td className="p-3.5">
                        <p className="text-white font-medium">{tx.title}</p>
                        <p className="text-[11px] text-slate-400">{tx.subtitle || tx.notes}</p>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-sm whitespace-nowrap">
                        <span className={tx.direction === 'INWARD' ? 'text-emerald-400' : tx.direction === 'OUTWARD' ? 'text-rose-400' : 'text-indigo-300'}>
                          {tx.direction === 'INWARD' ? '+' : tx.direction === 'OUTWARD' ? '-' : ''}Rs {Number(tx.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPrintRecord(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="Print Voucher / Record"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.flowType, tx.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CLIENT INVOICES TABLE                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'INVOICES' && (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg animate-fadeIn space-y-4">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234]/40">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Client Invoices Ledger ({filteredInvoices.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official billing statements dispatched to client organizations per project.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal('INVOICE')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Invoice
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Project & Client</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Invoiced Amount</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#182234]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-indigo-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-white">{inv.projectName}</p>
                      <p className="text-[11px] text-slate-400">Client: {inv.clientName}</p>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{inv.issueDate}</td>
                    <td className="p-3.5 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="p-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-sm text-indigo-300"> Rs {(inv.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPrintRecord({ ...inv, flowType: 'INVOICE' })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction('INVOICE', inv.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLIENT PAY-IN RECEIVED TABLE                                           */}
      {/* ========================================================================= */}
      {activeTab === 'PAYMENTS_IN' && (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg animate-fadeIn space-y-4">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234]/40">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                Client Inward Payments (Pay-In) ({filteredPayments.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cleared client payments received into corporate banking/settlement channels.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal('PAYMENT')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Record Client Pay-In
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5">Project & Client</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Reference / Tx ID</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 text-right">Received Amount</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#182234]/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{pay.paymentDate}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-white">{pay.projectName}</p>
                      <p className="text-[11px] text-slate-400">{pay.clientName}</p>
                    </td>
                    <td className="p-3.5 text-slate-300 font-medium">{pay.paymentMethod}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{pay.referenceNumber}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{pay.notes || '-'}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-sm text-emerald-400">
                      +${(pay.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPrintRecord({ ...pay, flowType: 'PAYMENT_IN' })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Print Pay-In Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction('PAYMENT', pay.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SOURCE / REFERRAL PAYOUTS TABLE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'SOURCE_FEES' && (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg animate-fadeIn space-y-4">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234]/40">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Source & Origination Payouts ({filteredSourcePayouts.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Commissions paid out to project lead originators, sources, and referral partners.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal('SOURCE')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Record Source Payout
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-3.5">Payout Date</th>
                  <th className="p-3.5">Source / Partner</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Channel & Ref</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Commission Amount</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSourcePayouts.map((src) => (
                  <tr key={src.id} className="hover:bg-[#182234]/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{src.payoutDate}</td>
                    <td className="p-3.5 font-bold text-white">{src.sourceName}</td>
                    <td className="p-3.5 text-slate-300">{src.projectName}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {src.paymentMethod} &bull; {src.referenceNumber || 'Pending Ref'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={src.status} />
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-sm text-amber-400">
                      -${(src.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPrintRecord({ ...src, flowType: 'SOURCE_PAYOUT' })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Print Commission Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTransaction('SOURCE', src.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EMPLOYEE PAYOUTS TABLE (PERCENTAGE & SALARIED)                         */}
      {/* ========================================================================= */}
      {activeTab === 'PERCENTAGE_PAYOUTS' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Sub-Filters inside Employee Payouts Section */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Compensation Type:</span>
              <div className="flex items-center gap-1.5 bg-[#182234] p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setEmployeeSubFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${employeeSubFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  All Staff Payouts ({employeePayoutCounts.total})
                </button>
                <button
                  onClick={() => setEmployeeSubFilter('PERCENTAGE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${employeeSubFilter === 'PERCENTAGE'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  % Share Staff ({employeePayoutCounts.percentage})
                </button>
                <button
                  onClick={() => setEmployeeSubFilter('SALARIED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${employeeSubFilter === 'SALARIED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Salaried Payroll ({employeePayoutCounts.salaried})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenModal('PERCENTAGE')}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Record Employee Payout
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234]/40">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Employee & Staff Payouts ({filteredPercentagePayouts.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified disbursements for percentage project shares and fixed salaried employee payroll.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="p-3.5">Staff / Employee</th>
                    <th className="p-3.5">Allocation / Project</th>
                    <th className="p-3.5">Structure & Model</th>
                    <th className="p-3.5">Scope & Reference</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Disbursed Amount</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPercentagePayouts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-500">
                        No employee payouts found matching this filter or month.
                      </td>
                    </tr>
                  ) : (
                    filteredPercentagePayouts.map((p) => {
                      const isSal = p.isSalaried || p.payoutType === 'SALARIED' || p.agreementModel === 'FIXED_SALARY';
                      return (
                        <tr key={p.id} className="hover:bg-[#182234]/50 transition-colors">
                          <td className="p-3.5">
                            <div>
                              <p className="font-bold text-white">{p.contractorName || p.employeeName}</p>
                              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isSal
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                }`}>
                                {isSal ? 'Salaried' : `${p.agreementPercentage || 15}% Share`}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300 font-medium">
                            {p.projectName || (isSal ? 'Company Payroll' : 'Project')}
                          </td>
                          <td className="p-3.5 font-mono text-[10px] text-slate-400">
                            {isSal ? 'Fixed Salaried Payroll' : (p.agreementModel?.replace(/_/g, ' ') || 'Project Share')}
                          </td>
                          <td className="p-3.5">
                            <p className="text-white">{p.deliverableTitle || (isSal ? 'Monthly Salary' : 'Milestone Share')}</p>
                            <p className="text-[10px] font-mono text-slate-500">{p.disbursementRef || 'Pending Settlement'}</p>
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className={`p-3.5 text-right font-mono font-bold text-sm ${isSal ? 'text-emerald-400' : 'text-purple-400'}`}>
                            -${(p.calculatedPayoutAmount || p.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setPrintRecord({ ...p, flowType: 'PERCENTAGE_PAYOUT' })}
                                className={`p-1.5 rounded-lg transition-colors ${isSal
                                    ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    : 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/10'
                                  }`}
                                title="Print Payout Voucher"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTransaction('PERCENTAGE_PAYOUT', p.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
      {/* 6. DIRECT EXPENSES TABLE                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'DIRECT_EXPENSES' && (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-lg animate-fadeIn space-y-4">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234]/40">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                Monthly Direct Expenses ({filteredDirectExpenses.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Company-wide operational costs, cloud servers, software licenses, security compliance, and direct infrastructure expenses for {currentSelectedMonthLabel}.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal('EXPENSE')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Record Monthly Expense
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#182234]/60 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="p-3.5">Expense Date</th>
                  <th className="p-3.5">Expense Category</th>
                  <th className="p-3.5">Expense Month</th>
                  <th className="p-3.5">Vendor / Description</th>
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5 text-right">Expense Amount</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredDirectExpenses.map((exp) => {
                  const expMonth = exp.month || (exp.expenseDate || exp.date || '').slice(0, 7);
                  const monthLabel = availableMonths.find(m => (m.id || m.value) === expMonth)?.label || expMonth;
                  return (
                    <tr key={exp.id} className="hover:bg-[#182234]/50 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">{exp.expenseDate}</td>
                      <td className="p-3.5 text-rose-300 font-bold">{exp.category}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold">
                          📅 {monthLabel}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">{exp.vendor}</td>
                      <td className="p-3.5 font-mono text-slate-400">{exp.receiptRef}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-sm text-rose-400">
                        -${(exp.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPrintRecord({ ...exp, flowType: 'DIRECT_EXPENSE' })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Print Expense Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction('EXPENSE', exp.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTION MODAL FOR ALL 5 FINANCIAL OPERATIONS                               */}
      {/* ========================================================================= */}
      {modalType && (
        <Modal
          isOpen={!!modalType}
          onClose={handleCloseModal}
          title={
            modalType === 'INVOICE'
              ? 'Add Client Invoice'
              : modalType === 'PAYMENT'
                ? 'Record Client Payment (Pay-In)'
                : modalType === 'SOURCE'
                  ? 'Disburse Source Referral Fee'
                  : modalType === 'PERCENTAGE'
                    ? (employeePayoutType === 'PERCENTAGE' ? 'Employee Payout - Percentage Share' : 'Employee Payout - Monthly Salaried')
                    : 'Record Monthly Expense'
          }
          subtitle="Log a verified transaction in the immutable operational ledger."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitModal} className="space-y-4">

            {/* Category Switcher for Employee Payout: Percentage vs Salaried */}
            {modalType === 'PERCENTAGE' && (
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#182234] border border-slate-700/80 mb-2">
                <button
                  type="button"
                  onClick={() => handleSwitchEmployeePayoutType('PERCENTAGE')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${employeePayoutType === 'PERCENTAGE'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Percent className="w-4 h-4" />
                  Percentage-Based
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchEmployeePayoutType('SALARIED')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${employeePayoutType === 'SALARIED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Users className="w-4 h-4" />
                  Salaried Employee
                </button>
              </div>
            )}

            {/* Target Project Selection (Only for project transactions: Invoices, Client Payments, Source Partner Commissions, and Percentage Contractors. Never for Salaried Employees or Direct Expenses) */}
            {modalType !== 'EXPENSE' && !(modalType === 'PERCENTAGE' && employeePayoutType === 'SALARIED') && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Project *
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  required
                >
                  {projects.map((p) => {
                    const pTcv = Number(p.totalContractValue) || 0;
                    const pInvoiced = (clientInvoices || [])
                      .filter(i => i.projectId === p.id)
                      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
                    const pRem = Math.max(0, pTcv - pInvoiced);
                    const clientLabel = p.clientName || 'Direct Client';

                    return (
                      <option key={p.id} value={p.id}>
                        📁 {p.name} (Client: {clientLabel}{pTcv > 0 ? ` • TCV: Rs ${pTcv.toLocaleString()}` : ''}{modalType === 'INVOICE' && pTcv > 0 ? ` • Rem: Rs ${pRem.toLocaleString()}` : ''})
                      </option>
                    );
                  })}
                </select>

                {/* Project Contract Cap Constraint Card */}
                {modalType === 'INVOICE' && selectedInvoiceProj && (
                  <div className={`mt-3 p-4 rounded-2xl border transition-all shadow-sm ${isInvoiceExceedingCap
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60'
                    : isFullyInvoiced
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                      : 'bg-slate-50/90 dark:bg-[#151f32] border-indigo-200/80 dark:border-indigo-500/30'
                    }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shadow-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-white block tracking-tight">
                            Project Contract Limit
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Contract Cap Rule
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                          Total Value (TCV)
                        </span>
                        <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-indigo-300">
                          {invoiceProjTcv > 0 ? `Rs ${invoiceProjTcv.toLocaleString()}` : 'Uncapped / Open'}
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-medium">
                        <span className="text-slate-600 dark:text-slate-300">
                          Billed to date: <strong className="text-slate-900 dark:text-white font-mono">{invoiceProjTcv > 0 ? `${invoicedPercent}%` : 'Flexible'}</strong>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {invoiceProjTcv === 0 ? (
                            <span className="text-indigo-400 font-bold">Open Contract</span>
                          ) : invoiceRemainingCap > 0 ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold"> Rs {invoiceRemainingCap.toLocaleString()} left</span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400 font-bold">Cap reached</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/60 dark:border-slate-700/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${invoicedPercent >= 100
                            ? 'bg-amber-500'
                            : isInvoiceExceedingCap
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                            }`}
                          style={{ width: `${invoiceProjTcv > 0 ? Math.min(100, Math.max(0, invoicedPercent)) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Dual Metric Cards */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {/* Already Invoiced Card */}
                      <div className="p-3 rounded-xl bg-white dark:bg-[#182234] border border-slate-200 dark:border-slate-700/80 shadow-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
                            Already Invoiced
                          </span>
                        </div>
                        <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                          Rs {invoiceProjAlreadyInvoiced.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                          {invoiceProjTcv > 0 ? `${invoicedPercent}% of contract` : 'Standard billing'}
                        </div>
                      </div>

                      {/* Remaining Invoicable Card */}
                      <div className={`p-3 rounded-xl border shadow-xs transition-colors ${invoiceProjTcv === 0 || invoiceRemainingCap > 0
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/60'
                        }`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${invoiceProjTcv === 0 || invoiceRemainingCap > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-sans ${invoiceProjTcv === 0 || invoiceRemainingCap > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            Remaining Cap
                          </span>
                        </div>
                        <div className={`text-base font-extrabold font-mono ${invoiceProjTcv === 0 || invoiceRemainingCap > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {invoiceProjTcv > 0 ? `Rs ${invoiceRemainingCap.toLocaleString()}` : 'No Ceiling'}
                        </div>
                        <div className={`text-[10px] mt-0.5 font-sans ${invoiceProjTcv === 0 || invoiceRemainingCap > 0 ? 'text-emerald-700/80 dark:text-emerald-400/80' : 'text-amber-700/80 dark:text-amber-400/80'}`}>
                          {invoiceProjTcv > 0 ? (invoiceRemainingCap > 0 ? 'Available allowance' : 'Limit reached') : 'Flexible Invoicing'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status / Guidance Note */}
                    <div className="pt-2">
                      {isFullyInvoiced ? (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span className="font-semibold text-[11px] leading-tight">
                            Project 100% Invoiced: Full contract value (Rs {invoiceProjTcv.toLocaleString()}) has been reached. No further invoices can be issued.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-xs">
                          <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            Invoice Cap Constraint:
                          </span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs bg-emerald-100/80 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-300/60 dark:border-emerald-800/60">
                            {invoiceProjTcv > 0 ? `Must not exceed Rs ${invoiceRemainingCap.toLocaleString()}` : 'Flexible Invoicing (Uncapped)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expense Month Selection for Direct Operational Expenses */}
            {modalType === 'EXPENSE' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Expense Month *
                </label>
                <select
                  value={expenseMonth}
                  onChange={(e) => {
                    setExpenseMonth(e.target.value);
                    setPaymentDate(`${e.target.value}-15`);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-rose-300 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                  required
                >
                  {availableMonths
                    .filter(m => (m.id || m.value) !== 'ALL')
                    .map((m) => (
                      <option key={m.id || m.value} value={m.id || m.value} className="bg-[#182234] text-white">
                        📅 {m.label}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Type-Specific Fields */}
            {modalType === 'INVOICE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2026-099"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PENDING">Pending Payment</option>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="PAID">Paid / Cleared</option>
                  </select>
                </div>
              </div>
            )}

            {modalType === 'SOURCE' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Source / Referral Partner Name *
                  </label>
                  {!isCustomSource ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSource(true);
                        setSourceName('');
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      + Enter Custom Source
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSource(false);
                        const fallback = availableSources[0]?.name || '';
                        setSourceName(fallback);
                        handleSourceSelect(fallback);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white font-medium cursor-pointer"
                    >
                      &larr; Select from List
                    </button>
                  )}
                </div>

                {!isCustomSource ? (
                  <select
                    value={sourceName}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsCustomSource(true);
                        setSourceName('');
                      } else {
                        handleSourceSelect(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-amber-500 cursor-pointer shadow-inner"
                    required
                  >
                    <option value="" disabled>-- Select a Referral Source / Partner --</option>
                    {availableSources.map((src) => (
                      <option key={src.id} value={src.name} className="bg-[#182234] text-white">
                        {src.name} {src.percentage ? `(${src.percentage}% Commission)` : ''} {src.country ? `• ${src.country}` : ''}
                      </option>
                    ))}
                    <option value="__NEW__" className="bg-[#182234] text-amber-400 font-bold">
                      + Enter New / Other Source Partner...
                    </option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      autoFocus
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g. Nexus Lead Capital Ltd"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-amber-500/70 text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Type the legal organization or partner entity name.
                    </span>
                  </div>
                )}

                {/* Selected Source Helper Card */}
                {(() => {
                  const selectedSourceObj = availableSources.find(s => s.name === sourceName);
                  if (!selectedSourceObj) return null;
                  const selProj = projects.find(p => p.id === targetProjectId);
                  const projTcv = selProj?.totalContractValue || 0;
                  const rate = selectedSourceObj.percentage || 10;
                  const estFee = Math.round(projTcv * (rate / 100));

                  return (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{selectedSourceObj.name}</span>
                        <span className="text-[11px] text-amber-400/90">
                          {rate}% standard commission rate {selectedSourceObj.country ? `&bull; ${selectedSourceObj.country}` : ''}
                        </span>
                      </div>
                      {projTcv > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-mono">Suggested Fee</span>
                          <span className="font-mono font-bold text-white"> Rs {estFee.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">({rate}% of ${projTcv.toLocaleString()})</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {modalType === 'PERCENTAGE' && (
              <div className="space-y-3">
                {employeePayoutType === 'PERCENTAGE' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Percentage-Based Employee / Partner *
                      </label>
                      <select
                        value={contractorId}
                        onChange={(e) => handleContractorChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                        required
                      >
                        {percentageUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Percentage Computation Helper Card */}
                    {(() => {
                      const selUser = users.find(u => u.id === contractorId) || percentageUsers[0];
                      const selProj = projects.find(p => p.id === targetProjectId) || projects[0];
                      const tcv = Number(selProj?.totalContractValue || 0);
                      const pct = Number(selUser?.percentage || 15.0);
                      const totalShare = Math.round(tcv * (pct / 100));

                      return (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{selUser?.name}</span>
                            <span className="text-[11px] text-purple-400">{pct}% Share on {selProj?.name || 'Project'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Project Share</span>
                            <span className="font-mono font-bold text-white"> Rs {totalShare.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Deliverable / Task Scope *
                      </label>
                      <input
                        type="text"
                        value={deliverableTitle}
                        onChange={(e) => setDeliverableTitle(e.target.value)}
                        placeholder="e.g. Phase 1: High-Frequency Architecture Milestone"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Salaried Employee / Staff *
                      </label>
                      <select
                        value={contractorId}
                        onChange={(e) => handleContractorChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                        required
                      >
                        {salariedUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Salaried Staff Helper Card */}
                    {(() => {
                      const selUser = users.find(u => u.id === contractorId) || salariedUsers[0];
                      const defSal = selUser?.role === 'SUPER_ADMIN' ? 180000 : selUser?.role === 'PROJECT_MANAGER' ? 135000 : 120000;
                      const annSal = (selUser?.salary !== undefined && selUser?.salary !== null && !isNaN(Number(selUser.salary))) ? Number(selUser.salary) : defSal;
                      const moSal = Math.round(annSal / 12);

                      return (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{selUser?.name}</span>
                            <span className="text-[11px] text-emerald-400">
                              {selUser?.title || selUser?.role} &bull; {selUser?.department || 'Engineering'} &bull; {selUser?.workMode || 'ONSITE'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-mono">Monthly Base Salary</span>
                            <span className="font-mono font-bold text-white"> Rs {moSal.toLocaleString()}/mo</span>
                            <span className="text-[10px] text-slate-400 block font-mono">(${annSal.toLocaleString()}/yr)</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                            Payroll Month *
                          </label>
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            📅 Select disbursement month
                          </span>
                        </div>
                        <select
                          value={payrollMonth}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPayrollMonth(val);
                            const mObj = availableMonths.find(m => (m.id || m.value) === val);
                            const mLabel = mObj?.label || val;
                            setDeliverableTitle(`Monthly Payroll (${mLabel})`);
                            setPaymentDate(`${val}-28`);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                          required
                        >
                          {availableMonths
                            .filter(m => (m.id || m.value) !== 'ALL')
                            .map((m) => (
                              <option key={m.id || m.value} value={m.id || m.value} className="bg-[#182234] text-white">
                                📅 {m.label}
                              </option>
                            ))}
                        </select>

                        {/* Quick Month Select Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500 mr-0.5">Quick:</span>
                          {availableMonths
                            .filter(m => (m.id || m.value) !== 'ALL')
                            .slice(0, 4)
                            .map((m) => {
                              const mVal = m.id || m.value;
                              const isSelected = payrollMonth === mVal;
                              return (
                                <button
                                  key={mVal}
                                  type="button"
                                  onClick={() => {
                                    setPayrollMonth(mVal);
                                    setDeliverableTitle(`Monthly Payroll (${m.label})`);
                                    setPaymentDate(`${mVal}-28`);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${isSelected
                                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/60'
                                    }`}
                                >
                                  {m.label.replace(' (Current Month)', '')}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {modalType === 'EXPENSE' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Expense Category *
                </label>

                {!isAddingNewCategory ? (
                  <select
                    value={expenseCategory}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsAddingNewCategory(true);
                      } else {
                        setExpenseCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                  >
                    {expenseCategories.length === 0 && (
                      <option value="" disabled className="bg-[#182234] text-slate-400">
                        -- No categories created yet --
                      </option>
                    )}
                    {expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-[#182234]">
                        {cat.name}
                      </option>
                    ))}
                    <option value="__NEW__" className="bg-[#182234] text-rose-400 font-bold">
                      + Add New Category...
                    </option>
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-[#0b1329] border border-rose-500/40 space-y-2.5 animate-fadeIn shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Create New Expense Category
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryError('');
                        }}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    {newCategoryError && (
                      <p className="text-[11px] text-rose-400 font-medium">{newCategoryError}</p>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          if (newCategoryError) setNewCategoryError('');
                        }}
                        placeholder="e.g. Legal & IP Filings"
                        className="w-full px-3 py-2 rounded-lg bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveInlineCategory();
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        placeholder="e.g. Trademark registrations and legal compliance overhead"
                        className="w-full px-3 py-2 rounded-lg bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveInlineCategory();
                          }
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(false);
                          setNewCategoryError('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveInlineCategory}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save & Select Category
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vendor / Payee Field for Direct Expense */}
            {modalType === 'EXPENSE' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Vendor / Payee Name *
                </label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. AWS Cloud, Confluent Kafka, Supabase, Twilio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                  required
                />
              </div>
            )}

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Transaction Amount (Rs) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-emerald-400 select-none">Rs</span>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  max={modalType === 'INVOICE' && invoiceRemainingCap > 0 ? invoiceRemainingCap : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={modalType === 'INVOICE' && invoiceRemainingCap > 0 ? `Max Rs ${invoiceRemainingCap.toLocaleString()}` : "e.g. 12001"}
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#182234] border text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none transition-colors ${isInvoiceExceedingCap
                    ? 'border-rose-500 text-rose-600 dark:text-rose-300 focus:border-rose-500'
                    : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  required
                />
              </div>

              {/* Realtime cap validation feedback */}
              {modalType === 'INVOICE' && isInvoiceExceedingCap && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-sm animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-rose-900 dark:text-rose-200">
                      Invoice Amount Exceeds Project Contract Cap!
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
                      Entering <span className="font-mono font-bold text-rose-950 dark:text-white"> Rs {invoiceAmountNum.toLocaleString()}</span> exceeds the remaining invoicable cap of <span className="font-mono font-bold text-rose-950 dark:text-white"> Rs {invoiceRemainingCap.toLocaleString()}</span> by <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400"> Rs {(invoiceAmountNum - invoiceRemainingCap).toLocaleString()}</span>. Total project contract value is <span className="font-mono font-bold text-rose-950 dark:text-white"> Rs {invoiceProjTcv.toLocaleString()}</span>.
                    </p>
                  </div>
                </div>
              )}

              {modalType === 'INVOICE' && invoiceAmountNum > 0 && !isInvoiceExceedingCap && !isFullyInvoiced && (
                <div className="mt-2 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Projected cumulative total after invoice:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400"> Rs {(invoiceProjAlreadyInvoiced + invoiceAmountNum).toLocaleString()} / Rs {invoiceProjTcv.toLocaleString()} ({invoiceProjTcv > 0 ? Math.round(((invoiceProjAlreadyInvoiced + invoiceAmountNum) / invoiceProjTcv) * 100) : 0}%)
                  </span>
                </div>
              )}

              {/* Presets for Salaried and Percentage Payouts */}
              {modalType === 'PERCENTAGE' && employeePayoutType === 'SALARIED' && (() => {
                const selUser = users.find(u => u.id === contractorId) || salariedUsers[0];
                const defSal = selUser?.role === 'SUPER_ADMIN' ? 180000 : selUser?.role === 'PROJECT_MANAGER' ? 135000 : 120000;
                const annSal = (selUser?.salary !== undefined && selUser?.salary !== null && !isNaN(Number(selUser.salary))) ? Number(selUser.salary) : defSal;
                const moSal = Math.round(annSal / 12);
                return (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Monthly Base:</span>
                    <button
                      type="button"
                      onClick={() => setAmount(String(moSal))}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                    >
                      Set to Rs {moSal.toLocaleString()}
                    </button>
                  </div>
                );
              })()}

              {modalType === 'PERCENTAGE' && employeePayoutType === 'PERCENTAGE' && (() => {
                const selUser = users.find(u => u.id === contractorId) || percentageUsers[0];
                const selProj = projects.find(p => p.id === targetProjectId) || projects[0];
                const tcv = Number(selProj?.totalContractValue || 0);
                const pct = Number(selUser?.percentage || 15.0);
                const totalShare = Math.round(tcv * (pct / 100));
                const halfShare = Math.round(totalShare / 2);
                return (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400">Quick Share Presets:</span>
                    {halfShare > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(halfShare))}
                        className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        50% Milestone (Rs {halfShare.toLocaleString()})
                      </button>
                    )}
                    {totalShare > 0 && (
                      <button
                        type="button"
                        onClick={() => setAmount(String(totalShare))}
                        className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        Full Share (Rs {totalShare.toLocaleString()})
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Date & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={modalType === 'INVOICE' ? issueDate : paymentDate}
                  onChange={(e) => {
                    setPaymentDate(e.target.value);
                    setIssueDate(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Channel / Reference #
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. WIRE-88412 or ACH"
                  className="w-full px-3 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Ledger Notes & Governance Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional audit notes or memo..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalType === 'INVOICE' && (isInvoiceExceedingCap || isFullyInvoiced)}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${modalType === 'INVOICE' && (isInvoiceExceedingCap || isFullyInvoiced)
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Save Record
              </button>
            </div>

          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 7. PRINTABLE FINANCIAL VOUCHER & STATEMENT MODAL                           */}
      {/* ========================================================================= */}
      {printRecord && (() => {
        const meta = getDocumentMeta(printRecord);
        if (!meta) return null;

        const isSidebarCollapsed = typeof window !== 'undefined' && localStorage.getItem('sidebar_collapsed') === 'true';

        const voucherModal = (
          <div className="fixed inset-0 z-40 overflow-y-auto custom-scrollbar">
            {/* Backdrop Layer */}
            <div
              className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-fadeIn no-print"
              onClick={() => setPrintRecord(null)}
            />

            {/* Viewport Centering Container (offset for visible sidebar & header) */}
            <div className={`min-h-screen w-full flex items-center justify-center p-3 sm:p-5 pt-20 pb-8 ${isSidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-60'}`}>
              {/* Modal Container */}
              <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 animate-scaleUp my-auto">

                {/* Screen Modal Header Toolbar (Hidden when printed) */}
                <div className="shrink-0 p-4 border-b border-slate-800 flex items-center justify-between bg-[#182234] no-print">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Print Financial Document</h3>
                      <p className="text-[11px] text-slate-400">Official verified voucher & settlement statement</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => printElement('printable-voucher', 'Lincoz_Voucher')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                    </button>
                    <button
                      onClick={() => setPrintRecord(null)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Printable Document Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 font-sans custom-scrollbar" id="printable-voucher">

                  {/* Document Header */}
                  <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-sm">
                          L
                        </div>
                        <div>
                          <span className="text-lg font-black tracking-tight text-slate-900">LINCOZ PLATFORM</span>
                          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold">FINANCE</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1.5">
                        Enterprise Project Management & Financial Settlement Ledger
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Corporate Ref: LCZ-CORP-2026 &bull; Governance & Audit Division
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-block px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                        {meta.tag}
                      </span>
                      <h2 className="text-sm font-black text-slate-900 mt-1">{meta.title}</h2>
                      <p className="text-xs font-mono font-bold text-indigo-700 mt-0.5">Doc #: {meta.refNo}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Date: {meta.date}</p>
                    </div>
                  </div>

                  {/* Primary Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-200 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Project</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{meta.project}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{meta.partyLabel}</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">{meta.partyName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Channel / Method</span>
                      <span className="font-medium text-slate-800 mt-0.5 block font-mono">{meta.channel}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Ledger Status</span>
                      <span className="font-bold text-emerald-700 mt-0.5 inline-block font-mono">
                        &bull; {meta.status}
                      </span>
                    </div>
                  </div>

                  {/* Line Item Particulars Table */}
                  <div className="py-5 border-b border-slate-200">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Transaction Particulars & Scope
                    </h4>
                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-50 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Description / Line Item Scope</th>
                          <th className="p-3 text-right">Settlement Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{meta.title}</p>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{meta.notes}</p>
                            {meta.deliverable && (
                              <p className="text-[11px] text-slate-700 mt-1">
                                <strong>Deliverable Scope:</strong> {meta.deliverable}
                              </p>
                            )}
                            {meta.agreementMeta && (
                              <p className="text-[10px] text-purple-700 font-mono mt-1 font-semibold">
                                Agreement Model: {meta.agreementMeta}
                              </p>
                            )}
                            {meta.dueDate && (
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                Payment Due Date: {meta.dueDate}
                              </p>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-base text-slate-900 whitespace-nowrap align-top"> Rs {meta.amount.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300">
                        <tr>
                          <td className="p-3 text-right uppercase text-[10px] tracking-wider text-slate-600">Total Transaction Amount:</td>
                          <td className="p-3 text-right font-mono text-lg text-slate-900"> Rs {meta.amount.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Verification & Sign-off Footer */}
                  <div className="pt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500 font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-700">Audit Verification Seal:</span>
                        <p className="text-[10px] text-slate-400">TX-HASH: {meta.refNo}-VERIFIED</p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-emerald-700 font-bold">&bull; Verified by Super Admin</span>
                        <p className="text-[10px] text-slate-400">Immutable Corporate Ledger Record</p>
                      </div>
                    </div>

                    {/* Dual Signature Blocks */}
                    <div className="grid grid-cols-2 gap-8 pt-4">
                      <div className="border-t border-slate-400 pt-2 text-center">
                        <p className="text-xs font-bold text-slate-900">{meta.signatoryTitle}</p>
                        <p className="text-[10px] text-slate-500">Lincoz Financial Authority</p>
                      </div>
                      <div className="border-t border-slate-400 pt-2 text-center">
                        <p className="text-xs font-bold text-slate-900">Beneficiary / Counterparty</p>
                        <p className="text-[10px] text-slate-500">Authorized Acknowledgment</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom bar for modal (Hidden when printed) */}
                <div className="shrink-0 p-3.5 border-t border-slate-800 bg-[#182234] flex items-center justify-end gap-2 no-print">
                  <button
                    type="button"
                    onClick={() => setPrintRecord(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        );

        return typeof document !== 'undefined' ? createPortal(voucherModal, document.body) : voucherModal;
      })()}

    </div>
  );
};

