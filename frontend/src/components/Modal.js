'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Dialog Box */}
        <div
          className={cn(
            'relative transform overflow-hidden rounded-3xl bg-white text-left shadow-[0_24px_60px_rgba(15,76,129,0.22)] transition-all w-full my-8 animate-in zoom-in-95 duration-200 border border-slate-200/80',
            maxWidth
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#FAF9FC]">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] leading-6 tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-[#526071] font-medium mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#526071] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-7 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
