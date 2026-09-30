<div align="center">

# 🏥 CLINIQ

### Intelligent Clinic Tracking and Monitoring System

Built for **Mendez Christian Academy** — Asis III, Mendez, Cavite, Philippines

*A CvSU–CEIT Software Engineering II capstone project*

<br/>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

![Status](https://img.shields.io/badge/status-planning%20%26%20architecture%20complete-yellow?style=flat-square)
![Deployment](https://img.shields.io/badge/deployment-local%20LAN-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

<br/>

## 📖 About

**CLINIQ** replaces a Philippine private school clinic's manual, paper-and-Excel workflow with a locally hosted, LAN-deployed system built around one hard constraint: **one nurse, one shared workstation, ~900 students, and effectively no budget for new hardware.**

It exists to solve four problems identified in a weighted SWOT analysis — in order of priority:

| # | Problem |
|---|---|
| 1 | ⏱️ Time-consuming manual processes |
| 2 | 👤 Insufficient manpower |
| 3 | ⚠️ High risk of human error |
| 4 | 💻 Overdependence on a single device/system |

Every feature in this project — down to individual UI decisions like *which screens show a student's name versus just their ID number* — traces back to one of these four.

<br/>

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

**🩺 Core Clinic Operations**
- Student health records with duplicate detection
- Visit logging with an embedded Smart Triage first-aid checklist
- Two-stage emergency response (fast-capture now, complete later)
- Excuse letter generation, review, and print
- Follow-Up Handling with built-in reminders (no SMS/push required)

</td>
<td width="50%" valign="top">

**📊 Operational Tools**
- Medicine & supply inventory with auto-decrementing stock and expiry tracking
- Clinic Overview Dashboard — trends, alerts, and a visit-activity calendar
- One-tap QR lookup (desktop **and** mobile) tied into every workflow
- Role-scoped read-only access for PE/Sports Instructors
- Automated backup verification with a guided recovery checklist

</td>
</tr>
</table>

> 📋 Full breakdown of all 10 modules, every operation, and exactly who can access what: [`CLINIQ-Knowledge-Base/01-Requirements/Features/Module-Overview.md`](./CLINIQ-Knowledge-Base/01-Requirements/Features/Module-Overview.md)

<br/>

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| 🎨 Frontend | React + TypeScript, built with **Vite** | Modern SPA tooling, static build output — no Node runtime needed in production |
| 💅 Styling | Tailwind CSS | Utility-first, fast to build a consistent design system on |
| ⚙️ Backend | Laravel (PHP) | Batteries-included framework, small-team-friendly |
| 🔐 Auth | Laravel Sanctum | SPA-specific token/cookie auth, not generic session auth |
| 🗄️ Database | MySQL | |
| 📷 QR Generation | [`endroid/qr-code`](https://github.com/endroid/qr-code) | Actively maintained (the more obvious pick was abandoned since 2021) |
| 📱 QR Scanning | [`qr-scanner`](https://github.com/nimiq/qr-scanner) | Falls back gracefully on browsers without native barcode APIs — works on iPhone, not just Android |
| 📈 Charts | Chart.js + `react-chartjs-2` | Smaller bundle, Canvas rendering — matters on a 4GB RAM workstation |
| 🧪 Testing | Pest (backend) · Vitest + RTL (frontend) | |
| 🏠 Local Dev | XAMPP, standardized across every machine | Matches the client's actual production environment |
| ☁️ Deployment | Local LAN today → remote/cloud is a documented future phase | API-driven architecture supports the move without a rewrite |

Every choice above was researched, not assumed — see [`ADR-007`](./CLINIQ-Knowledge-Base/06-Decisions/ADR-007-Stack-Finalization.md) for the full reasoning, including why the *more obvious-looking* QR scanning library was rejected.

<br/>

## 📁 Project Structure

```
CLINIQ/
├── 🤖 AGENTS.md                 → start here if you're an AI coding agent
├── 🤖 CLAUDE.md                 → identical to AGENTS.md (Claude Code auto-loads this one)
├── 📄 README.md                 → you are here
│
├── 🎨 frontend/                 → React + TypeScript + Vite
│   └── src/features/            → one folder per module, feature-based structure
│       └── qr-digital-health-id/
│           ├── desktop/         → Staff's computer quick-action hub
│           ├── mobile/          → Staff mobile flow + PE/Sports Instructor lookup
│           └── shared/          → the one camera-scanning implementation, used by both
│
├── ⚙️ backend/                  → Laravel API
│   └── app/Modules/             → one folder per module, mirroring the frontend directly
│
├── 🧠 .claude/skills/           → bespoke, CLINIQ-specific agent skills
│   ├── cliniq-display-privacy/
│   └── cliniq-audit-trail/
│
└── 📚 CLINIQ-Knowledge-Base/    → the full project knowledge base (Obsidian-compatible)
    ├── 00-Project-Core/         → what this is, for whom, and why
    ├── 01-Requirements/         → functional & non-functional requirements
    ├── 02-Architecture/         → tech stack, system design, database
    ├── 03-Design/               → full design system + reference screens
    ├── 04-Development/          → setup, conventions, phases, skills
    ├── 05-Testing/               → test strategy
    ├── 06-Decisions/             → every ADR, with reasoning
    ├── 07-AI-Agents/             → agent workflow rules
    ├── 08-Logs/                  → changelog, session logs, open issues
    └── 09-References/            → the 5 canonical planning documents, in full
```

One repository, not three — frontend, backend, and the knowledge base travel together so documentation can never quietly drift out of sync with the code.

<br/>

## 🚀 Getting Started

> ⚠️ **Nothing is scaffolded yet.** Planning and architecture are complete; environment setup is fully specified but hasn't been executed. The steps below are what *will* run, not what already has.

**Prerequisites:** XAMPP · Node.js (LTS) · Composer · Git

```bash
# 1. Clone the repo
git clone <repo-url> CLINIQ && cd CLINIQ

# 2. Backend
composer create-project laravel/laravel backend
cd backend
composer require laravel/sanctum endroid/qr-code
cp .env.example .env   # configure against XAMPP's MySQL

# 3. Frontend
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install tailwindcss qr-scanner chart.js react-chartjs-2
cp .env.example .env
```

Full step-by-step detail, including *why* each choice was made: [`CLINIQ-Knowledge-Base/04-Development/Environment-Setup.md`](./CLINIQ-Knowledge-Base/04-Development/Environment-Setup.md)

<br/>

## 🗺️ Development Roadmap

Frontend and backend are built as two coordinated tracks — frontend leads (per feature) so the client sees and approves a working UI before backend logic is finalized behind it.

| Track | Phases |
|---|---|
| 🎨 **Frontend** | `F0` Setup & design tokens → `F1` 5 reference screens → `F2` every remaining screen, module by module → `F3` polish & accessibility |
| ⚙️ **Backend** | `B0` Scaffold → `B1` Database schema *(TBA — not yet designed)* → `B2` Auth/RBAC → `B3` Audit trail → `B4`–`B10` one phase per module |

Full phase-by-phase detail, dependencies, and the two decisions still blocking Phase F0: [`CLINIQ-Knowledge-Base/04-Development/Development-Phases.md`](./CLINIQ-Knowledge-Base/04-Development/Development-Phases.md)

<br/>

## 👥 Team

| | Name | Role |
|---|---|---|
| 🧭 | **Ghenly B. Tinapay** | Project Manager |
| 🔍 | **Christian John C. Lugami** | System Analyst |
| 💻 | **Zean Kurt G. Balboa** | Developer / Tester |

**Client contact:** Ms. Jenne Baas, School Head Nurse, Mendez Christian Academy

<br/>

## 📚 Documentation

This project takes documentation seriously — every real decision has a paper trail.

- 📋 **[Project Plan](./CLINIQ-Knowledge-Base/09-References/Canonical-Documents/CLINIQ_Project_Plan.md)** — problem domain, approach, system design, timeline, budget (full revision history included)
- 🧩 **[Modules & Features](./CLINIQ-Knowledge-Base/09-References/Canonical-Documents/CLINIQ_Modules_and_Features.md)** — every module, submodule, and access rule
- 🖥️ **[Frontend Context Brief](./CLINIQ-Knowledge-Base/09-References/Canonical-Documents/CLINIQ_Frontend_Context_Brief.md)** — full spec for an AI coding agent
- 🎨 **[Frontend Design Reference](./CLINIQ-Knowledge-Base/09-References/Canonical-Documents/CLINIQ_Frontend_Design_Reference.md)** — the 5 reference screens, in depth
- 🔬 **[Review of Related Systems](./CLINIQ-Knowledge-Base/09-References/Canonical-Documents/CLINIQ_Review_of_Related_Systems.md)** — 10 existing systems compared, feature by feature
- 🗂️ **[Decision Log (ADRs)](./CLINIQ-Knowledge-Base/06-Decisions/)** — why, not just what
- 📝 **[Changelog](./CLINIQ-Knowledge-Base/08-Logs/Changelog.md)** — everything that's happened, in order
- 🔗 **[URL Parameters](./URL-Parameters.md)** — active query parameters, examples, and retired `?screen` history

<br/>

## 📄 License

MIT — see [`LICENSE`](./LICENSE). This was decided directly in the repo (not through this chat/vault workflow) — caught and synced here after checking the live GitHub repo, per the standing rule that the vault must be verified against GitHub before edits, not assumed current.

<br/>

## 🙏 Acknowledgments

- **Ms. Jenne Baas** and Mendez Christian Academy, for the trust and the real-world constraints that shaped every design decision in this project
- **CvSU–CEIT**, Software Engineering II course instruction

<br/>

<div align="center">

*Built with care for a clinic that runs on one workstation and one very busy nurse.*

</div>
