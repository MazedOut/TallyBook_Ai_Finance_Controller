import os
import json
import random
from datetime import datetime, timezone, timedelta
import pandas as pd

def generate_synthetic_dataset(output_dir: str = "./app/data") -> dict:
    os.makedirs(output_dir, exist_ok=True)
    random.seed(42)  # For reproducible ground-truth testing

    base_date = datetime(2026, 2, 1, tzinfo=timezone.utc)
    
    bank_txs = []
    ledger_entries = []
    ground_truth_matches = []
    ground_truth_unresolvables = []
    ground_truth_duplicates = []

    vendor_catalogue = [
        ("Amazon Web Services", "AMZN AWS US-EAST CLOUD", "Cloud Infrastructure"),
        ("Google Workspace", "GOOGLE *GSUITE CALENDAR", "Software Subscription"),
        ("Slack Technologies", "SLK*SLACK DIRECT COMM", "Team Collaboration"),
        ("Salesforce.com Inc", "SFDC CRM CLOUD SUB", "Sales CRM Enterprise"),
        ("Stripe Payouts", "STRIPE TRANSFER REVENUE", "Merchant Settlement"),
        ("Razorpay Settlement", "RAZORPAY DIRECT SETTL", "Payment Gateway Settlement"),
        ("Zoom Video Comm", "ZOOM.US ENTERPRISE VIDEO", "Remote Communications"),
        ("HubSpot Inc", "HUBSPOT INBOUND MKTG", "Marketing Automation"),
        ("Twilio Inc", "TWILIO TELECOM API SMS", "Communications API"),
        ("Datadog Monitoring", "DATADOG INC SYS METRICS", "APM & Infrastructure"),
        ("Figma Design Inc", "FIGMA ENTERPRISE LICENSE", "Product Design Tools"),
        ("GitHub Enterprise", "GITHUB INC DEV REPO", "Developer Tooling"),
        ("Notion Labs Inc", "NOTION LABS WORKSPACE", "Knowledge Management"),
        ("WeWork Management", "WEWORK SHARED DESK NYC", "Office Space Lease"),
        ("Dell Computers Corp", "DELL DIRECT HARDWARE EQ", "Employee Equipment"),
        ("Snowflake Inc", "SNOWFLAKE DATA WAREHOUSE", "Cloud Data Platform"),
        ("Cloudflare Inc", "CLOUDFLARE CDN SECURITY", "Edge Security & CDN"),
        ("Segment.io Inc", "SEGMENT CDP DATA PIPELN", "Customer Data Platform"),
        ("MongoDB Atlas", "MONGODB CLOUD DATABASE", "Distributed Database"),
        ("PagerDuty Inc", "PAGERDUTY INC ONCALL", "Incident Management"),
    ]

    current_bank_id = 1001
    current_ledger_id = 5001

    # =========================================================================
    # 1. 35 Exact Matches (1:1 Match on ref_id, amount, and date)
    # =========================================================================
    for i in range(35):
        vendor, bank_desc, ledger_desc = random.choice(vendor_catalogue)
        ref_id = f"REF-EX-{10000 + i}"
        day_offset = random.randint(0, 24)
        tx_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        amount = round(random.uniform(150.0, 12500.0), 2)
        
        b_id = f"BNK-{current_bank_id}"
        l_id = f"LDG-{current_ledger_id}"
        current_bank_id += 1
        current_ledger_id += 1

        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{bank_desc} - Invoice {10000+i}",
            "ref_id": ref_id,
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} - PO {10000+i}",
            "ref_id": ref_id,
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "EXACT",
            "expected_delta": 0.0,
            "rule": "RULE:REF_EXACT",
            "notes": "Exact match on reference ID, amount, and ledger date"
        })

    # =========================================================================
    # 2. 16 Date-Offset Matches (Settlement Lag T+1 to T+3, amount matches)
    # =========================================================================
    for i in range(16):
        vendor, bank_desc, ledger_desc = random.choice(vendor_catalogue)
        day_offset = random.randint(1, 20)
        lag_days = random.choice([1, 2, 3])
        l_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        b_date = (base_date + timedelta(days=day_offset + lag_days)).strftime("%Y-%m-%d")
        amount = round(random.uniform(300.0, 9500.0), 2)

        b_id = f"BNK-{current_bank_id}"
        l_id = f"LDG-{current_ledger_id}"
        current_bank_id += 1
        current_ledger_id += 1

        bank_txs.append({
            "id": b_id,
            "date": b_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} ACH CLEARING TXN {20000+i}",
            "ref_id": f"ACH-CHASE-{20000+i}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })

        ledger_entries.append({
            "id": l_id,
            "date": l_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} Scheduled AP Disbursement {20000+i}",
            "ref_id": f"SAP-PAY-{20000+i}",
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "DATE_OFFSET",
            "expected_delta": 0.0,
            "rule": "RULE:DATE_OFFSET",
            "notes": f"Settlement lag of {lag_days} days ({l_date} -> {b_date})"
        })

    # =========================================================================
    # 3. 12 Fee-Delta Matches (Bank amount net of $0.75 - $25.00 wire/gateway fees)
    # =========================================================================
    for i in range(12):
        vendor, bank_desc, ledger_desc = random.choice(vendor_catalogue)
        ref_id = f"REF-FEE-{30000 + i}"
        day_offset = random.randint(2, 22)
        tx_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        base_amt = round(random.uniform(400.0, 6500.0), 2)
        fee = random.choice([0.75, 1.50, 2.50, 15.00, 25.00])
        bank_amt = round(base_amt - fee, 2)

        b_id = f"BNK-{current_bank_id}"
        l_id = f"LDG-{current_ledger_id}"
        current_bank_id += 1
        current_ledger_id += 1

        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": bank_amt,
            "currency": "USD",
            "description": f"{bank_desc} WIRE NET OF ${fee:.2f} FEE",
            "ref_id": ref_id,
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": base_amt,
            "currency": "USD",
            "description": f"{vendor} Gross AP Invoice",
            "ref_id": ref_id,
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "FEE_DELTA",
            "expected_delta": fee,
            "rule": "RULE:FEE_DELTA",
            "notes": f"Bank deducted ${fee:.2f} wire or interchange processing fee"
        })

    # =========================================================================
    # 4. 10 Semantic / Vendor Abbreviation Typos (AI Reasoning Engine)
    # =========================================================================
    typo_pairs = [
        ("AMZN AWS US-EAST CLOUD SVCS", "Amazon Web Services Inc Infrastructure", 3420.50),
        ("GGL *GSUITE CALENDAR CORP", "Google LLC Enterprise Workspace Suite", 1850.00),
        ("SLK*SLACK DIRECT COMM", "Slack Technologies Team Subscription", 840.25),
        ("STRIPE TRANSFER REVENUE ACH", "Stripe Inc Merchant Processing Settlements", 14500.00),
        ("MSFT *AZURE CLOUD US", "Microsoft Corporation Azure Enterprise", 6210.80),
        ("DATADOG INC SYS METRICS APM", "Datadog Cloud Observability Platform", 2150.00),
        ("SFDC CRM CLOUD SUB ONLINE", "Salesforce.com Inc Enterprise CRM", 4890.00),
        ("SNOWFLAKE COMPUTING DATA WHS", "Snowflake Inc Cloud Data Platform", 3120.00),
        ("CLOUDFLARE EDGE NETWORK CDN", "Cloudflare Inc Enterprise DDoS Protection", 1400.00),
        ("FIGMA ENTERPRISE DESIGN SEAT", "Figma Design Inc Collaborative Subscriptions", 960.00),
    ]

    for i, (b_desc, l_desc, amt) in enumerate(typo_pairs):
        day_offset = random.randint(3, 23)
        tx_date_bank = (base_date + timedelta(days=day_offset + 1)).strftime("%Y-%m-%d")
        tx_date_ledger = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")

        b_id = f"BNK-{current_bank_id}"
        l_id = f"LDG-{current_ledger_id}"
        current_bank_id += 1
        current_ledger_id += 1

        bank_txs.append({
            "id": b_id,
            "date": tx_date_bank,
            "amount": amt,
            "currency": "USD",
            "description": b_desc,
            "ref_id": f"BNK-DEBIT-{40000+i}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date_ledger,
            "amount": amt,
            "currency": "USD",
            "description": l_desc,
            "ref_id": f"VOUCHER-ERP-{40000+i}",
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "SEMANTIC_FUZZY",
            "expected_delta": 0.0,
            "rule": "AI:REASONING",
            "notes": f"Semantic vendor abbreviation match ({b_desc} <-> {l_desc})"
        })

    # =========================================================================
    # 5. 6 Split Payment Matches (1 Bank Transaction = Sum of 2 Ledger PO Tranches)
    # =========================================================================
    split_configs = [
        ("Amazon Web Services", "AMZN AWS US-EAST CLOUD", 8000.00, 4800.00),
        ("WeWork Management", "WEWORK SHARED DESK NYC", 6000.00, 1500.00),
        ("Salesforce.com Inc", "SFDC CRM CLOUD SUB", 5500.00, 3500.00),
        ("Dell Computers Corp", "DELL DIRECT HARDWARE EQ", 3200.00, 1000.00),
        ("HubSpot Inc", "HUBSPOT INBOUND MKTG", 3500.00, 1500.00),
        ("MongoDB Atlas", "MONGODB CLOUD DATABASE", 2800.00, 1200.00),
    ]

    for i, (vendor, b_desc, amt1, amt2) in enumerate(split_configs):
        day_offset = random.randint(5, 20)
        tx_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        total_bank_amt = round(amt1 + amt2, 2)

        b_id = f"BNK-{current_bank_id}"
        l_id1 = f"LDG-{current_ledger_id}"
        current_ledger_id += 1
        l_id2 = f"LDG-{current_ledger_id}"
        current_ledger_id += 1
        current_bank_id += 1

        ref_base = f"SPLIT-{50000+i}"

        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": total_bank_amt,
            "currency": "USD",
            "description": f"{b_desc} CONSOLIDATED BATCH {ref_base}",
            "ref_id": f"BNK-{ref_base}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })

        ledger_entries.append({
            "id": l_id1,
            "date": tx_date,
            "amount": amt1,
            "currency": "USD",
            "description": f"{vendor} Milestone Tranche A {ref_base}",
            "ref_id": f"LDG-A-{ref_base}",
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ledger_entries.append({
            "id": l_id2,
            "date": tx_date,
            "amount": amt2,
            "currency": "USD",
            "description": f"{vendor} Milestone Tranche B {ref_base}",
            "ref_id": f"LDG-B-{ref_base}",
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id1, l_id2],
            "match_type": "SPLIT_PAYMENT",
            "expected_delta": 0.0,
            "rule": "RULE:SPLIT_PAYMENT",
            "notes": f"Bank payment of ${total_bank_amt:.2f} split into ${amt1:.2f} + ${amt2:.2f}"
        })

    # =========================================================================
    # 6. 6 Duplicates (3 Bank Feed Duplicates, 3 Ledger Double Entries)
    # =========================================================================
    for i in range(3):
        target_tx = bank_txs[i * 5]
        b_dup_id = f"BNK-{current_bank_id}"
        current_bank_id += 1
        dup_tx = dict(target_tx)
        dup_tx["id"] = b_dup_id
        dup_tx["description"] = f"{target_tx['description']} (DUPLICATE POST)"
        dup_tx["ref_id"] = f"{target_tx['ref_id']}-DUP"
        bank_txs.append(dup_tx)

        ground_truth_duplicates.append({
            "id": b_dup_id,
            "duplicate_of": target_tx["id"],
            "source": "bank",
            "category": "duplicate_fee_noise",
            "reason": "Duplicate debit posting in bank feed"
        })

    for i in range(3):
        target_entry = ledger_entries[i * 5]
        l_dup_id = f"LDG-{current_ledger_id}"
        current_ledger_id += 1
        dup_entry = dict(target_entry)
        dup_entry["id"] = l_dup_id
        dup_entry["description"] = f"{target_entry['description']} [ACC-DOUBLE-ENTRY]"
        dup_entry["ref_id"] = f"{target_entry['ref_id']}-DUP"
        ledger_entries.append(dup_entry)

        ground_truth_duplicates.append({
            "id": l_dup_id,
            "duplicate_of": target_entry["id"],
            "source": "ledger",
            "category": "duplicate_fee_noise",
            "reason": "Accidental double-booking in internal ERP ledger"
        })

    # =========================================================================
    # 7. High-Value Variance Exceptions (>= $10,000 requiring Controller Approval)
    # =========================================================================
    high_value_bank = [
        ("MANDIANT CYBER INCIDENT RESPONSE", 15500.00, "Enterprise Security emergency incident retainer missing AP voucher"),
        ("GOLDMAN SACHS M&A ESCROW DEPOSIT", 22400.00, "Treasury M&A escrow transaction unbooked in cash ledger"),
        ("PALO ALTO NETWORKS PRISMA ACCESS SASE", 11200.00, "Annual network security firewall renewal wire unvouched"),
        ("MCKINSEY STRATEGY CONSULTING TRANCHE", 28000.00, "Board-authorized restructuring advisory payment unbooked"),
    ]
    for desc, amt, reason in high_value_bank:
        b_id = f"BNK-{current_bank_id}"
        current_bank_id += 1
        tx_date = (base_date + timedelta(days=random.randint(5, 25))).strftime("%Y-%m-%d")
        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": f"BNK-HIGH-{current_bank_id}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })
        ground_truth_unresolvables.append({
            "id": b_id,
            "source": "bank",
            "amount": amt,
            "date": tx_date,
            "reason": reason,
            "expected_category": "no_counterpart",
            "requires_approval": True
        })

    high_value_ledger = [
        ("ORACLE ERP ANNUAL ENTERPRISE LICENSE", 18750.00, "Scheduled ERP software renewal awaiting bank wire release"),
        ("DELL SERVER CLUSTER HARDWARE CAPITALIZATION", 34950.00, "Capitalized data center compute hardware awaiting invoice clearing"),
        ("SNOWFLAKE ENTERPRISE CAPACITY COMMITMENT", 14600.00, "Prepaid compute consumption voucher awaiting Treasury wire clearing"),
        ("KPMG STATUTORY VALUATION & TRANSFER PRICING", 16800.00, "Statutory tax filing audit fee accrual pending wire disbursement"),
    ]
    for desc, amt, reason in high_value_ledger:
        l_id = f"LDG-{current_ledger_id}"
        current_ledger_id += 1
        tx_date = (base_date + timedelta(days=random.randint(5, 25))).strftime("%Y-%m-%d")
        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": f"LDG-HIGH-{current_ledger_id}",
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })
        ground_truth_unresolvables.append({
            "id": l_id,
            "source": "ledger",
            "amount": amt,
            "date": tx_date,
            "reason": reason,
            "expected_category": "no_counterpart",
            "requires_approval": True
        })

    # =========================================================================
    # 8. Operational & Treasury Unrecorded Bank Charges
    # =========================================================================
    operational_bank_charges = [
        ("CHASE SERVICE CHG WIRE TRANSFER", 35.00, "Unrecorded domestic wire fee"),
        ("INTERNATIONAL SWIFT INCOMING WIRE FEE", 45.00, "Foreign bank intermediary fee"),
        ("MONTHLY COMMERCIAL ACCOUNT MAINTENANCE FEE", 15.00, "Bank treasury account management fee"),
        ("AIRBNB RESERVATION SAN FRANCISCO", 1250.00, "Executive offsite travel missing expense report"),
        ("UNITED AIRLINES TICKET SFO-JFK", 840.00, "Corporate travel ticket missing counterpart receipt"),
        ("UBER FOR BUSINESS ENTERPRISE CORP", 185.50, "Monthly rideshare commute billing unvouched"),
        ("UNKNOWN ACH DEBIT MERCH-9921", 89.99, "Unidentified recurring software subscription"),
        ("FOREIGN EXCHANGE DISCREPANCY REVAL EUR/USD", 412.50, "Unbooked treasury currency revaluation adjustment"),
    ]
    for desc, amt, reason in operational_bank_charges:
        b_id = f"BNK-{current_bank_id}"
        current_bank_id += 1
        tx_date = (base_date + timedelta(days=random.randint(5, 25))).strftime("%Y-%m-%d")
        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": f"BNK-OP-{current_bank_id}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial Banking"
        })
        ground_truth_unresolvables.append({
            "id": b_id,
            "source": "bank",
            "amount": amt,
            "date": tx_date,
            "reason": reason,
            "expected_category": "no_counterpart"
        })

    # =========================================================================
    # 9. Ledger Float, Outstanding Checks & Accounting Accruals
    # =========================================================================
    operational_ledger_entries = [
        ("Accrued Legal Retainer - Cooley LLP", 5000.00, "Accrual entry with no bank cash movement yet"),
        ("Outstanding Vendor Check #99014 - Alpha Supplies", 750.00, "Uncashed vendor check still outstanding at bank cutoff"),
        ("Outstanding Vendor Check #99018 - TechLogistics", 2400.00, "Courier check in transit to payee"),
        ("Internal Intercompany Rebalance Entry GL-1010 to GL-2050", 3200.00, "Internal transfer between non-cash subsidiary accounts"),
        ("Prepaid Software Amortization March 2026", 1650.00, "Non-cash depreciation and amortization journal voucher"),
        ("In-Transit Customer Wire - Acme European Subsidiary", 4100.00, "Cross-border bank wire in clearing transit"),
        ("Accrued Performance Incentive Bonus Pool Q1", 8500.00, "Quarterly payroll bonus accrual awaiting distribution"),
        ("Petty Cash Imprest Fund Replenishment Voucher", 1200.00, "Office cash box replenishment check pending presentation"),
    ]
    for desc, amt, reason in operational_ledger_entries:
        l_id = f"LDG-{current_ledger_id}"
        current_ledger_id += 1
        tx_date = (base_date + timedelta(days=random.randint(5, 25))).strftime("%Y-%m-%d")
        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": f"LDG-OP-{current_ledger_id}",
            "account_id": "ACC-GL-1010",
            "entity": "TechCorp Global Inc",
            "gl_account": "1010-Operating-Cash"
        })
        ground_truth_unresolvables.append({
            "id": l_id,
            "source": "ledger",
            "amount": amt,
            "date": tx_date,
            "reason": reason,
            "expected_category": "no_counterpart"
        })

    # =========================================================================
    # 10. Ambiguous Candidate Scenarios (Multiple Identical Amounts on Same Day)
    # =========================================================================
    ambig_date = (base_date + timedelta(days=12)).strftime("%Y-%m-%d")
    ambig_amt = 1450.00

    b_ambig_1 = f"BNK-{current_bank_id}"
    current_bank_id += 1
    bank_txs.append({
        "id": b_ambig_1,
        "date": ambig_date,
        "amount": ambig_amt,
        "currency": "USD",
        "description": "ACH DEBIT CONSULTING SERVICES TRANCHE 1",
        "ref_id": f"BNK-AMBIG-1",
        "account_id": "ACC-BANK-CHASE-01",
        "raw_source": "Chase Commercial Banking"
    })

    b_ambig_2 = f"BNK-{current_bank_id}"
    current_bank_id += 1
    bank_txs.append({
        "id": b_ambig_2,
        "date": ambig_date,
        "amount": ambig_amt,
        "currency": "USD",
        "description": "ACH DEBIT CONSULTING SERVICES TRANCHE 2",
        "ref_id": f"BNK-AMBIG-2",
        "account_id": "ACC-BANK-CHASE-01",
        "raw_source": "Chase Commercial Banking"
    })

    l_ambig_1 = f"LDG-{current_ledger_id}"
    current_ledger_id += 1
    ledger_entries.append({
        "id": l_ambig_1,
        "date": ambig_date,
        "amount": ambig_amt,
        "currency": "USD",
        "description": "Vendor Consulting Advisory PO-8801 - Alpha Group",
        "ref_id": "PO-8801-AMBIG",
        "account_id": "ACC-GL-1010",
        "entity": "TechCorp Global Inc",
        "gl_account": "1010-Operating-Cash"
    })

    l_ambig_2 = f"LDG-{current_ledger_id}"
    current_ledger_id += 1
    ledger_entries.append({
        "id": l_ambig_2,
        "date": ambig_date,
        "amount": ambig_amt,
        "currency": "USD",
        "description": "Vendor Consulting Advisory PO-8802 - Beta Group",
        "ref_id": "PO-8802-AMBIG",
        "account_id": "ACC-GL-1010",
        "entity": "TechCorp Global Inc",
        "gl_account": "1010-Operating-Cash"
    })

    ground_truth_matches.append({
        "bank_id": b_ambig_1,
        "ledger_ids": [l_ambig_1],
        "match_type": "AMBIGUOUS",
        "expected_delta": 0.0,
        "rule": "AI:DISAMBIGUATION",
        "notes": "Disambiguated between two identical $1,450.00 candidate disbursements"
    })

    ground_truth_matches.append({
        "bank_id": b_ambig_2,
        "ledger_ids": [l_ambig_2],
        "match_type": "AMBIGUOUS",
        "expected_delta": 0.0,
        "rule": "AI:DISAMBIGUATION",
        "notes": "Disambiguated between two identical $1,450.00 candidate disbursements"
    })

    # =========================================================================
    # 11. Partial Milestone Tranche (50% Progress Payment)
    # =========================================================================
    partial_date = (base_date + timedelta(days=18)).strftime("%Y-%m-%d")
    b_part_id = f"BNK-{current_bank_id}"
    current_bank_id += 1
    bank_txs.append({
        "id": b_part_id,
        "date": partial_date,
        "amount": 2500.00,
        "currency": "USD",
        "description": "CONTRACTOR PROGRESS PAYMENT 50% WIRE",
        "ref_id": "BNK-PART-50",
        "account_id": "ACC-BANK-CHASE-01",
        "raw_source": "Chase Commercial Banking"
    })

    l_part_id = f"LDG-{current_ledger_id}"
    current_ledger_id += 1
    ledger_entries.append({
        "id": l_part_id,
        "date": partial_date,
        "amount": 5000.00,
        "currency": "USD",
        "description": "Contractor Full Milestone PO - $5000 Gross",
        "ref_id": "LDG-PART-FULL",
        "account_id": "ACC-GL-1010",
        "entity": "TechCorp Global Inc",
        "gl_account": "1010-Operating-Cash"
    })

    ground_truth_unresolvables.append({
        "id": b_part_id,
        "source": "bank",
        "amount": 2500.00,
        "date": partial_date,
        "reason": "50% partial progress payment against $5,000 PO",
        "expected_category": "split_payment_partial"
    })

    # Save to CSV and JSON
    df_bank = pd.DataFrame(bank_txs)
    df_ledger = pd.DataFrame(ledger_entries)

    bank_csv_path = os.path.join(output_dir, "bank_transactions.csv")
    ledger_csv_path = os.path.join(output_dir, "ledger_entries.csv")
    gt_json_path = os.path.join(output_dir, "ground_truth_mapping.json")

    df_bank.to_csv(bank_csv_path, index=False)
    df_ledger.to_csv(ledger_csv_path, index=False)

    metadata = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_bank_records": len(bank_txs),
        "total_ledger_records": len(ledger_entries),
        "ground_truth_matches_count": len(ground_truth_matches),
        "ground_truth_unresolvables_count": len(ground_truth_unresolvables),
        "ground_truth_duplicates_count": len(ground_truth_duplicates),
        "matches": ground_truth_matches,
        "unresolvables": ground_truth_unresolvables,
        "duplicates": ground_truth_duplicates
    }

    with open(gt_json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return {
        "bank_csv": bank_csv_path,
        "ledger_csv": ledger_csv_path,
        "ground_truth_json": gt_json_path,
        "bank_count": len(bank_txs),
        "ledger_count": len(ledger_entries),
        "matches_count": len(ground_truth_matches),
        "unresolvables_count": len(ground_truth_unresolvables),
        "duplicates_count": len(ground_truth_duplicates),
    }

if __name__ == "__main__":
    res = generate_synthetic_dataset("./app/data")
    print("Comprehensive enterprise dataset generated:", res)
