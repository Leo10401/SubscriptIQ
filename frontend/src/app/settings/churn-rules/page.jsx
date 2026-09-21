'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/AppShell';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { Play, ShieldCheck } from 'lucide-react';

export function ChurnRulesSettingsPage() {
  const { role } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await api.getChurnRules();
      setRules(data || []);
    } catch (err) {
      console.error('Error fetching churn rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = async (rule) => {
    try {
      await api.updateChurnRule(rule._id, { isActive: !rule.isActive });
      fetchRules();
    } catch (err) {
      alert('Failed to update rule status: ' + err.message);
    }
  };

  const handleUpdateWeight = async (ruleId, newWeight) => {
    try {
      const pointsMap = { high: 4, medium: 2, low: 1 };
      await api.updateChurnRule(ruleId, { weight: newWeight, points: pointsMap[newWeight] || 2 });
      fetchRules();
    } catch (err) {
      alert('Failed to update rule weight: ' + err.message);
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const res = await api.triggerChurnEvaluation();
      setEvalResult(res);
    } catch (err) {
      alert('Evaluation failed: ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const weightClasses = {
    high: 'smooth-badge-high font-bold',
    medium: 'smooth-badge-med font-bold',
    low: 'smooth-badge-low font-bold',
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 smooth-card">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
                Churn Risk Rules Engine
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF1F8] text-[#0F4C81] border border-[#B8D5E5]">
                Deterministic
              </span>
            </div>
            <p className="text-xs text-[#526071] font-medium mt-1">
              Configure transparent, rule-based signals and weights. The AI Copilot grounds explanations strictly on these rules.
            </p>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white smooth-btn-primary cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <Play className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? 'Evaluating Rules...' : 'Run Evaluation Across All Accounts'}</span>
          </button>
        </div>

        {/* Evaluation Result Banner */}
        {evalResult && (
          <div className="p-5 rounded-2xl smooth-card flex items-center justify-between gap-3 text-xs text-[#0F172A] animate-in fade-in border-l-4 border-l-[#0F4C81]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0F4C81] shrink-0" />
              <span>
                <strong>Evaluation complete:</strong> Evaluated {evalResult.evaluatedCount} subscriptions. Found{' '}
                <strong className="text-[#D0272B] font-bold">{evalResult.highRiskCount} High Risk</strong>,{' '}
                <strong className="text-[#B76E00] font-bold">{evalResult.mediumRiskCount} Medium Risk</strong>, and{' '}
                <strong className="text-[#00875A] font-bold">{evalResult.lowRiskCount} Low Risk</strong> accounts.
              </span>
            </div>
            <button
              onClick={() => setEvalResult(null)}
              className="text-xs text-[#0F4C81] hover:underline font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Rules Table */}
        <div className="smooth-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF9FC]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071]">Active Rule Definitions</h3>
            <span className="text-xs text-[#0F172A] font-mono font-bold">{rules.length} Rules Configured</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-xs text-[#526071] font-semibold">Loading churn rules...</div>
            ) : (
              rules.map((rule) => (
                <div
                  key={rule._id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    rule.isActive ? 'hover:bg-slate-50/70' : 'opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${rule.isActive ? (rule.weight === 'high' ? 'smooth-jewel-chrysanthemum' : rule.weight === 'medium' ? 'smooth-jewel-mimosa' : 'smooth-jewel-emerald') : 'bg-slate-300'}`} />
                      <h4 className="text-xs font-bold text-[#0F172A]">{rule.name}</h4>
                      <span className="font-mono text-[10px] text-[#526071] font-bold">[{rule.code}]</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase ${weightClasses[rule.weight]}`}>
                        {rule.weight} ({rule.points} pts)
                      </span>
                    </div>
                    <p className="text-xs text-[#526071] leading-relaxed font-medium">{rule.description}</p>
                  </div>

                  {role === 'Admin' && (
                    <div className="flex items-center gap-3">
                      {/* Weight Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#526071] font-bold">Weight:</span>
                        <select
                          value={rule.weight}
                          onChange={(e) => handleUpdateWeight(rule._id, e.target.value)}
                          className="text-xs p-2 border border-slate-200 rounded-xl bg-white font-bold text-[#0F172A] cursor-pointer"
                        >
                          <option value="high">High (4 pts)</option>
                          <option value="medium">Medium (2 pts)</option>
                          <option value="low">Low (1 pt)</option>
                        </select>
                      </div>

                      {/* Enable/Disable Button */}
                      <button
                        onClick={() => handleToggleRule(rule)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          rule.isActive
                            ? 'smooth-btn-primary'
                            : 'smooth-btn-secondary text-[#526071]'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ChurnRulesSettingsPage;
