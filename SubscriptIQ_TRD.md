# Technical Requirements Document (TRD)
## SubscriptIQ — SaaS Subscription & Customer Lifecycle Platform

| | |
|---|---|
| **Document Owner** | Ayush |
| **Status** | Draft v1.0 |
| **Companion Document** | SubscriptIQ_PRD.md |
| **Last Updated** | August 20, 2026 |

---

## 1. Purpose & Scope

This TRD translates the SubscriptIQ PRD into a concrete technical implementation plan: architecture, stack, data model, API surface, background jobs, AI integration, and security/operational requirements. It assumes single-tenant scope (one SaaS business's data) unless the multi-tenant open question from the PRD is resolved otherwise.

---

## 2. System Architecture

**Pattern:** Client–Server, REST API, single relational-ish document store, with a scheduled background worker for renewal/churn evaluation and a stateless AI-integration layer.

```
┌─────────────────┐        ┌──────────────────────┐        ┌───────────────┐
│  React Frontend  │◄─────►│  Express REST API     │◄─────►│   MongoDB      │
│  (Dashboard, RBAC │  HTTPS │  (Auth, RBAC, CRUD,   │        │  (Customers,   │
│   views, pipeline) │        │   business logic)     │        │   Subs, etc.)  │
└─────────────────┘        └──────────┬───────────┘        └───────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                             │
                ┌────────▼────────┐          ┌────────▼─────────┐
                │  Scheduled Job    │          │  AI Integration    │
                │  Worker (cron)    │          │  Layer (Claude API)│
                │  - Renewal gen    │          │  - Summarize        │
                │  - Churn rules    │          │  - Explain           │
                └──────────────────┘          │  - Draft messages    │
                                                └──────────────────┘
```

**Key architectural decisions:**
- API and background worker share the same codebase/models initially (monorepo-style Node service), split into a separate process only if load requires it.
- The AI integration layer is a thin service that assembles context from MongoDB (never lets the LLM write directly to the database) and returns drafts to an `AIDraft` collection with `status = pending_review`.
- Churn-risk computation is deterministic and runs server-side in the scheduled job — the frontend and AI layer only ever *read* risk results, never compute them independently.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS | Component-driven; matches existing MERN experience |
| State/data fetching | React Query (TanStack Query) | Caching for dashboard/pipeline views |
| Backend | Node.js + Express | REST API |
| Database | MongoDB + Mongoose | Flexible schema for usage events/support notes; see Section 6 for schema |
| Auth | JWT (access + refresh token), bcrypt for password hashing | Role claim embedded in JWT payload |
| Scheduled jobs | node-cron (MVP) → BullMQ + Redis (if scaling background load) | Daily renewal-generation + churn-rule evaluation job |
| AI integration | Anthropic Claude API (Messages endpoint) | Structured prompts built from DB context; JSON-mode output where applicable |
| Validation | Zod or Joi (request schema validation) | Applied at API boundary |
| Testing | Jest + Supertest (backend), React Testing Library (frontend) | See Section 11 |
| Hosting (suggested) | Backend: Render/Railway; Frontend: Vercel/Netlify; DB: MongoDB Atlas | Free/low-cost tiers suitable for a portfolio deployment |
| Logging | pino or winston (structured logs) | Correlate request logs with audit trail |

---

## 4. API Design (REST)

Base path: `/api/v1`

### 4.1 Auth
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/auth/register` | Create user (Admin-invited in production; open in MVP) | Admin |
| POST | `/auth/login` | Returns access + refresh token | Public |
| POST | `/auth/refresh` | Refresh access token | Authenticated |
| POST | `/auth/logout` | Invalidate refresh token | Authenticated |

### 4.2 Customers
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/customers` (filter/paginate) | Admin, CSM, Analyst |
| GET | `/customers/:id` (full profile: subs, usage, notes, signals) | Admin, CSM, Analyst |
| POST | `/customers` | Admin, CSM |
| PATCH | `/customers/:id` | Admin, CSM (own accounts) |
| DELETE | `/customers/:id` | Admin |

### 4.3 Plans
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/plans` | All authenticated |
| POST | `/plans` | Admin |
| PATCH | `/plans/:id` (creates new version) | Admin |
| DELETE | `/plans/:id` (soft-delete/archive) | Admin |

### 4.4 Subscriptions
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/subscriptions?customer_id=` | Admin, CSM, Analyst |
| POST | `/subscriptions` | Admin, CSM |
| PATCH | `/subscriptions/:id` (status, plan change) | Admin, CSM |

### 4.5 Renewals
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/renewals?stage=&risk_level=` | Admin, CSM, Analyst |
| PATCH | `/renewals/:id/stage` (move pipeline stage) | Admin, CSM |
| POST | `/renewals/:id/override-risk` (manual override, logged) | Admin |

### 4.6 Usage Events
| Method | Endpoint | Roles |
|---|---|---|
| POST | `/usage-events` (manual entry or webhook ingest) | Admin, CSM, System |
| GET | `/usage-events?customer_id=` | Admin, CSM, Analyst |

### 4.7 Support Notes
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/support-notes?customer_id=` | Admin, CSM, Support |
| POST | `/support-notes` | Support, CSM |

### 4.8 Churn Signals
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/churn-signals?subscription_id=` | Admin, CSM, Analyst |
| GET | `/churn-rules` (list configured rules) | Admin |
| PATCH | `/churn-rules/:id` (tune weight/threshold) | Admin |

### 4.9 Analytics
| Method | Endpoint | Roles |
|---|---|---|
| GET | `/analytics/retention-summary` | Admin, CSM, Analyst |
| GET | `/analytics/churn-trend?range=` | Admin, CSM, Analyst |
| GET | `/analytics/revenue-at-risk` | Admin, Analyst |

### 4.10 AI Copilot
| Method | Endpoint | Roles |
|---|---|---|
| POST | `/ai/summarize/:customerId` | Admin, CSM |
| POST | `/ai/explain-risk/:renewalId` | Admin, CSM |
| POST | `/ai/draft-message/:customerId` (type: retention \| onboarding) | Admin, CSM |
| PATCH | `/ai/drafts/:id/review` (approve/edit/reject) | Admin, CSM |

---

## 5. RBAC Permission Matrix

| Resource | Admin | CSM | Support Agent | Analyst |
|---|---|---|---|---|
| Users/Roles | CRUD | — | — | — |
| Plans | CRUD | Read | — | Read |
| Customers | CRUD | CRU (own) | Read | Read |
| Subscriptions | CRUD | CRU | Read | Read |
| Renewals | CRUD + override | RU | — | Read |
| Usage Events | CRUD | CR | — | Read |
| Support Notes | CRUD | CR | CR | Read |
| Churn Rules config | CRUD | — | — | — |
| Analytics | Read | Read | — | Read |
| AI Copilot | Use + review | Use + review | — | — |

Enforced via Express middleware (`requireRole([...])`) on every route, plus row-level ownership checks for CSM-scoped resources (`account_owner === req.user.id`).

---

## 6. Database Schema (MongoDB / Mongoose)

```js
User {
  _id, name, email (unique), passwordHash, role: enum[Admin,CSM,Support,Analyst],
  createdAt, updatedAt
}

Customer {
  _id, name, industry, size, contacts: [{name,email,phone}],
  ownerId: ref User, lifecycleStage: enum[trial,active,at_risk,churned],
  createdAt, updatedAt
}

Plan {
  _id, name, price, billingInterval: enum[monthly,annual],
  entitlements: {feature: value}, usageLimits: {metric: number},
  version: number, isArchived: boolean
}

Subscription {
  _id, customerId: ref Customer, planId: ref Plan, planVersion: number,
  status: enum[trial,active,past_due,paused,canceled],
  startDate, renewalDate, endDate,
  changeHistory: [{ fromPlanId, toPlanId, date, type: upgrade|downgrade }]
}

Renewal {
  _id, subscriptionId: ref Subscription, stage: enum[upcoming,at_risk,contacted,renewed,churned],
  riskLevel: enum[low,medium,high], riskScore: number,
  contributingSignals: [ref ChurnSignal], generatedAt, updatedAt,
  overriddenBy: ref User (optional), overrideReason: string (optional)
}

UsageEvent {
  _id, customerId: ref Customer, eventType: string, timestamp,
  metadata: Mixed
}

SupportNote {
  _id, customerId: ref Customer, agentId: ref User,
  summary: string, channel: enum[email,chat,call,ticket],
  sentiment: enum[positive,neutral,negative], status: enum[open,resolved],
  timestamp
}

ChurnRule {
  _id, name, description, signalType: string, threshold: Mixed,
  weight: enum[low,medium,high], isActive: boolean
}

ChurnSignal {
  _id, subscriptionId: ref Subscription, ruleId: ref ChurnRule,
  firedAt, weight, details: string
}

AIDraft {
  _id, customerId: ref Customer, renewalId: ref Renewal (optional),
  type: enum[summary,risk_explanation,retention_message,onboarding_message],
  content: string, status: enum[pending_review,approved,edited,rejected,sent],
  reviewedBy: ref User (optional), reviewedAt (optional),
  createdAt
}

AuditLog {
  _id, userId: ref User, action: string, entityType: string, entityId,
  before: Mixed, after: Mixed, timestamp
}
```

**Indexes:** `Customer.ownerId`, `Subscription.customerId`, `Subscription.renewalDate`, `Renewal.stage + riskLevel`, `ChurnSignal.subscriptionId`, `AIDraft.status`.

---

## 7. Churn-Risk Rule Engine (Technical Design)

- Runs as part of the daily scheduled job (`churnEvaluationJob`).
- For each active `Subscription`, iterate over active `ChurnRule` documents; evaluate each rule's condition against the subscription's related `UsageEvent`, `SupportNote`, and status data.
- Each fired rule creates/updates a `ChurnSignal` record.
- Aggregate fired signals into a weighted score → map to `riskLevel` (e.g., score ≥ 7 = High, 4–6 = Medium, <4 = Low) — exact thresholds configurable by Admin via `ChurnRule.weight` and a global threshold config.
- Update the corresponding `Renewal.riskLevel`, `riskScore`, `contributingSignals`.
- Rule evaluation logic implemented as pure functions (`(subscription, relatedData, rule) => boolean`) so each rule is independently unit-testable.

---

## 8. Scheduled Jobs

| Job | Frequency | Responsibility |
|---|---|---|
| `renewalGenerationJob` | Daily | Create/update `Renewal` records for subscriptions within the configured lead window (e.g., 90 days out) |
| `churnEvaluationJob` | Daily | Run rule engine (Section 7), update risk levels/signals |
| `staleAccountCheck` | Daily | Flag accounts with no CSM/support touchpoint in N days (feeds "No CSM contact" rule) |

MVP: `node-cron` in the same Node process. Scale-out path: move to BullMQ + Redis with a dedicated worker process if job volume/duration grows.

---

## 9. AI Copilot — Technical Integration

- **Provider:** Anthropic Claude API (Messages endpoint).
- **Context assembly:** Backend builds a structured JSON context object from MongoDB (customer profile, subscription/renewal state, recent usage summary, recent support notes, fired churn signals) — this is the *only* data passed to the model; no free-form DB access or tool-calling into the database from the model.
- **Prompt pattern (per capability):**
  - *Summarize:* system prompt instructs concise, factual summary strictly from provided context; no speculation beyond given data.
  - *Explain risk:* system prompt instructs the model to restate and explain only the `contributingSignals` already computed by the rule engine — explicitly forbidden from inventing new risk factors.
  - *Draft message:* system prompt instructs a first-draft tone (retention or onboarding), using account summary + risk context, ending with a note that it's a draft for CSM review.
- **Output handling:** Response stored as `AIDraft` with `status = pending_review`. Nothing is sent to a customer until a CSM/Admin calls `PATCH /ai/drafts/:id/review` with `approved` or `edited`.
- **Rate/cost control:** Cache summaries per customer for a short TTL (e.g., 1 hour) to avoid redundant calls when a CSM reopens the same profile.

---

## 10. Security Requirements

- Passwords hashed with bcrypt (cost factor ≥ 10); never logged or returned in API responses.
- JWT access tokens short-lived (~15 min) with refresh token rotation.
- All endpoints require authentication except `/auth/login`; all mutating endpoints enforce role middleware (Section 5).
- Input validation (Zod/Joi) on every POST/PATCH body.
- `AuditLog` entries written for: role changes, plan changes, subscription status changes, renewal risk overrides, AI draft approvals/sends.
- Environment secrets (DB URI, JWT secret, Claude API key) via environment variables, never committed.
- Rate limiting on `/auth/login` and `/ai/*` endpoints to prevent abuse.

---

## 11. Testing Strategy

| Layer | Approach |
|---|---|
| Churn rule engine | Unit tests per rule function with fixture data (fires / doesn't fire, edge thresholds) |
| API routes | Supertest integration tests per endpoint, covering role-based access (allowed/denied cases) |
| AI integration | Mock Claude API responses in tests; verify context assembly and that drafts are stored with `pending_review` status, never auto-sent |
| Frontend | React Testing Library for pipeline board, dashboard, and RBAC-conditional rendering |
| Scheduled jobs | Run job functions directly in tests against seeded data, assert resulting `Renewal`/`ChurnSignal` state |

---

## 12. Suggested Project Structure

```
subscriptiq/
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/         # Dashboard, Pipeline, CustomerProfile, Plans, Settings
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/           # API client (React Query hooks)
├── server/                # Express backend
│   ├── src/
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/    # auth, rbac, validation
│   │   ├── jobs/           # renewalGenerationJob, churnEvaluationJob
│   │   ├── services/
│   │   │   ├── churnRuleEngine/
│   │   │   └── aiCopilot/  # context builder + Claude API client
│   │   └── utils/
│   └── tests/
└── docs/
    ├── SubscriptIQ_PRD.md
    └── SubscriptIQ_TRD.md
```

---

## 13. Deployment Architecture (Suggested, Low-Cost)

- **Frontend:** Vercel or Netlify (static React build)
- **Backend + jobs:** Render or Railway (Node service; cron via node-cron in-process for MVP)
- **Database:** MongoDB Atlas (free tier for portfolio scale)
- **Secrets:** Managed via hosting provider's environment variable settings
- **CI:** GitHub Actions — run lint + tests on PR; deploy on merge to `main`

---

## 14. Open Technical Questions

- Multi-tenant support (per-business data isolation) — affects schema (add `orgId` to every collection) and auth (org-scoped JWT claim). Recommend deciding before Phase 1 if this is a requirement.
- Usage event ingestion: manual entry only for MVP, or expose a public webhook/API key per customer for real product-usage ingestion?
- Whether churn-rule thresholds should be globally configured or per-plan-tier configurable.
- Redis/BullMQ adoption trigger — defer until job volume or duration data justifies it.
