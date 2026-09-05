# AI Usage & Development Log — TallyBook
### Razor Buildathon — AI Finance Controller Track

> 🎬 **Video Demonstration**: [https://drive.google.com/file/d/1qkDbucXDn-RKV5QnvdGEFyFZg4kxoVX6/view?usp=sharing](https://drive.google.com/file/d/1qkDbucXDn-RKV5QnvdGEFyFZg4kxoVX6/view?usp=sharing)

This document explains which AI tools were used at each stage of building this project, why each was chosen for that specific stage, what problems came up, and how they were resolved. It is meant both as submission documentation and as a reference for Antigravity to align any remaining fixes/polish against.

---

## 1. Project Summary

Built a **multi-source reconciliation agent** for the AI Finance Controller track — matching a bank transactions feed against internal ledger entries using a **rules engine + AI reasoning hybrid**, reporting match rate, precision/recall against generated ground truth, and a categorized, honest exception list. The product is a fully functional web app with role-based access (Analyst, Controller, Auditor, Admin), an audit trail, approval workflows, and a statistics dashboard — not just a matching script.

Core design principle followed throughout: **AI should only do what deterministic logic structurally cannot** — semantic/fuzzy matching, tie-breaking ambiguous candidates, and writing human-readable justifications. Everything else (exact matches, tolerance checks, thresholds) is handled by explicit rules. This was a deliberate choice to avoid "AI-washing" a feature that didn't need AI.

---

## 2. AI Tool Usage Map

| Stage | Tool | Purpose | Why this tool specifically |
|---|---|---|---|
| Ideation & scoping | **Claude** | Brainstorming track direction, breaking down the problem statement, deciding on "multi-source reconciliation" as the specific loop, defining what counts as meaningful vs decorative AI use | Needed sustained reasoning through ambiguous tradeoffs — not a single answer, but a back-and-forth to pressure-test each direction before committing |
| Intent translation | **GPT** | Converting vague, half-formed ideas into precise, structured prompts before handing them to a build agent | The actual bottleneck early on wasn't *what* to build, it was *expressing* it clearly enough for a coding agent to act on without misinterpreting scope. GPT served specifically as a translator between rough intent and buildable instruction |
| Market/problem research | **Gemini** | Researching how reconciliation, settlement, and finance-ops workflows are actually handled today, and what pain points exist in real teams (manual matching, exception backlogs, audit requirements) | Needed live, external information — not something reasoning alone could produce. This directly shaped features that weren't in the original brief: approval thresholds, audit trail, period-close workflow |
| Backend architecture | **Claude** | Designing the rules-engine-plus-AI hybrid pipeline, the data model (transactions, ledger_entries, matches, exceptions, rules, audit_log, users, periods, runs), and the confidence-threshold logic | Needed architectural reasoning that stays consistent across a multi-stage pipeline, and had to be revisited multiple times as scope grew |
| Frontend implementation | **Gemini** | Building out frontend views against the design system tokens | Split cleanly from backend work; used for translating design tokens into working component code |
| Design system extraction | **Design-specific AI (token/MD generator)** | Converting a visual reference into a strict, machine-readable design spec — colors, radius scale, typography, shadows, component definitions | Needed a single source of truth so every tool touching the frontend (Gemini, Antigravity) pulled from identical constraints instead of drifting stylistically between sessions |
| Final orchestration & build | **Antigravity (Gemini-based)** | Actually implementing, wiring together, and integrating every component — data layer, rules engine, AI reasoning calls, role-based routing, statistics dashboard, motion/animation pass | The only tool in the stack capable of executing code across the full stack end-to-end rather than just advising on it; used to assemble everything the earlier stages had planned/designed |
| AI reasoning layer (in-product) | **Groq (Llama 3.3 70B)** | Powers the actual reconciliation agent's fuzzy-matching and justification-writing at runtime | Free tier, fast inference — important since the batch (50+ records) needed to process live during a demo without an awkward wait. Forced structured JSON output so confidence/reasoning fields parse reliably |
| Security | **HackerGPT** | Ran automated vulnerability scans against the finished product | Specialized security tool, chosen deliberately over the general-purpose build agent — a task like this needs a tool built for it, not a generalist |

---

## 3. Problems Faced & How They Were Solved

### 3.1 Vague intent → couldn't translate to a working spec
**Problem:** Early on, I knew roughly what I wanted but struggled to phrase it precisely enough for a build agent to act on without misinterpreting scope or missing intent.
**Solution:** Used GPT as an intent-clarification layer — describe the rough idea, GPT restates it as a structured, unambiguous prompt, which then feeds into Claude or Antigravity. This removed the single biggest early bottleneck.

### 3.2 Risk of building a demo that doesn't generalize
**Problem:** The brief explicitly warns against "one cherry-picked match" — an easy trap in a hackathon timeframe is to hand-pick a few clean examples that always work.
**Solution:** Generated synthetic data myself with a known ground-truth mapping (50+ records, deliberately including exact matches, date-offset matches, fee-delta patterns, typos, duplicates, split payments, and a genuinely unresolvable ~10-15% tail). Match rate, precision, recall, and F1 are all computed against this ground truth, not asserted.

### 3.3 AI feature risked being decorative rather than necessary
**Problem:** Given the track name and problem statement both foreground "AI," there was real risk of bolting AI onto a part of the pipeline that didn't actually need it — just to look the part.
**Solution:** Explicitly split the pipeline: a rules engine (deterministic, ~8-12 rules) handles exact/tolerance matches; AI is invoked only where rules structurally cannot resolve a match — semantic description matching, ranking close/ambiguous candidates, and writing the natural-language justification for each decision. The system logs which engine (rule vs AI) resolved every single record, and this split is surfaced in the UI so it's auditable, not just claimed.

### 3.4 Agent execution failures during the build
**Problem:** Antigravity's implementation-plan execution failed (agent execution terminated) when handed the full, multi-phase feature set in a single prompt — the scope was too large to plan reliably in one shot.
**Solution:** Split the build into sequential phases instead of one massive request: (1) data model + synthetic data generator + rules engine + AI reasoning layer + scoring, (2) backend/API + role middleware, (3) frontend + design system + motion, (4) remaining extra features. Each phase was handed off only once the previous one was working, which resolved the execution failures and also made debugging far easier.

### 3.5 Visual consistency across multiple AI tools/sessions
**Problem:** Using different tools for frontend (Gemini) and orchestration (Antigravity) risked stylistic drift — different radius values, spacing, or color choices creeping in between sessions.
**Solution:** Extracted a strict design token system up front (exact color hex values, a two-value radius scale — 18px interactive, 24px containers — typography scale, shadow definitions) into a shared reference file, and required every tool touching UI to build against those exact tokens rather than improvising.

### 3.6 Making an accuracy claim judges could actually trust
**Problem:** "Measured accuracy" is easy to assert and hard to prove in a short demo.
**Solution:** Built a dedicated view showing the agent's own claimed average confidence side-by-side with the actual verified accuracy (computed against ground truth), including a visible count of any false matches. Admitting where the agent was wrong, live, is more convincing than presenting a suspiciously perfect number.

### 3.7 Security vulnerabilities in the data layer
**Problem:** Running automated scans (HackerGPT) against the finished product surfaced real vulnerabilities: cross-site scripting (XSS) risks and SQL injection points in the SQLite data layer — a serious concern given the product handles financial records and has role-gated approval/audit workflows.
**Solution:** Fixed both classes of issue — moved to parameterized queries to close the injection paths, and added output sanitization/escaping to close the XSS vectors. Re-ran the scan after the fixes to confirm they held before final submission, and manually checked other query sites in the codebase for the same pattern rather than only fixing the specific spot that was flagged.

### 3.8 Real-world workflow gaps not covered by the original brief
**Problem:** The problem statement covers matching and exceptions, but real finance-ops teams also need sign-off chains, historical accountability, and a way to formally "close the books" — none of which is mentioned in the brief but all of which came up during market research.
**Solution:** Added an approval workflow (exceptions above a configurable dollar threshold require Controller sign-off), an immutable audit trail (every match, override, and approval logged with actor and timestamp), and a period-close/lock action that freezes a batch and generates a summary — all informed directly by the Gemini research phase into how this is handled manually today.

---

## 4. Security Summary

- **Tool used:** HackerGPT (automated vulnerability scanning)
- **Findings:** Cross-site scripting (XSS) vulnerabilities; SQL injection points in the SQLite data access layer
- **Fixes applied:** Parameterized queries throughout the data layer (not just at the flagged location — audited for the same pattern elsewhere); input sanitization and output escaping for all user-supplied text rendered in the UI
- **Verification:** Re-scanned after remediation; no further findings of the same class
- **Why this mattered specifically for this product:** The system is built around trust in an audit trail and role-gated approvals (Analyst/Controller/Auditor/Admin). A security gap in the data layer doesn't just risk data exposure — it undermines the entire premise that the audit trail and approval chain can be trusted, which is the core value proposition of a finance-ops tool.

---
