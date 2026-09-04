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

    # 1. 30 Exact Matches (Identical ref_id, amount, date)
    for i in range(30):
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
            "raw_source": "Chase Commercial"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} - PO {10000+i}",
            "ref_id": ref_id,
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "EXACT",
            "expected_delta": 0.0,
            "rule": "RULE:REF_EXACT",
            "notes": "Exact match on ref_id, amount, and date"
        })

    # 2. 15 Date-Offset Matches (T+1 to T+3 settlement lag, amount matches, different/no ref_id so REF_EXACT does not fire)
    for i in range(15):
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

        # Use disparate ref formats to ensure DATE_OFFSET fires
        bank_txs.append({
            "id": b_id,
            "date": b_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} ACH CLEARING TXN {20000+i}",
            "ref_id": f"ACH-CHASE-{20000+i}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial"
        })

        ledger_entries.append({
            "id": l_id,
            "date": l_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} Scheduled AP Disbursement {20000+i}",
            "ref_id": f"SAP-PAY-{20000+i}",
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
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

    # 3. 8 Fee-Delta Matches (Amount differs by <= $2.50 wire fee or foreign exchange rounding)
    for i in range(8):
        vendor, bank_desc, ledger_desc = random.choice(vendor_catalogue)
        ref_id = f"REF-FEE-{30000 + i}"
        day_offset = random.randint(2, 22)
        tx_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        base_amt = round(random.uniform(400.0, 4500.0), 2)
        fee = random.choice([0.75, 1.25, 1.50, 2.00, 2.50])
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
            "description": f"{bank_desc} WIRE NET OF ${fee} FEE",
            "ref_id": ref_id,
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": base_amt,
            "currency": "USD",
            "description": f"{vendor} Gross AP Invoice",
            "ref_id": ref_id,
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "FEE_DELTA",
            "expected_delta": round(base_amt - bank_amt, 2),
            "rule": "RULE:FEE_DELTA",
            "notes": f"Bank deducted ${fee} wire/service fee"
        })

    # 4. 6 Semantic / Vendor Abbreviation Typos (No exact ref_id, different descriptions, identical amounts)
    typo_pairs = [
        ("AMZN AWS US-EAST CLOUD SVCS", "Amazon Web Services Inc Infrastructure", 3420.50),
        ("GGL *GSUITE CALENDAR CORP", "Google LLC Enterprise Workspace Suite", 1850.00),
        ("SLK*SLACK DIRECT COMM", "Slack Technologies Team Subscription", 840.25),
        ("STRIPE TRANSFER REVENUE ACH", "Stripe Inc Merchant Processing Settlements", 14500.00),
        ("MSFT *AZURE CLOUD US", "Microsoft Corporation Azure Enterprise", 6210.80),
        ("DATADOG INC SYS METRICS APM", "Datadog Cloud Observability Platform", 2150.00),
    ]

    for i, (b_desc, l_desc, amt) in enumerate(typo_pairs):
        day_offset = random.randint(3, 23)
        # 1-day variance or identical date
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
            "raw_source": "Chase Commercial"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date_ledger,
            "amount": amt,
            "currency": "USD",
            "description": l_desc,
            "ref_id": f"VOUCHER-ERP-{40000+i}",
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
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

    # 5. 4 Split Payment Matches (1 bank transaction = 2 ledger entries)
    for i in range(4):
        vendor, bank_desc, ledger_desc = random.choice(vendor_catalogue)
        day_offset = random.randint(5, 20)
        tx_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        amt_part1 = round(random.uniform(500.0, 2000.0), 2)
        amt_part2 = round(random.uniform(500.0, 2000.0), 2)
        total_bank_amt = round(amt_part1 + amt_part2, 2)

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
            "description": f"{bank_desc} CONSOLIDATED {ref_base}",
            "ref_id": f"BNK-{ref_base}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial"
        })

        ledger_entries.append({
            "id": l_id1,
            "date": tx_date,
            "amount": amt_part1,
            "currency": "USD",
            "description": f"{vendor} Milestone Tranche A {ref_base}",
            "ref_id": f"LDG-A-{ref_base}",
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ledger_entries.append({
            "id": l_id2,
            "date": tx_date,
            "amount": amt_part2,
            "currency": "USD",
            "description": f"{vendor} Milestone Tranche B {ref_base}",
            "ref_id": f"LDG-B-{ref_base}",
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id1, l_id2],
            "match_type": "SPLIT_PAYMENT",
            "expected_delta": 0.0,
            "rule": "RULE:SPLIT_PAYMENT",
            "notes": f"Bank payment of ${total_bank_amt} split into ${amt_part1} + ${amt_part2}"
        })

    # 6. 4 Duplicates (2 duplicate entries in bank, 2 duplicate entries in ledger)
    for i in range(2):
        target_tx = bank_txs[i * 4]
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
            "reason": "Duplicate transaction posting in bank feed"
        })

    for i in range(2):
        target_entry = ledger_entries[i * 4]
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
            "reason": "Accidental double-booking in internal ledger"
        })

    # 7. Deliberate Unresolvables (8 records with NO counterparts ~ 11% tail)
    unresolvable_bank_reasons = [
        ("CHASE SERVICE CHG WIRE TRANSFER", 35.00, "Unrecorded bank wire fee"),
        ("AIRBNB RESERVATION SAN FRANCISCO", 1250.00, "Employee travel expense missing AP receipt"),
        ("UNKNOWN ACH DEBIT MERCH-9921", 89.99, "Unidentified recurring software subscription"),
        ("FOREIGN EXCHANGE DISCREPANCY REVAL", 412.50, "Unbooked treasury currency adjustment"),
    ]
    for desc, amt, reason in unresolvable_bank_reasons:
        b_id = f"BNK-{current_bank_id}"
        current_bank_id += 1
        tx_date = (base_date + timedelta(days=random.randint(5, 25))).strftime("%Y-%m-%d")
        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": f"BNK-UNRES-{current_bank_id}",
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial"
        })
        ground_truth_unresolvables.append({
            "id": b_id,
            "source": "bank",
            "amount": amt,
            "date": tx_date,
            "reason": reason,
            "expected_category": "no_counterpart"
        })

    unresolvable_ledger_reasons = [
        ("Accrued Legal Retainer - Cooley LLP", 5000.00, "Accrual entry with no cash movement yet"),
        ("Outstanding Vendor Check #99014", 750.00, "Uncashed check still outstanding at month-end"),
        ("Internal Intercompany Rebalance Entry", 3200.00, "Internal transfer between non-cash accounts"),
        ("Prepaid Software Amortization March", 1650.00, "Non-cash depreciation/amortization journal entry"),
    ]
    for desc, amt, reason in unresolvable_ledger_reasons:
        l_id = f"LDG-{current_ledger_id}"
        current_ledger_id += 1
        tx_date = (base_date + timedelta(days=random.randint(5, 25))).strftime("%Y-%m-%d")
        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": f"LDG-UNRES-{current_ledger_id}",
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
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

    # 8. Add 6 regular exact match vendor records to bring total bank records to 75
    for i in range(6):
        vendor, bank_desc, ledger_desc = random.choice(vendor_catalogue)
        ref_id = f"REF-EX-TOP-{60000 + i}"
        day_offset = random.randint(1, 26)
        tx_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        amount = round(random.uniform(500.0, 7500.0), 2)

        b_id = f"BNK-{current_bank_id}"
        l_id = f"LDG-{current_ledger_id}"
        current_bank_id += 1
        current_ledger_id += 1

        bank_txs.append({
            "id": b_id,
            "date": tx_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{bank_desc} - Regular Vendor Settlement {60000+i}",
            "ref_id": ref_id,
            "account_id": "ACC-BANK-CHASE-01",
            "raw_source": "Chase Commercial"
        })

        ledger_entries.append({
            "id": l_id,
            "date": tx_date,
            "amount": amount,
            "currency": "USD",
            "description": f"{vendor} - Operating Expense Voucher {60000+i}",
            "ref_id": ref_id,
            "account_id": "ACC-GL-1010",
            "entity": "RazorPay Global Inc",
            "gl_account": "1010-Operating-Cash"
        })

        ground_truth_matches.append({
            "bank_id": b_id,
            "ledger_ids": [l_id],
            "match_type": "EXACT",
            "expected_delta": 0.0,
            "rule": "RULE:REF_EXACT",
            "notes": "Exact match vendor settlement"
        })

    # Convert to DataFrames and save
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
    print("Dataset generated:", res)
