import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AddClientModal } from './AddClientModal';
import { ClientDetailModal } from './ClientDetailModal';
import {
  Building2,
  UserCheck,
  Globe,
  Phone,
  Mail,
  Percent,
  Search,
  Filter,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';

export const ClientDirectory = () => {
  const { getScopedClients, projects, isSuperAdmin } = useApp();

  if (!isSuperAdmin()) {
    return (
      <div className="p-12 rounded-3xl bg-[#111827] border border-slate-800 text-center space-y-3">
        <h3 className="text-base font-bold text-white">Access Restricted</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Client and source directory details are strictly restricted to Executive Governance (Super Admin).
        </p>
      </div>
    );
  }

  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL' | 'CLIENT' | 'FREELANCER'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [sortBy, setSortBy] = useState('name_asc'); // 'name_asc' | 'name_desc' | 'pct_desc' | 'newest'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addInitialCategory, setAddInitialCategory] = useState('CLIENT');
  const [selectedClientForModal, setSelectedClientForModal] = useState(null);

  const scopedClients = getScopedClients();

  // Distinct countries list for dropdown
  const uniqueCountries = useMemo(() => {
    const set = new Set();
    scopedClients.forEach(c => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [scopedClients]);

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    return scopedClients.filter(c => {
      // Category filter
      if (activeCategory !== 'ALL' && c.category !== activeCategory) {
        return false;
      }
      // Country filter
      if (selectedCountry !== 'ALL' && c.country !== selectedCountry) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(query);
        const matchEmail = c.email?.toLowerCase().includes(query);
        const matchPhone = c.contactNumber?.toLowerCase().includes(query);
        const matchCountry = c.country?.toLowerCase().includes(query);
        const matchSkills = c.skills?.toLowerCase().includes(query);
        return matchName || matchEmail || matchPhone || matchCountry || matchSkills;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'pct_desc') {
        const pctA = a.percentage !== null && a.percentage !== undefined ? a.percentage : -1;
        const pctB = b.percentage !== null && b.percentage !== undefined ? b.percentage : -1;
        return pctB - pctA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });
  }, [scopedClients, activeCategory, selectedCountry, searchQuery, sortBy]);

  // Directory Statistics
  const stats = useMemo(() => {
    const total = scopedClients.length;
    const clientCount = scopedClients.filter(c => c.category === 'CLIENT').length;
    const freelancerCount = scopedClients.filter(c => c.category === 'FREELANCER').length;

    const freelancers = scopedClients.filter(c => c.category === 'FREELANCER' && typeof c.percentage === 'number');
    const avgPct = freelancers.length > 0
      ? (freelancers.reduce((sum, f) => sum + f.percentage, 0) / freelancers.length).toFixed(1)
      : '0.0';

    return { total, clientCount, freelancerCount, avgPct };
  }, [scopedClients]);

  const openAddModal = (cat = 'CLIENT') => {
    setAddInitialCategory(cat);
    setIsAddModalOpen(true);
  };

  const categoryChips = [
    { id: 'ALL', label: `All Directory (Rs {stats.total})` },
    { id: 'CLIENT', label: `Clients (Rs {stats.clientCount})` },
    { id: 'FREELANCER', label: `Sources (Rs {stats.freelancerCount})` }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-400" />
            Clients & Sources Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of enterprise clients, external sources, and commission percentage agreements.
          </p>
        </div>

        {isSuperAdmin() && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal('CLIENT')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#182234] hover:bg-slate-700/60 text-white text-xs font-semibold border border-slate-700 transition-all shadow-sm shrink-0"
            >
              <Building2 className="w-4 h-4 text-indigo-400" /> + Add Client
            </button>

          </div>
        )}
      </div>

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#182234] border border-slate-700/80 text-slate-300 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corporate Clients</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.clientCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#182234] border border-slate-700/80 text-indigo-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sources</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.freelancerCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#182234] border border-slate-700/80 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Commission %</p>
            <p className="text-2xl font-bold text-white mt-0.5">{stats.avgPct}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#182234] border border-slate-700/80 text-slate-300 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filter and Category Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categoryChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveCategory(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${activeCategory === chip.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-[#182234] text-slate-400 hover:text-white border border-slate-700/80'
                }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search & Country & Sort Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#182234] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-[#182234] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            <option value="ALL">All Countries</option>
            {uniqueCountries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#182234] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="pct_desc">Highest Commission %</option>
            <option value="newest">Recently Added</option>
          </select>

        </div>

      </div>

      {/* Directory List Table */}
      {filteredClients.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111827] border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#182234] text-slate-400 flex items-center justify-center mx-auto border border-slate-700/80">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No clients or freelancers matched your search and filter criteria.
          </p>
          {isSuperAdmin() && (
            <button
              onClick={() => openAddModal(activeCategory === 'FREELANCER' ? 'FREELANCER' : 'CLIENT')}
              className="mt-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#182234]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Name & Country</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Project Share</th>
                  <th className="py-3 px-4">Active Projects</th>
                  <th className="py-3 px-4">Completed Value</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredClients.map((item) => {
                  const isFreelancer = item.category === 'FREELANCER';
                  const associatedProjectObjs = (projects || []).filter(p => (item.associatedProjects || []).includes(p.id));
                  const totalCompletedValue = associatedProjectObjs
                    .filter(p => p.status?.toUpperCase() === 'COMPLETED')
                    .reduce((sum, p) => sum + (Number(p.totalContractValue) || 0), 0);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedClientForModal(item)}
                      className="hover:bg-[#182234]/50 transition-colors cursor-pointer group"
                    >
                      {/* Name & Country */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#182234] border border-slate-700/80 flex items-center justify-center shrink-0">
                            {isFreelancer ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <Building2 className="w-4 h-4 text-indigo-400" />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white group-hover:text-indigo-300 transition-colors block truncate max-w-[220px]">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                              {item.country}
                            </span>
                            {item.skills && (
                              <p className="text-[10px] text-slate-400 truncate max-w-[220px] mt-0.5">
                                <span className="text-slate-500 font-medium">Skills:</span> {item.skills}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isFreelancer
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isFreelancer ? 'bg-emerald-400' : 'bg-indigo-400'}`}></span>
                          {isFreelancer ? 'Source' : 'Client'}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-200">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.contactNumber}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{item.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Project Share % */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isFreelancer ? (
                          <div className="flex items-center gap-1 font-mono">
                            <Percent className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">
                              {item.percentage !== null && item.percentage !== undefined ? item.percentage : 0.0}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Linked Projects */}
                      <td className="py-3 px-4 max-w-xs">
                        {associatedProjectObjs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {associatedProjectObjs.slice(0, 2).map(p => (
                              <span
                                key={p.id}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-[#182234] border border-slate-700/80 text-slate-300 truncate max-w-[130px]"
                              >
                                {p.name}
                              </span>
                            ))}
                            {associatedProjectObjs.length > 2 && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-[#182234] text-slate-400 border border-slate-700/60">
                                +{associatedProjectObjs.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs italic">None</span>
                        )}
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className="font-bold text-white text-xs"> Rs {totalCompletedValue.toLocaleString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClientForModal(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#182234] hover:bg-slate-700 text-xs font-semibold text-indigo-300 hover:text-white border border-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Client / Freelancer Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialCategory={addInitialCategory}
      />

      {/* Detail / Edit Modal */}
      {selectedClientForModal && (
        <ClientDetailModal
          isOpen={!!selectedClientForModal}
          onClose={() => setSelectedClientForModal(null)}
          client={selectedClientForModal}
        />
      )}

    </div>
  );
};
