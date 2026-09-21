const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('subscriptiq_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Optional redirect on 401
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.warn(`Fetch error for ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCurrentUser: () => fetchWithAuth('/auth/me'),
  getDemoUsers: () => fetchWithAuth('/auth/demo-users'),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/customers${query ? `?${query}` : ''}`);
  },
  getCustomerById: (id) => fetchWithAuth(`/customers/${id}`),
  createCustomer: (data) =>
    fetchWithAuth('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCustomer: (id, data) =>
    fetchWithAuth(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id) =>
    fetchWithAuth(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // Plans
  getPlans: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/plans${query ? `?${query}` : ''}`);
  },
  createPlan: (data) =>
    fetchWithAuth('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePlan: (id, data) =>
    fetchWithAuth(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deletePlan: (id) =>
    fetchWithAuth(`/plans/${id}`, {
      method: 'DELETE',
    }),

  // Subscriptions
  getSubscriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/subscriptions${query ? `?${query}` : ''}`);
  },
  getSubscriptionById: (id) => fetchWithAuth(`/subscriptions/${id}`),
  createSubscription: (data) =>
    fetchWithAuth('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSubscription: (id, data) =>
    fetchWithAuth(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Renewals Pipeline
  getRenewals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/renewals${query ? `?${query}` : ''}`);
  },
  getRenewalById: (id) => fetchWithAuth(`/renewals/${id}`),
  updateRenewalStage: (id, stage, notes) =>
    fetchWithAuth(`/renewals/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, notes }),
    }),
  overrideRenewalRisk: (id, overrideRiskLevel, reason) =>
    fetchWithAuth(`/renewals/${id}/override-risk`, {
      method: 'POST',
      body: JSON.stringify({ overrideRiskLevel, reason }),
    }),

  // Usage Events
  getUsageEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/usage-events${query ? `?${query}` : ''}`);
  },
  logUsageEvent: (data) =>
    fetchWithAuth('/usage-events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Support Notes
  getSupportNotes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/support-notes${query ? `?${query}` : ''}`);
  },
  createSupportNote: (data) =>
    fetchWithAuth('/support-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Churn Rules & Signals
  getChurnRules: () => fetchWithAuth('/churn-rules'),
  updateChurnRule: (id, data) =>
    fetchWithAuth(`/churn-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  triggerChurnEvaluation: () =>
    fetchWithAuth('/churn-rules/evaluate-now', {
      method: 'POST',
    }),
  getChurnSignals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/churn-rules/signals${query ? `?${query}` : ''}`);
  },

  // Analytics
  getRetentionSummary: () => fetchWithAuth('/analytics/retention-summary'),
  getChurnTrend: () => fetchWithAuth('/analytics/churn-trend'),
  getCohorts: () => fetchWithAuth('/analytics/cohorts'),
  getExportCSVUrl: () => `${API_BASE}/analytics/export-csv`,

  // AI Copilot
  summarizeCustomer: (customerId) =>
    fetchWithAuth(`/ai/summarize/${customerId}`, {
      method: 'POST',
    }),
  explainRisk: (renewalId) =>
    fetchWithAuth(`/ai/explain-risk/${renewalId}`, {
      method: 'POST',
    }),
  draftMessage: (customerId, type = 'retention') =>
    fetchWithAuth(`/ai/draft-message/${customerId}`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
  getDrafts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/ai/drafts${query ? `?${query}` : ''}`);
  },
  getDraftById: (id) => fetchWithAuth(`/ai/drafts/${id}`),
  reviewDraft: (id, data) =>
    fetchWithAuth(`/ai/drafts/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // User & Audit Management
  getUsers: () => fetchWithAuth('/users'),
  createUser: (data) =>
    fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUserRole: (id, role, department) =>
    fetchWithAuth(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, department }),
    }),
  getAuditLogs: () => fetchWithAuth('/users/audit-logs'),

  // Seed Helper
  seedDatabase: () =>
    fetchWithAuth('/seed', {
      method: 'POST',
    }),
};
