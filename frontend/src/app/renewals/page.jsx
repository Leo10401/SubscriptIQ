'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AppShell } from '../../components/AppShell';
import { RiskBadge } from '../../components/RiskBadge';
import { SlideOver } from '../../components/SlideOver';
import { AIContentBlock } from '../../components/AIContentBlock';
import { RiskOverrideModal } from '../../components/RiskOverrideModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency, formatDate, formatRelativeDays } from '../../lib/utils';
import {
  Sparkles,
  ChevronRight,
  Send,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  X,
  Layers,
} from 'lucide-react';

const COLUMNS = [
  { id: 'upcoming', title: 'Upcoming Renewals', headingColor: 'text-[#0F4C81]', jewel: 'smooth-jewel-violet' },
  { id: 'at_risk', title: 'At Risk', headingColor: 'text-[#D0272B]', jewel: 'smooth-jewel-chrysanthemum' },
  { id: 'contacted', title: 'Contacted', headingColor: 'text-[#B76E00]', jewel: 'smooth-jewel-mimosa' },
  { id: 'renewed', title: 'Renewed', headingColor: 'text-[#00875A]', jewel: 'smooth-jewel-emerald' },
  { id: 'churned', title: 'Churned', headingColor: 'text-[#526071]', jewel: 'bg-slate-400' },
];

export function RenewalPipelinePage() {
  const { role } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  // AI Generation States in SlideOver
  const [isExplainingRisk, setIsExplainingRisk] = useState(false);
  const [isDraftingMessage, setIsDraftingMessage] = useState(false);
  const [aiExplanationDraft, setAiExplanationDraft] = useState(null);
  const [aiMessageDraft, setAiMessageDraft] = useState(null);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const data = await api.getRenewals();
      setCards(data || []);

      if (selectedRenewal) {
        const updated = (data || []).find((r) => r._id === selectedRenewal._id);
        if (updated) setSelectedRenewal(updated);
      }
    } catch (err) {
      console.error('Error fetching renewals pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleOpenDetail = async (renewal) => {
    setSelectedRenewal(renewal);
    setIsSlideOverOpen(true);
    setAiExplanationDraft(null);
    setAiMessageDraft(null);

    if (renewal.customerId?._id) {
      try {
        const drafts = await api.getDrafts({ customerId: renewal.customerId._id });
        const explanation = drafts.find((d) => d.type === 'risk_explanation');
        const message = drafts.find((d) => d.type === 'retention_message');
        if (explanation) setAiExplanationDraft(explanation);
        if (message) setAiMessageDraft(message);
      } catch (e) {
        console.warn('Error fetching drafts:', e);
      }
    }
  };

  const handleExplainRiskWithAI = async () => {
    if (!selectedRenewal) return;
    setIsExplainingRisk(true);
    try {
      const draft = await api.explainRisk(selectedRenewal._id);
      setAiExplanationDraft(draft);
    } catch (err) {
      alert('Failed to explain risk: ' + err.message);
    } finally {
      setIsExplainingRisk(false);
    }
  };

  const handleDraftRetentionMessage = async () => {
    if (!selectedRenewal || !selectedRenewal.customerId) return;
    setIsDraftingMessage(true);
    try {
      const draft = await api.draftMessage(selectedRenewal.customerId._id, 'retention');
      setAiMessageDraft(draft);
    } catch (err) {
      alert('Failed to draft message: ' + err.message);
    } finally {
      setIsDraftingMessage(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
                Renewal Pipeline Kanban
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]">
                Interactive Stages
              </span>
            </div>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Drag accounts across stages or drop into the Churn Bin. Click any contract card to inspect telemetry, risk signals, and launch AI Copilot drafts.
            </p>
          </div>
        </div>

        {/* Board Component */}
        <div className="flex w-full gap-5 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col.id}
              title={col.title}
              headingColor={col.headingColor}
              jewel={col.jewel}
              cards={cards}
              setCards={setCards}
              onCardClick={handleOpenDetail}
              role={role}
            />
          ))}
          <BurnBarrel setCards={setCards} />
        </div>
      </div>

      {/* Renewal Detail SlideOver */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={selectedRenewal?.customerId?.name || 'Renewal Details'}
        subtitle={`Target Renewal: ${formatDate(selectedRenewal?.targetRenewalDate)} (${formatRelativeDays(selectedRenewal?.targetRenewalDate)})`}
      >
        {selectedRenewal && (
          <div className="space-y-6">
            {/* Status & Risk Banner */}
            <div className="p-5 smooth-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#526071] font-bold">Calculated Risk Level</span>
                  <div className="mt-1 flex items-center gap-2">
                    <RiskBadge level={selectedRenewal.riskLevel} score={selectedRenewal.riskScore} size="lg" />
                    {selectedRenewal.overrideRiskLevel && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F5F3FA] text-[#5F4B8B] border border-[#DDD6FE]">
                        Overridden by Admin
                      </span>
                    )}
                  </div>
                </div>

                {role === 'Admin' && (
                  <button
                    onClick={() => setIsOverrideModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs smooth-btn-secondary flex items-center gap-1.5 cursor-pointer text-[#0F172A]"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#526071]" />
                    <span>Override Risk</span>
                  </button>
                )}
              </div>

              {selectedRenewal.overrideReason && (
                <p className="text-xs text-[#483473] bg-[#F5F3FA] border border-[#DDD6FE] p-3.5 rounded-xl font-medium">
                  <strong>Override Justification:</strong> {selectedRenewal.overrideReason}
                </p>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExplainRiskWithAI}
                disabled={isExplainingRisk}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs smooth-btn-ai cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExplainingRisk ? 'Analyzing...' : 'Explain Risk with AI'}</span>
              </button>

              <button
                onClick={handleDraftRetentionMessage}
                disabled={isDraftingMessage}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs smooth-btn-primary cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isDraftingMessage ? 'Drafting...' : 'Draft Outreach'}</span>
              </button>
            </div>

            {/* AI Risk Explanation Block */}
            {aiExplanationDraft && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#5F4B8B] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#5F4B8B]" />
                  <span>AI Risk Explanation (Grounded)</span>
                </h4>
                <AIContentBlock
                  draft={aiExplanationDraft}
                  onStatusChange={fetchRenewals}
                  onRegenerate={handleExplainRiskWithAI}
                  isGenerating={isExplainingRisk}
                />
              </div>
            )}

            {/* AI Retention Message Block */}
            {aiMessageDraft && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#0F4C81] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F4C81]" />
                  <span>AI Outreach Draft</span>
                </h4>
                <AIContentBlock
                  draft={aiMessageDraft}
                  onStatusChange={fetchRenewals}
                  onRegenerate={handleDraftRetentionMessage}
                  isGenerating={isDraftingMessage}
                />
              </div>
            )}

            {/* Rule Engine Fired Signals Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#526071]">
                Contributing Deterministic Signals ({selectedRenewal.contributingSignals?.length || 0})
              </h4>

              {(!selectedRenewal.contributingSignals || selectedRenewal.contributingSignals.length === 0) ? (
                <div className="p-4 text-center rounded-2xl bg-[#E6F7F1] border border-[#99E3D0] text-[#006644] text-xs">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-[#00875A]" />
                  No negative signals fired for this account.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedRenewal.contributingSignals.map((signal) => (
                    <div
                      key={signal._id || signal.ruleCode}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5 border-l-4 border-l-[#D0272B] shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#D0272B]">{signal.ruleName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FDF0F0] text-[#B01E22] border border-[#FECACA]">
                          {signal.weight} Priority
                        </span>
                      </div>
                      <p className="text-xs text-[#0F172A] leading-relaxed">{signal.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Full Account Profile Link */}
            <div className="pt-4 border-t border-slate-200/80">
              <Link
                href={`/customers/${selectedRenewal.customerId?._id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs smooth-btn-secondary cursor-pointer"
              >
                <span>View Complete Customer Profile</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Admin Risk Override Modal */}
      <RiskOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        onSuccess={fetchRenewals}
        renewal={selectedRenewal}
      />
    </AppShell>
  );
}

const Column = ({ title, headingColor, jewel, cards, column, setCards, onCardClick, role }) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData("cardId", card._id);
  };

  const handleDragEnd = async (e) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c._id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, stage: column };

      copy = copy.filter((c) => c._id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el._id === before);
        if (insertAtIndex !== -1) {
          copy.splice(insertAtIndex, 0, cardToTransfer);
        } else {
          copy.push(cardToTransfer);
        }
      }

      setCards(copy);

      // Persist stage update in backend database
      try {
        await api.updateRenewalStage(cardId, column);
      } catch (err) {
        console.error('Failed to sync renewal stage to backend:', err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = (els) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    if (el && el.element) {
      el.element.style.opacity = "1";
    }
  };

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.stage === column);
  const totalStageMrr = filteredCards.reduce(
    (acc, r) => acc + (r.subscriptionId?.currentMonthlyPrice || r.customerId?.mrr || 0),
    0
  );

  return (
    <div className="w-72 shrink-0">
      {/* Column Header */}
      <div className="mb-3 px-3.5 py-2.5 smooth-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${jewel}`} />
          <h3 className={`text-xs font-black ${headingColor}`}>{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F6F8FB] text-[#0F172A] border border-slate-200">
            {filteredCards.length}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#0F172A] font-bold">
          {formatCurrency(totalStageMrr)}
        </span>
      </div>

      {/* Column Drop Zone */}
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`min-h-[540px] p-3 rounded-3xl transition-all border border-slate-200/70 ${
          active
            ? "bg-[#EAF1F8]/90 shadow-[inset_0_0_12px_rgba(15,76,129,0.18)] border-[#0F4C81]/30"
            : "bg-[#F4F6F9]/60"
        }`}
      >
        {filteredCards.map((c) => {
          return (
            <Card
              key={c._id}
              card={c}
              column={column}
              handleDragStart={handleDragStart}
              onClick={() => onCardClick(c)}
            />
          );
        })}
        <DropIndicator beforeId={null} column={column} />
        {(role === 'Admin' || role === 'CSM') && (
          <AddCard column={column} setCards={setCards} />
        )}
      </div>
    </div>
  );
};

const Card = ({ card, column, handleDragStart, onClick }) => {
  const isHighRisk = card.riskLevel === 'high';

  return (
    <>
      <DropIndicator beforeId={card._id} column={column} />
      <motion.div
        layout
        layoutId={card._id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, card)}
        onClick={onClick}
        className={`cursor-grab active:cursor-grabbing p-4 rounded-2xl smooth-card smooth-card-interactive space-y-2.5 select-none ${
          isHighRisk ? 'border-l-4 border-l-[#D0272B]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">
            {card.customerId?.name || 'Account'}
          </h4>
          <RiskBadge level={card.riskLevel} score={card.riskScore} size="sm" showLabel={false} />
        </div>

        <div className="space-y-1 text-[11px] text-[#526071] font-medium">
          <div className="flex items-center justify-between">
            <span>MRR:</span>
            <span className="font-mono font-bold text-[#0F172A]">
              {formatCurrency(card.subscriptionId?.currentMonthlyPrice || card.customerId?.mrr)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target:</span>
            <span className="font-mono font-semibold text-[#526071]">
              {formatDate(card.targetRenewalDate)}
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const DropIndicator = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-1.5 h-1 w-full rounded-full bg-[#0F4C81] shadow-[0_0_8px_rgba(15,76,129,0.8)] opacity-0 transition-opacity duration-150"
    />
  );
};

const BurnBarrel = ({ setCards }) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = async (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;

    setCards((pv) => pv.map((c) => (c._id === cardId ? { ...c, stage: 'churned' } : c)));
    setActive(false);

    try {
      await api.updateRenewalStage(cardId, 'churned');
    } catch (err) {
      console.error('Failed to churn card in barrel:', err);
    }
  };

  return (
    <div className="w-56 shrink-0 pt-1">
      <div className="mb-3 px-3.5 py-2.5 smooth-card text-center">
        <h3 className="text-xs font-black text-[#D0272B]">Churn Drop Bin</h3>
      </div>

      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`grid h-56 w-full place-content-center rounded-3xl transition-all border border-slate-200/70 ${
          active
            ? "bg-[#FDF0F0] shadow-[inset_0_0_16px_rgba(208,39,43,0.3)] text-[#D0272B] scale-105 border-[#D0272B]/40"
            : "bg-[#F4F6F9]/60 text-slate-400"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          {active ? (
            <Flame className="w-9 h-9 animate-bounce text-[#D0272B]" />
          ) : (
            <Trash2 className="w-8 h-8 text-slate-400" />
          )}
          <span className="text-[11px] font-bold text-[#526071]">
            {active ? 'Drop to Churn' : 'Drag here to Churn'}
          </span>
        </div>
      </div>
    </div>
  );
};

const AddCard = ({ column, setCards }) => {
  const [name, setName] = useState("");
  const [mrr, setMrr] = useState(199);
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim().length) return;

    const newCard = {
      _id: Math.random().toString(),
      stage: column,
      riskLevel: 'low',
      riskScore: 0,
      targetRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      customerId: {
        _id: Math.random().toString(),
        name: name.trim(),
        mrr: Number(mrr),
      },
      subscriptionId: {
        currentMonthlyPrice: Number(mrr),
      },
    };

    setCards((pv) => [...pv, newCard]);
    setName("");
    setAdding(false);
  };

  return (
    <div className="mt-3">
      {adding ? (
        <motion.form layout onSubmit={handleSubmit} className="p-3.5 rounded-2xl smooth-card space-y-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="Account name..."
            className="w-full text-xs p-2.5 smooth-input font-bold"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#526071] font-bold">MRR:</span>
            <input
              type="number"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              className="w-full text-xs p-2 smooth-input font-mono font-bold"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-[#526071] hover:text-[#0F172A] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1.5 text-xs smooth-btn-primary"
            >
              <span>Add</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0F4C81] hover:bg-[#EAF1F8] rounded-xl smooth-btn-secondary cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#0F4C81]" />
          <span>Add account</span>
        </motion.button>
      )}
    </div>
  );
};

export default RenewalPipelinePage;
