import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  UserCheck,
  Globe,
  Phone,
  Mail,
  Percent,
  FileText,
  AlertCircle
} from 'lucide-react';

export const AddClientModal = ({ isOpen, onClose, initialCategory = 'CLIENT' }) => {
  const { createClient } = useApp();

  const [category, setCategory] = useState(initialCategory);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    contactNumber: '',
    email: '',
    percentage: '15.0',
    skills: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (category === 'FREELANCER') {
      const pct = parseFloat(formData.percentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        newErrors.percentage = 'Percentage must be between 0.0% and 100.0%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    createClient({
      category,
      name: formData.name.trim(),
      country: formData.country.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
      percentage: category === 'FREELANCER' ? parseFloat(formData.percentage) : null,
      skills: formData.skills.trim(),
      notes: formData.notes.trim()
    });

    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 overflow-y-auto custom-scrollbar animate-fadeIn">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-xl max-h-[90vh] my-auto flex flex-col bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl z-10 overflow-hidden animate-scaleUp modal-container">
        
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#182234]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#182234] border border-slate-700/80 text-indigo-400 flex items-center justify-center">
              {category === 'FREELANCER' ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <Building2 className="w-5 h-5 text-indigo-400" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Add New {category === 'FREELANCER' ? 'Source' : 'Client'}
              </h2>
              <p className="text-xs text-slate-400">
                Register a new {category === 'FREELANCER' ? 'source and project percentage share' : 'client account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Category Switcher */}
          <div className="px-6 pt-5">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#182234] border border-slate-700/80">
              <button
                type="button"
                onClick={() => { setCategory('CLIENT'); setErrors({}); }}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                  category === 'CLIENT'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
              <Building2 className="w-4 h-4" />
              Client
            </button>
            <button
              type="button"
              onClick={() => { setCategory('FREELANCER'); setErrors({}); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                category === 'FREELANCER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Source
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {category === 'FREELANCER' ? 'Source Name *' : 'Client Name *'}
              </label>
              <input
                type="text"
                placeholder={category === 'FREELANCER' ? 'e.g. David Vance' : 'e.g. Apex Banking Corp'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-[#182234] border ${
                  errors.name ? 'border-rose-500' : 'border-slate-700/80'
                } rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Country *
              </label>
              <input
                type="text"
                placeholder="e.g. United States"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`w-full bg-[#182234] border ${
                  errors.country ? 'border-rose-500' : 'border-slate-700/80'
                } rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
              />
              {errors.country && <p className="text-[11px] text-rose-400 mt-1">{errors.country}</p>}
            </div>
          </div>

          {/* Contact No & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Number *
              </label>
              <input
                type="text"
                placeholder="e.g. +1 (415) 890-2100"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className={`w-full bg-[#182234] border ${
                  errors.contactNumber ? 'border-rose-500' : 'border-slate-700/80'
                } rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
              />
              {errors.contactNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.contactNumber}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address *
              </label>
              <input
                type="email"
                placeholder={category === 'FREELANCER' ? 'source@example.com' : 'client@company.com'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-[#182234] border ${
                  errors.email ? 'border-rose-500' : 'border-slate-700/80'
                } rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
              />
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Source Percentage & Skills */}
          {category === 'FREELANCER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" /> Project Share Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="e.g. 15.0"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    className={`w-full bg-[#182234] border ${
                      errors.percentage ? 'border-rose-500' : 'border-slate-700/80'
                    } rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
                {errors.percentage && <p className="text-[11px] text-rose-400 mt-1">{errors.percentage}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Skills & Expertise
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack React, Security"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes
            </label>
            <textarea
              rows={2}
              placeholder="Contract terms, notes, or remarks..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#182234] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all"
            >
              Add {category === 'FREELANCER' ? 'Source' : 'Client'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
