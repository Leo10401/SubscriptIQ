'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/AppShell';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit3, Archive } from 'lucide-react';

export function PlansPage() {
  const { role } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    tier: 'Growth',
    price: 199,
    billingInterval: 'monthly',
    description: '',
    seats: 10,
    apiCalls: 50000,
    storageGB: 50,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api.getPlans({ includeArchived: true });
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setSelectedPlan(null);
    setFormData({
      name: '',
      tier: 'Growth',
      price: 199,
      billingInterval: 'monthly',
      description: '',
      seats: 10,
      apiCalls: 50000,
      storageGB: 50,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      tier: plan.tier || 'Growth',
      price: plan.price,
      billingInterval: plan.billingInterval || 'monthly',
      description: plan.description || '',
      seats: plan.usageLimits?.seats || 5,
      apiCalls: plan.usageLimits?.apiCalls || 10000,
      storageGB: plan.usageLimits?.storageGB || 50,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        tier: formData.tier,
        price: Number(formData.price),
        billingInterval: formData.billingInterval,
        description: formData.description,
        usageLimits: {
          seats: Number(formData.seats),
          apiCalls: Number(formData.apiCalls),
          storageGB: Number(formData.storageGB),
        },
      };

      if (selectedPlan) {
        await api.updatePlan(selectedPlan._id, payload);
      } else {
        await api.createPlan(payload);
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert('Failed to save plan: ' + err.message);
    }
  };

  const handleArchive = async (planId) => {
    if (confirm('Archive this subscription plan? Existing subscriptions will maintain historical pricing.')) {
      try {
        await api.deletePlan(planId);
        fetchPlans();
      } catch (err) {
        alert('Failed to archive plan: ' + err.message);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Subscription Plans &amp; Entitlements
            </h1>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Configure SaaS tiers, usage limits, pricing intervals, and version history.
            </p>
          </div>

          {role === 'Admin' && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs smooth-btn-primary cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Plan</span>
            </button>
          )}
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`smooth-card p-6 flex flex-col justify-between transition-all smooth-card-interactive ${
                plan.isArchived ? 'opacity-60' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]">
                    {plan.tier} Tier
                  </span>
                  <span className="text-[10px] text-[#526071] font-mono font-bold">v{plan.version || 1}</span>
                </div>

                <h3 className="text-base font-bold text-[#0F172A] mt-4">{plan.name}</h3>
                <p className="text-xs text-[#526071] font-medium mt-1 min-h-[36px] line-clamp-2">
                  {plan.description || 'Standard platform tier.'}
                </p>

                <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-[#0F172A]">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-[#526071] font-medium">/{plan.billingInterval}</span>
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="mt-4 space-y-2 text-xs text-[#0F172A]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                    <span className="text-[#526071] font-medium">Seats:</span>
                    <span className="font-mono font-bold text-[#0F172A]">{plan.usageLimits?.seats || 5}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                    <span className="text-[#526071] font-medium">API Calls / mo:</span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {(plan.usageLimits?.apiCalls || 10000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                    <span className="text-[#526071] font-medium">Storage:</span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {plan.usageLimits?.storageGB || 50} GB
                    </span>
                  </div>
                </div>
              </div>

              {role === 'Admin' && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="px-3.5 py-1.5 text-xs smooth-btn-secondary flex items-center gap-1.5 cursor-pointer text-[#0F172A]"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#526071]" />
                    <span>Edit</span>
                  </button>
                  {!plan.isArchived && (
                    <button
                      onClick={() => handleArchive(plan._id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#D0272B] hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer bg-white"
                    >
                      <Archive className="w-3.5 h-3.5 text-[#D0272B]" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Plan Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlan ? 'Edit Plan Version' : 'Create New Subscription Plan'}
        subtitle="Pricing changes automatically generate a new plan version while preserving existing subscriptions."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Plan Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Enterprise Plus"
              className="w-full text-xs p-3 smooth-input font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Plan Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Scale">Scale</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Billing Interval</label>
              <select
                value={formData.billingInterval}
                onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Price ($) *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full text-xs p-3 smooth-input font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of entitlements and suitable company stage..."
              className="w-full text-xs p-3 smooth-input"
            />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-bold text-[#0F172A] mb-2.5">Usage Entitlements</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#526071] mb-1">Seats</label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                  className="w-full text-xs p-2.5 smooth-input font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#526071] mb-1">API Calls</label>
                <input
                  type="number"
                  value={formData.apiCalls}
                  onChange={(e) => setFormData({ ...formData, apiCalls: e.target.value })}
                  className="w-full text-xs p-2.5 smooth-input font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#526071] mb-1">Storage (GB)</label>
                <input
                  type="number"
                  value={formData.storageGB}
                  onChange={(e) => setFormData({ ...formData, storageGB: e.target.value })}
                  className="w-full text-xs p-2.5 smooth-input font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs smooth-btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white smooth-btn-primary cursor-pointer"
            >
              {selectedPlan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default PlansPage;
