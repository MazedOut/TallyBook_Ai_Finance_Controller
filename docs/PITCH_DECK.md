# TallyBook — Pitch Deck
### AI Finance Controller — Razor Buildathon

> 🎬 **Interactive Product Demo Video**:  
> **[Watch 1080p Walkthrough on Google Drive](https://drive.google.com/file/d/1qkDbucXDn-RKV5QnvdGEFyFZg4kxoVX6/view?usp=sharing)**

---

## Slide 1 — Title
**TallyBook**  
Run the books. Trust the exceptions.  
*An AI + rules hybrid reconciliation agent that closes the finance-ops loop — and shows its work.*

---

## Slide 2 — The Problem
- Reconciliation — matching bank transactions against ledgers/invoices — is still done manually across most businesses, especially small ones.
- Even where payments and GST are already digitized, reconciliation remains a top-3 named accounting pain point for Indian SMEs.
- Existing tools either don't reach this segment, or force-match everything to look clean — hiding the exceptions that actually matter.

---

## Slide 3 — Why Now
- The 2026 consensus: **verification capacity, not generation speed, is the bottleneck.** AI can already generate answers; the unsolved problem is checking whether they're right.
- The reconciliation software market itself is shifting toward AI-assisted, continuous matching instead of manual month-end crunches.
- MSMEs — the largest underserved segment — have already proven fast adoption of digital financial tools (UPI, WhatsApp Business, basic accounting software). The receptivity exists; the tool doesn't, yet.

*(Full data and sourcing: see `MARKET_RESEARCH.md`)*

---

## Slide 4 — The Solution: TallyBook
A reconciliation agent that:
- Runs deterministic rules first (fast, auditable, free) for the ~80% of records that don't need judgment
- Uses AI only where rules structurally can't resolve a match — fuzzy description matching, ranking ambiguous candidates, writing plain-language justifications
- Reports a **match rate it can actually prove**, scored against ground truth — not asserted
- Surfaces every exception it couldn't resolve, categorized and explained, instead of hiding uncertainty

---

## Slide 5 — How It Works (Pipeline)
1. Ingest bank transactions + ledger entries
2. Deterministic rules pass — exact/tolerance matches cleared instantly
3. Candidate generation for the rest — narrows, doesn't decide
4. AI reasoning pass — picks best candidate, assigns confidence, writes justification
5. Threshold check — below-confidence cases become exceptions, never forced matches
6. Exception triage — clustered into categories with a suggested next action
7. Scoring — claimed confidence vs. ground-truth-verified accuracy, shown side by side

---

## Slide 6 — Proof, Not a Cherry-Picked Demo
- Runs on a full **101-record production-grade synthetic batch** (87 accepted matches, 10 flagged exceptions with fee/lag deltas, 4 manual supervisor overrides), not a hand-picked few
- Precision, recall, and F1 computed against known ground truth
- Deliberately includes an unresolvable ~10-15% tail — an honest exception list, not a suspiciously perfect one
- Every record shows which engine resolved it (rule vs AI) — fully auditable

---

## Slide 7 — Product Depth (It's a Real App, Not a Script)
- Role-based access: **Analyst, Controller, Auditor, Admin** — functionally distinct, not just permission tiers
- **4 Dynamic Display Themes**: Light Corporate, Obsidian Dark Terminal, Cyber Neon, and Warm Ivory Editorial
- **Multilingual AI Assistant**: Executive financial briefings across **8 native languages** (EN, ES, FR, DE, JA, ZH, PT, HI) with speech synthesis
- Immutable audit trail on every match, override, and approval
- Threshold-based approval workflow for high-value exceptions
- Period close/lock with generated summary
- Statistics dashboard: match rate trend, precision/recall, confidence calibration, rule vs AI contribution split
- Security-hardened: scanned with HackerGPT, XSS and SQL injection issues found and fixed, re-verified post-fix

---

## Slide 8 — Market Opportunity
- Global reconciliation software market: ~$2.8–3.3B (2025–26), growing at 15–18% CAGR toward $6–8B+ by 2030
- India: 63.4M+ MSMEs contributing ~30% of GDP, but only 29% currently use any accounting software
- Reconciliation is a named top-3 pain point even after GST/payments digitization
- Enterprise/mid-market already served by Oracle, SAP, Trintech, Xero — the MSME tier is not

*(Full data and sourcing: see `MARKET_RESEARCH.md`)*

---

## Slide 9 — Go-To-Market
- **Land:** regional MSME beachhead, founder-led adoption, low-friction onboarding
- **Expand:** grow within the region via MSME networks, trade associations, and referrals — not paid acquisition
- **Move upmarket:** CA and audit firms adopt TallyBook to manage reconciliation across their entire client book at once
- **Sustain:** social media, WhatsApp Business (97% MSME usage), and content marketing running throughout

*(Full strategy and rationale: see `GO_TO_MARKET.md`)*

---

## Slide 10 — What's Next
- Expand rule library and multi-currency support
- Live bank/ledger integrations (beyond CSV batch upload)
- Deeper CA/audit-firm multi-entity tooling
- Continuous (real-time) reconciliation, not just batch runs

---

## Slide 11 — Built With
- Rules engine + AI reasoning hybrid (AI provider abstracted from user-facing product)
- Full-stack web app: role-based access, audit trail, approval workflow, statistics dashboard
- Security-audited before submission
- See `AI_USAGE_AND_DEVELOPMENT_LOG.md` for the full build process and tooling breakdown
