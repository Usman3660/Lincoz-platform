import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} bg-[#111827] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 transition-all animate-scaleUp`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800 bg-[#182234]/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
