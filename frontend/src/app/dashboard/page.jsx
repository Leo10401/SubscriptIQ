'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { RiskBadge } from '../../components/RiskBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import {
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Download,
  Plus,
  GitPullRequestDraft,
  Mail,
  TrendingDown,
  Tag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CustomerModal } from '../../components/CustomerModal';
import { SupportNoteModal } from '../../components/SupportNoteModal';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [renewals, setRenewals] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, renewalsRes, draftsRes, customersRes, plansRes] = await Promise.all([
        api.getRetentionSummary().catch(() => null),
        api.getRenewals().catch(() => []),
        api.getDrafts({ status: 'pending_review' }).catch(() => []),
        api.getCustomers({ limit: 6 }).catch(() => ({ customers: [] })),
        api.getPlans().catch(() => []),
      ]);

      if (summaryRes) setMetrics(summaryRes);
      if (renewalsRes) setRenewals(renewalsRes);
      if (draftsRes) setDrafts(draftsRes);
      if (customersRes) setCustomers(customersRes.customers || []);
      if (plansRes) setPlans(plansRes);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMrr = metrics?.metrics?.totalMrr || 4891;
  const arr = totalMrr * 12;
  const revenueAtRisk = metrics?.metrics?.revenueAtRisk || 998;
  const renewalRate = metrics?.metrics?.renewalRate || 50;
  const pendingDraftsCount = drafts.length || 7;

  // Urgent at-risk accounts list
  const displayAccounts = renewals.length > 0
    ? renewals.slice(0, 4).map((r, i) => ({
        id: r._id,
        customerId: r.customerId?._id,
        name: r.customerId?.name || 'Account',
        mrr: r.subscriptionId?.currentMonthlyPrice || r.customerId?.mrr || 650,
        riskLevel: r.riskLevel || (i < 2 ? 'high' : 'low'),
        initial: (r.customerId?.name || 'A')[0],
        avatarBg: i === 0 ? 'bg-[#EAF1F8] text-[#0F4C81]' : i === 1 ? 'bg-[#FDF0F0] text-[#D0272B]' : i === 2 ? 'bg-[#E6F7F1] text-[#006644]' : 'bg-[#F5F3FA] text-[#5F4B8B]',
      }))
    : [
        { id: '1', name: 'Nexus AI Systems', mrr: 650, riskLevel: 'high', initial: 'N', avatarBg: 'bg-[#EAF1F8] text-[#0F4C81]' },
        { id: '2', name: 'Pulse Health Technologies', mrr: 348, riskLevel: 'high', initial: 'P', avatarBg: 'bg-[#FDF0F0] text-[#D0272B]' },
        { id: '3', name: 'CyberShield Global', mrr: 1200, riskLevel: 'low', initial: 'C', avatarBg: 'bg-[#E6F7F1] text-[#006644]' },
      ];

  const highRiskCount = displayAccounts.filter((a) => a.riskLevel === 'high').length;

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Hero Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
              Command Center: {user?.name || 'Ayush Sharma'}
            </h1>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Your subscription portfolio has <strong className="text-[#D0272B] font-bold">{highRiskCount} high-risk accounts</strong> requiring proactive intervention.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => window.open(api.getExportCSVUrl(), '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0F172A] smooth-btn-secondary cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#526071]" />
              <span>Export Report</span>
            </button>

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white smooth-btn-primary cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Contract</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards with Pantone Anchors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Total Monthly Revenue */}
          <div className="smooth-card p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#526071] uppercase tracking-wider">
                Total Monthly Revenue
              </span>
              <div className="p-2 rounded-xl bg-[#EAF1F8] text-[#0F4C81]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-3xl font-black text-[#0F172A] tracking-tight font-mono">
                {formatCurrency(totalMrr)}
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#526071] font-medium">ARR {formatCurrency(arr)}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F7F1] text-[#006644] border border-[#99E3D0]">
                <TrendingUp className="w-3 h-3" /> 8.4%
              </span>
            </div>
          </div>

          {/* 2. Revenue at Risk (Pantone Chrysanthemum high-contrast accent) */}
          <div className="smooth-card p-5 flex flex-col justify-between border-l-4 border-l-[#D0272B]">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#526071] uppercase tracking-wider">
                Revenue At Risk
              </span>
              <div className="p-2 rounded-xl bg-[#FDF0F0] text-[#D0272B]">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-3xl font-black text-[#D0272B] tracking-tight font-mono">
                {formatCurrency(revenueAtRisk)}
              </h3>
            </div>
            <div className="text-xs text-[#526071] font-medium flex items-center justify-between">
              <span>Across {highRiskCount || 2} accounts</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF0F0] text-[#B01E22] border border-[#FECACA]">
                Requires Action
              </span>
            </div>
          </div>

          {/* 3. Renewal Rate */}
          <div className="smooth-card p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#526071] uppercase tracking-wider">
                Renewal Rate
              </span>
              <div className="p-2 rounded-xl bg-[#EAF1F8] text-[#0F4C81]">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-3xl font-black text-[#0F172A] tracking-tight font-mono">
                {renewalRate}%
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#526071] font-medium">Cohort 2026</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F7F1] text-[#006644] border border-[#99E3D0]">
                <TrendingUp className="w-3 h-3" /> 1.2%
              </span>
            </div>
          </div>

          {/* 4. AI Drafts Pending (Pantone Ultra Violet) */}
          <div className="smooth-card p-5 flex flex-col justify-between border-l-4 border-l-[#5F4B8B]">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#526071] uppercase tracking-wider">
                AI Drafts Pending
              </span>
              <div className="p-2 rounded-xl bg-[#F5F3FA] text-[#5F4B8B]">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <h3 className="text-3xl font-black text-[#0F172A] tracking-tight font-mono">
                {pendingDraftsCount}
              </h3>
            </div>
            <div className="text-xs text-[#526071] font-medium flex items-center justify-between">
              <span>Ready for human review</span>
              <Link href="/ai-drafts" className="text-[#5F4B8B] font-bold hover:underline">
                Review &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Lower Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Urgent At-Risk Accounts (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-[#0F172A]">Urgent At-Risk Accounts</h2>
              <Link
                href="/renewals"
                className="text-xs font-bold text-[#0F4C81] hover:text-[#0B3B66] transition-colors flex items-center gap-1"
              >
                <span>Pipeline Board</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="smooth-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-[#FAF9FC] text-[10px] font-bold uppercase text-[#526071] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Company &amp; MRR</th>
                      <th className="px-6 py-3.5">Risk Level</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70 text-[#0F172A]">
                    {displayAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Company & MRR */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${account.avatarBg}`}>
                              {account.initial}
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A] text-xs">{account.name}</p>
                              <p className="text-[11px] text-[#526071] font-mono font-medium mt-0.5">
                                {formatCurrency(account.mrr)} / mo
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Risk Level Badge */}
                        <td className="px-6 py-4">
                          <RiskBadge level={account.riskLevel} />
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href="/renewals"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F172A] smooth-btn-secondary"
                            >
                              <GitPullRequestDraft className="w-3 h-3 text-[#526071]" />
                              <span>Pipeline</span>
                            </Link>

                            <Link
                              href={account.customerId ? `/customers/${account.customerId}` : '/customers'}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F4C81] bg-[#EAF1F8] hover:bg-[#D5E4F3] rounded-xl transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-[#0F4C81]" />
                              <span>Profile &amp; AI</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: AI Copilot Queue (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-[#0F172A]">AI Copilot Queue</h2>
              <span className="text-[10px] font-bold text-[#5F4B8B] bg-[#F5F3FA] border border-[#DDD6FE] px-2 py-0.5 rounded-full">
                {pendingDraftsCount} Pending
              </span>
            </div>

            <div className="smooth-card p-5 space-y-4 border-t-4 border-t-[#5F4B8B]">
              <div className="flex items-center gap-2 text-[#483473] font-bold text-xs">
                <Sparkles className="w-4 h-4 text-[#5F4B8B]" />
                <span>Next Priority Outreach</span>
              </div>

              <div>
                <p className="text-xs font-bold text-[#0F172A]">Nexus AI Systems</p>
                <p className="text-[11px] text-[#526071] font-medium">Pending Review Tasks</p>
              </div>

              {/* Task Items */}
              <div className="space-y-2.5">
                {/* Task 1 */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70 space-y-1 hover:bg-[#F5F3FA]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <Mail className="w-3.5 h-3.5 text-[#5F4B8B]" />
                    <span>Draft: Renewal follow-up</span>
                  </div>
                  <p className="text-[11px] text-[#526071] line-clamp-2 leading-relaxed">
                    &quot;Hi Sarah, following up on our last conversation regarding your Q3 subscription renewal...&quot;
                  </p>
                </div>

                {/* Task 2 */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70 space-y-1 hover:bg-[#FDF0F0]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <TrendingDown className="w-3.5 h-3.5 text-[#D0272B]" />
                    <span>Insight: Usage Drop Detected</span>
                  </div>
                  <p className="text-[11px] text-[#526071] line-clamp-2 leading-relaxed">
                    API calls dropped by 40% in the last 14 days. Suggested action: schedule technical review.
                  </p>
                </div>

                {/* Task 3 */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70 space-y-1 hover:bg-[#EAF1F8]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                    <Tag className="w-3.5 h-3.5 text-[#0F4C81]" />
                    <span>Proposal: Retention Incentive</span>
                  </div>
                  <p className="text-[11px] text-[#526071] line-clamp-2 leading-relaxed">
                    Generated 15% retention discount package based on historical contract value.
                  </p>
                </div>
              </div>

              {/* View All Drafts CTA */}
              <Link
                href="/ai-drafts"
                className="w-full flex items-center justify-center py-2.5 px-3 text-xs font-bold text-white smooth-btn-ai text-center cursor-pointer"
              >
                Review All {pendingDraftsCount} Drafts
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchData}
        plans={plans}
      />

      <SupportNoteModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onSuccess={fetchData}
        customerId={customers[0]?._id}
        customerName={customers[0]?.name}
      />
    </AppShell>
  );
}
