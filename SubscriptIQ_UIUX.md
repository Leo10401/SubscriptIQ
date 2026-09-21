# UI/UX Design System Document
## SubscriptIQ — SaaS Subscription & Customer Lifecycle Platform

| | |
|---|---|
| **Document Owner** | Ayush |
| **Status** | Draft v1.0 |
| **Companion Documents** | SubscriptIQ_PRD.md, SubscriptIQ_TRD.md, SubscriptIQ_AppFlow.md |
| **Last Updated** | August 20, 2026 |

---

## 1. Purpose

SubscriptIQ has no existing design system yet, so this document defines one from scratch — tokens, core components, and key patterns — sized to what the App Flow document actually requires: a renewal pipeline board, risk indicators, a customer profile with several data panels, and an AI-draft review workflow that must always read as "assistive, not autonomous."

---

## 2. Design Principles

1. **Clarity over decoration** — this is a working tool for CSMs moving through accounts quickly; every screen should answer "what needs my attention" fast.
2. **Risk should be legible at a glance** — churn-risk level uses a single consistent color language everywhere it appears (pipeline board, customer profile, dashboard, renewal detail).
3. **AI content is visually distinct** — anything AI-generated (summaries, explanations, drafts) carries a consistent visual marker so it's never mistaken for verified system data or already-sent communication.
4. **Consistency over creativity** — reuse the same table, card, and badge patterns across every module rather than inventing new layouts per screen.
5. **Accessible by default** — sufficient color contrast, keyboard operability, and non-color-only risk indicators (icon/label + color, not color alone).

---

## 3. Design Tokens

### 3.1 Color

| Token | Value | Usage |
|---|---|---|
| `color-primary-600` | `#4F46E5` (indigo) | Primary actions, links, active nav |
| `color-primary-50` | `#EEF2FF` | Primary hover/active backgrounds |
| `color-neutral-900` | `#111827` | Primary text |
| `color-neutral-600` | `#4B5563` | Secondary text |
| `color-neutral-200` | `#E5E7EB` | Borders, dividers |
| `color-neutral-50` | `#F9FAFB` | Page background |
| `color-surface` | `#FFFFFF` | Card/panel background |
| `color-risk-low` | `#059669` (green) | Low churn risk |
| `color-risk-medium` | `#D97706` (amber) | Medium churn risk |
| `color-risk-high` | `#DC2626` (red) | High churn risk |
| `color-ai-accent` | `#7C3AED` (violet) | AI-generated content marker (badge, border, icon) |
| `color-success` | `#059669` | Success toasts/confirmations |
| `color-error` | `#DC2626` | Error states, validation |
| `color-warning` | `#D97706` | Warnings (e.g., overdue renewal) |

**Rule:** `color-risk-*` is reserved exclusively for churn-risk indicators — never reused for generic status (e.g., don't reuse risk-red for a form validation error; use `color-error` instead, even though the hex values coincide, to keep the semantic mapping unambiguous in code).

### 3.2 Typography

| Token | Value | Usage |
|---|---|---|
| `font-family-base` | Inter, system-ui, sans-serif | All UI text |
| `font-family-mono` | "JetBrains Mono", monospace | IDs, timestamps, technical values |
| `text-xs` | 12px / 16px line-height | Table meta, timestamps |
| `text-sm` | 14px / 20px | Body default, table cells |
| `text-base` | 16px / 24px | Form inputs, primary body copy |
| `text-lg` | 18px / 28px | Card titles, section headers |
| `text-xl` | 22px / 30px | Page titles |
| `text-2xl` | 28px / 36px | Dashboard KPI numbers |
| `font-weight-regular` | 400 | Body text |
| `font-weight-medium` | 500 | Labels, table headers |
| `font-weight-semibold` | 600 | Headings, KPI numbers |

### 3.3 Spacing

4px base scale: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px). Component internal padding defaults to `space-3`–`space-4`; page-level gutters use `space-6`–`space-8`.

### 3.4 Borders & Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, inputs |
| `radius-md` | 8px | Cards, buttons |
| `radius-lg` | 12px | Modals, panels |
| `border-default` | 1px solid `color-neutral-200` | Card/table borders |
| `border-ai` | 1px solid `color-ai-accent` (left-border accent, 3px) | AI-generated content blocks |

### 3.5 Shadows (Elevation)

| Token | Usage |
|---|---|
| `shadow-sm` | Cards at rest |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Modals, AI Drafts review panel |

### 3.6 Motion

| Token | Value | Usage |
|---|---|---|
| `duration-fast` | 120ms | Hover/focus transitions |
| `duration-base` | 200ms | Panel open/close, toasts |
| `easing-standard` | ease-out | Default for all transitions |

---

## 4. Core Components

### 4.1 Component: Button

**Description:** Primary interactive trigger for actions across the app.

| Variant | Use When |
|---|---|
| Primary | Main action on a screen (e.g., "Save Customer", "Approve & Send") |
| Secondary | Supporting action (e.g., "Cancel", "Edit") |
| Ghost | Low-emphasis inline actions (e.g., table row actions) |
| Destructive | Irreversible actions (e.g., "Reject Draft", "Delete Plan") |

| Property | Type | Default | Description |
|---|---|---|---|
| `variant` | enum | `primary` | primary \| secondary \| ghost \| destructive |
| `size` | enum | `md` | sm \| md \| lg |
| `isLoading` | boolean | `false` | Shows spinner, disables interaction |
| `disabled` | boolean | `false` | Non-interactive state |

| State | Visual | Behavior |
|---|---|---|
| Default | Solid/outline per variant | — |
| Hover | Slight darken (`primary-700`) | Cursor pointer |
| Active | Darken + scale 98% | On press |
| Disabled | 40% opacity, no hover | Non-interactive |
| Loading | Spinner replaces label | Blocks re-submission |

**Accessibility:** `role="button"`; focus ring visible (`outline: 2px solid primary-600`); Enter/Space activates; `aria-busy="true"` when loading.

---

### 4.2 Component: Risk Badge

**Description:** The single consistent visual for churn-risk level — appears on the pipeline board, renewal detail, customer profile, and dashboard.

| Variant | Use When |
|---|---|
| Low | `riskLevel = low` |
| Medium | `riskLevel = medium` |
| High | `riskLevel = high` |

| Property | Type | Default | Description |
|---|---|---|---|
| `level` | enum | — | low \| medium \| high (required) |
| `showLabel` | boolean | `true` | Shows text label alongside color+icon |

**Visual:** Filled pill, `radius-sm`, background = risk color at 10% opacity, text/icon = full risk color. Icon differs per level (not color alone) — e.g., check-circle (low), alert-triangle (medium), alert-octagon (high) — to remain colorblind-accessible.

**Accessibility:** `aria-label="Churn risk: {level}"`; never rely on color alone to convey meaning.

---

### 4.3 Component: AI Content Block

**Description:** Wrapper for any AI-generated content (summary, risk explanation, drafted message) — used consistently across Customer Profile, Renewal Detail, and AI Drafts Inbox so AI output is never visually confused with verified system data.

| Property | Type | Default | Description |
|---|---|---|---|
| `type` | enum | — | summary \| explanation \| draft_message |
| `status` | enum | `pending_review` | pending_review \| approved \| edited \| rejected \| sent |

| State | Visual | Behavior |
|---|---|---|
| Pending review | `border-ai` left accent, violet "AI Draft — Pending Review" tag, Approve/Edit/Reject actions visible | Default on generation |
| Approved | Tag changes to "Approved", actions collapse to "Mark as Sent" | After CSM approval |
| Edited | Tag shows "Edited by {user}", diff-style note optional | After CSM edits content |
| Sent | Tag shows "Sent", actions removed, block becomes read-only | Terminal state |
| Rejected | Greyed out, "Rejected" tag, collapsed by default | Terminal state |

**Do's and Don'ts**

| ✅ Do | ❌ Don't |
|---|---|
| Always show the pending/approved/sent tag | Never let AI content render without a status tag |
| Keep the violet accent exclusive to AI content | Don't reuse `color-ai-accent` for any non-AI UI element |
| Require an explicit action to change status | Don't auto-transition status on page load/view |

**Accessibility:** Status tag is announced via `aria-live="polite"` when it changes after an action.

---

### 4.4 Component: Data Table

**Description:** Standard list view for Customers, Subscriptions, Support Notes, Usage Events.

| Property | Type | Default | Description |
|---|---|---|---|
| `columns` | array | — | Column defs (label, key, sortable) |
| `paginated` | boolean | `true` | Server-side pagination |
| `density` | enum | `comfortable` | comfortable \| compact |

| State | Visual | Behavior |
|---|---|---|
| Default | Zebra-free, `border-default` row dividers | — |
| Row hover | `color-neutral-50` background | Cursor pointer if row-clickable |
| Empty | Centered icon + message + primary CTA | e.g., "No customers yet — Add your first customer" |
| Loading | Skeleton rows (3–5) | While fetching |

**Accessibility:** `<table>` semantics with `<th scope="col">`; sortable headers expose `aria-sort`.

---

### 4.5 Component: Pipeline Board (Renewal Pipeline)

**Description:** Kanban-style board grouping Renewals by stage (Upcoming → At Risk → Contacted → Renewed/Churned). This is the CSM's primary daily view.

| Property | Type | Default | Description |
|---|---|---|---|
| `groupBy` | enum | `stage` | stage \| riskLevel |
| `cardFields` | array | `[customerName, riskBadge, renewalDate]` | Fields shown on each card |

**Card anatomy:** customer name (semibold, `text-sm`), Risk Badge (4.2), renewal date (`text-xs`, neutral-600), owning CSM avatar (top-right).

| State | Visual | Behavior |
|---|---|---|
| Default | `shadow-sm` card in column | — |
| Dragging | `shadow-lg`, slight rotate (2°) | Drag-to-change-stage (Admin/CSM only) |
| High risk | Left border accent in `color-risk-high` | Reinforces Risk Badge, scannable even collapsed |

**Accessibility:** Drag-and-drop has a keyboard-accessible fallback (select card → "Move to..." menu) so stage changes aren't mouse-only.

---

### 4.6 Component: Modal / Panel

**Description:** Used for Renewal Detail (side panel), risk override (modal with required reason field), and AI draft full-view.

| Variant | Use When |
|---|---|
| Side panel | Renewal Detail, Customer quick-view (non-blocking, dismissible) |
| Centered modal | Destructive/blocking confirmations (risk override, delete plan) |

**States:** Default, entering (`duration-base` slide/fade), exiting. Focus is trapped within modal while open; `Escape` closes (side panel) or is disabled for actions requiring explicit confirm (destructive modal, to prevent accidental dismissal of a reason field mid-entry).

**Accessibility:** `role="dialog"`, `aria-modal="true"`, focus returns to triggering element on close.

---

## 5. Key Patterns

### 5.1 Customer Profile Layout
Two-column layout: left column (fixed width) shows account summary card + AI Content Block (account summary, on-demand); right column (flexible) holds tabs — Subscriptions, Usage, Support Notes, Churn Signals. This keeps the AI summary persistently visible while the CSM scans through raw data tabs, without the AI panel competing for the same space as the data it summarizes.

### 5.2 Renewal Detail
Header: customer name + Risk Badge + stage. Body: contributing signals list (each mapped from `ChurnSignal`, plain text with the source rule name) immediately above the "Explain with AI" trigger — so the rule-based facts are always visible before/alongside the AI's narration of them, reinforcing that the AI explains rather than decides.

### 5.3 AI Drafts Inbox
A filtered Data Table (4.4) where each row expands into an AI Content Block (4.3) rather than navigating away — keeps the review-and-approve loop to a single screen.

### 5.4 Retention Dashboard
KPI row (4 cards: renewal rate, churn rate, at-risk count, revenue at risk) using `text-2xl` numbers, followed by a churn-trend chart and a cohort table. KPI cards use neutral surfaces — risk color is reserved for the at-risk-count card only, not applied decoratively across all four.

---

## 6. Accessibility Summary

- Minimum contrast ratio 4.5:1 for body text, 3:1 for large text/icons (WCAG 2.1 AA).
- No information conveyed by color alone — risk level, status, and errors always pair color with an icon and/or text label.
- All interactive elements reachable and operable via keyboard, including the Pipeline Board's drag interaction.
- Focus states visible on every focusable element (`outline: 2px solid primary-600`, never `outline: none` without a replacement).
- `aria-live` regions for async status changes (AI draft generation, save confirmations, risk overrides).

---

## 7. Open Questions

- Dark mode — in scope for v1 or deferred?
- Should the Risk Badge's color mapping remain fixed (green/amber/red) or should Admins be able to customize it per the PRD's configurable-rules philosophy?
- Icon set choice (e.g., Lucide vs. Heroicons) — pick one and use it exclusively to avoid visual inconsistency.
