'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/AppShell';
import { Modal } from '../../../components/Modal';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/utils';
import { Plus } from 'lucide-react';

export function UsersSettingsPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'CSM',
    department: 'Customer Success',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
      ]);
      setUsers(usersData || []);
      setAuditLogs(logsData || []);
    } catch (err) {
      console.error('Error fetching users and audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchData();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(formData);
      setIsModalOpen(false);
      fetchData();
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'CSM',
        department: 'Customer Success',
      });
    } catch (err) {
      alert('Failed to invite user: ' + err.message);
    }
  };

  const roleConfigs = {
    Admin: 'neu-badge-high font-black',
    CSM: 'neu-badge text-indigo-900 font-bold',
    Support: 'neu-badge-med font-bold',
    Analyst: 'neu-badge-low font-bold',
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 neu-card">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Users & Role-Based Access Control
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Manage organization teammates, permissions (Admin, CSM, Support, Analyst), and inspect compliance audit trails.
            </p>
          </div>

          {role === 'Admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs neu-btn-primary cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Team Member</span>
            </button>
          )}
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1.5 neu-inset rounded-2xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'neu-card-flat text-indigo-700 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team Members ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'neu-card-flat text-indigo-700 font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* 1. Team Members List */}
        {activeTab === 'users' && (
          <div className="neu-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-300/40 text-slate-500 font-black uppercase tracking-wider bg-white/20">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Department</th>
                    <th className="px-4 py-4">Assigned Accounts</th>
                    <th className="px-4 py-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/30 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                        Loading team members...
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/40 transition-colors">
                        <td className="px-5 py-4 flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover neu-card-flat"
                          />
                          <span className="font-bold text-slate-900">{u.name}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 font-mono font-medium">{u.email}</td>
                        <td className="px-4 py-4 text-slate-600 font-medium">{u.department || 'Operations'}</td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-900">
                          {u.assignedAccountsCount || 0}
                        </td>
                        <td className="px-4 py-4">
                          {role === 'Admin' ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className={`text-xs px-3 py-1.5 rounded-xl border-none font-bold cursor-pointer focus:outline-none ${
                                roleConfigs[u.role]
                              }`}
                            >
                              <option value="Admin">Admin</option>
                              <option value="CSM">CSM</option>
                              <option value="Support">Support</option>
                              <option value="Analyst">Analyst</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${roleConfigs[u.role]}`}>
                              {u.role}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Audit Logs Table */}
        {activeTab === 'audit' && (
          <div className="neu-card overflow-hidden">
            <div className="p-5 border-b border-slate-300/40 bg-white/20">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Security & Action Audit Logs
              </h3>
            </div>

            <div className="divide-y divide-slate-300/30">
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">No audit logs recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log._id} className="p-5 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] neu-inset text-slate-800 font-mono font-bold">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs font-medium">{log.details || `Performed by ${log.userName} (${log.userRole})`}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold whitespace-nowrap">{formatDate(log.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite New Team Member"
        subtitle="Assign their operational role and department."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jordan Hayes"
              className="w-full text-xs p-3 neu-input font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jordan@subscriptiq.io"
              className="w-full text-xs p-3 neu-input font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role Permission</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs p-3 neu-input font-bold"
              >
                <option value="CSM">Customer Success Manager (CSM)</option>
                <option value="Support">Support Agent</option>
                <option value="Analyst">Analyst (Read-only)</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Customer Success"
                className="w-full text-xs p-3 neu-input font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-300/40">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs neu-btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs neu-btn-primary cursor-pointer"
            >
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default UsersSettingsPage;
