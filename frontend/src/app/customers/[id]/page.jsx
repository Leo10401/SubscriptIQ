'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { RiskBadge } from '../../../components/RiskBadge';
import { AIContentBlock } from '../../../components/AIContentBlock';
import { SupportNoteModal } from '../../../components/SupportNoteModal';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Mail,
  Phone,
  Layers,
  Sparkles,
  MessageSquare,
  Activity,
  ShieldAlert,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id;
  const { role } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // AI Generation States
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [latestSummaryDraft, setLatestSummaryDraft] = useState(null);
  const [latestMessageDraft, setLatestMessageDraft] = useState(null);

  const fetchProfile = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const data = await api.getCustomerById(customerId);
      setProfile(data);

      if (data.aiDrafts && data.aiDrafts.length > 0) {
        const summary = data.aiDrafts.find((d) => d.type === 'summary');
        const message = data.aiDrafts.find((d) => d.type.includes('message'));
        if (summary) setLatestSummaryDraft(summary);
        if (message) setLatestMessageDraft(message);
      }
    } catch (err) {
      console.error('Error fetching customer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [customerId]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const draft = await api.summarizeCustomer(customerId);
      setLatestSummaryDraft(draft);
      await fetchProfile();
    } catch (err) {
      alert('Failed to generate summary: ' + err.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDraftMessage = async (type = 'retention') => {
    setIsGeneratingMessage(true);
    try {
      const draft = await api.draftMessage(customerId, type);
      setLatestMessageDraft(draft);
      await fetchProfile();
    } catch (err) {
      alert('Failed to draft message: ' + err.message);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  if (loading || !profile) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-[#526071] font-semibold">
          Loading customer account dossier...
        </div>
      </AppShell>
    );
  }

  const { customer, subscriptions, supportNotes, usageEvents, churnSignals, renewal } = profile;
  const activeSub = subscriptions.find((s) => s.status === 'active' || s.status === 'past_due') || subscriptions[0];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.push('/customers')}
              className="p-2.5 smooth-btn-secondary cursor-pointer"
              aria-label="Back to customers directory"
            >
              <ArrowLeft className="w-4 h-4 text-[#526071]" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
                  {customer.name}
                </h1>
                <RiskBadge
                  level={renewal?.riskLevel || (customer.lifecycleStage === 'at_risk' ? 'high' : 'low')}
                  score={renewal?.riskScore}
                />
              </div>
              <p className="text-xs text-[#526071] font-medium mt-0.5">
                {customer.industry} • Account Owner: <strong className="text-[#0F172A]">{customer.ownerId?.name || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(role === 'Admin' || role === 'CSM' || role === 'Support') && (
              <button
                onClick={() => setIsSupportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs smooth-btn-secondary cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#526071]" />
                <span>Log Support Note</span>
              </button>
            )}

            {(role === 'Admin' || role === 'CSM') && (
              <button
                onClick={() => handleDraftMessage(renewal?.riskLevel === 'high' ? 'retention' : 'onboarding')}
                disabled={isGeneratingMessage}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs smooth-btn-ai cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingMessage ? 'AI Drafting...' : 'Draft Outreach (AI)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Sticky Account Dossier + AI Console) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Account Dossier Card */}
            <div className="smooth-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#526071]">Account Dossier</h3>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]">
                  {customer.lifecycleStage.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl">
                  <span className="text-[#526071] text-[10px] font-bold uppercase">Monthly MRR</span>
                  <p className="text-base font-bold font-mono text-[#0F172A] mt-0.5">
                    {formatCurrency(customer.mrr || activeSub?.currentMonthlyPrice)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl">
                  <span className="text-[#526071] text-[10px] font-bold uppercase">Annual ARR</span>
                  <p className="text-base font-bold font-mono text-[#0F172A] mt-0.5">
                    {formatCurrency(customer.arr || (customer.mrr || 0) * 12)}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl">
                  <span className="text-[#526071] text-[10px] font-bold uppercase">Renewal Target</span>
                  <p className="font-mono text-[#0F172A] font-bold mt-0.5">
                    {activeSub ? formatDate(activeSub.renewalDate) : 'N/A'}
                  </p>
                </div>
                <div className="p-3.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl">
                  <span className="text-[#526071] text-[10px] font-bold uppercase">Health Score</span>
                  <p className="font-mono font-black text-[#00875A] mt-0.5">
                    {customer.healthScore}/100
                  </p>
                </div>
              </div>

              {customer.contacts && customer.contacts.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-[#0F172A] mb-2">Key Contacts</p>
                  {customer.contacts.map((contact, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-1 text-xs">
                      <p className="font-bold text-[#0F172A]">{contact.name} ({contact.role || 'Lead'})</p>
                      <p className="flex items-center gap-1.5 text-[#526071] font-medium">
                        <Mail className="w-3 h-3 text-[#526071]" /> {contact.email}
                      </p>
                      {contact.phone && (
                        <p className="flex items-center gap-1.5 text-[#526071] font-medium">
                          <Phone className="w-3 h-3 text-[#526071]" /> {contact.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Account Briefing Console */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-[#483473]">
                  <span className="w-2.5 h-2.5 rounded-full smooth-jewel-violet"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider">AI Copilot Briefing</h3>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="px-3.5 py-1.5 text-xs smooth-btn-ai cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingSummary ? 'Summarizing...' : latestSummaryDraft ? 'Regenerate' : 'Summarize Account'}</span>
                </button>
              </div>

              {latestSummaryDraft ? (
                <AIContentBlock
                  draft={latestSummaryDraft}
                  onStatusChange={fetchProfile}
                  onRegenerate={handleGenerateSummary}
                  isGenerating={isGeneratingSummary}
                />
              ) : (
                <div className="p-8 rounded-2xl bg-white border border-dashed border-[#DDD6FE] text-center space-y-2">
                  <Sparkles className="w-7 h-7 text-[#5F4B8B] mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-[#0F172A]">No account summary generated yet.</p>
                  <p className="text-[11px] text-[#526071] max-w-xs mx-auto">
                    Click &quot;Summarize Account&quot; to generate an executive briefing via OpenRouter Nemotron-70B.
                  </p>
                </div>
              )}

              {latestMessageDraft && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                  <h4 className="text-xs font-bold text-[#0F172A]">Latest Outreach Draft</h4>
                  <AIContentBlock
                    draft={latestMessageDraft}
                    onStatusChange={fetchProfile}
                    onRegenerate={() => handleDraftMessage('retention')}
                    isGenerating={isGeneratingMessage}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Tab Deck) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tab Levers Header */}
            <div className="flex items-center gap-2 p-1.5 bg-[#F1F4F8] rounded-2xl overflow-x-auto border border-slate-200/80">
              {[
                { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length, icon: Layers },
                { id: 'signals', label: 'Churn Signals', count: churnSignals.length, icon: ShieldAlert, highlight: churnSignals.length > 0 },
                { id: 'notes', label: 'Support & Notes', count: supportNotes.length, icon: MessageSquare },
                { id: 'usage', label: 'Usage Activity', count: usageEvents.length, icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-[#0F4C81] shadow-2xs'
                        : 'text-[#526071] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0F4C81]' : 'text-[#526071]'}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          tab.highlight
                            ? 'smooth-badge-high'
                            : 'bg-[#EAF1F8] text-[#0F4C81]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Deck Contents */}
            <div className="smooth-card p-6 min-h-[440px]">
              {/* 1. Subscriptions Tab */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071] mb-3">Active Subscription</h3>
                    {activeSub ? (
                      <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#0F172A]">{activeSub.planId?.name || 'Standard Plan'}</h4>
                            <p className="text-xs text-[#526071] font-medium">Tier: {activeSub.planId?.tier || 'Growth'} • Version {activeSub.planVersion || 1}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeSub.status === 'active' ? 'smooth-badge-low' : 'smooth-badge-high'}`}>
                            {activeSub.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-200/70">
                          <div>
                            <span className="text-[#526071] font-medium">Price / Interval</span>
                            <p className="font-mono font-bold text-[#0F172A] mt-0.5">{formatCurrency(activeSub.currentMonthlyPrice)} / mo</p>
                          </div>
                          <div>
                            <span className="text-[#526071] font-medium">Start Date</span>
                            <p className="font-mono text-[#0F172A] font-semibold mt-0.5">{formatDate(activeSub.startDate)}</p>
                          </div>
                          <div>
                            <span className="text-[#526071] font-medium">Renewal Date</span>
                            <p className="font-mono font-bold text-[#0F4C81] mt-0.5">{formatDate(activeSub.renewalDate)}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#526071]">No active subscription found.</p>
                    )}
                  </div>

                  {activeSub?.changeHistory && activeSub.changeHistory.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071] mb-3">Plan Upgrade/Downgrade History</h3>
                      <div className="space-y-2">
                        {activeSub.changeHistory.map((ch, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <History className="w-4 h-4 text-[#526071]" />
                              <span className="font-bold text-[#0F172A]">
                                {ch.type.toUpperCase()}: {ch.reason || 'Plan adjustment'}
                              </span>
                            </div>
                            <span className="font-mono text-[#526071] font-medium">{formatDate(ch.date)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Churn Signals Tab */}
              {activeTab === 'signals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071]">
                      Fired Rule Signals ({churnSignals.length})
                    </h3>
                    <RiskBadge level={renewal?.riskLevel || 'low'} score={renewal?.riskScore} />
                  </div>

                  {churnSignals.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#006644] bg-[#E6F7F1] border border-[#99E3D0] rounded-2xl">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-[#00875A]" />
                      All health checks passed. No negative churn rules have fired for this account.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {churnSignals.map((signal) => (
                        <div
                          key={signal._id}
                          className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5 border-l-4 border-l-[#D0272B] shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#D0272B] flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#D0272B]" />
                              {signal.ruleName}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase smooth-badge-high">
                              {signal.weight} Weight ({signal.points} pts)
                            </span>
                          </div>
                          <p className="text-xs text-[#0F172A] leading-relaxed">{signal.details}</p>
                          <p className="text-[10px] text-[#526071] font-mono font-medium">Fired: {formatDate(signal.firedAt)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Support Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071]">
                      Customer Touchpoint History ({supportNotes.length})
                    </h3>
                    <button
                      onClick={() => setIsSupportModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs smooth-btn-secondary flex items-center gap-1.5 cursor-pointer text-[#0F172A]"
                    >
                      <Plus className="w-3 h-3 text-[#526071]" />
                      <span>Log Note</span>
                    </button>
                  </div>

                  {supportNotes.length === 0 ? (
                    <p className="text-xs text-[#526071] py-8 text-center">No support notes recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {supportNotes.map((note) => (
                        <div key={note._id} className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F172A]">{note.summary}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  note.sentiment === 'positive'
                                    ? 'smooth-badge-low'
                                    : note.sentiment === 'negative'
                                    ? 'smooth-badge-high'
                                    : 'bg-slate-100 text-[#526071] border border-slate-200'
                                }`}
                              >
                                {note.sentiment.toUpperCase()}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                                  note.status === 'open' ? 'smooth-badge-med' : 'bg-slate-100 text-[#0F172A] border border-slate-200'
                                }`}
                              >
                                {note.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {note.details && <p className="text-xs text-[#526071] leading-relaxed pl-2.5 border-l-2 border-[#0F4C81]/30">{note.details}</p>}
                          <div className="flex items-center justify-between text-[11px] text-[#526071] pt-1 border-t border-slate-200/70">
                            <span>Logged by {note.agentId?.name || 'Agent'} ({note.channel})</span>
                            <span className="font-mono font-medium">{formatDate(note.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Usage Activity Tab */}
              {activeTab === 'usage' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071]">
                    Recent Product Adoption Events ({usageEvents.length})
                  </h3>

                  {usageEvents.length === 0 ? (
                    <p className="text-xs text-[#526071] py-8 text-center">No usage events logged yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {usageEvents.slice(0, 15).map((ev) => (
                        <div key={ev._id} className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <Activity className="w-4 h-4 text-[#0F4C81]" />
                            <span className="font-bold text-[#0F172A]">{ev.eventType}</span>
                            <span className="text-[11px] text-[#526071] font-mono font-medium">({ev.count || 1} counts)</span>
                          </div>
                          <span className="text-[11px] text-[#526071] font-mono font-medium">{formatDate(ev.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SupportNoteModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onSuccess={fetchProfile}
        customerId={customer._id}
        customerName={customer.name}
      />
    </AppShell>
  );
}
