# Product Requirements Document (PRD)
## SubscriptIQ — SaaS Subscription & Customer Lifecycle Platform

| | |
|---|---|
| **Document Owner** | Ayush |
| **Status** | Draft v1.0 |
| **Last Updated** | August 20, 2026 |

---

## 1. Overview

SubscriptIQ is a platform that helps a SaaS business manage the full customer lifecycle — from onboarding through subscription, renewal, support, and eventual churn or retention. It centralizes customer, plan, and subscription data; automates renewal tracking with rule-based churn-risk flags; and gives customer-success teams an AI copilot that summarizes account history, explains why an account is flagged at risk, and drafts retention or onboarding messages for human review.

### 1.1 Problem Statement

SaaS teams typically track customers, subscriptions, support tickets, and usage in disconnected tools (CRM, billing system, helpdesk, spreadsheets). This fragmentation makes it hard to answer a simple question quickly: *"Which accounts are at risk of churning, why, and what should we do about it?"* Customer success managers (CSMs) spend significant time manually piecing together account history before a renewal call or a retention outreach.

### 1.2 Solution Summary

SubscriptIQ consolidates customer, plan, subscription, renewal, usage, and support data in one system, applies transparent rule-based logic to flag churn risk, and surfaces everything through a retention dashboard. An AI copilot sits on top of this structured data to save CSMs time — summarizing an account, explaining *why* a churn flag fired, and drafting a first-pass outreach message — while keeping a human in the loop for anything sent to a customer.

---

## 2. Goals & Objectives

| Goal | Success Looks Like |
|---|---|
| Unify customer lifecycle data | One system of record for customers, plans, subscriptions, renewals, usage, and support notes |
| Make churn risk visible early | Renewal pipeline surfaces at-risk accounts before renewal date, not after cancellation |
| Reduce manual prep time for CSMs | AI copilot cuts account-review/prep time before renewal calls or outreach |
| Keep AI assistive, not autonomous | Every AI-drafted message and every churn explanation is reviewable and requires human approval before action |
| Demonstrate role-based access control | Different personas (Admin, CSM, Support Agent, Read-only/Analyst) see and do only what they should |

### 2.1 Non-Goals (see also Section 11 — Out of Scope)

- SubscriptIQ does not process real payments or replace a billing/invoicing system (e.g., Stripe) — it models subscription *state*, not payment execution.
- The AI copilot never auto-sends messages to customers; it only drafts content for human review.
- Not a full-fledged CRM or marketing automation platform.

---

## 3. Target Users / Personas

| Persona | Role | Key Needs |
|---|---|---|
| **Admin** | Manages the SaaS business's SubscriptIQ instance | User/role management, plan configuration, full data visibility |
| **Customer Success Manager (CSM)** | Owns a book of accounts | Renewal pipeline, churn-risk explanations, retention dashboard, AI-drafted outreach |
| **Support Agent** | Handles day-to-day customer issues | Log support notes/interactions tied to a customer/subscription |
| **Analyst / Read-only (Founder, Ops)** | Wants visibility without editing rights | Analytics dashboards, churn trends, cohort reporting |

---

## 4. Scope: Modules & Functional Requirements

### 4.1 Auth & RBAC
- Email/password authentication (with room to add OAuth later); session/JWT-based auth.
- Roles: Admin, CSM, Support Agent, Analyst (read-only).
- Role-based access enforced at both API and UI level (e.g., only Admin can manage plans and users; Support Agents cannot see analytics; Analysts cannot edit records).
- Audit trail of who changed what (at least for subscription status and churn-flag overrides).

### 4.2 Customers
- CRUD for customer/account records: company name, contacts, industry, size, account owner (CSM), lifecycle stage (trial, active, at-risk, churned).
- Each customer links to their subscriptions, usage events, support notes, and churn signals in one profile view.

### 4.3 Plans
- CRUD for subscription plans: name, price, billing interval (monthly/annual), feature entitlements, usage limits.
- Plan versioning so historical subscriptions still reference the plan terms they were sold under.

### 4.4 Subscriptions
- A subscription links a customer to a plan with a status (trial, active, past_due, paused, canceled) and key dates (start, renewal/next-billing date, end/cancellation date).
- Support upgrade/downgrade and plan-change history per subscription.

### 4.5 Renewals
- Auto-generated renewal records ahead of each subscription's renewal date (configurable lead time, e.g., 30/60/90 days out).
- Renewal pipeline view (kanban or list) grouped by stage: Upcoming → At Risk → Contacted → Renewed / Churned.
- Each renewal record shows the current churn-risk flag and score (see 4.8).

### 4.6 Usage Events
- Ingest/record product usage events per customer (e.g., logins, key feature usage, API calls) — via manual entry or event API for the MVP.
- Rollup views: usage trend per customer, usage vs. plan entitlement/limit.

### 4.7 Support Notes
- Log support interactions per customer: ticket summary, channel, sentiment/severity tag, resolution status, timestamp, agent.
- Support note history feeds into the account summary and churn-signal rules (e.g., spike in negative/unresolved tickets).

### 4.8 Churn Signals & Risk Flags (Core Feature — see Section 5 for detail)
- Rule-based engine that evaluates a customer/subscription against configurable signals (usage drop, unresolved tickets, plan downgrade, late payment/past_due, low login frequency, approaching renewal with no engagement, etc.).
- Produces a churn-risk level (e.g., Low / Medium / High) with the contributing rules listed transparently.

### 4.9 Analytics
- Retention dashboard: renewal rate, churn rate, at-risk account count/trend, revenue at risk (based on plan price of at-risk subscriptions).
- Cohort/segment views: churn by plan tier, by account age, by CSM.
- Exportable reports (CSV) for stakeholder reporting.

---

## 5. Core Feature Deep Dive: Renewal Pipeline + Rule-Based Churn-Risk Flags + Retention Dashboard

**What it is:** The system's backbone workflow. As subscriptions approach renewal, SubscriptIQ automatically evaluates each one against a set of configurable, transparent rules and assigns a churn-risk flag — no black-box ML required for the core product.

**Example rule set (configurable by Admin):**

| Signal | Example Rule | Weight |
|---|---|---|
| Usage drop | Usage down >40% vs. prior 30 days | High |
| Unresolved support | 2+ open/unresolved tickets in last 30 days | Medium |
| Negative sentiment | Support note tagged "negative" in last 14 days | Medium |
| Payment issue | Subscription status = past_due | High |
| Plan downgrade | Downgrade event in last 60 days | Medium |
| Low engagement pre-renewal | <5 logins in 30 days before renewal date | High |
| No CSM contact | No support/CSM touchpoint in 45+ days | Low |

Rules combine into an overall risk score/level per account, which drives:
- **Renewal pipeline** — accounts move through Upcoming → At Risk → Contacted → Renewed/Churned; CSMs work the pipeline like a sales board.
- **Retention dashboard** — aggregated view of at-risk accounts, revenue at risk, churn trend over time, and rule-firing frequency (so Admins can tune rules that are too noisy or too quiet).

**Why rule-based first:** it's explainable ("this account is High risk because usage dropped 45% and there are 2 open tickets"), fast to ship, and easy to demo/tune — a strong foundation the AI copilot (Section 6) can build explanations on top of.

---

## 6. AI Feature Deep Dive: AI Customer-Success Copilot

**What it is:** An assistant layered on top of the structured data already in SubscriptIQ (customers, subscriptions, usage, support notes, churn signals) — not a source of new "ground truth," but a way to make existing data faster to consume and act on.

**Capabilities (MVP scope):**

1. **Account history summarization** — given a customer, generate a concise natural-language summary of their subscription history, usage trend, recent support interactions, and any plan changes. Saves a CSM from reading through raw records before a call.
2. **Churn-signal explanation** — given a flagged account, explain in plain language *which rules fired and why*, grounded strictly in the rule engine's output (Section 5) — the AI narrates the existing rule results, it does not invent its own risk score.
3. **Retention/onboarding message drafting** — generate a first draft of a retention outreach (for at-risk accounts) or onboarding check-in (for new accounts), using the account summary and churn context as input. Draft is always routed to the owning CSM for review/edit before sending — the system never auto-sends AI-drafted messages.

**Guardrails:**
- All AI output is generated from data already stored in SubscriptIQ (no external data, no fabricated account details).
- Every AI-drafted message is clearly labeled "AI Draft — Pending Review" and requires explicit CSM approval/edit before it can be marked as sent.
- Churn-risk *decisions* remain fully rule-based and auditable; the AI explains and drafts, it does not decide.

---

## 7. Data Model Overview (Key Entities)

- **User** (Admin/CSM/Support/Analyst) — id, name, email, role
- **Customer** — id, name, owner (User), lifecycle stage
- **Plan** — id, name, price, interval, entitlements, version
- **Subscription** — id, customer_id, plan_id, status, start_date, renewal_date, end_date
- **Renewal** — id, subscription_id, stage, risk_level, risk_score, generated_at
- **UsageEvent** — id, customer_id, event_type, timestamp, metadata
- **SupportNote** — id, customer_id, agent_id, summary, sentiment, status, timestamp
- **ChurnSignal** — id, subscription_id, rule_name, fired_at, weight
- **AIDraft** — id, customer_id, type (summary/explanation/message), content, status (pending/approved/edited/sent), reviewed_by

---

## 8. Non-Functional Requirements

- **Security & Privacy:** Role-based access enforced server-side; customer data isolated per tenant if multi-tenant; passwords hashed; audit logging on sensitive actions.
- **Explainability:** Every churn-risk flag must show its contributing rules — no opaque scoring.
- **Performance:** Renewal pipeline and dashboard should load account-level data for a typical book of ~200–500 accounts without noticeable lag.
- **Reliability:** Renewal record generation and churn-rule evaluation should run on a reliable schedule (e.g., daily batch job) with retry on failure.
- **Auditability:** AI-drafted messages and any manual overrides of risk flags are logged with who/when.

---

## 9. Suggested Tech Stack

Given a MERN-based background, a natural fit:

- **Frontend:** React (dashboard, renewal pipeline board, customer profile views)
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (flexible schema for usage events/support notes) — alternatively PostgreSQL if relational integrity across subscriptions/renewals/plans is prioritized
- **Auth:** JWT-based auth with role middleware
- **Scheduled jobs:** node-cron (or a queue like BullMQ) for renewal-record generation and churn-rule evaluation
- **AI copilot:** Anthropic Claude API (or similar LLM API) called with structured account data as context, constrained to summarization/explanation/drafting tasks only

---

## 10. Success Metrics (for a demo/portfolio context)

- Renewal pipeline correctly generates renewal records and risk flags ahead of subscription renewal dates.
- Retention dashboard accurately aggregates at-risk accounts and revenue at risk from underlying data.
- AI copilot summaries and churn explanations are grounded in and consistent with the actual stored rule results (no fabricated reasons).
- RBAC correctly restricts each persona to their intended views/actions.

---

## 11. Out of Scope (v1)

- Real payment processing / billing integration
- Predictive ML-based churn scoring (rule-based only for v1; ML could be a future phase)
- Automated (non-reviewed) sending of retention/onboarding messages
- Multi-currency / multi-region billing
- Native mobile app

---

## 12. Suggested Phased Rollout

| Phase | Focus |
|---|---|
| Phase 1 | Auth & RBAC, Customers, Plans, Subscriptions (core CRUD + data model) |
| Phase 2 | Renewals module + rule-based churn-signal engine + renewal pipeline UI |
| Phase 3 | Usage Events + Support Notes (feed the churn rules with real signals) |
| Phase 4 | Retention dashboard + Analytics |
| Phase 5 | AI customer-success copilot (summarization → explanation → message drafting) |

---

## 13. Open Questions

- Single-tenant (one SaaS business) or multi-tenant (platform serving multiple SaaS businesses)?
- Should usage events be ingested via a public API/webhook, or manually entered for the MVP?
- MongoDB vs. PostgreSQL — depends on how relational the reporting/analytics needs turn out to be.
