'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export function SlideOver({ isOpen, onClose, title, subtitle, children, width = 'max-w-xl' }) {
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
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Smooth Backdrop Scrim */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
          <div
            className={cn(
              'w-screen bg-white shadow-[0_20px_50px_rgba(15,76,129,0.22)] flex flex-col transform transition-transform animate-in slide-in-from-right duration-250 sm:rounded-l-3xl border-l border-slate-200/80',
              width
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-[#FAF9FC] sm:rounded-tl-3xl">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] leading-6 tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-[#526071] font-medium mt-0.5">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-[#526071] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 bg-white">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
