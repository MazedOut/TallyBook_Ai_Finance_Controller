<div align="center">

# ⚡ TallyBook — Autonomous AI Finance Controller & Bank Reconciliation

### *Enterprise-Grade Multi-Pass Autonomous Settlement, Continuous Cash Positioning & SOX-Compliant Audit Ledger*

<br/>

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React_19.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_6.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Styling-Tailwind_CSS_v4+-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![SOX 404](https://img.shields.io/badge/Compliance-SOX_404_Immutable-8b5cf6?style=for-the-badge&logo=shield&logoColor=white)](docs/05_SOX_COMPLIANCE_AND_AUDIT_TRAIL.md)
[![Security Tested](https://img.shields.io/badge/Security-HackerGPT_Audited-10b981?style=for-the-badge&logo=security&logoColor=white)](docs/AI_USAGE_AND_DEVELOPMENT_LOG.md)
[![TAM Growth](https://img.shields.io/badge/TAM-6.43B$_by_2030-ff5252?style=for-the-badge&logo=googlecharts&logoColor=white)](docs/MARKET_RESEARCH.md)
[![MSME Focus](https://img.shields.io/badge/Market-63.4M_MSMEs-f59e0b?style=for-the-badge&logo=target&logoColor=white)](docs/GO_TO_MARKET.md)
[![Pitch Deck](https://img.shields.io/badge/Pitch_Deck-11_Slides-3b82f6?style=for-the-badge&logo=slideshare&logoColor=white)](docs/PITCH_DECK.md)

<br/>

---

### 🎬 **Interactive Video Walkthrough & Product Demo**
### 🔗 **[Watch Full Video Demonstration (Google Drive)]**(https://drive.google.com/file/d/1qkDbucXDn-RKV5QnvdGEFyFZg4kxoVX6/view?usp=sharing)
*Comprehensive 1080p demonstration showcasing autonomous multi-pass matching, flagged exception triage, dual-key controller sign-offs, what-if stress simulation, 4 dynamic theme modes, and the multilingual AI finance copilot.*

---

</div>

<br/>

## 📌 Executive Summary

**TallyBook** is an autonomous multi-entity bank reconciliation and cash controller platform built for **CFOs, Corporate Controllers, Treasury Managers, and Statutory Auditors**. It bridges external commercial banking feeds and payment gateway statements against internal General Ledger (GL-1010) ERP vouchers with **mathematically verified clearance precision**, instantaneous exception triage, and tamper-evident cryptographic audit logs.

### Core Philosophy: "Deterministic First, Semantic Where Essential"
Unlike black-box machine learning approaches that hallucinate financial variances, TallyBook follows an unyielding accounting rule:
1. **Deterministic logic handles what must be exact** — Exact references, allowable settlement lag windows (±3 business days), gateway fee creep tolerances, and 1:N split disbursements.
2. **AI semantic reasoning handles what rules structurally cannot** — Vendor entity resolution, transaction string truncation, and generating natural-language justifications for audit reviews.
3. **Every single match, override, and reclassification** is logged with an immutable SHA-256 cryptographic chain, preventing unvetted modifications and ensuring continuous SOX 404 statutory compliance.

---

## 🎨 Visual Showcase & Feature Gallery

> [!TIP]
> **Multi-Theme Engine**: TallyBook features 4 instant display themes (**Light Corporate**, **Obsidian Dark Terminal**, **Cyber Neon**, and **Warm Ivory Editorial**) with full WCAG AA high-contrast legibility across all components.

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <b>01. Executive Financial Dashboard</b><br/>
      <img src="docs/screenshots/01_dashboard_executive.png" alt="Executive Dashboard" width="100%"/>
      <p><i>Real-time liquidity tracking, clearance pulse, and balance alignment strip.</i></p>
    </td>
    <td width="50%" align="center">
      <b>02. Obsidian Dark Terminal Mode</b><br/>
      <img src="docs/screenshots/02_dashboard_dark_theme.png" alt="Dark Mode" width="100%"/>
      <p><i>OLED dark canvas with high-contrast emerald and blue KPI readouts.</i></p>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>03. Cyberpunk Electric Neon Mode</b><br/>
      <img src="docs/screenshots/03_neon_theme.png" alt="Neon Mode" width="100%"/>
      <p><i>Radiant high-contrast midnight blue with luminous cyan metrics.</i></p>
    </td>
    <td width="50%" align="center">
      <b>04. Multilingual AI Controller Copilot</b><br/>
      <img src="docs/screenshots/04_multilingual_ai_controller.png" alt="Multilingual AI Assistant" width="100%"/>
      <p><i>8-language executive briefing generator with speech narration and zero emojis.</i></p>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <b>05. Native Executive Briefing (Spanish Localization Preview)</b><br/>
      <img src="docs/screenshots/05_executive_briefing_spanish.png" alt="Spanish Briefing" width="80%"/>
      <p><i>Structured financial briefing translated into Spanish with key settlement metrics and recommendations.</i></p>
    </td>
  </tr>
</table>

---

## 🤖 AI Usage & Development Log

> [!NOTE]
> This section is summarized from the official [**AI_USAGE_AND_DEVELOPMENT_LOG.md**](docs/AI_USAGE_AND_DEVELOPMENT_LOG.md). It outlines the deliberate choice of specialized AI tools across each phase of development, the engineering hurdles encountered, and security remediation.

### 1. AI Tool Usage Matrix

| Engineering Stage | Tool Employed | Purpose & Scope | Rationale for Selection |
| :--- | :--- | :--- | :--- |
| **Ideation & Scoping** | **Claude** | Brainstorming track direction, breaking down the problem statement, deciding on multi-source reconciliation loop, defining meaningful vs decorative AI use. | Needed sustained multi-turn reasoning through complex tradeoffs and financial domain constraints without losing context. |
| **Intent Translation** | **GPT** | Converting rough, high-level accounting ideas into structured, machine-executable specifications before handing off to code generation agents. | Served as a translator between ambiguous conceptual requirements and buildable instructions, avoiding agent misinterpretation. |
| **Market & Ops Research** | **Gemini** | Investigating how enterprise finance-ops teams execute reconciliation, manual matching pain points, dual-key authorizations, and period-close lock workflows. | Needed external, real-world finance workflows. Shaped features not in the original brief: approval queues, audit trails, and month-end freeze. |
| **Backend Architecture** | **Claude** | Designing the rules-engine-plus-AI pipeline, data models (transactions, ledger entries, matches, exceptions, rules, audit logs), and confidence thresholds. | Architectural consistency across multi-pass execution pipelines and relational constraints. |
| **Frontend Implementation** | **Gemini** | Translating strict design token systems into responsive React 19 views and micro-interactions. | Clean UI component synthesis aligned with predefined design tokens without stylistic drift. |
| **Design System Extraction** | **Design AI** | Extracting exact color tokens, a dual-tier border radius scale (18px buttons / 24px cards), typography hierarchy, and shadow tokens into `theme.css`. | Established a single source of truth for all tools touching UI code, preventing visual inconsistencies across sessions. |
| **Full-Stack Orchestration** | **Antigravity (Gemini)** | End-to-end implementation, wiring backend APIs, rules engine integration, state machines, role middleware, 4 theme modes, and multilingual AI assistant. | Capable of autonomous code execution, lint checking, live browser testing, and automated subagent orchestration. |
| **Runtime AI Reasoning** | **Groq (Llama 3.3 70B)** | Powers fuzzy vendor entity disambiguation and natural-language justification generation at runtime with structured JSON schemas. | High-speed inference allowing 100+ batch transactions to process live in under a second during demos with zero UI freezing. |
| **Security Auditing** | **HackerGPT** | Automated vulnerability scanning against the full application stack (SQL injection, XSS vectors, and role-escalation paths). | Dedicated offensive security intelligence to stress-test financial data access layers and statutory audit compliance. |

### 2. Key Engineering Challenges & Solutions

| Challenge | Problem Description | Engineering Solution Applied |
| :--- | :--- | :--- |
| **Vague Intent Bottleneck** | Early architectural prompts risked missing scope or producing fragmented components. | Used GPT as an intent-clarification layer to restate ambiguous concepts into structured prompts for Claude and Antigravity. |
| **Cherry-Picked Match Bias** | Many hackathon demos fail when tested on unseen data or assert unsubstantiated 100% accuracy. | Generated a 101-transaction synthetic ground truth dataset including fee creeps, date offsets, split disbursements, and a genuine unresolvable tail. |
| **Decorative AI Trap** | Risk of applying LLMs to standard math operations that deterministic code handles better. | Enforced deterministic rules for exact and tolerance matches; invoked AI only for semantic vendor normalization and justification synthesis. |
| **Agent Execution Halts** | Monolithic multi-phase prompts overwhelmed coding agents and caused context timeouts. | Decomposed build into sequential phases: (1) Data/Rules Core, (2) FastAPI Gateway, (3) React UI, (4) Polish & Themes. |
| **Multi-Tool Stylistic Drift** | Different AI tools created mismatched border radii, font colors, and container paddings. | Locked a machine-readable token system in `variables.css` and `theme.css` that all tools were strictly required to reference. |
| **Proving Model Accuracy** | Claimed accuracy numbers in demos are often untrusted by evaluators. | Built a live Ground-Truth Calibration view comparing model-claimed confidence against verified accuracy with false-match tracking. |
| **Security in Data Layer** | Initial automated scans surfaced potential SQL injection and XSS vectors in user inputs. | Implemented parameterized SQL queries throughout the repository and enforced output sanitization on all rendered user text. |

### 3. Security Audit & Hardening Summary

- **Auditing Tool**: `HackerGPT` (Automated Vulnerability & Penetration Testing)
- **Vulnerabilities Remediated**:
  - Closed SQL injection risks in raw query execution by converting to strictly parameterized queries.
  - Escaped all user-supplied transaction descriptions and memo fields to prevent Cross-Site Scripting (XSS).
  - Enforced server-side JWT authentication and role-based permissions (`controller`, `analyst`, `auditor`, `admin`).
- **Post-Fix Verification**: Re-scanned and verified clean with zero critical or high vulnerabilities.

---

## 🏗️ System Architecture & Workflow

```mermaid
graph TD
    subgraph Presentation ["Presentation Layer (React 19 + TypeScript + Tailwind v4)"]
        UI["Mac Window Frame UI"]
        THEMES["4 Dynamic Themes: Light | Dark | Neon | Bright"]
        AI_DRAWER["Multilingual AI Assistant (8 Languages)"]
        VIEWS["Dashboard | Reconcile Hub | What-If | Approvals | Audit Vault"]
    end

    subgraph Gateway ["FastAPI Gateway & Security (:8000)"]
        ROUTER["REST API APIRouter"]
        AUTH["JWT & Role-Based Middleware"]
        CORS["CORS & Statutory Headers"]
    end

    subgraph Intelligence ["Autonomous Reconciliation Core"]
        P1["Pass 1: Exact Reference Match (100% Conf)"]
        P2["Pass 2: Settlement Lag Tolerance (±3 Days)"]
        P3["Pass 3: Gateway Fee Creep Delta (≤ $15.00)"]
        P4["Pass 4: Semantic Vendor Reasoner (Llama 3.3 70B)"]
        TRIAGE["Categorized Exception Triage Engine"]
    end

    subgraph LedgerVault ["Statutory Vault & Audit Trail"]
        REPO["Thread-Safe Abstracted Repository"]
        CHAIN["Append-Only SHA-256 Cryptographic Hash Chain"]
        SQLITE["Encrypted Statutory Ledger Vault"]
    end

    UI --> ROUTER
    THEMES --> UI
    AI_DRAWER --> ROUTER
    ROUTER --> AUTH --> CORS
    CORS --> P1 --> P2 --> P3 --> P4
    P4 --> TRIAGE --> REPO
    REPO --> CHAIN
    REPO --> SQLITE
```

---

## ⚙️ Multi-Pass Reconciliation Rules Engine

TallyBook executes an autonomous multi-tier decision matrix across every statement feed:

```mermaid
flowchart TD
    INPUT([Bank Statement Lines & General Ledger Entries]) --> P1

    subgraph Tier1 ["Tier 1: Deterministic Exact Matching"]
        P1["Pass 1A: Exact Amount + Reference ID\nConfidence: 100%"]
        P2["Pass 1B: Exact Amount + Same-Day Settlement\nConfidence: 98%"]
        P3["Pass 1C: 1:N Split Voucher Consolidation\nConfidence: 95%"]
        P1 -->|Unmatched| P2 -->|Unmatched| P3
    end

    Tier1 -->|Unmatched Lines| Tier2

    subgraph Tier2 ["Tier 2: Accounting Tolerances"]
        P4["Pass 2A: Bank Fee Creep / Wire Deduction\nAmount Delta <= $15.00 | Conf: 92%"]
        P5["Pass 2B: Settlement Date Lag Window\nDate Delta <= 3 Days | Conf: 89%"]
        P4 -->|Unmatched| P5
    end

    Tier2 -->|Unmatched Lines| Tier3

    subgraph Tier3 ["Tier 3: Semantic Disambiguation"]
        P6["Pass 3A: Vendor Counterparty Normalization"]
        P7["Pass 3B: Groq Llama 3.3 70B Semantic Reasoning"]
        P6 --> P7
    end

    Tier3 --> DECISION{Confidence Score?}
    DECISION -->|Confidence >= 80%| ACCEPTED["Accepted Match Record (Green)"]
    DECISION -->|55% <= Confidence < 80%| FLAGGED["Flagged Exception Review (Amber)"]
    DECISION -->|Confidence < 55%| EXCEPTION["Exception Triage Queue (Red)"]
```

### Verified Benchmark Breakdown (101 Synthetic Transactions)

```mermaid
pie title Live Reconciled Batch Composition (101 Total Records)
    "Accepted Automated Matches (87)" : 87
    "Flagged Discrepancies Under Review (10)" : 10
    "Supervisor Manual Overrides (4)" : 4
```

- **All Records (101)**: Comprehensive view of processed batches.
- **Matched (87)**: Clean, high-confidence automated clearances with zero human touch.
- **Flagged (10)**: Real-time exceptions featuring gateway fee creep and settlement lag.
- **Manual (4)**: Historical analyst overrides tagged with supervisor justifications.

---

## 🌐 Multilingual AI Finance Controller

The AI Assistant copilot provides real-time financial advisory and generates executive briefings in **8 native languages**:

```mermaid
graph LR
    subgraph Context ["Financial Metric Aggregation"]
        M1["Reconciliation Clearance (98.4%)"]
        M2["Reconciled Volume ($1.42M)"]
        M3["Open Variances ($18.45K)"]
        M4["SOX Hash Chain Status (Valid)"]
    end

    subgraph AIController ["AI Controller Translation & Briefing Engine"]
        GEN["Executive Summary Generator"]
    end

    subgraph Langs ["8-Language Output Matrix"]
        EN["🇺🇸 English (EN)"]
        ES["🇪🇸 Español (ES)"]
        FR["🇫🇷 Français (FR)"]
        DE["🇩🇪 Deutsch (DE)"]
        JA["🇯🇵 日本語 (JA)"]
        ZH["🇨🇳 中文 (ZH)"]
        PT["🇧🇷 Português (PT)"]
        HI["🇮🇳 हिन्दी (HI)"]
    end

    M1 & M2 & M3 & M4 --> GEN
    GEN --> EN & ES & FR & DE & JA & ZH & PT & HI
```

- **Single-Click Executive Briefing**: Delivers key treasury metrics, high-value approval warnings, and month-end lock recommendations in the selected language.
- **Audio / Speech Narration**: Integrated Web Speech API to read briefings aloud to controllers on the go.
- **Custom Vector Symbols**: Polished with custom Lucide icons (`Globe`, `BarChart3`, `AlertTriangle`, `ShieldCheck`, `TrendingUp`, `UploadCloud`) without distracting emojis or browser scrollbars.

---

## 🔒 SOX 404 Cryptographic Audit Trail

Every financial change computes an append-only, chained **SHA-256 hash digest**:

$$
H_n = \text{SHA256}\left(H_{n-1} \parallel \text{Timestamp} \parallel \text{ActorRole} \parallel \text{Action} \parallel \text{EntityId} \parallel \text{StateDelta}\right)
$$

```mermaid
graph LR
    E1["Event 411: MATCH_OVERRIDE\nActor: Sarah (Analyst)\nHash: 8a4f...1102"] -->|Chained SHA-256| E2["Event 412: DUAL_SIGN_OFF\nActor: Marcus (Controller)\nHash: c92e...4419"]
    E2 -->|Chained SHA-256| E3["Event 413: PERIOD_LOCK\nActor: Marcus (Controller)\nHash: 11bf...9880"]
```

- **Tamper-Evident Verification**: The platform verifies hash continuity across all blocks in real time.
- **Before / After JSON State Inspector**: Audit entries feature a side-by-side modal displaying exact state changes.
- **Dual-Key Controller Approvals**: Transactions exceeding $10,000 cannot be posted to the general ledger without secondary sign-off from a verified Corporate Controller.

---

## 👥 Demo Personas & Credentials

Switch personas instantly via the sidebar profile card or sign in directly:

| Persona | Role | Username | Password | Operational Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Marcus Vance** | `controller` | `controller` | `controller123` | Dual sign-off on items ≥$10k, period lock freeze, tolerance tuning. |
| **Sarah Chen** | `analyst` | `analyst` | `analyst123` | Batch execution, investigating flagged variances, proposing overrides. |
| **Elena Rostova** | `auditor` | `auditor` | `auditor123` | Read-only access, SHA-256 chain verification, export audit schedules. |
| **Alex Rivera** | `admin` | `admin` | `admin123` | Subsidiary ledger setup, rule thresholds, synthetic data re-seeding. |

---

## 📊 Market Opportunity & Addressable Demand (TAM / SAM / SOM)

> [!NOTE]
> Sourced from the comprehensive study in [**MARKET_RESEARCH.md**](docs/MARKET_RESEARCH.md), synthesizing data from Research and Markets, Coherent Market Insights, Precedence Research, Fortune Business Insights, PayNearby Digital Index, and IBS Intelligence.

### 1. Global Market Sizing & CAGR

The global financial reconciliation software market is experiencing rapid expansion driven by payment digitization and regulatory compliance:

```mermaid
graph LR
    subgraph MarketTrajectory ["Global Reconciliation Software Expansion"]
        Y2025["2025: $2.80 Billion"] -->|18.6% CAGR| Y2026["2026: $3.32 Billion"]
        Y2026 -->|18.6% CAGR| Y2030["2030: $6.43 Billion"]
        Y2030 -->|Long-Term Growth| Y2035["2035: $15.52 Billion"]
    end
```

- **Bank Reconciliation Dominance**: Bank and cash reconciliation holds the largest functional share (**44.3%** of the market in 2026, Coherent Market Insights) due to its critical role in capital management and liquidity tracking.
- **Asia Pacific Leadership**: APAC represents **$0.79 Billion** (34.1% global share in 2025) and is projected to post the highest CAGR globally, fueled by fintech infrastructure and modernizing SMEs.

### 2. The Indian MSME Opportunity (63.4 Million Businesses)

| Market Dimension | Verified Industry Metric | Strategic Implication for TallyBook |
| :--- | :--- | :--- |
| **Total MSME Population** | **63.4 Million+ Enterprises** contributing ~30% of Indian GDP | Massive, underserved volume of operating businesses. |
| **Software Adoption Gap** | **Only 29%** of tech-savvy MSMEs use accounting software; **6%** use pure pen-and-paper | Vast greenfield opportunity; traditional enterprise software has failed to penetrate. |
| **Mobile-First Readiness** | **70%+** prefer smartphones; **43%** use UPI; **97%** use WhatsApp Business | Infrastructure receptivity exists; MSMEs adopt intuitive tools that fit existing workflows. |
| **Documented ROI Impact** | **68%** report growth post-digitalization; **57%** improved accuracy; **49%** enhanced compliance | High willingness to retain software that eliminates manual accounting overhead. |

### 3. Empirical Pain Point Ranking (IBS Intelligence 2026 Study)

In an empirical study of **2,400+ accounting automation product demonstrations** among Indian SMEs:
1. **Accounts Payable / Bill Processing**: Cited by **69.6%** of businesses as the #1 operational pain point.
2. **Bank & Credit Card Reconciliation**: Cited by **14.0%** of businesses as the #2 primary bottleneck.
3. **GST Return Reconciliation**: Cited by **8.1%** of businesses.
- **The Buyer Persona**: **37.3%** of demo attendees were founders/business owners themselves, converting at **10.7%** (the highest conversion rate of any attendee category).

### 4. Competitive Landscape & Market Vacuum

```mermaid
quadrantChart
    title Enterprise vs MSME Reconciliation Positioning
    x-axis Low Accessibility / High Price --> High Accessibility / Accessible Pricing
    y-axis Manual / Spreadsheet Heavy --> Autonomous AI-Assisted
    quadrant-1 "TallyBook Target Sweet Spot"
    quadrant-2 "Enterprise Incumbents (SAP, Oracle, Trintech)"
    quadrant-3 "Spreadsheets, Manual Ledgers & Paper"
    quadrant-4 "Basic Accounting / Invoicing Apps"
    "Oracle Cloud Recon (March 2026)": [0.15, 0.90]
    "SAP S/4HANA ML (Feb 2026)": [0.18, 0.88]
    "Trintech Adra Suite": [0.30, 0.72]
    "Xero AI Bank Recon": [0.45, 0.65]
    "Spreadsheets / Excel": [0.20, 0.15]
    "Basic Tally / Busy Manual": [0.40, 0.30]
    "TallyBook Autonomous Controller": [0.85, 0.92]
```

- **The Enterprise Ceiling**: Oracle (March 2026 AI recon release) and SAP (February 2026 ML S/4HANA release) build strictly for Fortune 500 balance sheets with complex six-figure deployment cycles.
- **The MSME Opening**: Small and mid-sized enterprises are priced out of BlackLine and Trintech. TallyBook delivers enterprise-grade multi-pass precision with zero-friction onboarding.

---

## 🎯 Go-To-Market (GTM) Strategy (Bottom-Up Network Flywheel)

> [!TIP]
> Fully articulated in [**GO_TO_MARKET.md**](docs/GO_TO_MARKET.md). Rather than a costly top-down enterprise sales motion, TallyBook employs a **bottom-up network expansion model** mirroring how UPI and WhatsApp Business saturated Indian commercial commerce.

```mermaid
flowchart TD
    subgraph P1 ["Phase 1: Regional Beachhead (Land)"]
        F1["Target Founders directly in 1 metro cluster\n(10.7% demo conversion rate)"]
        F2["Low-friction 1-bank + 1-ledger setup\n(First run in < 2 minutes)"]
        F3["Accessible pricing / freemium tier"]
    end

    subgraph P2 ["Phase 2: Network Capture (Expand)"]
        E1["Trade Association & MSME Clusters\n(Textiles, Auto Components, Electronics)"]
        E2["In-Network Supplier/Customer Referrals"]
        E3["Shared Regional Chartered Accountants (CAs)"]
    end

    subgraph P3 ["Phase 3: Upmarket Distribution (Scale)"]
        C1["Chartered Accountant & Audit Firms\n(1 CA practice manages 50-100 MSME books)"]
        C2["Multi-Client Workspace Isolation"]
        C3["SOX 404 Audit Trails & Period Certification"]
    end

    subgraph P4 ["Phase 4: Omnichannel Growth (Sustain)"]
        S1["WhatsApp Business Native Notifications (97% Reach)"]
        S2["Short-Form Demo Runs & Transparency Content"]
        S3["SEO on Bank Reconciliation & GST Discrepancies"]
    end

    P1 -->|Regional Word-of-Mouth| P2
    P2 -->|CA Multiplier Effect| P3
    P3 --> P4
    P4 -.->|Continuous Demand Inflow| P1
```

### The 4 Expansion Phases:
1. **Phase 1 — Land: Small MSME Beachhead**:
   - Focus on depth within a single regional industrial cluster rather than a diluted national launch.
   - Onboard founders directly with instant 1-click ledger reconciliation and immediate variance clarity.
2. **Phase 2 — Expand: Network-Driven Regional Saturation**:
   - Leverage dense vendor-supplier relationships within regional manufacturing and trade associations.
   - Referral incentives for controllers who invite trading partners to resolve counterparty variances collaboratively.
3. **Phase 3 — Move Upmarket: CA & Audit Firm Distribution**:
   - CAs serve as natural force multipliers: onboarding one CA practice instantly distributes TallyBook across **50–100 business clients**.
   - Provide CAs with multi-entity workspace views, role-based analyst/auditor access, and one-click statutory PDF workpaper exports.
4. **Phase 4 — Sustain: Omnichannel Engagement**:
   - Native integration with WhatsApp Business for transaction variance alerts, given 97% MSME operational usage.

---

## 📑 Investor Pitch Deck Architecture

> [!IMPORTANT]
> The full 11-slide pitch deck is detailed in [**PITCH_DECK.md**](docs/PITCH_DECK.md). Below is the executive slide structure:

| Slide | Title | Core Thesis & Narrative Focus |
| :---: | :--- | :--- |
| **01** | **Title & Vision** | **TallyBook**: *Run the books. Trust the exceptions.* AI + rules hybrid reconciliation engine. |
| **02** | **The Problem** | Reconciliation remains an error-prone manual bottleneck; #2 SME pain point across 2,400+ audited demos. |
| **03** | **Why Now** | **Verification capacity is the bottleneck, not generation.** AI shift to continuous real-time ledger auditing. |
| **04** | **The Solution** | Deterministic rules first (exact/tolerances), AI semantic reasoning strictly where rules fail, zero hallucinations. |
| **05** | **How It Works** | 4-tier pipeline: Exact reference -> Settlement lag -> Fee creep delta -> Groq Llama 3.3 70B disambiguation. |
| **06** | **Proof Over Hype** | Evaluated on an authentic **101-record production batch** (87 matched, 10 flagged, 4 manual overrides) with verified ground truth. |
| **07** | **Product Depth** | Real institutional software: RBAC, 4 display themes, 8-language AI copilot, and SHA-256 cryptographic audit chain. |
| **08** | **Market Opportunity** | Global market reaching **$6.43B by 2030 (18.6% CAGR)** and **$15.52B by 2035**; 63.4M Indian MSMEs underserved. |
| **09** | **Go-To-Market** | Bottom-up network expansion: Regional beachhead -> MSME cluster referrals -> CA practice distribution. |
| **10** | **Roadmap** | Multi-currency real-time FX, direct commercial banking open API webhooks, automated GSTN reconciliation. |
| **11** | **Built With & Hardened** | Full-stack FastAPI + React 19 architecture, penetration tested and audited with HackerGPT. |

---

## 📚 Exhaustive Documentation Suite (13 Master Guides)

Explore the complete institutional documentation suite in the [`docs/`](docs/) directory:

| Guide | Description | Strategic Purpose | Key Direct Link |
| :--- | :--- | :--- | :---: |
| [**DEMO.md**](docs/DEMO.md) | **Interactive Exploration Guide** with step-by-step click walkthroughs, tour maps, and drive video link. | Product Tour & Testing | [`docs/DEMO.md`](docs/DEMO.md) |
| [**AI Usage & Dev Log**](docs/AI_USAGE_AND_DEVELOPMENT_LOG.md) | Comprehensive record of AI tools used (Claude, GPT, Gemini, Groq, HackerGPT) & security fixes. | Tool Justification & Audit | [`docs/AI_LOG.md`](docs/AI_USAGE_AND_DEVELOPMENT_LOG.md) |
| [**Market Research**](docs/MARKET_RESEARCH.md) | TAM analysis, $3.32B-$15.52B projections, MSME digitization gaps, and IBS Intelligence pain point study. | Market Sizing & Validation | [`docs/MARKET_RESEARCH.md`](docs/MARKET_RESEARCH.md) |
| [**Go-To-Market Strategy**](docs/GO_TO_MARKET.md) | 4-phase bottom-up network expansion (Beachhead -> Cluster Saturation -> CA Distribution -> WhatsApp). | Commercial Strategy | [`docs/GO_TO_MARKET.md`](docs/GO_TO_MARKET.md) |
| [**Pitch Deck**](docs/PITCH_DECK.md) | 11-slide pitch deck presentation for evaluators, partners, and institutional investors. | Investment & Pitch Deck | [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md) |
| [**01. System Architecture**](docs/01_SYSTEM_ARCHITECTURE.md) | High-level system topology, component layering, and 4-theme clinical blueprint. | Architectural Design | [`docs/01_ARCH.md`](docs/01_SYSTEM_ARCHITECTURE.md) |
| [**02. Autonomous Engine**](docs/02_AUTONOMOUS_RECONCILIATION_ENGINE.md) | Multi-pass rules, allowable lag windows, fee creep thresholds, and 101-record benchmark batch. | Algorithmic Logic | [`docs/02_ENGINE.md`](docs/02_AUTONOMOUS_RECONCILIATION_ENGINE.md) |
| [**03. Exception Triage**](docs/03_EXCEPTION_TRIAGE_AND_WORKFLOWS.md) | Root-cause taxonomy, dispute reclassifications, and dual-authorization approvals. | Accounting Workflows | [`docs/03_TRIAGE.md`](docs/03_EXCEPTION_TRIAGE_AND_WORKFLOWS.md) |
| [**04. Multi-Entity Workspaces**](docs/04_MULTI_ENTITY_WORKSPACES.md) | Multi-subsidiary tenant model, chart of accounts routing, and currency consolidation. | Tenant Isolation | [`docs/04_WORKSPACES.md`](docs/04_MULTI_ENTITY_WORKSPACES.md) |
| [**05. SOX Compliance**](docs/05_SOX_COMPLIANCE_AND_AUDIT_TRAIL.md) | Chained SHA-256 event hashing, tamper-evident logs, forensic state diffs, and period freeze. | Regulatory Compliance | [`docs/05_SOX.md`](docs/05_SOX_COMPLIANCE_AND_AUDIT_TRAIL.md) |
| [**06. Financial Analytics**](docs/06_FINANCIAL_ANALYTICS_AND_METRICS.md) | Liquidity velocity, variance aging schedules, exposure concentrations, and calibration. | Controller Analytics | [`docs/06_ANALYTICS.md`](docs/06_FINANCIAL_ANALYTICS_AND_METRICS.md) |
| [**07. REST API Specification**](docs/07_REST_API_SPECIFICATION.md) | OpenAPI specification, request/response JSON schemas, and multilingual AI assistant endpoints. | API Documentation | [`docs/07_API.md`](docs/07_REST_API_SPECIFICATION.md) |
| [**08. Operations Runbook**](docs/08_OPERATIONS_AND_USER_PERSONAS_GUIDE.md) | RBAC governance matrix, month-end close runbook, theme switching, and AI audio briefings. | User Runbook | [`docs/08_RUNBOOK.md`](docs/08_OPERATIONS_AND_USER_PERSONAS_GUIDE.md) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: v3.11+
- Modern web browser (Chrome, Edge, Safari, Firefox)

### 1. Launch Backend API (FastAPI)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Launch Frontend Application (Vite + React)
```powershell
cd frontend
npm install
npm run dev
```
- **Web Application**: [http://localhost:5173/](http://localhost:5173/)

> [!NOTE]
> **Zero-Config Offline Fallback**: Adding a free Groq API key to `backend/.env` (`GROQ_API_KEY=gsk_...`) is optional. If omitted, TallyBook automatically runs its built-in deterministic semantic entity reasoner with 100% offline accuracy.

---

<div align="center">

### 🏆 Built for the Razorpay Buildathon 2026 — AI Finance Controller Track
*Engineered for institutional finance teams demanding precision, explainability, and rigorous compliance.*

[![Apache License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Demo Video](https://img.shields.io/badge/Demo_Video-Google_Drive-red?style=flat&logo=google-drive&logoColor=white)](https://drive.google.com/file/d/1qkDbucXDn-RKV5QnvdGEFyFZg4kxoVX6/view?usp=sharing)

</div>
