# Multi-Entity Workspaces & Chart of Accounts Routing

## Overview

Modern corporate finance teams manage multi-entity subsidiary structures, each with distinct commercial bank accounts, currencies, general ledger accounts, and regulatory jurisdictions. Tallybook provides an **Excel-style Multi-Business Workspace Switcher** that completely isolates statements, ledger entries, and audit histories across legal entities while offering executive rollup views.

---

## 1. Multi-Entity Data Architecture

```mermaid
erDiagram
    ENTERPRISE ||--o{ WORKSPACE : contains
    WORKSPACE ||--|| BANK_ACCOUNT : operates
    WORKSPACE ||--|| GENERAL_LEDGER : maintains
    WORKSPACE ||--o{ RECONCILIATION_RUN : executes
    
    BANK_ACCOUNT ||--o{ STATEMENT_LINE : receives
    GENERAL_LEDGER ||--o{ GL_VOUCHER : records
    
    RECONCILIATION_RUN ||--o{ MATCH_RECORD : produces
    RECONCILIATION_RUN ||--o{ EXCEPTION_RECORD : isolates
    RECONCILIATION_RUN ||--o{ AUDIT_LOG : appends

    WORKSPACE {
        string id PK "techcorp | retailflow | healthplus"
        string legal_entity_name
        string industry
        string currency
        string status
    }

    BANK_ACCOUNT {
        string account_id PK
        string institution_name
        string account_number_mask
        decimal statement_closing_balance
    }

    GENERAL_LEDGER {
        string gl_account_code PK "GL-1010, GL-2050, GL-1040"
        string gl_account_name
        decimal book_closing_balance
    }
```

---

## 2. Pre-Configured Demo Workspaces

| Workspace ID | Legal Entity Name | Sector | Bank Account | General Ledger Account | Base Currency | Typical Transaction Volume |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `techcorp` | **TechCorp Solutions Inc.** | Enterprise Software / SaaS | Chase Commercial `#4991` | `GL-1010 Cash & Equivalents` | USD ($) | High volume, subscription receipts, wire payouts |
| `retailflow` | **RetailFlow Brands Ltd.** | E-Commerce / Consumer Retail | HDFC Current `#2280` | `GL-2050 Clearing Account` | USD / INR | High frequency, payment gateway settlement batches |
| `healthplus` | **HealthPlus Systems Inc.** | Healthcare / Medical Diagnostics | SVB Operating `#8812` | `GL-1040 Operating Account` | USD ($) | Material disbursements, insurance claims, strict audit |

---

## 3. Statement-to-Ledger Routing Pipeline

```mermaid
graph TD
    subgraph Ingestion ["Multi-Source Ingestion Feeds"]
        F1["Chase Bank Commercial MT940 / CSV Feed"]
        F2["HDFC Gateway Settlement Batch Feed"]
        F3["SVB Operating ACH / Wire Feed"]
        ERP["ERP General Ledger Vouchers (SAP / NetSuite / Tally)"]
    end

    subgraph WorkspaceRouter ["Tenant Context & Routing Layer"]
        ROUTER{"Workspace Router\n(Active Entity ID)"}
    end

    subgraph TechCorpContext ["TechCorp Solutions (GL-1010)"]
        TC_BANK["Chase #4991 Bank Store"]
        TC_GL["GL-1010 Voucher Store"]
        TC_ENGINE["Isolated Match Engine"]
    end

    subgraph RetailFlowContext ["RetailFlow Brands (GL-2050)"]
        RF_BANK["HDFC #2280 Bank Store"]
        RF_GL["GL-2050 Voucher Store"]
        RF_ENGINE["Isolated Match Engine"]
    end

    subgraph HealthPlusContext ["HealthPlus Systems (GL-1040)"]
        HP_BANK["SVB #8812 Bank Store"]
        HP_GL["GL-1040 Voucher Store"]
        HP_ENGINE["Isolated Match Engine"]
    end

    F1 --> ROUTER
    F2 --> ROUTER
    F3 --> ROUTER
    ERP --> ROUTER

    ROUTER -->|id == 'techcorp'| TC_BANK & TC_GL --> TC_ENGINE
    ROUTER -->|id == 'retailflow'| RF_BANK & RF_GL --> RF_ENGINE
    ROUTER -->|id == 'healthplus'| HP_BANK & HP_GL --> HP_ENGINE
```

---

## 4. UI Workspace Switching Mechanics

When switching between workspaces in the left navigation sidebar:
1. **Context Update**: `WorkspaceContext` immediately sets `activeWorkspace`.
2. **Dynamic Breadcrumb**: The Mac toolbar breadcrumb updates in real time (e.g., `TechCorp · Chase Commercial #4991 → GL-1010`).
3. **KPI & Dataset Re-binding**: Dashboard tiles, Balance Alignment strips, and Analytics recalculate instantaneously without page reloads.
4. **Audit Scope Isolation**: Audit trail logs filter strictly by the selected business entity, preventing cross-subsidiary data contamination during compliance audits.
