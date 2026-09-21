'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../lib/api';

export function SupportNoteModal({ isOpen, onClose, onSuccess, customerId, customerName }) {
  const [formData, setFormData] = useState({
    summary: '',
    details: '',
    channel: 'ticket',
    sentiment: 'neutral',
    status: 'resolved',
    severity: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const note = await api.createSupportNote({
        customerId,
        ...formData,
      });

      if (onSuccess) onSuccess(note);
      onClose();
      // Reset form
      setFormData({
        summary: '',
        details: '',
        channel: 'ticket',
        sentiment: 'neutral',
        status: 'resolved',
        severity: 'medium',
      });
    } catch (err) {
      setError(err.message || 'Failed to log support interaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Customer Touchpoint"
      subtitle={`Record support ticket or CSM interaction for ${customerName || 'Account'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[#FDF0F0] text-[#B01E22] rounded-xl border border-[#FECACA] font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Summary Headline *</label>
          <input
            type="text"
            required
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="e.g. Export timeout issue reported on large dataset"
            className="w-full text-xs p-3 smooth-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Channel</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
            >
              <option value="ticket">Helpdesk Ticket</option>
              <option value="email">Email Thread</option>
              <option value="call">Phone / Zoom Call</option>
              <option value="chat">Live Chat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Customer Sentiment</label>
            <select
              value={formData.sentiment}
              onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-semibold text-[#0F172A]"
            >
              <option value="positive">🟢 Positive</option>
              <option value="neutral">⚪ Neutral</option>
              <option value="negative">🔴 Negative (Elevates Risk)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Ticket Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
            >
              <option value="resolved">Resolved</option>
              <option value="open">Open / Unresolved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Details &amp; Notes</label>
          <textarea
            rows={3}
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="Detailed meeting touchpoint notes or technical troubleshooting steps..."
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
            {loading ? 'Saving...' : 'Save Interaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
