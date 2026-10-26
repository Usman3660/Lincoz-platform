import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatsCard } from '../common/StatsCard';
import { Modal } from '../common/Modal';
import {
  Receipt,
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  Banknote,
  AlertCircle,
  Calendar,
  Tag,
  CheckCircle2
} from 'lucide-react';

export const ExpenseCategoryManagement = () => {
  const {
    expenseCategories = [],
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    directExpensesList = [],
    addDirectExpense,
    deleteTransaction,
    isSuperAdmin,
    selectedMonth,
    setSelectedMonth,
    availableMonths = []
  } = useApp();

  // Active view: 'EXPENSES' (Direct Expenses Ledger) or 'CATEGORIES' (Category Management)
  const [activeSubTab, setActiveSubTab] = useState('EXPENSES');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Category Form state
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catErrorMsg, setCatErrorMsg] = useState('');

  // Direct Expense Form state (Only the 4 requested fields)
  const todayStr = new Date().toISOString().split('T')[0];
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayStr);
  const [expenseMonth, setExpenseMonth] = useState(selectedMonth !== 'ALL' ? selectedMonth : todayStr.slice(0, 7));
  const [expenseErrorMsg, setExpenseErrorMsg] = useState('');

  // Selected Month helper
  const selectedMonthObj = availableMonths.find(m => m.id === selectedMonth) || { label: 'Current Month' };

  // Filtered direct expenses for current month
  const monthlyExpenses = useMemo(() => {
    return directExpensesList.filter(e => {
      if (selectedMonth === 'ALL') return true;
      const expMonth = e.month || (e.expenseDate || e.date || '').slice(0, 7);
      return expMonth === selectedMonth;
    });
  }, [directExpensesList, selectedMonth]);

  // Search/Filter direct expenses
  const filteredExpenses = useMemo(() => {
    return monthlyExpenses.filter(e => {
      // Category filter
      if (filterCategory !== 'ALL' && e.category !== filterCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCat = (e.category || '').toLowerCase().includes(q);
        const matchesDate = (e.expenseDate || e.date || '').includes(q);
        const matchesMonth = (e.month || '').includes(q);
        const matchesAmount = (e.amount?.toString() || '').includes(q);
        return matchesCat || matchesDate || matchesMonth || matchesAmount;
      }
      return true;
    });
  }, [monthlyExpenses, filterCategory, searchQuery]);

  // Search categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return expenseCategories;
    const q = searchQuery.toLowerCase();
    return expenseCategories.filter(
      cat =>
        cat.name?.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q)
    );
  }, [expenseCategories, searchQuery]);

  // Aggregated KPIs
  const totalDirectExpenseSum = monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalLoggedCount = monthlyExpenses.length;
  const avgExpense = totalLoggedCount > 0 ? Math.round(totalDirectExpenseSum / totalLoggedCount) : 0;
  const totalCategoriesCount = expenseCategories.length;

  // Most spent category in selected month
  const categorySpendingMap = useMemo(() => {
    const map = {};
    monthlyExpenses.forEach(e => {
      const cat = e.category || 'General';
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0);
    });
    return map;
  }, [monthlyExpenses]);

  const topCategory = useMemo(() => {
    let topName = 'N/A';
    let topAmt = 0;
    Object.entries(categorySpendingMap).forEach(([name, amt]) => {
      if (amt > topAmt) {
        topAmt = amt;
        topName = name;
      }
    });
    return { name: topName, amount: topAmt };
  }, [categorySpendingMap]);

  // --- Category Modal Handlers ---
  const handleOpenCreateCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setCatErrorMsg('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatErrorMsg('');
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCatName('');
    setCatDescription('');
    setCatErrorMsg('');
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatErrorMsg('Category name is required.');
      return;
    }
    if (!catDescription.trim()) {
      setCatErrorMsg('Category description is required.');
      return;
    }

    if (editingCategory) {
      updateExpenseCategory(editingCategory.id, {
        name: catName.trim(),
        description: catDescription.trim()
      });
    } else {
      addExpenseCategory({
        name: catName.trim(),
        description: catDescription.trim()
      });
    }

    handleCloseCategoryModal();
  };

  const handleDeleteCategory = (id, cName) => {
    const associatedCount = directExpensesList.filter(e => e.category === cName).length;
    let confirmMsg = `Are you sure you want to delete the expense category "${cName}"?`;
    if (associatedCount > 0) {
      confirmMsg += `\nWarning: There are ${associatedCount} direct expense record(s) currently logged under this category.`;
    }
    if (window.confirm(confirmMsg)) {
      deleteExpenseCategory(id);
    }
  };

  // --- Expense Entry Modal Handlers (Strictly 4 fields) ---
  const handleOpenExpenseModal = () => {
    const defaultCat = expenseCategories[0]?.name || 'General Operations';
    setExpenseAmount('');
    setExpenseCategory(defaultCat);
    setExpenseDate(todayStr);
    setExpenseMonth(selectedMonth !== 'ALL' ? selectedMonth : todayStr.slice(0, 7));
    setExpenseErrorMsg('');
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setExpenseErrorMsg('');
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(expenseAmount);
    if (!numAmount || numAmount <= 0) {
      setExpenseErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!expenseCategory.trim()) {
      setExpenseErrorMsg('Please select an expense category.');
      return;
    }
    if (!expenseDate) {
      setExpenseErrorMsg('Please select an expense date.');
      return;
    }

    const targetMonth = expenseMonth || expenseDate.slice(0, 7) || (selectedMonth !== 'ALL' ? selectedMonth : todayStr.slice(0, 7));

    addDirectExpense({
      amount: numAmount,
      category: expenseCategory,
      expenseDate: expenseDate,
      date: expenseDate,
      month: targetMonth,
      projectId: 'GENERAL',
      projectName: 'General Operations',
      vendor: expenseCategory,
      receiptRef: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `${expenseCategory} Expense for ${targetMonth}`
    });

    // Auto align month filter if logged for another month
    if (targetMonth && selectedMonth !== 'ALL' && selectedMonth !== targetMonth) {
      setSelectedMonth(targetMonth);
    }

    // Ensure we are viewing the expenses tab
    setActiveSubTab('EXPENSES');
    handleCloseExpenseModal();
  };

  const handleDeleteExpense = (exp) => {
    const formattedAmt = Number(exp.amount || 0).toLocaleString();
    if (window.confirm(`Are you sure you want to delete this expense of Rs ${formattedAmt} (${exp.category})?`)) {
      deleteTransaction('DIRECT_EXPENSE', exp.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Header */}
      <div className="dashboard-hero-banner expenses-banner p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-[#111827] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Receipt className="w-3.5 h-3.5" /> Project Cost Governance • {selectedMonthObj.label}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Expenses
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
              Record and manage operational expenses and categories with simple ledger tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Month Selector */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111827] border border-rose-500/40 shadow-inner">
              <Receipt className="w-3.5 h-3.5 text-rose-400 shrink-0" />
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

            {/* Primary Action: Enter Expense */}
            <button
              onClick={handleOpenExpenseModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Enter Expense
            </button>

            {/* Secondary Action: Add Category */}
            {isSuperAdmin() && (
              <button
                onClick={handleOpenCreateCategoryModal}
                className="px-3.5 py-2.5 rounded-xl bg-[#182234] hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Add Category
              </button>
            )}
          </div>
        </div>

        {/* Sub-tab Navigation Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => { setActiveSubTab('EXPENSES'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'EXPENSES'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-[#182234]/70 text-slate-400 hover:text-white hover:bg-[#182234]'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Expenses</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'EXPENSES' ? 'bg-black/30 text-rose-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {monthlyExpenses.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveSubTab('CATEGORIES'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'CATEGORIES'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-[#182234]/70 text-slate-400 hover:text-white hover:bg-[#182234]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'CATEGORIES' ? 'bg-black/30 text-indigo-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {expenseCategories.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={`Total Expenses (${selectedMonthObj.label})`}
          value={`Rs ${totalDirectExpenseSum.toLocaleString()}`}
          subtitle={`${totalLoggedCount} direct transaction(s)`}
          icon={Banknote}
          colorScheme="rose"
        />
        <StatsCard
          title="Active Categories"
          value={totalCategoriesCount.toString()}
          subtitle="Configured spend categories"
          icon={Layers}
          colorScheme="indigo"
          badgeText="Active"
        />
        <StatsCard
          title="Average Ticket"
          value={`Rs ${avgExpense.toLocaleString()}`}
          subtitle="Per direct expense entry"
          icon={Receipt}
          colorScheme="amber"
        />
        <StatsCard
          title="Top Category Spend"
          value={topCategory.amount > 0 ? `Rs ${topCategory.amount.toLocaleString()}` : 'Rs 0'}
          subtitle={topCategory.name}
          icon={Tag}
          colorScheme="emerald"
        />
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: EXPENSES LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'EXPENSES' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-400">Category:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#182234] border border-slate-700 text-xs font-semibold text-white px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-rose-500"
                >
                  <option value="ALL">All Categories</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {(filterCategory !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => { setFilterCategory('ALL'); setSearchQuery(''); }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 underline underline-offset-2"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expense category or amount..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                onClick={handleOpenExpenseModal}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Enter Expense
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            {filteredExpenses.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Banknote className="w-12 h-12 mx-auto mb-3 opacity-30 text-rose-400" />
                <p className="text-base font-semibold text-slate-300">No expenses recorded for this selection</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  {searchQuery || filterCategory !== 'ALL'
                    ? 'No expense matches your active filters. Try clearing filters or search term.'
                    : `No direct operational expenses have been logged for ${selectedMonthObj.label}. Click below to enter your first expense.`}
                </p>
                <button
                  onClick={handleOpenExpenseModal}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  <Plus className="w-4 h-4" /> Enter Expense
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#182234]/70 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4 font-semibold whitespace-nowrap">Expense Date</th>
                      <th className="p-4 font-semibold whitespace-nowrap">Billing Month</th>
                      <th className="p-4 font-semibold">Expense Category</th>
                      <th className="p-4 font-semibold text-right whitespace-nowrap">Amount (Rs)</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredExpenses.map((exp) => {
                      const expDateDisplay = exp.expenseDate || exp.date || 'N/A';
                      const expMonthDisplay = exp.month || expDateDisplay.slice(0, 7) || 'N/A';
                      const expAmt = Number(exp.amount) || 0;

                      return (
                        <tr
                          key={exp.id}
                          className="hover:bg-[#182234]/50 transition-colors group"
                        >
                          {/* Expense Date */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {expDateDisplay}
                            </span>
                          </td>

                          {/* Billing Month */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded-lg border border-slate-700/60">
                              {expMonthDisplay}
                            </span>
                          </td>

                          {/* Expense Category */}
                          <td className="p-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              <Tag className="w-3 h-3 text-rose-400" />
                              {exp.category}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="p-4 text-right whitespace-nowrap font-mono">
                            <span className="text-sm font-bold text-rose-400">
                              Rs {expAmt.toLocaleString()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteExpense(exp)}
                              className="p-1.5 rounded-lg bg-[#182234] hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Expense Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: EXPENSE CATEGORIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'CATEGORIES' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Expense Directory:</span>
              <span className="text-xs font-mono text-white bg-[#182234] px-2.5 py-1 rounded-lg border border-slate-700">
                {filteredCategories.length} Categories
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expense category or description..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {isSuperAdmin() && (
                <button
                  onClick={handleOpenCreateCategoryModal}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category
                </button>
              )}
            </div>
          </div>

          {/* Categories Table */}
          <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
            {filteredCategories.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30 text-indigo-400" />
                <p className="text-sm font-semibold text-slate-300">No expense categories found</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  {searchQuery ? 'Try a different search query or clear your filter.' : 'Your category directory is empty. Click "+ Add Category" to create your first category.'}
                </p>
                {isSuperAdmin() && (
                  <button
                    onClick={handleOpenCreateCategoryModal}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Plus className="w-4 h-4" /> Add Category
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#182234]/70 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-4 font-semibold">Category Name</th>
                      <th className="p-4 font-semibold">Description & Scope</th>
                      <th className="p-4 font-semibold text-center whitespace-nowrap">Usage ({selectedMonthObj.label})</th>
                      <th className="p-4 font-semibold text-right whitespace-nowrap">Monthly Spend</th>
                      {isSuperAdmin() && <th className="p-4 font-semibold text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredCategories.map((cat) => {
                      const usageRecords = monthlyExpenses.filter(e => e.category === cat.name);
                      const totalSpentInCategory = usageRecords.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                      return (
                        <tr
                          key={cat.id}
                          className="hover:bg-[#182234]/50 transition-colors group"
                        >
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                <Layers className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                                {cat.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 max-w-md">
                            <p className="text-xs text-slate-300 leading-relaxed font-normal">
                              {cat.description || <span className="text-slate-500 italic">No description provided</span>}
                            </p>
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                              <strong className="text-white font-bold">{usageRecords.length}</strong> logged
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap font-mono">
                            <span className="text-sm font-bold text-rose-400">
                              Rs {totalSpentInCategory.toLocaleString()}
                            </span>
                          </td>
                          {isSuperAdmin() && (
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditCategoryModal(cat)}
                                  className="p-1.5 rounded-lg bg-[#182234] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                  title="Edit Category"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  className="p-1.5 rounded-lg bg-[#182234] hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ENTER DIRECT EXPENSE (STRICTLY THE 4 REQUESTED FIELDS) */}
      {/* ========================================================================= */}
      {isExpenseModalOpen && (
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={handleCloseExpenseModal}
          title="Enter Expense"
          subtitle="Record a direct operational expense."
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleExpenseSubmit} className="space-y-5">
            {expenseErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{expenseErrorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* AMOUNT (RS) * */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Amount (Rs) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                    Rs
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* EXPENSE CATEGORY * */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Expense Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  required
                >
                  {expenseCategories.length === 0 ? (
                    <option value="General Operations">General Operations</option>
                  ) : (
                    expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.name} className="bg-[#182234] text-white">
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* EXPENSE DATE * */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Expense Date *
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => {
                    setExpenseDate(e.target.value);
                    if (e.target.value) {
                      setExpenseMonth(e.target.value.slice(0, 7));
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  required
                />
              </div>

              {/* BILLING MONTH */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Billing Month
                </label>
                <select
                  value={expenseMonth}
                  onChange={(e) => setExpenseMonth(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs font-medium text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {availableMonths.filter(m => m.id !== 'ALL').map(m => (
                    <option key={m.id} value={m.id} className="bg-[#182234] text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseExpenseModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Expense
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT EXPENSE CATEGORY */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          title={editingCategory ? 'Edit Expense Category' : 'Add New Expense Category'}
          subtitle="Define categories that organize direct operational expenses."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            {catErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{catErrorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g., Electricity, Internet, Cloud Servers"
                className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category Description *
              </label>
              <textarea
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                rows={4}
                placeholder="Describe what expenses this category covers..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
