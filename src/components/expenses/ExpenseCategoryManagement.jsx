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
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const ExpenseCategoryManagement = () => {
  const {
    expenseCategories = [],
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    directExpensesList = [],
    isSuperAdmin,
    selectedMonth,
    setSelectedMonth,
    availableMonths = []
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected Month helper
  const selectedMonthObj = availableMonths.find(m => m.id === selectedMonth) || { label: 'Current Month' };

  // Filtered direct expenses for current month
  const monthlyExpenses = directExpensesList.filter(e => {
    if (selectedMonth === 'ALL') return true;
    const expMonth = e.month || (e.expenseDate || e.date || '').slice(0, 7);
    return expMonth === selectedMonth;
  });

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
    setDescription('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Expense name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Expense description is required.');
      return;
    }

    if (editingCategory) {
      updateExpenseCategory(editingCategory.id, {
        name: name.trim(),
        description: description.trim()
      });
    } else {
      addExpenseCategory({
        name: name.trim(),
        description: description.trim()
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id, catName) => {
    const associatedCount = directExpensesList.filter(e => e.category === catName).length;
    let confirmMsg = `Are you sure you want to delete the expense category "${catName}"?`;
    if (associatedCount > 0) {
      confirmMsg += `\nNote: There are ${associatedCount} direct expense record(s) currently logged under this category.`;
    }
    if (window.confirm(confirmMsg)) {
      deleteExpenseCategory(id);
    }
  };

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return expenseCategories;
    const q = searchQuery.toLowerCase();
    return expenseCategories.filter(
      cat =>
        cat.name?.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q)
    );
  }, [expenseCategories, searchQuery]);

  // Aggregate stats (Monthly)
  const totalCategoriesCount = expenseCategories.length;
  const totalDirectExpenseSum = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalLoggedCount = monthlyExpenses.length;

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
              Define and manage project expense categories and descriptions. These categories and descriptions will be automatically available as categories and helper references when logging direct project expenses in the Pay-In & Pay-Out desk.
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

            {isSuperAdmin() && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Defined Expense Categories"
          value={totalCategoriesCount.toString()}
          subtitle="Available for direct project allocations"
          icon={Layers}
          colorScheme="rose"
          badgeText="Active"
        />
        <StatsCard
          title={`Direct Expenses (${selectedMonthObj.label})`}
          value={`$${totalDirectExpenseSum.toLocaleString()}`}
          subtitle={`${totalLoggedCount} transaction(s) in ${selectedMonthObj.label}`}
          icon={DollarSign}
          colorScheme="indigo"
        />
        <StatsCard
          title="Classification Matrix"
          value={`${filteredCategories.length} Categories`}
          subtitle="Searchable classification ledger"
          icon={Receipt}
          colorScheme="amber"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#111827] border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Expense Directory:</span>
          <span className="text-xs font-mono text-white bg-[#182234] px-2.5 py-1 rounded-lg border border-slate-700">
            {filteredCategories.length} Categories
          </span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense name or description..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Categories Row / Table Format */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30 text-rose-400" />
            <p className="text-sm font-semibold text-slate-300">No expense categories found</p>
            <p className="text-xs text-slate-500 mt-1">Try a different search or create a new expense category.</p>
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
                  const totalSpentInCategory = usageRecords.reduce((sum, e) => sum + (e.amount || 0), 0);

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-[#182234]/50 transition-colors group"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-white text-sm group-hover:text-rose-300 transition-colors">
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
                          ${totalSpentInCategory.toLocaleString()}
                        </span>
                      </td>
                      {isSuperAdmin() && (
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-1.5 rounded-lg bg-[#182234] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* Add / Edit Expense Category Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCategory ? 'Edit Expense Category' : 'Add New Expense Category'}
          subtitle="Expense categories and descriptions will be available as category options in Pay-In & Pay-Out Direct Expenses."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Expense Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cloud Infrastructure & Security"
                className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Expense Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what this expense covers (e.g., AWS / GCP compute, Kubernetes clusters, database nodes, dedicated VPC networks)..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#182234] border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                required
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                This description will be reflected under the direct expense category in the Pay-In & Pay-Out station.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30"
              >
                {editingCategory ? 'Update Expense' : 'Create Expense'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
