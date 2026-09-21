'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { RiskBadge } from '../../components/RiskBadge';
import { CustomerModal } from '../../components/CustomerModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import {
  Plus,
  Search,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function CustomersPage() {
  const { role } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const [resCust, resPlans] = await Promise.all([
        api.getCustomers({ search, stage: stageFilter }),
        api.getPlans().catch(() => []),
      ]);
      setCustomers(resCust.customers || []);
      setPlans(resPlans || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [stageFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const stageBadgeClasses = {
    trial: 'bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]',
    active: 'smooth-badge-low',
    at_risk: 'smooth-badge-high font-bold',
    churned: 'bg-slate-100 text-[#526071] border border-slate-200',
  };

  return (
    <AppShell onSearch={(val) => { setSearch(val); fetchCustomers(); }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Customer Accounts Directory
            </h1>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Manage accounts, active subscriptions, health telemetry, and AI lifecycle summaries.
            </p>
          </div>

          {(role === 'Admin' || role === 'CSM') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs smooth-btn-primary cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 smooth-card">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#526071]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or contact..."
              className="w-full pl-10 pr-4 py-2 text-xs smooth-input font-medium"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-[#526071] font-bold uppercase hidden sm:inline">Stage:</span>
            {['', 'active', 'at_risk', 'trial', 'churned'].map((st) => (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  stageFilter === st
                    ? 'bg-[#0F4C81] text-white shadow-2xs'
                    : 'bg-white text-[#526071] hover:text-[#0F172A] border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {st === '' ? 'All Accounts' : st.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="smooth-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-[#FAF9FC] text-[#526071] font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-4">Company</th>
                  <th className="px-4 py-4">Lifecycle Stage</th>
                  <th className="px-4 py-4">Health Score</th>
                  <th className="px-4 py-4">Active Plan</th>
                  <th className="px-4 py-4">MRR</th>
                  <th className="px-4 py-4">Churn Risk</th>
                  <th className="px-4 py-4">Account Owner</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-[#0F172A]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#526071] font-medium">
                      Loading customer accounts...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#526071] font-medium">
                      No customer accounts found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/customers/${c._id}`}
                          className="font-bold text-[#0F172A] hover:text-[#0F4C81] transition-colors block"
                        >
                          {c.name}
                        </Link>
                        <span className="text-[11px] text-[#526071] font-medium">
                          {c.industry} • {c.size} seats
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            stageBadgeClasses[c.lifecycleStage] || 'smooth-badge-low'
                          }`}
                        >
                          {c.lifecycleStage.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                c.healthScore > 75
                                  ? 'bg-[#00875A]'
                                  : c.healthScore > 50
                                  ? 'bg-[#D97706]'
                                  : 'bg-[#D0272B]'
                              }`}
                              style={{ width: `${c.healthScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-[#0F172A] font-bold">{c.healthScore}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-bold text-[#0F172A]">
                          {c.activeSubscription?.planId?.name || 'Standard Tier'}
                        </span>
                        {c.activeSubscription?.status === 'past_due' && (
                          <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold smooth-badge-high">
                            PAST DUE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 font-mono font-bold text-[#0F172A]">
                        {formatCurrency(c.mrr || c.activeSubscription?.currentMonthlyPrice || 0)}
                      </td>

                      <td className="px-4 py-4">
                        <RiskBadge
                          level={c.renewal?.riskLevel || (c.lifecycleStage === 'at_risk' ? 'high' : 'low')}
                          score={c.renewal?.riskScore}
                          size="sm"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-[#0F172A] font-semibold">
                          {c.ownerId?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/customers/${c._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs smooth-btn-secondary"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCustomers}
        plans={plans}
      />
    </AppShell>
  );
}

export default CustomersPage;
