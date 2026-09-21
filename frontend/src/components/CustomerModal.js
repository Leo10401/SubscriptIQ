'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../lib/api';

export function CustomerModal({ isOpen, onClose, onSuccess, customer = null, plans = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology',
    size: '11-50',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    planId: '',
    mrr: 199,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        industry: customer.industry || 'Technology',
        size: customer.size || '11-50',
        contactName: customer.contacts?.[0]?.name || '',
        contactEmail: customer.contacts?.[0]?.email || '',
        contactPhone: customer.contacts?.[0]?.phone || '',
        website: customer.website || '',
        planId: customer.activeSubscription?.planId?._id || '',
        mrr: customer.mrr || 199,
      });
    } else {
      setFormData({
        name: '',
        industry: 'Technology',
        size: '11-50',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        planId: plans[0]?._id || '',
        mrr: plans[0]?.price || 199,
      });
    }
  }, [customer, plans, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        industry: formData.industry,
        size: formData.size,
        website: formData.website,
        mrr: Number(formData.mrr),
        arr: Number(formData.mrr) * 12,
        contacts: [
          {
            name: formData.contactName || 'Primary Contact',
            email: formData.contactEmail || `contact@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            phone: formData.contactPhone || '',
          },
        ],
      };

      let resCustomer;
      if (customer) {
        resCustomer = await api.updateCustomer(customer._id, payload);
      } else {
        resCustomer = await api.createCustomer(payload);
        if (formData.planId) {
          await api.createSubscription({
            customerId: resCustomer._id,
            planId: formData.planId,
          });
        }
      }

      if (onSuccess) onSuccess(resCustomer);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer Account' : 'Create New Customer Account'}
      subtitle="Fill in company and primary contact details to manage subscription lifecycle."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-[#FDF0F0] text-[#B01E22] rounded-xl border border-[#FECACA] font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Company Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apex Global Systems"
            className="w-full text-xs p-3 smooth-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
            >
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial Services">Financial Services</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Company Size</label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
        </div>

        {!customer && plans.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Initial Plan</label>
              <select
                value={formData.planId}
                onChange={(e) => {
                  const selPlan = plans.find((p) => p._id === e.target.value);
                  setFormData({
                    ...formData,
                    planId: e.target.value,
                    mrr: selPlan ? selPlan.price : formData.mrr,
                  });
                }}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] focus:outline-none bg-white font-medium text-[#0F172A]"
              >
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (${p.price}/mo)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Monthly MRR ($)</label>
              <input
                type="number"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                className="w-full text-xs p-3 smooth-input font-mono"
              />
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-bold text-[#0F172A] mb-2.5">Primary Contact Information</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#526071] mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="e.g. Jordan Hayes"
                className="w-full text-xs p-3 smooth-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#526071] mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="jordan@company.com"
                className="w-full text-xs p-3 smooth-input"
              />
            </div>
          </div>
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
            {loading ? 'Saving...' : customer ? 'Save Changes' : 'Create Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
