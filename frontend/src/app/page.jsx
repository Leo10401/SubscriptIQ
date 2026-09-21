'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2,
  Users,
  Layers,
  CreditCard,
  ChevronRight,
  GitPullRequestDraft,
  Mail,
  ShieldAlert,
  Play,
  Star,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { switchPersona } = useAuth();
  const [activePersonaTab, setActivePersonaTab] = useState('CSM');

  const handleLaunchWithPersona = (role) => {
    switchPersona(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#0F172A] font-sans selection:bg-[#0F4C81] selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C81] flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(15,76,129,0.30)] group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-[#0F172A] leading-none flex items-center gap-1">
                <span>Subscript</span><span className="text-[#0F4C81]">IQ</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F61]"></span>
              </span>
              <span className="block text-[10px] text-[#526071] font-bold uppercase tracking-wider mt-0.5">
                Lifecycle &amp; AI Copilot
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#526071]">
            <a href="#features" className="hover:text-[#0F4C81] transition-colors">Features</a>
            <a href="#ai-copilot" className="hover:text-[#0F4C81] transition-colors flex items-center gap-1.5">
              <span>AI Copilot</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#F5F3FA] text-[#5F4B8B] border border-[#DDD6FE] font-bold">NEW</span>
            </a>
            <a href="#pipeline" className="hover:text-[#0F4C81] transition-colors">Renewal Pipeline</a>
            <a href="#personas" className="hover:text-[#0F4C81] transition-colors">Personas</a>
            <a href="#pricing" className="hover:text-[#0F4C81] transition-colors">Pricing</a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-[#0F172A] hover:text-[#0F4C81] rounded-xl hover:bg-slate-100 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-xl shadow-[0_2px_8px_rgba(15,76,129,0.25)] hover:shadow-[0_4px_14px_rgba(15,76,129,0.35)] transition-all group cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 overflow-hidden">
        {/* Soft Ambient Diffuse Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-gradient-to-r from-[#0F4C81]/10 via-[#5F4B8B]/10 to-[#FF6F61]/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-[#0F172A]">
            <span className="w-2 h-2 rounded-full bg-[#5F4B8B] animate-pulse" />
            <span>OpenRouter Nemotron-70B • Deterministic Churn Engine</span>
            <span className="text-[#0F4C81] ml-1">v2.4 Live &rarr;</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F172A] leading-[1.12]">
            Predict Churn. Automate Renewals.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C81] via-[#5F4B8B] to-[#FF6F61]">
              Empower CS with AI.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#526071] font-medium max-w-2xl mx-auto leading-relaxed">
            SubscriptIQ unifies SaaS subscription lifecycles, deterministic health scoring, and an AI outreach copilot to protect recurring revenue before customer accounts lapse.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-xl shadow-[0_4px_16px_rgba(15,76,129,0.30)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FF6F61]" />
              <span>Explore Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/renewals"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#0F172A] smooth-btn-secondary rounded-xl transition-all cursor-pointer"
            >
              <GitPullRequestDraft className="w-4 h-4 text-[#526071]" />
              <span>Interactive Pipeline</span>
            </Link>
          </div>

          {/* Live Proof Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-3xl mx-auto border-t border-slate-200/80">
            <div>
              <p className="text-2xl lg:text-3xl font-black font-mono text-[#0F172A]">$14.2M+</p>
              <p className="text-xs text-[#526071] font-medium mt-0.5">ARR Protected</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black font-mono text-[#00875A]">94.8%</p>
              <p className="text-xs text-[#526071] font-medium mt-0.5">Gross Renewal Rate</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black font-mono text-[#5F4B8B]">7x</p>
              <p className="text-xs text-[#526071] font-medium mt-0.5">Faster Outreach</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-black font-mono text-[#0F4C81]">100%</p>
              <p className="text-xs text-[#526071] font-medium mt-0.5">Grounded Telemetry</p>
            </div>
          </div>
        </div>

        {/* 3. Hero Product Mockup */}
        <div className="max-w-6xl mx-auto mt-14 relative">
          <div className="p-2 sm:p-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_rgba(15,76,129,0.12)]">
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
              {/* Window Bar */}
              <div className="h-10 bg-[#FAF9FC] border-b border-slate-200 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#D0272B]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#D97706]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#00875A]/80" />
                </div>
                <div className="px-4 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-mono text-[#526071] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00875A]" />
                  <span>app.subscriptiq.io/dashboard</span>
                </div>
                <div className="w-12"></div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 bg-[#F6F8FB] space-y-5">
                {/* Metric Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="smooth-card p-4">
                    <span className="text-[10px] font-bold text-[#526071] uppercase">Total Monthly Revenue</span>
                    <p className="text-xl font-black text-[#0F172A] font-mono mt-1">$24,800</p>
                    <span className="text-[10px] text-[#006644] font-bold">↑ 8.4% MoM</span>
                  </div>
                  <div className="smooth-card p-4 border-l-4 border-l-[#D0272B]">
                    <span className="text-[10px] font-bold text-[#526071] uppercase">Revenue at Risk</span>
                    <p className="text-xl font-black text-[#D0272B] font-mono mt-1">$499</p>
                    <span className="text-[10px] text-[#B01E22] font-bold">2 accounts flagged</span>
                  </div>
                  <div className="smooth-card p-4">
                    <span className="text-[10px] font-bold text-[#526071] uppercase">Renewal Rate</span>
                    <p className="text-xl font-black text-[#0F172A] font-mono mt-1">93%</p>
                    <span className="text-[10px] text-[#006644] font-bold">↑ 1.2% vs target</span>
                  </div>
                  <div className="smooth-card p-4 border-l-4 border-l-[#5F4B8B]">
                    <span className="text-[10px] font-bold text-[#526071] uppercase">AI Drafts Ready</span>
                    <p className="text-xl font-black text-[#5F4B8B] font-mono mt-1">7 Pending</p>
                    <span className="text-[10px] text-[#5F4B8B] font-bold">Human review queue</span>
                  </div>
                </div>

                {/* Split row preview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* At risk */}
                  <div className="md:col-span-8 smooth-card p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-[#0F172A]">Urgent At-Risk Accounts</span>
                      <span className="text-[11px] text-[#0F4C81] font-bold">View Pipeline &rarr;</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#EAF1F8] text-[#0F4C81] flex items-center justify-center font-bold text-[11px]">N</div>
                          <div>
                            <p className="font-bold text-[#0F172A]">Nexus AI Systems</p>
                            <p className="text-[10px] text-[#526071] font-mono font-medium">$650/mo • Usage drop -42%</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold smooth-badge-high">High Risk</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#FDF0F0] text-[#D0272B] flex items-center justify-center font-bold text-[11px]">P</div>
                          <div>
                            <p className="font-bold text-[#0F172A]">Pulse Health Technologies</p>
                            <p className="text-[10px] text-[#526071] font-mono font-medium">$348/mo • 3 open support tickets</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold smooth-badge-high">High Risk</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Copilot queue preview */}
                  <div className="md:col-span-4 smooth-card p-4 border-t-4 border-t-[#5F4B8B] space-y-2">
                    <div className="flex items-center gap-1.5 text-[#483473] font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#5F4B8B]" />
                      <span>AI Copilot Queue</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F5F3FA] border border-[#DDD6FE] text-[11px] space-y-1">
                      <p className="font-bold text-[#0F172A]">Draft: Retention Outreach</p>
                      <p className="text-[#526071] line-clamp-2">&quot;Hi Sarah, noticing your team has encountered recent API rate limits...&quot;</p>
                    </div>
                    <Link href="/ai-drafts" className="block text-center py-2 rounded-xl bg-[#5F4B8B] text-white text-[11px] font-bold hover:bg-[#483473] transition-colors">
                      Review &amp; Send Drafts
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Bento Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#0F4C81] uppercase tracking-wider">Enterprise Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Designed for Revenue Retention Teams
            </h2>
            <p className="text-xs sm:text-sm text-[#526071] font-medium">
              Every tool and workflow eliminates churn blindspots and gives CSMs actionable AI copilot leverage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento 1: Deterministic Churn Engine */}
            <div className="smooth-card p-6 space-y-4 smooth-card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F8] text-[#0F4C81] flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Deterministic Churn Rules</h3>
              <p className="text-xs text-[#526071] leading-relaxed font-medium">
                Pure-function evaluators across usage drops, open tickets, sentiment, payment status, and plan changes. Zero black-box hallucinations.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-[#0F4C81]">
                <span>7 Core Evaluators Configured</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento 2: OpenRouter AI Copilot */}
            <div className="smooth-card p-6 space-y-4 smooth-card-interactive border-t-4 border-t-[#5F4B8B]">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FA] text-[#5F4B8B] flex items-center justify-center shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">OpenRouter Nemotron Copilot</h3>
              <p className="text-xs text-[#526071] leading-relaxed font-medium">
                Generates concise account summaries, plain-language risk explanations, and first-pass retention outreach grounded strictly in customer history.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-[#5F4B8B]">
                <span>Human-in-the-Loop Review</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento 3: Animated Drag & Drop Kanban */}
            <div className="smooth-card p-6 space-y-4 smooth-card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F8] text-[#0F4C81] flex items-center justify-center shadow-2xs">
                <GitPullRequestDraft className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Interactive Renewal Kanban</h3>
              <p className="text-xs text-[#526071] leading-relaxed font-medium">
                Drag accounts across stages (Upcoming &rarr; At Risk &rarr; Contacted &rarr; Renewed &rarr; Churned), with animated DropIndicators and real-time MRR tallies.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-[#0F4C81]">
                <span>Drag &amp; Drop Enabled</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento 4: 2-Column Account Dossier */}
            <div className="smooth-card p-6 space-y-4 smooth-card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#E6F7F1] text-[#00875A] flex items-center justify-center shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">360° Customer Dossiers</h3>
              <p className="text-xs text-[#526071] leading-relaxed font-medium">
                Left column sticky overview and AI briefing; right column tab deck for Subscriptions, Fired Churn Signals, Support Notes, and Usage Logs.
              </p>
            </div>

            {/* Bento 5: Plan Versioning & Entitlements */}
            <div className="smooth-card p-6 space-y-4 smooth-card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-[#B76E00] flex items-center justify-center shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Plans &amp; Price Versioning</h3>
              <p className="text-xs text-[#526071] leading-relaxed font-medium">
                Create tiers, usage quotas (seats, API limits, storage), and automatically grandfather existing subscriptions when prices change.
              </p>
            </div>

            {/* Bento 6: Retention Analytics & Cohorts */}
            <div className="smooth-card p-6 space-y-4 smooth-card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#FDF0F0] text-[#D0272B] flex items-center justify-center shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A]">Cohort &amp; Churn Analytics</h3>
              <p className="text-xs text-[#526071] leading-relaxed font-medium">
                6-month churn trajectory graphs, cohort breakdowns by Plan Tier and CSM portfolio, and one-click CSV executive reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 1-Click Persona Simulator */}
      <section id="personas" className="py-20 px-6 lg:px-12 bg-[#F6F8FB]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#0F4C81] uppercase tracking-wider">Role-Based Access Control</span>
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
              Test Drive by Operational Role
            </h2>
            <p className="text-xs sm:text-sm text-[#526071] font-medium">
              SubscriptIQ provides tailored permissions and navigation for every team member. Click a role to test:
            </p>
          </div>

          {/* Persona Tab Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { role: 'Admin', name: 'Ayush Sharma' },
              { role: 'CSM', name: 'Sarah Connor' },
              { role: 'Support', name: 'Dave Miller' },
              { role: 'Analyst', name: 'Maya Lin' },
            ].map((p) => (
              <button
                key={p.role}
                onClick={() => setActivePersonaTab(p.role)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePersonaTab === p.role
                    ? 'bg-[#0F4C81] text-white shadow-[0_2px_8px_rgba(15,76,129,0.30)]'
                    : 'bg-white text-[#526071] hover:text-[#0F172A] border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {p.role} ({p.name})
              </button>
            ))}
          </div>

          {/* Active Persona Box */}
          <div className="smooth-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF1F8] text-[#0F4C81]">
                  {activePersonaTab} Environment
                </span>
                <span className="text-xs text-[#526071] font-medium">• Instant 1-Click Login</span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                {activePersonaTab === 'Admin' && 'Administrator — Full Strategic Control'}
                {activePersonaTab === 'CSM' && 'Customer Success Manager — Daily Retention Workflow'}
                {activePersonaTab === 'Support' && 'Support Agent — Touchpoints & Sentiment Gating'}
                {activePersonaTab === 'Analyst' && 'Business Analyst — Executive Insights & Cohorts'}
              </h3>
              <p className="text-xs text-[#526071] leading-relaxed max-w-xl">
                {activePersonaTab === 'Admin' && 'Manage subscription plans, edit churn rule weights, review security audit logs, and trigger full database evaluations.'}
                {activePersonaTab === 'CSM' && 'Manage account portfolios, move renewals through the Kanban pipeline, and review/approve AI-generated retention messages.'}
                {activePersonaTab === 'Support' && 'Log customer touchpoints with sentiment tags (Positive, Neutral, Negative) that directly feed the deterministic churn engine.'}
                {activePersonaTab === 'Analyst' && 'Access read-only financial retention dashboards, cohort performance tables by plan and CSM, and CSV data downloads.'}
              </p>
            </div>

            <button
              onClick={() => handleLaunchWithPersona(activePersonaTab)}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-xl shadow-[0_2px_8px_rgba(15,76,129,0.25)] transition-all whitespace-nowrap cursor-pointer"
            >
              <span>Launch as {activePersonaTab}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-12 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#0F4C81] uppercase tracking-wider">Transparent Tiers</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Subscription Plans Built for Scale
            </h2>
            <p className="text-xs sm:text-sm text-[#526071] font-medium">
              Flexible entitlements with automated usage monitoring and version preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Starter', price: 49, interval: 'month', desc: 'For early SaaS teams monitoring up to 50 accounts.', seats: 3, api: '10K', storage: '10 GB' },
              { name: 'Growth', price: 199, interval: 'month', desc: 'Core retention engine with AI copilot for growing teams.', seats: 10, api: '50K', storage: '50 GB', popular: true },
              { name: 'Professional', price: 499, interval: 'month', desc: 'Advanced analytics, custom churn weights, and cohort models.', seats: 25, api: '250K', storage: '200 GB' },
              { name: 'Enterprise', price: 1299, interval: 'month', desc: 'Unlimited accounts, dedicated CSM seats, and SOC2 audit logs.', seats: 'Unlimited', api: '1M+', storage: '1 TB' },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`smooth-card p-6 flex flex-col justify-between space-y-6 transition-all smooth-card-interactive ${
                  plan.popular
                    ? 'border-2 border-[#0F4C81] shadow-[0_12px_32px_rgba(15,76,129,0.14)]'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-[#0F172A]">{plan.name}</h3>
                    {plan.popular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F4C81] text-white">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#526071] mt-1 min-h-[32px]">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono text-[#0F172A]">${plan.price}</span>
                    <span className="text-xs text-[#526071] font-medium">/{plan.interval}</span>
                  </div>

                  <div className="mt-6 space-y-2.5 text-xs text-[#0F172A]">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00875A]" />
                      <span>{plan.seats} Team Seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00875A]" />
                      <span>{plan.api} API Calls/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00875A]" />
                      <span>{plan.storage} Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00875A]" />
                      <span>OpenRouter AI Integration</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/plans"
                  className={`w-full py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-[#0F4C81] text-white hover:bg-[#0B3B66] shadow-[0_2px_8px_rgba(15,76,129,0.25)]'
                      : 'smooth-btn-secondary'
                  }`}
                >
                  Configure Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner */}
      <section className="py-16 px-6 lg:px-12 bg-[#0F4C81] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Start Protecting Your SaaS Recurring Revenue
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl mx-auto leading-relaxed">
            Join forward-thinking Customer Success and Revenue operations teams using SubscriptIQ to reduce churn and accelerate renewals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-sm font-bold text-[#0F4C81] bg-white hover:bg-slate-100 rounded-xl shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              Launch Dashboard Now
            </Link>
            <Link
              href="/renewals"
              className="px-6 py-3.5 text-sm font-bold text-white border border-white/30 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              View Renewal Pipeline
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-12 px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F4C81] text-white flex items-center justify-center font-black">
              S
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">SubscriptIQ</p>
              <p className="text-[11px] text-slate-500">SaaS Subscription &amp; Customer Lifecycle Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-medium">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/customers" className="hover:text-white transition-colors">Customers</Link>
            <Link href="/renewals" className="hover:text-white transition-colors">Renewal Pipeline</Link>
            <Link href="/ai-drafts" className="hover:text-white transition-colors">AI Drafts</Link>
            <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
          </div>

          <p className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} SubscriptIQ Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
