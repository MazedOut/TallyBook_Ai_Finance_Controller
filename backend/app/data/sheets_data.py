import os
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple
from app.models.transaction import BankTransaction, LedgerEntry
from app.data.loader import load_reconciliation_data

# In-memory / persistent registry for sheets
DEFAULT_SHEETS: List[Dict[str, Any]] = [
    {
        "id": "sheet-techcorp",
        "name": "TechCorp SaaS Inc.",
        "domain": "B2B SaaS / Enterprise ARR",
        "code": "TC-GL1010",
        "currency": "USD",
        "currency_symbol": "$",
        "bank_name": "Chase Commercial Banking",
        "bank_account": "•••• 4991",
        "gl_account": "1010-Operating-Cash",
        "entity_name": "TechCorp Global SaaS Holdings",
        "color": "#0ea5e9",  # Azure
        "theme": "azure",
        "icon": "Building2",
        "description": "Primary operating account for enterprise subscription revenues, AWS compute, and corporate payroll.",
        "is_default": True
    },
    {
        "id": "sheet-apex",
        "name": "Apex Retail & E-Commerce",
        "domain": "Direct-to-Consumer / Payment Gateway",
        "code": "AP-GL1020",
        "currency": "USD",
        "currency_symbol": "$",
        "bank_name": "Silicon Valley Bank",
        "bank_account": "•••• 8821",
        "gl_account": "1020-Merchant-Clearing",
        "entity_name": "Apex Omni-Channel Retail LLC",
        "color": "#10b981",  # Mint
        "theme": "mint",
        "icon": "ShoppingBag",
        "description": "High-velocity merchant settlement batches from Razorpay & Stripe, courier shipping charges, and returns.",
        "is_default": False
    },
    {
        "id": "sheet-bluehorizon",
        "name": "BlueHorizon Partners & Advisory",
        "domain": "Professional Services & Retainers",
        "code": "BH-GL1030",
        "currency": "EUR",
        "currency_symbol": "€",
        "bank_name": "Barclays Corporate International",
        "bank_account": "•••• 3104",
        "gl_account": "1030-Client-Trust-Ledger",
        "entity_name": "BlueHorizon Strategic Advisory LLP",
        "color": "#8b5cf6",  # Lavender
        "theme": "lavender",
        "icon": "Briefcase",
        "description": "Monthly executive retainers, partner distributions, statutory VAT payments, and subcontractor fees.",
        "is_default": False
    },
    {
        "id": "sheet-cloudscale",
        "name": "CloudScale DevOps & Infra",
        "domain": "Cloud Infrastructure & API OpEx",
        "code": "CS-GL1040",
        "currency": "USD",
        "currency_symbol": "$",
        "bank_name": "Wells Fargo Treasury",
        "bank_account": "•••• 1092",
        "gl_account": "1040-DevOps-OpEx",
        "entity_name": "CloudScale Systems Inc.",
        "color": "#f59e0b",  # Amber
        "theme": "amber",
        "icon": "Server",
        "description": "Automated developer tooling, Snowflake compute credits, Datadog observability, and OpenAI API usage.",
        "is_default": False
    }
]

# Custom sheets added by the user at runtime
_custom_sheets: Dict[str, Dict[str, Any]] = {}
_cached_sheet_datasets: Dict[str, Tuple[List[BankTransaction], List[LedgerEntry], Dict[str, Any]]] = {}

def get_all_sheets() -> List[Dict[str, Any]]:
    """Return all available sheets (defaults + user created)."""
    return list(DEFAULT_SHEETS) + list(_custom_sheets.values())

def get_sheet_by_id(sheet_id: str) -> Dict[str, Any]:
    for s in get_all_sheets():
        if s["id"] == sheet_id:
            return s
    return DEFAULT_SHEETS[0]

def create_sheet(sheet_data: Dict[str, Any]) -> Dict[str, Any]:
    sheet_id = sheet_data.get("id") or f"sheet-{uuid.uuid4().hex[:6]}"
    new_sheet = {
        "id": sheet_id,
        "name": sheet_data.get("name", "New Business Unit"),
        "domain": sheet_data.get("domain", "General Enterprise"),
        "code": sheet_data.get("code", f"BU-{uuid.uuid4().hex[:4].upper()}"),
        "currency": sheet_data.get("currency", "USD"),
        "currency_symbol": "$" if sheet_data.get("currency", "USD") == "USD" else ("€" if sheet_data.get("currency") == "EUR" else "₹"),
        "bank_name": sheet_data.get("bank_name", "Corporate Operating Bank"),
        "bank_account": sheet_data.get("bank_account", f"•••• {uuid.uuid4().hex[:4]}"),
        "gl_account": sheet_data.get("gl_account", "1000-Cash-General"),
        "entity_name": sheet_data.get("entity_name", sheet_data.get("name")),
        "color": sheet_data.get("color", "#0ea5e9"),
        "theme": sheet_data.get("theme", "azure"),
        "icon": sheet_data.get("icon", "Building2"),
        "description": sheet_data.get("description", "Custom business book added to workbook."),
        "is_default": False
    }
    _custom_sheets[sheet_id] = new_sheet
    return new_sheet

def load_sheet_data(sheet_id: str, data_dir: str = "./app/data") -> Tuple[List[BankTransaction], List[LedgerEntry], Dict[str, Any]]:
    """Loads or generates domain-specific data for a given sheet."""
    if sheet_id in _cached_sheet_datasets:
        return _cached_sheet_datasets[sheet_id]

    if sheet_id == "sheet-techcorp" or sheet_id not in ["sheet-apex", "sheet-bluehorizon", "sheet-cloudscale"]:
        # Use baseline dataset from data_dir
        bank, ledger, gt = load_reconciliation_data(data_dir)
        _cached_sheet_datasets[sheet_id] = (bank, ledger, gt)
        return bank, ledger, gt

    if sheet_id == "sheet-apex":
        dataset = _generate_apex_retail_dataset()
    elif sheet_id == "sheet-bluehorizon":
        dataset = _generate_bluehorizon_dataset()
    elif sheet_id == "sheet-cloudscale":
        dataset = _generate_cloudscale_dataset()
    else:
        # Fallback
        dataset = load_reconciliation_data(data_dir)

    _cached_sheet_datasets[sheet_id] = dataset
    return dataset

def reset_sheet_data(sheet_id: str):
    if sheet_id in _cached_sheet_datasets:
        del _cached_sheet_datasets[sheet_id]

# -------------------------------------------------------------
# Domain Synthetic Generators
# -------------------------------------------------------------

def _generate_apex_retail_dataset() -> Tuple[List[BankTransaction], List[LedgerEntry], Dict[str, Any]]:
    """Synthetic dataset for D2C Retail & Gateway Reconciliation."""
    bank_txs: List[BankTransaction] = []
    ledger_entries: List[LedgerEntry] = []
    ground_truth: Dict[str, Any] = {}

    apex_items = [
        # Inflows / Gateway Sweeps
        ("AP-TX-101", "2026-02-01", 42500.00, "Razorpay Gateway Daily Settlement Batch #9021", "RZP-9021", "exact", 42500.00),
        ("AP-TX-102", "2026-02-02", 38450.50, "Stripe Merchant Clearing Card Payout #STR-441", "STR-441", "lag", 38450.50),
        ("AP-TX-103", "2026-02-03", 51200.00, "Shopify Payments Gross Settlement #SHP-1288", "SHP-1288", "exact", 51200.00),
        ("AP-TX-104", "2026-02-04", 29800.75, "Razorpay Gateway UPI & NetBanking Sweep #9028", "RZP-9028", "exact", 29800.75),
        ("AP-TX-105", "2026-02-05", 47100.00, "PayPal Merchant Services Daily Sweep #PP-301", "PP-301", "fee", 47125.00),  # $25 fee
        ("AP-TX-106", "2026-02-06", 64500.00, "Stripe Bulk Weekend Card Capture #STR-448", "STR-448", "exact", 64500.00),
        ("AP-TX-107", "2026-02-07", 33200.00, "Amazon Seller Central Disbursement #AMZ-771", "AMZ-771", "lag", 33200.00),
        ("AP-TX-108", "2026-02-08", 41900.50, "Razorpay Gateway Daily Settlement Batch #9035", "RZP-9035", "exact", 41900.50),
        # Outflows / OpEx & Inventory
        ("AP-TX-109", "2026-02-09", -18400.00, "FedEx Logistics Priority Freight & Warehousing", "FDX-6610", "exact", -18400.00),
        ("AP-TX-110", "2026-02-10", -24500.00, "DHL Express Global Distribution Delivery Fees", "DHL-9811", "exact", -24500.00),
        ("AP-TX-111", "2026-02-11", -85000.00, "Supplier Apex Apparel Mills Shanghai Wire Transfer", "APX-WIRE-44", "exact", -85000.00),
        ("AP-TX-112", "2026-02-12", -12800.00, "Klaviyo Automated Marketing Subscription Q1", "KLV-882", "exact", -12800.00),
        ("AP-TX-113", "2026-02-13", -3400.25, "Chargeback Recovery & Card Dispute Admin Surcharge", "CB-REV-10", "exception", 0),  # Missing GL
        ("AP-TX-114", "2026-02-14", -78500.00, "Packaging World Poly Mailers & Eco Boxes Bulk", "PKG-330", "exact", -78500.00),
        ("AP-TX-115", "2026-02-15", 58900.00, "Razorpay Gateway Festive Flash Sale Sweep #9042", "RZP-9042", "exact", 58900.00),
        ("AP-TX-116", "2026-02-16", -4500.00, "Google Ads Performance Max Campaign Prepayment", "GOOG-5510", "lag", -4500.00),
        ("AP-TX-117", "2026-02-17", -6200.00, "Meta Ads Direct Response Influencer Ad Spend", "FB-9921", "exact", -6200.00),
        ("AP-TX-118", "2026-02-18", -1850.00, "Customer Return Restocking Fee Adjustment Bank Credit", "RET-ADJ", "exception", 0),  # Missing GL
        ("AP-TX-119", "2026-02-19", 37400.00, "Shopify Payments Direct Merchant Settlement", "SHP-1299", "exact", 37400.00),
        ("AP-TX-120", "2026-02-20", -95000.00, "Apex Warehouse Lease — Ontario Fulfillment Center", "LSE-ONT-02", "exact", -95000.00),
    ]

    for b_id, dt, amt, desc, ref, match_type, gl_amt in apex_items:
        bank_txs.append(BankTransaction(
            id=b_id,
            date=dt,
            amount=amt,
            currency="USD",
            description=desc,
            ref_id=ref,
            account_id="ACC-SVB-8821",
            raw_source="Silicon Valley Bank Feed"
        ))

        if match_type != "exception":
            l_id = f"GL-{b_id}"
            ledger_date = dt
            if match_type == "lag":
                # 2 days lag
                d_num = int(dt.split("-")[-1]) + 2
                ledger_date = f"2026-02-{d_num:02d}"

            ledger_entries.append(LedgerEntry(
                id=l_id,
                date=ledger_date,
                amount=gl_amt,
                currency="USD",
                description=f"ERP VOUCHER: {desc}",
                ref_id=ref,
                account_id="ACC-GL-1020",
                entity="Apex Omni-Channel Retail LLC",
                gl_account="1020-Merchant-Clearing"
            ))
            ground_truth[b_id] = [l_id]

    return bank_txs, ledger_entries, ground_truth

def _generate_bluehorizon_dataset() -> Tuple[List[BankTransaction], List[LedgerEntry], Dict[str, Any]]:
    """Synthetic dataset for Professional Advisory & Client Retainers (EUR/USD)."""
    bank_txs: List[BankTransaction] = []
    ledger_entries: List[LedgerEntry] = []
    ground_truth: Dict[str, Any] = {}

    advisory_items = [
        ("BH-TX-201", "2026-02-01", 65000.00, "Siemens AG M&A Advisory Retainer — Feb 2026", "RET-SIE-02", "exact", 65000.00),
        ("BH-TX-202", "2026-02-03", 45000.00, "Allianz SE Strategic Turnaround Milestone 2", "MIL-ALZ-02", "exact", 45000.00),
        ("BH-TX-203", "2026-02-05", 82000.00, "Roche Pharmaceuticals Corporate Finance Consulting", "CON-ROC-88", "lag", 82000.00),
        ("BH-TX-204", "2026-02-07", -28000.00, "Senior Partner Profit Draw — Marcus Vance", "DRW-MV-02", "exact", -28000.00),
        ("BH-TX-205", "2026-02-08", -28000.00, "Senior Partner Profit Draw — Elena Rostova", "DRW-ER-02", "exact", -28000.00),
        ("BH-TX-206", "2026-02-10", -14500.00, "Deloitte Statutory External Audit & Compliance Fee", "DEL-AUD-01", "exact", -14500.00),
        ("BH-TX-207", "2026-02-12", 35000.00, "Novartis Health Venture Structuring Retainer", "RET-NOV-01", "fee", 35040.00),  # 40 EUR wire fee
        ("BH-TX-208", "2026-02-14", -42000.00, "HM Revenue & Customs Quarterly VAT Settlement", "HMRC-VAT-Q1", "exact", -42000.00),
        ("BH-TX-209", "2026-02-16", 50000.00, "BMW Group ESG Compliance Advisory Tranche", "RET-BMW-03", "exact", 50000.00),
        ("BH-TX-210", "2026-02-18", -8400.00, "Mayfair London Executive Suites Office Rent", "OFF-MAY-02", "exact", -8400.00),
        ("BH-TX-211", "2026-02-20", -3200.00, "Bloomberg Terminal & Capital IQ Subscription", "BBG-3011", "exact", -3200.00),
        ("BH-TX-212", "2026-02-22", -12500.00, "External Legal Counsel Expert Witness Escrow", "ESC-LEG-99", "exception", 0),  # Missing GL entry
        ("BH-TX-213", "2026-02-24", 75000.00, "Airbus Capital Restructuring Retainer Feb", "RET-AIR-02", "exact", 75000.00),
        ("BH-TX-214", "2026-02-26", -16000.00, "Associate Contractor Bonus Pool Disbursement", "BON-ASSOC-02", "exact", -16000.00),
    ]

    for b_id, dt, amt, desc, ref, match_type, gl_amt in advisory_items:
        bank_txs.append(BankTransaction(
            id=b_id,
            date=dt,
            amount=amt,
            currency="EUR",
            description=desc,
            ref_id=ref,
            account_id="ACC-BARC-3104",
            raw_source="Barclays Corporate MT940"
        ))

        if match_type != "exception":
            l_id = f"GL-{b_id}"
            ledger_date = dt
            if match_type == "lag":
                d_num = int(dt.split("-")[-1]) + 1
                ledger_date = f"2026-02-{d_num:02d}"

            ledger_entries.append(LedgerEntry(
                id=l_id,
                date=ledger_date,
                amount=gl_amt,
                currency="EUR",
                description=f"SAGE LEDGER: {desc}",
                ref_id=ref,
                account_id="ACC-GL-1030",
                entity="BlueHorizon Strategic Advisory LLP",
                gl_account="1030-Client-Trust-Ledger"
            ))
            ground_truth[b_id] = [l_id]

    return bank_txs, ledger_entries, ground_truth

def _generate_cloudscale_dataset() -> Tuple[List[BankTransaction], List[LedgerEntry], Dict[str, Any]]:
    """Synthetic dataset for Cloud Infrastructure, Developer Tooling & API OpEx."""
    bank_txs: List[BankTransaction] = []
    ledger_entries: List[LedgerEntry] = []
    ground_truth: Dict[str, Any] = {}

    cloud_items = [
        ("CS-TX-301", "2026-02-01", 125000.00, "Parent Co Equity Capital Contribution Infusion", "CAP-INF-02", "exact", 125000.00),
        ("CS-TX-302", "2026-02-02", -38400.00, "Amazon Web Services us-east-1 Cluster Bill", "AWS-INV-881", "exact", -38400.00),
        ("CS-TX-303", "2026-02-03", -19200.00, "Google Cloud Platform BigQuery Compute Billing", "GCP-BIGQ-01", "lag", -19200.00),
        ("CS-TX-304", "2026-02-05", -14500.00, "Snowflake Data Warehouse Enterprise Credits", "SNOW-CRED-44", "exact", -14500.00),
        ("CS-TX-305", "2026-02-06", -8900.00, "OpenAI API Platform Tier 5 Usage Monthly", "OAI-API-FEB", "fee", -8915.00),  # $15 foreign fee
        ("CS-TX-306", "2026-02-08", -6400.00, "Datadog APM & Synthetic Monitoring Bill", "DDOG-MON-02", "exact", -6400.00),
        ("CS-TX-307", "2026-02-10", -4200.00, "GitHub Enterprise Cloud 250 Seats License", "GH-ENT-250", "exact", -4200.00),
        ("CS-TX-308", "2026-02-12", -3100.00, "PagerDuty Enterprise On-Call Incident Management", "PD-INC-02", "exact", -3100.00),
        ("CS-TX-309", "2026-02-14", -7800.00, "Fastly CDN Global Edge Bandwidth Surcharge", "FST-CDN-99", "exact", -7800.00),
        ("CS-TX-310", "2026-02-16", -12000.00, "Auth0 Enterprise Single Sign-On Identity", "AUTH0-SSO-Q1", "exact", -12000.00),
        ("CS-TX-311", "2026-02-18", -5600.00, "Vercel Enterprise Team Edge Network Pro", "VERCEL-ENT-02", "lag", -5600.00),
        ("CS-TX-312", "2026-02-20", -850.00, "Stripe Billing Infrastructure Usage Fees", "STR-INF-99", "exception", 0),  # Missing GL voucher
        ("CS-TX-313", "2026-02-22", -45000.00, "Engineering Core Team Payroll Clearing", "PAY-ENG-02", "exact", -45000.00),
        ("CS-TX-314", "2026-02-25", 85000.00, "Enterprise API Platform License Renewal", "LIC-ENT-02", "exact", 85000.00),
    ]

    for b_id, dt, amt, desc, ref, match_type, gl_amt in cloud_items:
        bank_txs.append(BankTransaction(
            id=b_id,
            date=dt,
            amount=amt,
            currency="USD",
            description=desc,
            ref_id=ref,
            account_id="ACC-WF-1092",
            raw_source="Wells Fargo Direct Connect"
        ))

        if match_type != "exception":
            l_id = f"GL-{b_id}"
            ledger_date = dt
            if match_type == "lag":
                d_num = int(dt.split("-")[-1]) + 1
                ledger_date = f"2026-02-{d_num:02d}"

            ledger_entries.append(LedgerEntry(
                id=l_id,
                date=ledger_date,
                amount=gl_amt,
                currency="USD",
                description=f"NETSUITE: {desc}",
                ref_id=ref,
                account_id="ACC-GL-1040",
                entity="CloudScale Systems Inc.",
                gl_account="1040-DevOps-OpEx"
            ))
            ground_truth[b_id] = [l_id]

    return bank_txs, ledger_entries, ground_truth
