'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ onSearch }) {
  const { user, role, switchPersona, availablePersonas } = useAuth();
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal);
  };

  return (
    <header className="h-16 bg-transparent px-8 flex items-center justify-between gap-6">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#526071]" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          placeholder="Search accounts, churn signals, renewals..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-full border border-slate-200/90 text-[#0F172A] placeholder-[#526071]/70 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] shadow-2xs transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* OpenRouter AI status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FA] border border-[#DDD6FE] text-[#483473] text-[11px] font-bold select-none shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#5F4B8B]" />
          <span>Nemotron-70B:free</span>
        </div>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-full bg-white border border-slate-200/90 text-[#526071] hover:text-[#0F172A] hover:bg-slate-50 transition-colors relative cursor-pointer shadow-2xs"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#FF6F61] absolute top-1.5 right-1.5 border-2 border-white shadow-xs"></span>
        </button>

        {/* Persona Switcher Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsPersonaOpen(!isPersonaOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-white border border-slate-200/90 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-[#0F4C81]/20"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-[#0F172A] leading-none">{user?.name || 'Ayush Sharma'}</p>
              <p className="text-[10px] text-[#0F4C81] font-bold mt-0.5">{role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isPersonaOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl p-2 z-50 shadow-[0_12px_32px_-6px_rgba(15,76,129,0.18)] border border-slate-200/80 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-[#526071] uppercase tracking-wider">
                  Switch Persona Role
                </p>
              </div>

              <div className="p-1 space-y-1 mt-1">
                {availablePersonas.map((pRole) => (
                  <button
                    key={pRole}
                    onClick={() => {
                      switchPersona(pRole);
                      setIsPersonaOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                      role === pRole
                        ? 'bg-[#EAF1F8] text-[#0F4C81] font-bold'
                        : 'text-[#0F172A] hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span>
                      {pRole === 'Admin' ? 'Ayush (Admin)' : pRole === 'CSM' ? 'Sarah (CSM)' : pRole === 'Support' ? 'Dave (Support)' : 'Maya (Analyst)'}
                    </span>
                    {role === pRole && <Check className="w-3.5 h-3.5 text-[#0F4C81]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
