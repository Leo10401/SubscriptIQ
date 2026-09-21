# App Flow Document
## SubscriptIQ — SaaS Subscription & Customer Lifecycle Platform

| | |
|---|---|
| **Document Owner** | Ayush |
| **Status** | Draft v1.0 |
| **Companion Documents** | SubscriptIQ_PRD.md, SubscriptIQ_TRD.md |
| **Last Updated** | August 20, 2026 |

---

## 1. Purpose

This document maps how each persona actually moves through SubscriptIQ — screen by screen — and traces the end-to-end flow of the two features at the core of the product: the renewal/churn-risk pipeline and the AI customer-success copilot. It complements the PRD (what the product does) and TRD (how it's built) with the *experience* layer: what a user sees and does, in order.
---
## 2. High-Level Navigation Map

```
Login
  │
  ▼
Dashboard (role-aware landing page)
  ├── Customers
  │     └── Customer Profile (subs, usage, support notes, churn signals, AI panel)
  ├── Plans                          (Admin only)
  ├── Renewal Pipeline
  │     └── Renewal Detail (risk breakdown, AI explain, actions)
  ├── Analytics / Retention Dashboard
  ├── Support Notes (quick-log)      (Support, CSM)
  ├── AI Drafts Inbox                (pending review queue)
  └── Settings
        ├── Users & Roles            (Admin only)
        └── Churn Rules Config       (Admin only)
```

Navigation items shown are filtered by role at render time (per the RBAC matrix in the TRD) — e.g., a Support Agent's sidebar shows only Customers (read), Customer Profile, and Support Notes.

---

## 3. Persona Flows

### 3.1 Admin
```
Login → Dashboard (org-wide KPIs)
   → Settings → Users & Roles → Invite user, assign role
   → Settings → Churn Rules Config → Adjust rule weight/threshold → Save
   → Plans → Create/Edit plan → New plan version saved
   → Renewal Pipeline → Review any account → Override risk flag (reason logged)
```

### 3.2 Customer Success Manager (CSM)
```
Login → Dashboard (my accounts: upcoming renewals, at-risk count)
   → Renewal Pipeline → Filter "At Risk" → Select account
       → Renewal Detail → View contributing churn signals
       → Click "Explain with AI" → AI-generated plain-language explanation shown
       → Click "Draft Retention Message" → AI draft appears in AI Drafts Inbox (pending_review)
   → AI Drafts Inbox → Open draft → Edit as needed → Approve & Send (or Reject)
   → Customer Profile → Log a CSM touchpoint / view full account history
```

### 3.3 Support Agent
```
Login → Dashboard (my open tickets / recent customers)
   → Customers → Search/select customer → Customer Profile
       → Support Notes tab → New Note → summary, channel, sentiment, status → Save
   (No access to Plans, Analytics, Churn Rules Config, or AI drafting)
```

### 3.4 Analyst / Read-only
```
Login → Dashboard (read-only org KPIs)
   → Analytics → Retention Dashboard → filter by date range / plan / CSM
   → Export CSV
   (No create/edit access anywhere in the app)
```

---

## 4. Core Flow: Customer Onboarding

```
CSM/Admin → Customers → "New Customer"
   → Enter company + contact details → Save (lifecycleStage = trial)
   → Subscriptions tab → "Add Subscription" → select Plan → set start date
   → System auto-generates Renewal record (stage = upcoming) based on plan's renewal date
   → [Optional] AI Drafts → "Draft Onboarding Message" → CSM reviews & sends
```

---

## 5. Core Flow: Renewal Pipeline & Churn-Risk Detection

This is the system's central automated flow — it runs largely in the background, then surfaces results for a human to act on.

```
[Scheduled Job — daily, no user action]
  1. renewalGenerationJob creates/updates Renewal records for subscriptions
     entering the configured lead window (e.g., 90 days to renewal)
  2. churnEvaluationJob evaluates each active subscription against
     configured Churn Rules (usage drop, unresolved tickets, past_due, etc.)
  3. Fired rules → ChurnSignal records created
  4. Aggregated score → Renewal.riskLevel updated (Low / Medium / High)

[User-facing flow — CSM]
  Dashboard shows "3 accounts moved to At Risk overnight"
     → Renewal Pipeline (auto-sorted, At Risk accounts surfaced first)
        → Open Renewal Detail
           → See risk level + list of contributing signals (e.g.,
             "Usage down 45%", "2 open tickets")
           → [Optional] "Explain with AI" → plain-language narrative
             of the same signals (no new signals invented)
           → CSM moves renewal stage: Upcoming → At Risk → Contacted → Renewed/Churned
           → Each stage change is logged (who, when)
```

---

## 6. Core Flow: AI Customer-Success Copilot

```
Entry points: Customer Profile, Renewal Detail, or AI Drafts Inbox

1. Trigger
   CSM clicks one of:
     - "Summarize Account"
     - "Explain Risk" (only available on a flagged Renewal)
     - "Draft Retention Message" / "Draft Onboarding Message"

2. Context Assembly (backend, invisible to user)
   Server pulls: customer profile, subscription/renewal state, recent usage
   trend, recent support notes, fired churn signals → builds structured
   context object → sends to Claude API with a task-specific system prompt

3. Draft Created
   Response saved as AIDraft (status = pending_review)
   → Appears inline (summary/explanation) or in AI Drafts Inbox (messages)
   → Clearly labeled "AI Draft — Pending Review"

4. Human Review (required — no auto-send)
   CSM opens draft →
     ├── Approve as-is → status = approved → CSM marks "Sent" after sending externally
     ├── Edit → status = edited → same approve/send step
     └── Reject → status = rejected, discarded (optionally logged for prompt tuning)

5. Audit
   Every review action (approve/edit/reject/sent) logged with user + timestamp
```

---

## 7. Screen Inventory

| Screen/Route | Primary Persona(s) | Key Actions |
|---|---|---|
| `/login` | All | Authenticate |
| `/dashboard` | All (role-aware content) | View KPIs relevant to role |
| `/customers` | Admin, CSM, Support, Analyst | List/search/filter customers |
| `/customers/:id` | Admin, CSM, Support, Analyst | View profile: subs, usage, notes, signals, AI panel |
| `/plans` | Admin | Manage plans/pricing/entitlements |
| `/subscriptions/:id` | Admin, CSM | View/edit a specific subscription |
| `/renewals` (pipeline board) | Admin, CSM, Analyst | Drag/move renewal stage, filter by risk |
| `/renewals/:id` | Admin, CSM | View risk breakdown, trigger AI explain, override risk |
| `/support-notes/new` | Support, CSM | Log a support interaction |
| `/ai-drafts` | Admin, CSM | Review pending AI-generated content |
| `/analytics` | Admin, CSM, Analyst | Retention dashboard, churn trend, revenue at risk |
| `/settings/users` | Admin | Manage users/roles |
| `/settings/churn-rules` | Admin | Configure churn signal rules and weights |

---

## 8. Key Edge-Case & Error Flows

| Scenario | Flow |
|---|---|
| AI API call fails/times out | Draft generation shows inline error + "Retry" action; no partial/garbled draft is saved |
| CSM tries to send an AI draft without reviewing | Blocked — "Sent" status only reachable from `approved` or `edited`, not `pending_review` |
| Admin overrides a risk flag | Prompted for a reason (required field) → logged to AuditLog → Renewal shows "Manually overridden by [Admin]" badge |
| Support Agent attempts to view Analytics/Plans | Route blocked client-side (nav item hidden) and server-side (403 on direct API call) |
| Session/token expires mid-session | Silent refresh via refresh token; if refresh also fails, redirect to `/login` with returning-URL preserved |
| Subscription cancelled manually before renewal date | Renewal record stage auto-moves to "Churned"; excluded from future churn-evaluation runs |

---

## 9. Open Flow Questions

- Should risk-level changes (e.g., Low → High overnight) trigger a notification/email to the owning CSM, or remain dashboard-only for MVP?
- Should the AI Drafts Inbox be a shared queue (any CSM can review) or strictly scoped to the account owner?
- Is a mobile/responsive flow needed for CSMs reviewing accounts on the go, or is desktop-only acceptable for v1?
