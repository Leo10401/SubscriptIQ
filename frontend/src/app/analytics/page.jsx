'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { StatCard } from '../../components/StatCard';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Download,
  Users,
  Layers,
} from 'lucide-react';

export function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [churnTrend, setChurnTrend] = useState([]);
  const [cohorts, setCohorts] = useState({ byPlan: [], byCSM: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [sumRes, trendRes, cohortRes] = await Promise.all([
          api.getRetentionSummary().catch(() => null),
          api.getChurnTrend().catch(() => []),
          api.getCohorts().catch(() => ({ byPlan: [], byCSM: [] })),
        ]);

        if (sumRes) setSummary(sumRes);
        if (trendRes) setChurnTrend(trendRes);
        if (cohortRes) setCohorts(cohortRes);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const handleExportCSV = () => {
    window.open(api.getExportCSVUrl(), '_blank');
  };

  const metrics = summary?.metrics || {};

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Retention &amp; Churn Analytics
            </h1>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Executive visibility into customer renewal rates, churn trajectory, cohort performance, and revenue impact.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs smooth-btn-secondary cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#526071]" />
            <span>Export Report (CSV)</span>
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Gross Renewal Rate"
            value={`${metrics.renewalRate || 93}%`}
            subtitle="Target: 90% benchmark"
            icon={TrendingUp}
            trend={2.4}
            trendLabel="vs prior quarter"
            variant="primary"
          />

          <StatCard
            title="Monthly Churn Rate"
            value={`${metrics.churnRate || 5.8}%`}
            subtitle="Industry average: ~7%"
            icon={TrendingDown}
            trend={-0.8}
            trendLabel="improved"
            variant="success"
          />

          <StatCard
            title="Active MRR / ARR"
            value={formatCurrency(metrics.totalMrr || 24800)}
            subtitle={`ARR: ${formatCurrency((metrics.totalMrr || 24800) * 12)}`}
            icon={DollarSign}
            trend={6.1}
            trendLabel="MoM growth"
          />

          <StatCard
            title="Revenue at Risk"
            value={formatCurrency(metrics.revenueAtRisk || 499)}
            subtitle={`${summary?.riskDistribution?.high || 2} accounts requiring retention sync`}
            icon={AlertTriangle}
            highlight={true}
            variant="danger"
          />
        </div>

        {/* 6-Month Churn & Renewal Trend Chart */}
        <div className="smooth-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                Renewal &amp; Churn Trajectory (6-Month Trajectory)
              </h3>
              <p className="text-xs text-[#526071] font-medium">Historical performance across monthly renewal cohorts</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0F4C81] shadow-2xs"></span>
                <span className="text-[#0F172A]">Renewal Rate (%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D0272B] shadow-2xs"></span>
                <span className="text-[#0F172A]">Churn Rate (%)</span>
              </div>
            </div>
          </div>

          {/* Smooth Trend Bars */}
          <div className="grid grid-cols-6 gap-4 pt-6 pb-2 items-end min-h-[240px] bg-[#F8FAFC] border border-slate-200/80 p-5 rounded-2xl">
            {churnTrend.map((m) => (
              <div key={m.month} className="flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-2 h-40">
                  {/* Renewal Bar (Pantone Classic Blue) */}
                  <div
                    className="w-1/2 bg-[#0F4C81] hover:bg-[#0B3B66] rounded-t-lg transition-all relative group cursor-pointer shadow-xs"
                    style={{ height: `${m.renewalRate}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white font-bold text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap z-10 transition-opacity shadow-md">
                      {m.renewalRate}% Renewed
                    </div>
                  </div>
                  {/* Churn Bar (Pantone Chrysanthemum Red) */}
                  <div
                    className="w-1/2 bg-[#D0272B] hover:bg-[#B01E22] rounded-t-lg transition-all relative group cursor-pointer shadow-xs"
                    style={{ height: `${Math.max(m.churnRate * 5, 8)}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white font-bold text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap z-10 transition-opacity shadow-md">
                      {m.churnRate}% Churn
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0F172A] truncate">{m.month}</span>
                <span className="text-[10px] font-mono text-[#526071] font-bold">{formatCurrency(m.renewedMRR)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Breakdown (By Plan Tier & By CSM) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Tier Cohorts */}
          <div className="smooth-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#0F4C81]" />
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">Cohort by Subscription Plan</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {cohorts.byPlan.map((plan) => (
                <div key={plan.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{plan.name}</h4>
                    <p className="text-[11px] text-[#526071] font-medium">
                      {plan.subCount} subscriptions • {formatCurrency(plan.totalMrr)} MRR
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#00875A] text-sm">{plan.retentionRate}%</span>
                    <p className="text-[10px] text-[#526071] font-bold uppercase">Retention</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CSM Cohorts */}
          <div className="smooth-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#0F4C81]" />
                <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">Cohort by Account Owner (CSM)</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {cohorts.byCSM.map((csm) => (
                <div key={csm.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{csm.name}</h4>
                    <p className="text-[11px] text-[#526071] font-medium">
                      {csm.accountCount} accounts managed • {formatCurrency(csm.totalBookMrr)} Book MRR
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#0F4C81] text-sm">{csm.retentionRate}%</span>
                    <p className="text-[10px] text-[#526071] font-bold uppercase">Portfolio Retention</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default AnalyticsPage;
