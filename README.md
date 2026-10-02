# Lincoz Platform | Internal Hybrid Project & Financial Management System

A high-performance, enterprise-grade Hybrid Project and Financial Management platform built in strict compliance with the **Software Requirements Specification (SRS) & Product Requirements Document (PRD) v1.0.0**.

The platform resolves the operational overhead of managing blended teams—comprising full-time onsite employees (Project Managers, Engineers, Designers) and external percentage-partner freelancers—within a unified operational and financial ledger.

---

## 🌟 Core Architecture & Key Modules

### 1. Role-Based Access Control (RBAC) & 4 Personas
* **Super Admin (Owner)**: Global financial oversight (TCV, Gross Invoiced, Accounts Receivable, Accrued Contractor Liabilities), contractor partnership model setup (% Gross Contract, % Net Revenue, % Milestone Tranche), and **2-Step Cryptographic Payout Disbursement Authorization**.
* **Project Manager (Onsite)**: Project sprint velocity, milestone deliverable reviews, task lifecycle orchestration (Create, Update, Assign, Block, Archive), Step-1 calculation verification.
* **Onsite Member (Engineer / Designer)**: Assigned task execution station, interactive checklist criteria completion, sub-250ms latency updates, internal commenting threads.
* **Partner Contractor (Freelancer)**: **Data-Isolated Contractor Portal**, real-time milestone percentage earnings ledger (`Milestone Payout = Billed Milestone Amount × Agreement % / 100`), deliverable submission (GitHub PRs, Figma links, demo servers), and **Strict Concealment of confidential client commercial rates**.

---

### 2. Detailed Functional Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **Global Financial Governance** | Real-time monitoring of Total Contract Value (TCV), Gross Invoiced, Accounts Receivable (AR), Accrued Liabilities, and 2-Step Payout Authorization Queue. |
| **Contractor & % Setup** | Entity profiles (legal name, tax classification, default payout channel like Wise/USDC/Wire), Gross Contract Share %, Net Revenue Share % (after expenses), and Milestone Tranche Share %. |
| **Project Structuring** | Hierarchical model: `Client Portfolio` &rarr; `Project` &rarr; `Milestones` &rarr; `Tasks` &rarr; `Checklist Items`. |
| **Task Lifecycle Engine** | Interactive **Kanban Board**, Filterable **List View**, and visual **Gantt / Timeline Roadmap** with discrete milestone bounds. States: `Backlog` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Pending Review` &rarr; `Completed`. |
| **Deliverable Pipeline** | PR / asset link submission with automated review alerts and PM verification queues. |
| **Append-Only Immutable Audit Trail** | Captures UUIDv4, actor, action type (`ITEM_CHECKED`, `STATUS_CHANGED`, `PAYOUT_DISBURSED`, etc.), Client IP, User-Agent, UTC millisecond timestamp, and **Side-by-Side JSON State Deltas**. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on `v24.18.1`)
- npm `v9+` or `v11+`

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at
http://localhost:3000/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🕹️ Interactive RBAC Persona Switcher Guide

Use the **Persona Switcher** dropdown in the top header to experience the platform from each stakeholder's perspective:

1. **Alexander Wright (Super Admin)**:
   - View global TCV ($270,000 across portfolios), $150,000 Gross Invoiced, and $19,050 Accrued Liabilities.
   - Click **"Step 2 Sign-Off"** on David Vance's approved milestone ($6,000.00) to execute the 2-step disbursement sign-off.
   - Inspect global immutable audit diffs and provision new system users.

2. **Sarah Jenkins (Project Manager)**:
   - Review pending deliverables (e.g. PR #189 Kafka worker submitted by David Vance).
   - Resolve active blocker alerts.
   - Execute Step 1 verification on contractor milestones.

3. **Alex Rivera (Senior Engineer)**:
   - Toggle verification checklist items with sub-250ms real-time audit capture.
   - Transition tasks from In Progress to Pending Review.

4. **David Vance (Partner Contractor)**:
   - Observe the **Data-Isolated Workspace**: Client contract values ($120k TCV) are strictly masked as `CONFIDENTIAL`.
   - Real-time earnings ledger tracking $17,625 earned across active milestone tranches.
   - Submit new GitHub PRs or demo links for PM review.

---

## 🔒 Security & Non-Functional Specifications
- **Row-Level Security (RLS)**: Scoped project and financial access preventing external contractor leakage.
- **Audit Trail Immutability**: Append-only (WORM) event storage preventing updates or deletions.
- **Latency**: Sub-250ms reactive state mutations with local persistence and one-click demo reset.
