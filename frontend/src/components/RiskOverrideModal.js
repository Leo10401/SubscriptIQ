'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../lib/api';
import { ShieldAlert } from 'lucide-react';

export function RiskOverrideModal({ isOpen, onClose, onSuccess, renewal }) {
  const [overrideLevel, setOverrideLevel] = useState(renewal?.riskLevel || 'low');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A justification reason is required for compliance and audit logs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updated = await api.overrideRenewalRisk(renewal._id, overrideLevel, reason);
      if (onSuccess) onSuccess(updated);
      onClose();
      setReason('');
    } catch (err) {
      setError(err.message || 'Failed to override risk level.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Override Churn Risk Flag (Admin Only)"
      subtitle="Manually adjust the calculated risk level. This action is permanently logged to the audit trail."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[#FDF0F0] text-[#B01E22] rounded-xl border border-[#FECACA] font-medium">
            {error}
          </div>
        )}

        <div className="p-3.5 bg-[#FFF8E6] rounded-xl border border-[#FDE68A] flex items-start gap-2.5 text-xs text-[#874700]">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#B76E00] mt-0.5" />
          <p>
            Current calculated risk for <strong>{renewal?.customerId?.name || 'Account'}</strong> is{' '}
            <strong className="uppercase font-bold">{renewal?.riskLevel}</strong> (score: {renewal?.riskScore}).
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">New Risk Level *</label>
          <select
            value={overrideLevel}
            onChange={(e) => setOverrideLevel(e.target.value)}
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-semibold text-[#0F172A]"
          >
            <option value="low">🟢 Low Risk (Healthy)</option>
            <option value="medium">🟡 Medium Risk (Attention Needed)</option>
            <option value="high">🔴 High Risk (Critical)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Justification &amp; Context * <span className="text-[#526071] font-normal">(Required for audit trail)</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Spoke directly with VP of Operations; temporary usage dip was due to company ERP migration, not dissatisfaction."
            className="w-full text-xs p-3 smooth-input"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs smooth-btn-secondary cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3B66] rounded-xl shadow-[0_2px_8px_rgba(15,76,129,0.25)] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting Override...' : 'Apply Risk Override'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
