'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { SupportNoteModal } from '../../components/SupportNoteModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Plus } from 'lucide-react';

export function SupportNotesPage() {
  const { role } = useAuth();
  const [notes, setNotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const [notesData, custData] = await Promise.all([
        api.getSupportNotes({ sentiment: sentimentFilter, status: statusFilter }),
        api.getCustomers().catch(() => ({ customers: [] })),
      ]);
      setNotes(notesData || []);
      setCustomers(custData.customers || []);
      if (custData.customers && custData.customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custData.customers[0]._id);
      }
    } catch (err) {
      console.error('Error fetching support notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [sentimentFilter, statusFilter]);

  const sentimentConfigs = {
    positive: { badge: 'smooth-badge-low', jewel: 'smooth-jewel-emerald' },
    neutral: { badge: 'bg-slate-100 text-[#526071] border border-slate-200', jewel: 'bg-slate-400' },
    negative: { badge: 'smooth-badge-high font-bold', jewel: 'smooth-jewel-chrysanthemum' },
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Support Interactions &amp; Notes
            </h1>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Log tickets, phone calls, and customer touchpoints. Unresolved issues and negative sentiments feed the churn engine.
            </p>
          </div>

          {(role === 'Admin' || role === 'CSM' || role === 'Support') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs smooth-btn-primary cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Log Support Note</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 smooth-card">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-[#526071] font-bold uppercase hidden sm:inline">Sentiment:</span>
            {['', 'positive', 'neutral', 'negative'].map((st) => (
              <button
                key={st}
                onClick={() => setSentimentFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  sentimentFilter === st
                    ? 'bg-[#0F4C81] text-white shadow-2xs'
                    : 'bg-white text-[#526071] hover:text-[#0F172A] border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {st === '' ? 'All Sentiment' : st.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#526071] font-bold uppercase hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 border border-slate-200 rounded-xl bg-white font-bold text-[#0F172A] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="open">Open / Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Notes Feed */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#526071] font-semibold">Loading support notes...</div>
          ) : notes.length === 0 ? (
            <div className="smooth-card p-12 text-center text-xs text-[#526071] font-medium">
              No support notes found matching your criteria.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="smooth-card p-5 space-y-3 smooth-card-interactive"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/customers/${note.customerId?._id}`}
                      className="font-bold text-xs text-[#0F172A] hover:text-[#0F4C81] transition-colors"
                    >
                      {note.customerId?.name || 'Account'}
                    </Link>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-[#0F172A]">{note.summary}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        sentimentConfigs[note.sentiment]?.badge || sentimentConfigs.neutral.badge
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sentimentConfigs[note.sentiment]?.jewel || 'bg-slate-400'}`} />
                      {note.sentiment.toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        note.status === 'open'
                          ? 'smooth-badge-med font-extrabold'
                          : 'bg-slate-100 text-[#0F172A] border border-slate-200'
                      }`}
                    >
                      {note.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {note.details && (
                  <p className="text-xs text-[#0F172A] leading-relaxed p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                    {note.details}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#526071] pt-2 border-t border-slate-100 font-medium">
                  <span>
                    Logged by {note.agentId?.name || 'Support Agent'} via {note.channel.toUpperCase()}
                  </span>
                  <span className="font-mono">{formatDate(note.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <SupportNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchNotes}
        customerId={selectedCustomerId}
        customerName={customers.find((c) => c._id === selectedCustomerId)?.name}
      />
    </AppShell>
  );
}

export default SupportNotesPage;
