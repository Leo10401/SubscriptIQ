# SubscriptIQ — SaaS Subscription & Customer Lifecycle Platform

<div align="center">

![SubscriptIQ Banner](https://img.shields.io/badge/SubscriptIQ-SaaS%20Lifecycle%20%26%20Retention%20Engine-6366f1?style=for-the-badge&logo=rocket)

**A proactive, AI-assisted platform for SaaS teams to manage the full customer lifecycle, predict churn risk early, and automate retention workflows with human-in-the-loop intelligence.**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express%205-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter%20LLMs-FF6B6B?style=flat-square)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

</div>

---

## 📖 Overview

SaaS customer success and revenue teams frequently struggle with fragmented data spread across disconnected billing tools, CRM instances, support tickets, and spreadsheets. **SubscriptIQ** solves this by centralizing the complete customer journey — from onboarding and subscription management to renewal tracking, usage telemetry, and support history.

Built directly into the core workflow is an automated **Rule-Based Churn Risk Engine** combined with an **AI Copilot** powered by OpenRouter LLMs. CSMs can instantly identify high-risk renewals, inspect contributing risk factors, generate plain-language account summaries, and produce personalized retention drafts with **100% human-in-the-loop review**.

---

## ✨ Key Features

### 📊 1. Unified Executive & Retention Dashboard
- **Real-Time MRR & ARR Tracking**: Monitor monthly and annual recurring revenue with dynamic plan distribution breakdown.
- **Proactive Churn Radar**: Instant visibility into high, medium, and low-risk accounts heading into upcoming renewal windows.
- **Renewal Pipeline Countdown**: Filter renewals by 14, 30, 60, or 90-day timeframes.
- **Quick Action Bar**: Fast-create subscriptions, log support notes, evaluate churn triggers, and trigger AI drafts.

### 👥 2. 360° Customer & Account Intelligence
- **Deep Account Profiles**: Track MRR, active plan tier, billing cycle, renewal date, and dynamic health scores.
- **Activity Timeline**: Consolidated event stream combining login activity, API call volume, support tickets, and churn signals.
- **Engagement Telemetry**: Real-time monitoring of daily active users, seats utilized, and usage drop-offs.

### 💳 3. Subscriptions & Flexible Plan Management
- **Tiered SaaS Plans**: Configure Starter, Pro, Enterprise, and Custom tiers with monthly or annual billing.
- **Lifecycle Statuses**: Manage trial, active, past-due, canceled, and paused subscription lifecycles.
- **MRR Normalization**: Automatic calculation and aggregation across billing cycles.

### ⏳ 4. Proactive Renewal Pipeline & Churn Risk Engine
- **Transparent Rule Evaluation**: Automatically calculates compound churn risk scores based on customizable triggers:
  - Inactivity periods (e.g., >14 days without login).
  - Usage drops (e.g., >30% drop in weekly API / seat usage).
  - Unresolved critical or negative sentiment support tickets.
  - Excessive license/seat underutilization.
- **Manual Risk Overrides**: CSMs can adjust or override flags with mandatory audit logging.

### 🧠 5. AI Customer Success Copilot (OpenRouter Integration)
- **Account Summary Generator**: Condenses months of telemetry and support tickets into an executive summary in seconds.
- **Churn Explanations**: Converts complex signal metrics into human-readable explanations of why an account is at risk.
- **AI Drafts Inbox (Human-in-the-Loop)**:
  - Generates personalized renewal offers, retention pitches, and re-engagement outreach.
  - Dedicated review queue to **Edit**, **Approve & Send**, or **Reject** drafts before customer contact.

### 🎧 6. Support Notes & Sentiment Logging
- **Multi-Channel Logging**: Log interactions across Email, Slack, Zoom, Phone, and Helpdesk.
- **Sentiment Tracking**: Tag notes with Positive, Neutral, or Negative sentiment.
- **Ticket Escalation**: Flag critical tickets that automatically feed into the Churn Risk Engine.

### 📈 7. Revenue Intelligence & Cohort Analytics
- **Cohort Retention Tables**: Track retention trends across customer signup months.
- **Churn Distribution**: Analyze churn root causes (pricing, product fit, lack of adoption, support issues).
- **Plan Migration Tracking**: Visualize upgrades, downgrades, and expansion revenue.

### 🛡️ 8. Granular Role-Based Access Control (RBAC)
- Built-in enforcement across both frontend routes and backend APIs for **Admin**, **CSM**, **Support Agent**, and **Analyst** roles.

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Module / Action | Admin | Customer Success (CSM) | Support Agent | Analyst / Read-Only |
|:---|:---:|:---:|:---:|:---:|
| **Executive Dashboard & KPIs** | ✅ Full | ✅ Assigned Accounts | ⚠️ Ticket Stats Only | ✅ Read-only |
| **Customer Directory & 360° Profiles** | ✅ Full | ✅ Full | ✅ Read-only | ✅ Read-only |
| **Plan & Pricing Configuration** | ✅ Create / Edit | ❌ View Only | ❌ No Access | ❌ View Only |
| **Renewal Pipeline & Churn Flags** | ✅ Full | ✅ Manage / Override | ❌ No Access | ✅ View Only |
| **AI Copilot & Drafts Generation** | ✅ Full | ✅ Generate & Review | ❌ No Access | ❌ No Access |
| **Support Notes Management** | ✅ Full | ✅ Create & Edit | ✅ Create & Edit | ✅ Read-only |
| **Churn Rule & Weight Configuration**| ✅ Full | ❌ View Only | ❌ No Access | ❌ View Only |
| **User & Team Management** | ✅ Full | ❌ No Access | ❌ No Access | ❌ No Access |
| **Analytics & Cohort Reports** | ✅ Full | ✅ View Only | ❌ No Access | ✅ Full Read-only |

---

## 🏗️ System Architecture & Tech Stack

```
SubscriptIQ Architecture
├── Frontend (Next.js 16 App Router + React 19)
│   ├── Client Pages (Dashboard, Customers, Renewals, AI Drafts, Analytics, Plans, Settings)
│   ├── Component Library (Cards, Badges, Modals, ChurnRadar, AIContentBlock)
│   ├── Context Providers (AuthContext, Theme, Toast Notifications)
│   └── Styling: Tailwind CSS v4, Lucide Icons, Framer Motion
│
├── Backend (Node.js & Express 5 API Server)
│   ├── Authentication: JWT + bcryptjs (Role-based middleware)
│   ├── Churn Rule Engine: Automated cron + real-time trigger evaluation
│   ├── AI Service: OpenRouter API (Nemotron / Llama models)
│   └── Scheduled Jobs: node-cron (Daily renewal checks, churn scoring)
│
└── Database (MongoDB & Mongoose ODM)
    └── Collections: Users, Customers, Plans, Subscriptions, Renewals, 
                     UsageEvents, SupportNotes, ChurnRules, ChurnSignals, 
                     AIDrafts, AuditLogs
```

---

## 📁 Project Structure

```bash
SubscriptionQ/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, AI, Customers, Renewals, etc.)
│   │   ├── middleware/       # JWT Auth & Role Authorization middleware
│   │   ├── models/           # Mongoose schemas (User, Customer, Subscription, etc.)
│   │   ├── routes/           # Express API route declarations
│   │   ├── services/         # Churn engine, AI integration, cron jobs
│   │   └── seed.js           # Demo dataset seed script
│   ├── index.js              # Express server entry point & MongoDB connection
│   ├── package.json
│   └── .env                  # Environment configurations
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── ai-drafts/    # AI message review queue
│   │   │   ├── analytics/    # Churn & MRR cohort charts
│   │   │   ├── customers/    # Customer directory & profile pages
│   │   │   ├── dashboard/    # Executive KPI dashboard
│   │   │   ├── login/        # Authentication page
│   │   │   ├── plans/        # Subscription tier management
│   │   │   ├── renewals/     # Churn radar & renewal pipeline
│   │   │   ├── settings/     # Users & Churn Rules config
│   │   │   ├── support-notes/# Ticket & interaction history
│   │   │   └── layout.jsx    # Root layout & navigation shell
│   │   ├── components/       # Reusable UI components & modals
│   │   ├── context/          # Global AuthContext & state providers
│   │   └── lib/              # API client & utility helpers
│   ├── package.json
│   └── next.config.mjs
│
├── SubscriptIQ_PRD.md        # Product Requirements Document
├── SubscriptIQ_TRD.md        # Technical Requirements Document
├── SubscriptIQ_AppFlow.md    # User Flow & Navigation Specs
├── SubscriptIQ_UIUX.md       # Design System & UI/UX Specs
└── README.md                 # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: `v18.x` or higher (v20+ recommended)
- **npm** or **yarn** / **pnpm**
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **OpenRouter API Key** *(Optional for AI Copilot features)*: Get one at [openrouter.ai](https://openrouter.ai)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/subscriptiq
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   OPENROUTER_MODEL=nvidia/nemotron-3-ultra-550b-a55b:free
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   > 💡 *Note: The server automatically connects to MongoDB and initializes demo seed data if the database is empty.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables *(Optional, defaults to `http://localhost:5000/api/v1`)*:
   Create a `.env.local` file in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Access the application in your browser at:
   ```
   http://localhost:3000
   ```

---

## 🔑 Demo Login Accounts

SubscriptIQ comes pre-seeded with rich test data and persona accounts. Use the credentials below to test different role permissions:

| Persona | Email | Password | Access Capabilities |
|:---|:---|:---|:---|
| **Admin** | `admin@subscriptiq.io` | `password123` | Full access across all pages, plans, churn rules, users & analytics |
| **CSM** | `sarah@subscriptiq.io` | `password123` | Customer CRM, renewal pipeline, churn flags, AI drafting & approval |
| **Support Agent** | `dave@subscriptiq.io` | `password123` | Customer lookup, interaction logging, sentiment notes |
| **Analyst** | `maya@subscriptiq.io` | `password123` | Read-only analytics, MRR charts, retention cohort reports |

> 🔄 **Reset Seed Data Anytime**: You can trigger a complete database re-seed by sending a `POST` request to `http://localhost:5000/api/v1/seed` or using the reset button in Settings.

---

## 🔌 API Reference Overview

The backend REST API is organized cleanly under `/api/v1`:

| Endpoint Group | Description | Primary Methods |
|:---|:---|:---|
| `/api/v1/auth` | User login, profile retrieval, token validation | `POST /login`, `GET /me` |
| `/api/v1/customers` | Customer directory, 360 profile, metrics | `GET /`, `POST /`, `GET /:id` |
| `/api/v1/plans` | Subscription plan tiers and pricing rules | `GET /`, `POST /`, `PUT /:id` |
| `/api/v1/subscriptions` | Subscription creation, upgrades, cancellations | `GET /`, `POST /`, `PUT /:id` |
| `/api/v1/renewals` | Renewal pipeline, churn flags & risk overrides | `GET /`, `POST /:id/override` |
| `/api/v1/churn-rules` | Dynamic churn rule definitions & thresholds | `GET /`, `POST /`, `PUT /:id` |
| `/api/v1/ai` | AI account summaries, churn explanations, drafts | `POST /summarize`, `POST /draft` |
| `/api/v1/support-notes` | Customer interaction logs & sentiment tickets | `GET /`, `POST /` |
| `/api/v1/usage-events` | Customer usage telemetry & event ingest | `GET /`, `POST /` |
| `/api/v1/analytics` | MRR, ARR, churn rate, cohort metrics | `GET /summary`, `GET /cohorts` |
| `/api/v1/users` | Organization user management (Admin only) | `GET /`, `POST /`, `PUT /:id` |
| `/api/v1/seed` | Reset & re-populate demo SaaS database | `POST /` |

---

## 🎨 Design System & Aesthetics

SubscriptIQ is crafted with a modern, high-contrast dark/light aesthetic:
- **Typography**: Clean, geometric sans typography optimized for complex data tables.
- **Glassmorphism & Gradients**: Subtle slate/indigo surface styling with modern border glows.
- **Risk Indicators**: Clear color coding for churn severity (🟢 Low Risk, 🟡 Medium Risk, 🔴 High Risk / Critical).
- **Micro-Interactions**: Smooth state transitions and modal animations powered by `framer-motion`.

---

## 📜 Documentation

For deeper architectural breakdowns, refer to the included design and specification files:
- [Product Requirements Document (PRD)](file:///d:/SubscriptionQ/SubscriptIQ_PRD.md)
- [Technical Requirements Document (TRD)](file:///d:/SubscriptionQ/SubscriptIQ_TRD.md)
- [App Flow & User Journey](file:///d:/SubscriptionQ/SubscriptIQ_AppFlow.md)
- [UI/UX Specifications & Design System](file:///d:/SubscriptionQ/SubscriptIQ_UIUX.md)

---

## 📄 License

This project is licensed under the **ISC License**.
