# Operations Guide & User Personas Runbook

## Overview

Tallybook is architected around four distinct finance operating personas. Each persona has tailored permissions, distinct navigational views, and specialized actions that uphold internal accounting segregation of duties.

---

## 1. Role-Based Access Control (RBAC) Matrix

```mermaid
graph TD
    subgraph Personas ["Operating Personas"]
        ANALYST["Sarah\n(Senior Finance Analyst)"]
        CONTROLLER["Marcus\n(Corporate Controller)"]
        AUDITOR["Elena\n(Deloitte Statutory Auditor)"]
        ADMIN["Alex\n(Finance Systems Admin)"]
    end

    subgraph Permissions ["Permissions & Workflows"]
        P_RUN["Execute Batch Reconciliation"]
        P_REVIEW["Review & Investigate Exceptions"]
        P_APPROVE_LOW["Approve Adjustments < $10,000"]
        P_APPROVE_HIGH["Dual-Sign Material Items >= $10,000"]
        P_POLICY["Configure Rules & Tolerances"]
        P_PERIOD["Freeze & Certify Period"]
        P_FORENSIC["Verify Hash Chain & Audit Log"]
        P_RESEED["Re-Seed Synthetic Demo Data"]
    end

    ANALYST --> P_RUN
    ANALYST --> P_REVIEW
    ANALYST --> P_APPROVE_LOW

    CONTROLLER --> P_RUN
    CONTROLLER --> P_REVIEW
    CONTROLLER --> P_APPROVE_LOW
    CONTROLLER --> P_APPROVE_HIGH
    CONTROLLER --> P_PERIOD
    CONTROLLER --> P_FORENSIC

    AUDITOR --> P_FORENSIC
    AUDITOR -.->|Read-Only Review| P_REVIEW

    ADMIN --> P_POLICY
    ADMIN --> P_RESEED
```

| Operating Persona | Username / Password | Primary Daily Responsibilities | Allowed Actions | Restricted Actions |
| :--- | :--- | :--- | :--- | :--- |
| **Finance Analyst** | `analyst` / `analyst123` | Daily batch clearing, investigating unmatched statement lines, gathering counterparty invoice advice. | Run batch, propose overrides, approve small variances (<$10k). | Cannot freeze accounting periods; cannot sign off material items (≥$10k). |
| **Corporate Controller** | `controller` / `controller123` | Balance alignment oversight, high-value authorization, period close certification. | Full operational approval, dual sign-off, period lock, policy enforcement. | Cannot modify historical logs after period lock. |
| **Statutory Auditor** | `auditor` / `auditor123` | Independent SOX compliance audit, hash chain validation, workpaper verification. | Read-only forensic inspection, hash chain verify, export certified PDF audit packages. | Cannot create, modify, or delete financial records. |
| **Systems Admin** | `admin` / `admin123` | Platform health, multi-entity setup, rule parameter configuration, dataset reseeding. | Tune rule parameters, manage thresholds, re-seed demo benchmarks. | Segregated from day-to-day transaction approvals. |

---

## 2. Standard Month-End Closing Runbook

```mermaid
flowchart TD
    D1["Day -2: Statement Ingestion\nBank statement feeds ingested into active workspace"] --> D2["Day -1: Autonomous Batch Execution\nEngine clears Tier 1 and Tier 2 exact/tolerance matches"]
    D2 --> D3["Day 0: Analyst Exception Review\nSarah reviews open variances & categorizes discrepancies"]
    D3 --> D4{Any Variances >= $10,000?}
    
    D4 -->|Yes| D5["Controller Dual Sign-Off\nMarcus reviews supporting documents in Approvals queue"]
    D4 -->|No| D6["Post Standard GL Adjustments\nWrite off bank fees < $15 to GL-6150"]
    D5 --> D6
    
    D6 --> D7["Final Variance Check\nVerify Balance Alignment shows Zero Unreconciled Variance"]
    D7 --> D8["Controller Period Freeze\nMarcus enters final attestation statement & freezes period"]
    D8 --> D9["Auditor Review & Export\nElena verifies cryptographic SHA-256 hash & exports PDF schedules"]
```

---

## 3. Step-by-Step Operator Instructions

### How to Reconcile a New Financial Batch
1. Log in as **Analyst** or **Controller**.
2. Select your target subsidiary from the **Workspace Switcher** in the sidebar (e.g., *TechCorp Solutions*).
3. Click the **Run Reconcile** button in the top window toolbar (or press `⌘R`).
4. Watch the progress indicator as Tier 1, Tier 2, and Tier 3 rules execute across all statement items.
5. Review the updated **Balance Alignment** card on the Overview dashboard to confirm cleared volume.

### How to Resolve an Open Exception
1. Navigate to **Reconciliation** in the sidebar and switch to the **Exceptions** tab.
2. Select an exception card (e.g., *Unrecorded Wire Fee*).
3. Review the AI explainability trace, confidence score, and candidate ledger entries.
4. Choose an action:
   - Click **Approve** if matching to an identified ledger voucher.
   - Click **Write-Off** to allocate to bank charges (`GL-6150`).
   - Click **Escalate** if the item requires investigation by the corporate controller.
5. Enter your audit justification note and click **Confirm**.

### How to Perform Period Close & Statutory Certification
1. Ensure all open exceptions for the current period have been resolved or authorized.
2. Navigate to **Period Close** under the Governance navigation group.
3. Verify that the **Integrity Score** reads `100/100` and **Hash Chain** shows `Verified`.
4. Enter your certification attestation statement (e.g., *"Audited and certified by Corporate Controller"*).
5. Click **Certify & Freeze Period**. The period becomes immutable and locked.
6. Click **Export Audit Package (PDF)** to download the certified statutory workpapers.
