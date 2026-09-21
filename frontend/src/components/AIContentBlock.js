'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Edit3, X, Send, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function AIContentBlock({
  draft,
  onStatusChange,
  onRegenerate,
  isGenerating = false,
  className,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(draft?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!draft) return null;

  const statusConfigs = {
    pending_review: {
      label: 'AI Draft — Pending Review',
      badgeClass: 'bg-[#F5F3FA] text-[#483473] border border-[#DDD6FE]',
      jewelClass: 'smooth-jewel-violet',
    },
    approved: {
      label: 'Approved by CSM',
      badgeClass: 'bg-[#E6F7F1] text-[#006644] border border-[#99E3D0]',
      jewelClass: 'smooth-jewel-emerald',
    },
    edited: {
      label: 'Edited & Approved',
      badgeClass: 'bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]',
      jewelClass: 'smooth-jewel-emerald',
    },
    sent: {
      label: 'Sent to Customer',
      badgeClass: 'bg-[#E6F7F1] text-[#006644] border border-[#99E3D0]',
      jewelClass: 'smooth-jewel-emerald',
    },
    rejected: {
      label: 'Rejected',
      badgeClass: 'bg-[#FDF0F0] text-[#B01E22] border border-[#FECACA]',
      jewelClass: 'smooth-jewel-chrysanthemum',
    },
  };

  const status = draft.status || 'pending_review';
  const config = statusConfigs[status] || statusConfigs.pending_review;

  const handleAction = async (newStatus) => {
    setIsSaving(true);
    try {
      const updated = await api.reviewDraft(draft._id, {
        status: newStatus,
        content: editedContent,
      });
      setIsEditing(false);
      if (onStatusChange) onStatusChange(updated);
    } catch (err) {
      alert(err.message || 'Failed to update draft status.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={cn(
        'relative smooth-card border-l-4 border-l-[#5F4B8B] overflow-hidden transition-all duration-200',
        status === 'rejected' && 'opacity-65',
        className
      )}
    >
      {/* Console Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-[#FAF9FC]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#5F4B8B] text-white shadow-[0_3px_10px_rgba(95,75,139,0.30)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] tracking-tight">
              {draft.title || 'AI Copilot Insight'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', config.jewelClass)} />
              <p className="text-[11px] text-[#5F4B8B] font-mono font-bold">
                Model: {draft.modelUsed || 'Nemotron-70B'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-2xs',
              config.badgeClass
            )}
            role="status"
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.jewelClass)} />
            {config.label}
          </span>

          {onRegenerate && status === 'pending_review' && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="p-2 text-[#5F4B8B] hover:text-[#483473] smooth-btn-secondary cursor-pointer"
              title="Regenerate with AI"
              aria-label="Regenerate with AI"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isGenerating && 'animate-spin text-[#5F4B8B]')} />
            </button>
          )}
        </div>
      </div>

      {/* Recessed Well */}
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={10}
              className="w-full text-xs sm:text-sm font-sans leading-relaxed text-[#0F172A] p-4 smooth-input font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(draft.content);
                }}
                className="px-4 py-2 text-xs smooth-btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction('edited')}
                disabled={isSaving}
                className="px-4 py-2 text-xs smooth-btn-ai flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
            <div className="prose prose-sm max-w-none text-xs sm:text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans font-normal">
              {draft.content}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {!isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-[#FAF9FC]">
          <div className="text-[11px] text-[#526071] font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#0F4C81]" />
            {draft.reviewedBy ? (
              <span>Reviewed by {draft.reviewedBy.name || 'CSM'}</span>
            ) : (
              <span>Assistive draft — requires human review prior to delivery</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status === 'pending_review' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs smooth-btn-secondary flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#526071]" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('rejected')}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#D0272B] hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer bg-white"
                >
                  <X className="w-3.5 h-3.5 text-[#D0272B]" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('approved')}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs smooth-btn-ai flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Draft
                </button>
              </>
            )}

            {(status === 'approved' || status === 'edited') && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs smooth-btn-secondary flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#526071]" />
                  Edit Again
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('sent')}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#00875A] hover:bg-[#006644] rounded-xl shadow-[0_2px_8px_rgba(0,135,90,0.30)] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Mark as Sent
                </button>
              </>
            )}

            {status === 'sent' && (
              <span className="text-xs text-[#006644] font-bold flex items-center gap-1.5 bg-[#E6F7F1] border border-[#99E3D0] px-3.5 py-1.5 rounded-full shadow-2xs">
                <CheckCheck className="w-4 h-4 text-[#00875A]" /> Sent on {new Date(draft.sentAt || draft.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
