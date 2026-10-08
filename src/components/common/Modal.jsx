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
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar">
      {/* Backdrop Layer */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Natural Top-Anchored Centering Container */}
      <div className="min-h-full flex items-start justify-center p-3 sm:p-5 pt-8 sm:pt-12 md:pt-14 pb-12">
        {/* Modal Container */}
        <div className={`relative w-full ${maxWidth} max-h-[85vh] flex flex-col bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp`}>
          {/* Header */}
          <div className="shrink-0 flex items-start justify-between px-6 py-5 border-b border-slate-800 bg-[#182234]/70">
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
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
