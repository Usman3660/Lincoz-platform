# Lincoz Platform | Internal Hybrid Project & Financial Management System

A high-performance, enterprise-grade Hybrid Project and Financial Management platform built in strict compliance with the **Software Requirements Specification (SRS) & Product Requirements Document (PRD) v2.2.0**.

The platform resolves the operational overhead of managing blended teams—comprising full-time onsite employees (Project Managers, Engineers, Designers) and external percentage-partner freelancers—within a unified operational, financial, and relational ledger.

---

## 🌟 Core Architecture & Key Modules

### 1. Role-Based Access Control (RBAC) & 4 Personas
* **Super Admin (Owner)**: Global financial oversight (TCV, Gross Invoiced, Accounts Receivable, Accrued Contractor Liabilities), contractor partnership model setup (% Gross Contract, % Net Revenue, % Milestone Tranche), **2-Step Cryptographic Payout Disbursement Authorization**, and **Exclusive Password & Fixed 2FA Key Provisioning/Governance**.
* **Project Manager (Onsite)**: Project sprint velocity, milestone deliverable reviews, task lifecycle orchestration (Create, Update, Assign, Block, Archive), Step-1 calculation verification, project completion/reopen controls, and daily team attendance roster marking.
* **Onsite Member (Engineer / Designer)**: Assigned task execution station, interactive checklist criteria completion, sub-250ms latency updates, internal commenting threads, private personal to-do scratchpad, and personal attendance history.
* **Partner Contractor (Freelancer)**: **Data-Isolated Contractor Portal**, real-time milestone percentage earnings ledger (`Milestone Payout = Billed Milestone Amount × Agreement % / 100`), deliverable submission (GitHub PRs, Figma links, demo servers), and **Strict Concealment of confidential client commercial rates**.

---

### 2. Enterprise Security & Fixed 2FA Governance

* **Fixed Security Keys (Non-Arbitrary Verification)**: Two-Factor Authentication utilizes deterministic, fixed keys provisioned and managed strictly by the Super Admin (default key: `8892`). Arbitrary or randomly guessed 4-digit codes are strictly rejected.
* **Initial Credential Provisioning**: Super Admin creates initial employee accounts with dedicated "Security & 2FA Credentials Provisioning" controls (auto-generating or custom entering secure initial passwords $\ge 6$ characters and fixed 2FA keys).
* **Super Admin Override & Edit Modal**: Super Admin can view/modify passwords, view/modify 2FA keys, and toggle 2FA on/off directly inside the employee's `EditProfileModal.jsx` and via dedicated quick-action 2FA modals.
* **Bcrypt Password Security**: Passwords stored using bcrypt with a salt cost factor of 12.

---

### 3. Detailed Functional Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **Global Financial Governance** | Real-time monitoring of Total Contract Value (TCV), Gross Invoiced, Accounts Receivable (AR), Accrued Liabilities, and 2-Step Payout Authorization Queue. |
| **Contractor & % Setup** | Entity profiles (legal name, tax classification, default payout channel like Wise/USDC/Wire), Gross Contract Share %, Net Revenue Share % (after expenses), and Milestone Tranche Share %. |
| **Project Structuring** | Hierarchical model: `Client Portfolio` &rarr; `Project` &rarr; `Milestones` &rarr; `Tasks` &rarr; `Checklist Items`. PRD document upload ($\le 2\text{MB}$) isolated strictly to Super Admin & PM. |
| **Task Lifecycle Engine** | Interactive **Kanban Board**, Filterable **List View**, and visual **Gantt / Timeline Roadmap** with discrete milestone bounds. States: `Backlog` &rarr; `Assigned` &rarr; `In Progress` &rarr; `Pending Review` &rarr; `Completed`. Backlog isolated to PM/Admin. Completion strictly gated by PM sign-off. |
| **Deliverable Pipeline** | PR / asset link submission with automated review alerts and PM verification queues. |
| **Staff Attendance Module** | Full-team roster marking (`[A] [P] [L] [HD]`), real-time attendance stats, and employee private log isolation. |
| **Enterprise Persistence (PostgreSQL & Redis)** | PostgreSQL 16 ACID database managed via Prisma ORM 5.22, with Redis 7 caching and Express REST microservices. |
| **Append-Only Immutable Audit Trail** | Captures UUIDv4, actor, action type (`ITEM_CHECKED`, `STATUS_CHANGED`, `PAYOUT_DISBURSED`, `PASSWORD_CHANGED`, `SECURITY_2FA_UPDATED`, etc.), Client IP, User-Agent, UTC millisecond timestamp, and **Side-by-Side JSON State Deltas**. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on `v24.18.1`)
- npm `v9+` or `v11+`
- Docker & Docker Compose (for PostgreSQL 16 & Redis 7)

### 1. Database & Cache Infrastructure (Docker)
```bash
# Start PostgreSQL 16 (port 5432) and Redis 7 (port 6379)
docker compose up -d

# Verify health status
docker compose ps
```

### 2. Backend API Server (Node / Express / Prisma)
```bash
cd server
npm install
npm run prisma:generate
npm run prisma:seed
npm run dev
# Server running at http://localhost:5000/
```

### 3. Frontend Client (React 19 / Vite)
```bash
# In the project root directory
npm install
npm run dev
# Frontend running at http://localhost:3000/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Default Credentials & Fixed 2FA Keys

| Stakeholder Persona | Email | Default Password | Fixed 2FA Key | Role Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Alexander Wright** | `alexander@lincoz.com` | `admin123` | `8892` | `SUPER_ADMIN` |
| **Sarah Jenkins** | `sarah@lincoz.com` | `pm1234` | `8892` | `PROJECT_MANAGER` |
| **Alex Rivera** | `alex@lincoz.com` | `dev123` | `8892` | `ONSITE_MEMBER` |
| **David Vance** | `david@vancedesign.io` | `freelance123` | `8892` | `PARTNER_FREELANCER` |

> [!NOTE]
> Fixed 2FA keys can be updated at any time by the **Super Admin** inside User Management or the employee's Edit Profile modal.

---

## 🕹️ Interactive RBAC Persona Switcher Guide

Use the **Persona Switcher** dropdown in the top header to experience the platform from each stakeholder's perspective:

1. **Alexander Wright (Super Admin)**:
   - View global TCV ($270,000 across portfolios), $150,000 Gross Invoiced, and $19,050 Accrued Liabilities.
   - Click **"Step 2 Sign-Off"** on David Vance's approved milestone ($6,000.00) to execute the 2-step disbursement sign-off.
   - Provision new staff members with customized initial passwords and fixed 2FA keys.
   - Inspect global immutable audit diffs with side-by-side JSON snapshots.

2. **Sarah Jenkins (Project Manager)**:
   - Review pending deliverables (e.g. PR #189 Kafka worker submitted by David Vance).
   - Mark daily team attendance roster with 1-click status toggles.
   - Resolve active blocker alerts and approve task completion sign-offs.
   - Execute Step 1 verification on contractor milestones.

3. **Alex Rivera (Senior Engineer)**:
   - Toggle verification checklist items with sub-250ms real-time audit capture.
   - Transition tasks from In Progress to Pending Review.
   - Maintain private personal to-dos.

4. **David Vance (Partner Contractor)**:
   - Observe the **Data-Isolated Workspace**: Client contract values ($120k TCV) are strictly masked as `CONFIDENTIAL`.
   - Real-time earnings ledger tracking $17,625 earned across active milestone tranches.
   - Submit new GitHub PRs or demo links for PM review.

---

## 🔒 Security & Non-Functional Specifications
- **Row-Level Security (RLS)**: Scoped project and financial access preventing external contractor leakage.
- **Fixed 2FA Key Governance**: Super Admin cryptographic control over two-factor security keys.
- **Audit Trail Immutability**: Append-only (WORM) event storage preventing updates or deletions.
- **Latency**: Sub-250ms reactive state mutations with local persistence and one-click demo reset.

