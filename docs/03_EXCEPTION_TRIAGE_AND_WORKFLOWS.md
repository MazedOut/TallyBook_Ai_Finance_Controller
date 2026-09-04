# Exception Triage & Accounting Workflows

## Overview

In enterprise finance, an autonomous agent must never force a false match. Genuine discrepancies (unrecorded debits, bank errors, fraudulent charges, or missing invoices) must be categorized honestly and surfaced with actionable remediation advice.

---

## 1. Exception Taxonomy & Categories

```mermaid
pie title Exception Distribution by Root Cause Category
    "Timing Differences / Uncredited Deposits" : 35
    "Unrecorded Bank Charges & Direct Debits" : 25
    "Bank Fee & Wire Deductions" : 20
    "Counterparty Ambiguity & Reference Typos" : 12
    "Potential Duplicate Postings" : 8
```

| Exception Category Code | Accounting Label | Root Cause Explanation | Default Recommended Action |
| :--- | :--- | :--- | :--- |
| `TIMING_DIFFERENCE` | Timing Difference / Uncredited Deposit | Deposit initiated at month-end but credit card/merchant processor batch not settled in bank until next period. | Carry forward to next period as a timing reconciliation item. |
| `UNRECORDED_BANK_CHARGE` | Unrecorded Bank Direct Debit | Bank fee, foreign exchange fee, or automated utility debit that exists on the bank statement without a prior GL voucher. | Create new Accounts Payable / Expense voucher in GL with 1-click. |
| `BANK_FEE_VARIANCE` | Bank Fee / Wire Deduction | Intermediate routing bank deducted correspondent charges from international wire. | Post adjusting entry to Bank Charges Expense (GL-6150). |
| `COUNTERPARTY_AMBIGUITY` | Counterparty Reference Ambiguity | Vendor name heavily abbreviated on statement line (e.g. `SVCS-HQ-TX-99`) with multiple possible internal purchase orders. | Route to Accounts Payable analyst for purchase order confirmation. |
| `DUPLICATE_SUSPICION` | Potential Duplicate Payment | Two identical amounts within a 48-hour window from the same vendor. | Flag for immediate Controller review to prevent duplicate cash loss. |

---

## 2. Exception Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Flagged: Reconcile Batch Run
    Flagged --> InReview: Analyst Opens Queue
    
    InReview --> Approved: Within Threshold (<$10,000)
    InReview --> ControllerQueue: Material Item (>= $10,000)
    
    ControllerQueue --> Approved: Controller 2nd Sign-Off
    ControllerQueue --> Rejected: Controller Reject
    
    InReview --> WriteOff: Bank Fee / Immaterial Variance
    InReview --> Reassigned: Reassign to Correct GL Voucher
    
    Approved --> CommittedToGL: Post Reconciliation Adjustment
    WriteOff --> CommittedToGL: Post to Expense (GL-6150)
    Reassigned --> Flagged: Re-run Validation Pass
    Rejected --> EscalatedToAudit: Audit Review
    
    CommittedToGL --> [*]
    EscalatedToAudit --> [*]
```

---

## 3. Human-in-the-Loop Review Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Senior Finance Analyst
    actor Controller as Corporate Controller
    participant Queue as Exception Queue
    participant Engine as Tallybook Core
    participant Audit as SOX Audit Trail

    Analyst->>Queue: Inspect Open Exceptions (Filter by Category)
    Queue->>Analyst: Display Item: $14,250.00 Unrecorded Wire Debit
    
    alt Under $10,000 (Standard Clearance)
        Analyst->>Queue: Submit Adjustment & Justification
        Queue->>Engine: Commit Clearance
        Engine->>Audit: Append Audit Record (Single Sign-Off)
    else Exceeds $10,000 (Dual Authorization Mandate)
        Analyst->>Queue: Propose GL Adjustment (Pending Controller Approval)
        Queue->>Controller: Route to Approvals Drawer (High-Value Item)
        Controller->>Queue: Review Audit Trail & Bank Statement Advice
        Controller->>Queue: Authorized & Dual Signed
        Queue->>Engine: Final Commitment
        Engine->>Audit: Append Audit Record (Dual Signatures Verified)
    end
```

---

## 4. Remediation Action Definitions

1. **Approve Match (`approve`)**:
   - Manually links the bank statement line to an identified GL voucher, recording the analyst's written justification in the immutable audit trail.
2. **Write-Off Variance (`write_off`)**:
   - Authorizes small balance differences (typically under $50.00) to be cleared directly to the designated variance expense ledger (`GL-6150 Bank Charges & Small Write-Offs`).
3. **Escalate to Controller (`escalate`)**:
   - Flags transactions exceeding $10,000 or suspected fraudulent items into the high-priority Controller queue.
4. **Reassign Voucher (`reassign`)**:
   - Detaches an incorrect ledger candidate and pairs the statement item with the correct voucher number.
