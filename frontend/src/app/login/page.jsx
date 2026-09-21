'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Zap, Shield, Sparkles, UserCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchPersona, login } = useAuth();
  const [email, setEmail] = useState('admin@subscriptiq.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const personas = [
    {
      role: 'Admin',
      name: 'Ayush Sharma',
      email: 'admin@subscriptiq.io',
      desc: 'Full configuration, user roles, plan management & risk overrides',
      color: 'border-rose-200/80 hover:border-[#D0272B] bg-[#FDF0F0]/70',
      badge: 'bg-[#FDF0F0] text-[#B01E22] border border-[#FECACA]',
    },
    {
      role: 'CSM',
      name: 'Sarah Connor',
      email: 'sarah@subscriptiq.io',
      desc: 'Renewal pipeline, AI risk explanations, client outreach review',
      color: 'border-[#B8D5E5] hover:border-[#0F4C81] bg-[#EAF1F8]/70',
      badge: 'bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]',
    },
    {
      role: 'Support',
      name: 'Dave Miller',
      email: 'dave@subscriptiq.io',
      desc: 'Ticket logging, sentiment tagging, customer support notes',
      color: 'border-amber-200/80 hover:border-[#D97706] bg-[#FFF8E6]/70',
      badge: 'bg-[#FFF8E6] text-[#874700] border border-[#FDE68A]',
    },
    {
      role: 'Analyst',
      name: 'Maya Patel',
      email: 'maya@subscriptiq.io',
      desc: 'Read-only analytics, retention dashboard, cohort reporting & CSV export',
      color: 'border-emerald-200/80 hover:border-[#00875A] bg-[#E6F7F1]/70',
      badge: 'bg-[#E6F7F1] text-[#006644] border border-[#99E3D0]',
    },
  ];

  const handlePersonaSelect = async (roleName) => {
    await switchPersona(roleName);
    router.push('/dashboard');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#0F4C81] flex items-center justify-center text-white font-black mx-auto shadow-[0_4px_16px_rgba(15,76,129,0.30)] text-xl">
          S
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-[#0F172A]">
          Sign in to Subscript<span className="text-[#0F4C81]">IQ</span>
        </h2>
        <p className="mt-1.5 text-xs text-[#526071] max-w-sm mx-auto font-medium">
          SaaS Subscription &amp; Customer Lifecycle Platform with AI Copilot
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        {/* Fast Persona Switcher Box */}
        <div className="smooth-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-4 h-4 text-[#0F4C81]" />
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              1-Click Demo Persona Access
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personas.map((p) => (
              <button
                key={p.role}
                type="button"
                onClick={() => handlePersonaSelect(p.role)}
                className={`p-3.5 rounded-xl border text-left transition-all hover:shadow-xs flex flex-col justify-between cursor-pointer ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${p.badge}`}>
                      {p.role}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#526071]" />
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A] mt-2">{p.name}</h4>
                  <p className="text-[11px] text-[#526071] mt-1 line-clamp-2 leading-tight">
                    {p.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form */}
        <div className="smooth-card py-6 px-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs bg-[#FDF0F0] text-[#B01E22] rounded-xl border border-[#FECACA] font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 smooth-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-3 smooth-input font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-white smooth-btn-primary cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in with Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
