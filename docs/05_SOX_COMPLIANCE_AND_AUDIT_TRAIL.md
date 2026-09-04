# SOX Compliance, Cryptographic Audit Trail & Period Certification

## Overview

Sarbanes-Oxley (SOX) Section 404 and global statutory accounting standards require complete evidentiary certainty over all internal financial controls and general ledger balances. Tallybook enforces an **append-only immutable audit trail with SHA-256 cryptographic hash chaining** and dual-authorization approval workflows.

---

## 1. Cryptographic Hash-Chained Audit Model

Every transaction clearance, manual override, exception write-off, and policy adjustment generates an immutable audit record. Each record computes a cryptographically linked SHA-256 digest referencing the hash of the preceding event, creating a tamper-evident audit ledger.

```mermaid
graph LR
    subgraph EventN1 ["Audit Event N-1"]
        E1["Action: MATCH_ACCEPT\nActor: Sarah (Analyst)\nEntity: TX-4091\nTimestamp: 2026-02-28 10:14:22 UTC\nPrevHash: a8f9...4c21\nHash: 7b3e...99fa"]
    end

    subgraph EventN ["Audit Event N"]
        E2["Action: EXCEPTION_WRITE_OFF\nActor: Marcus (Controller)\nEntity: EXC-108\nAmount: $12.50\nPrevHash: 7b3e...99fa\nHash: 41dc...e3a0"]
    end

    subgraph EventNPlus1 ["Audit Event N+1"]
        E3["Action: PERIOD_FREEZE\nActor: Marcus (Controller)\nEntity: PERIOD-2026-02\nCert: Certified by Controller\nPrevHash: 41dc...e3a0\nHash: f98a...221b"]
    end

    EventN1 -->|SHA-256 Link| EventN -->|SHA-256 Link| EventNPlus1
```

### Forensic Hash Verification Formula:
$$
H_n = \text{SHA256}\left(H_{n-1} \parallel \text{Timestamp} \parallel \text{ActorRole} \parallel \text{Action} \parallel \text{EntityId} \parallel \text{StateDelta}\right)
$$
If any historical record is modified or deleted in the datastore, the hash chain breaks immediately, alerting the Statutory Auditor in the Audit Trail Health Index (`Hash Chain: Tampered (Compromised)`).

---

## 2. Four-Eye Dual Authorization Principle

For material transactions exceeding corporate risk cutoffs (default: **$10,000.00 USD**):

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Senior Finance Analyst
    actor Controller as Corporate Controller
    participant Core as Tallybook Engine
    participant Log as Append-Only Audit Log

    Note over Analyst,Controller: Dual-Control Sign-Off Requirement (SOX 404)
    Analyst->>Core: Propose Write-Off / Match for $42,500.00 Variance
    Core->>Core: Detect Amount >= $10,000.00 Policy Threshold
    Core->>Core: Set Status: PENDING_CONTROLLER_AUTHORIZATION
    Core->>Log: Append Event: PROPOSED_BY_ANALYST (1st Signature)
    
    Controller->>Core: Open Approvals Drawer (Controller Sign-Off)
    Controller->>Core: Verify Supporting Bank Advice & Voucher
    Controller->>Core: Authorize & Commit
    Core->>Log: Append Event: DUAL_SIGN_OFF_CERTIFIED (2nd Signature)
    Core->>Core: Transition Voucher to Cleared
```

---

## 3. Period Close, Freeze & Certification Lifecycle

At the end of each accounting cycle (monthly or quarterly), the Corporate Controller executes the statutory period freeze:

```mermaid
flowchart TD
    A[Open Accounting Period: Transactions Ingested & Cleared] --> B[Run Final Batch Reconciliation Engine]
    B --> C{Unreconciled Variance > Tolerance?}
    
    C -->|Yes| D[Review Open Exceptions Queue\nApprove or Post Adjustments]
    D --> B
    
    C -->|No: Balanced| E[Generate Preliminary Balance Alignment Schedules]
    E --> F[Controller Digital Sign-Off & Attestation]
    F --> G[PERIOD FREEZE: Append-Only Lock Engaged]
    
    subgraph LockState ["Locked Period State"]
        G --> H["Read-Only Ledger Enforcement\n(No further insertions, edits, or overrides allowed)"]
        G --> I["Immutable SOX Audit Package Generated"]
        G --> J["Direct Export: PDF Workpapers & CSV Schedules"]
    end
```

---

## 4. Auditor Capabilities (Elena - Deloitte Statutory Auditor)

Auditors have independent read-only credentials with exclusive governance tools:
1. **Cryptographic Verification**: 1-click verification of the entire SHA-256 hash sequence across all batches.
2. **Interactive Forensic Event Inspector**: Click any historical event in the timeline to view the exact before-and-after voucher state JSON diff.
3. **Statutory Export Packages**: One-click download of the complete audit log, reconciliation report, and certification statement for regulatory submission.
