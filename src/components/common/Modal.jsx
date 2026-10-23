import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto custom-scrollbar animate-fadeIn">
      {/* Backdrop Layer */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} max-h-[90vh] my-auto flex flex-col bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 animate-scaleUp modal-container`}>
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-6 py-5 border-b border-slate-800 bg-[#182234]/70 modal-header">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 modal-title">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-1 modal-subtitle">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors modal-close-btn"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
