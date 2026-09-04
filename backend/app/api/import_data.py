import io
import os
import csv
import json
import uuid
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import pandas as pd

from app.config import settings
from app.models.user import User
from app.models.audit import AuditLog
from app.models.transaction import BankTransaction, LedgerEntry
from app.middleware.auth import get_current_user
from app.data.loader import load_reconciliation_data
from app.data.generator import generate_synthetic_dataset
from app.engine.rules_engine import RulesEngine
from app.engine.ai_engine import AIEngine
from app.engine.scorer import ReconciliationScorer
from app.engine.exception_triage import ExceptionTriage
from app.repository import repo

router = APIRouter(prefix="/data", tags=["Data Ingestion & Imports"])

DEMO_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "demo_data")
if not os.path.exists(DEMO_DATA_DIR):
    DEMO_DATA_DIR = os.path.join(os.getcwd(), "demo_data")


class ImportPreviewRequest(BaseModel):
    raw_content: str
    file_name: str
    source_type: str = "bank"  # "bank" or "ledger"


class ImportConfirmRequest(BaseModel):
    file_name: str
    source_type: str = "bank"  # "bank" or "ledger"
    mode: str = "append"  # "append" or "replace"
    mapping: Dict[str, str]
    raw_content: Optional[str] = None
    parsed_rows: Optional[List[Dict[str, Any]]] = None
    run_reconciliation_now: bool = True


class ManualEntryRequest(BaseModel):
    source_type: str = "bank"  # "bank" or "ledger"
    date: str
    amount: float
    description: str
    ref_id: Optional[str] = None
    account_id: Optional[str] = None
    currency: str = "USD"
    run_reconciliation_now: bool = True


def _is_numeric_val(val: Any) -> bool:
    if val is None or val == "":
        return False
    s = str(val).strip().replace("$", "").replace(",", "").replace(" ", "")
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]
    try:
        float(s)
        return any(c.isdigit() for c in s)
    except ValueError:
        return False


def _clean_amount(val: Any) -> float:
    if val is None or val == "":
        return 0.0
    s = str(val).strip().replace("$", "").replace(",", "").replace(" ", "")
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]
    try:
        return float(s)
    except ValueError:
        return 0.0


def _is_date_val(val: Any) -> bool:
    if not val:
        return False
    s = str(val).strip()
    if len(s) < 6:
        return False
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d", "%b %d, %Y", "%d/%m/%Y"):
        try:
            datetime.strptime(s[:10], fmt[:len(s[:10])])
            return True
        except ValueError:
            pass
    if re.match(r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}", s) or re.match(r"^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}", s):
        return True
    return False


def _clean_date(val: Any) -> str:
    if not val:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    s = str(val).strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d", "%b %d, %Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(s[:10], fmt[:len(s[:10])]).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return s[:10]


def _infer_column_type(col: str, rows: List[Dict[str, Any]]) -> str:
    samples = [r.get(col) for r in rows[:25] if r.get(col) not in (None, "")]
    if not samples:
        return "string"
    num_count = sum(1 for v in samples if _is_numeric_val(v))
    if num_count / len(samples) >= 0.6:
        return "numeric"
    date_count = sum(1 for v in samples if _is_date_val(v))
    if date_count / len(samples) >= 0.6:
        return "date"
    id_count = sum(1 for v in samples if re.match(r"^[A-Za-z0-9_-]{2,30}$", str(v).strip()) and " " not in str(v).strip())
    if id_count / len(samples) >= 0.6 and any(kw in col.lower() for kw in ["id", "ref", "check", "code", "tx", "num"]):
        return "identifier"
    return "string"


@router.post("/import/preview")
async def preview_import(
    req: ImportPreviewRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Parse uploaded CSV/JSON content, suggest value-verified column mappings,
    detect duplicates against active data, and return validation metrics.
    """
    content = req.raw_content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file content is empty.")

    rows = []
    # 1. Try parsing JSON first
    if content.startswith("[") or content.startswith("{"):
        try:
            parsed_json = json.loads(content)
            rows = parsed_json if isinstance(parsed_json, list) else [parsed_json]
        except Exception:
            rows = []

    # 2. If not JSON, parse as CSV/TSV
    if not rows:
        try:
            sniffer = csv.Sniffer()
            sample = content[:4096]
            try:
                dialect = sniffer.sniff(sample)
                delim = dialect.delimiter
            except Exception:
                delim = ","
                if "\t" in sample and "," not in sample:
                    delim = "\t"

            reader = csv.DictReader(io.StringIO(content), delimiter=delim)
            rows = [r for r in reader if any(r.values())]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if not rows:
        raise HTTPException(status_code=400, detail="No readable rows found in the uploaded file.")

    detected_columns = list(rows[0].keys())

    # Deep inspection: Infer type and sample value for every column
    column_types = {}
    column_samples = {}
    for col in detected_columns:
        column_types[col] = _infer_column_type(col, rows)
        sample = next((str(r.get(col, "")).strip() for r in rows if r.get(col) not in (None, "")), "")
        column_samples[col] = sample

    # Value-verified auto-infer column mappings
    suggested_mapping = {}
    col_lower = {col.lower().strip(): col for col in detected_columns}

    # 1. Amount mapping: MUST BE NUMERIC
    numeric_cols = [c for c in detected_columns if column_types[c] == "numeric"]
    amount_match = None
    for kw in ["amount", "net", "total", "sum", "amt", "debit", "credit", "value", "balance", "price"]:
        for c in numeric_cols:
            if kw in c.lower():
                amount_match = c
                break
        if amount_match:
            break
    if not amount_match and numeric_cols:
        amount_match = numeric_cols[0]
    if amount_match:
        suggested_mapping["amount"] = amount_match

    # 2. Date mapping: MUST BE DATE
    date_cols = [c for c in detected_columns if column_types[c] == "date"]
    date_match = None
    for kw in ["date", "tx_date", "transaction_date", "post_date", "booking_date", "timestamp"]:
        for c in (date_cols or detected_columns):
            if kw in c.lower():
                date_match = c
                break
        if date_match:
            break
    if not date_match and date_cols:
        date_match = date_cols[0]
    if date_match:
        suggested_mapping["date"] = date_match

    # 3. Description mapping: PREFER STRING
    string_cols = [c for c in detected_columns if column_types[c] == "string" and c != suggested_mapping.get("amount") and c != suggested_mapping.get("date")]
    desc_match = None
    for kw in ["description", "desc", "memo", "narration", "payee", "counterparty", "vendor", "name", "particulars"]:
        for c in (string_cols or detected_columns):
            if kw in c.lower() and c != suggested_mapping.get("amount") and c != suggested_mapping.get("date"):
                desc_match = c
                break
        if desc_match:
            break
    if not desc_match and string_cols:
        desc_match = string_cols[0]
    if desc_match:
        suggested_mapping["description"] = desc_match

    # 4. Ref ID mapping: PREFER IDENTIFIER OR STRING
    ref_match = None
    for kw in ["ref", "reference", "ref_id", "id", "check", "cheque", "invoice", "voucher", "tx_id", "payout_id"]:
        for c in detected_columns:
            if kw in c.lower() and c not in suggested_mapping.values():
                ref_match = c
                break
        if ref_match:
            break
    if ref_match:
        suggested_mapping["ref_id"] = ref_match

    # 5. Account / Currency mapping
    acc_match = None
    for kw in ["account", "account_id", "gl_account", "bank_account", "cost_center"]:
        for c in detected_columns:
            if kw in c.lower() and c not in suggested_mapping.values():
                acc_match = c
                break
        if acc_match:
            break
    if acc_match:
        suggested_mapping["account_id"] = acc_match

    # Check duplicates against active dataset
    bank_txs, ledger_entries, _ = load_reconciliation_data(settings.data_dir)
    existing_items = bank_txs if req.source_type == "bank" else ledger_entries
    existing_signatures = {
        (round(float(item.amount), 2), item.date, item.description.lower().strip()[:20])
        for item in existing_items
    }

    warnings = []
    errors = []
    duplicate_count = 0
    valid_count = 0

    amount_col = suggested_mapping.get("amount")
    date_col = suggested_mapping.get("date")
    desc_col = suggested_mapping.get("description")

    for i, r in enumerate(rows):
        is_valid = True
        amt_val = _clean_amount(r.get(amount_col)) if amount_col else 0.0
        if amt_val == 0.0 and amount_col and r.get(amount_col) not in ["0", "0.0", "0.00"]:
            errors.append(f"Row {i+1}: Non-numeric amount '{r.get(amount_col)}'")
            is_valid = False

        date_val = _clean_date(r.get(date_col)) if date_col else ""
        desc_val = str(r.get(desc_col, "")).lower().strip()[:20]

        # Duplicate check
        if (round(amt_val, 2), date_val, desc_val) in existing_signatures:
            duplicate_count += 1

        if is_valid:
            valid_count += 1

    if duplicate_count > 0:
        warnings.append(f"{duplicate_count} transactions appear to duplicate existing records in the ledger.")

    if not suggested_mapping.get("amount"):
        warnings.append("Could not automatically identify the 'Amount' column. Please select a numeric column.")
    if not suggested_mapping.get("date"):
        warnings.append("Could not automatically identify the 'Date' column. Please select a date column.")

    return {
        "file_name": req.file_name,
        "source_type": req.source_type,
        "detected_columns": detected_columns,
        "column_types": column_types,
        "column_samples": column_samples,
        "suggested_mapping": suggested_mapping,
        "preview_rows": rows[:12],
        "total_rows": len(rows),
        "valid_rows_count": valid_count,
        "warning_count": len(warnings) + duplicate_count,
        "warnings": warnings,
        "error_count": len(errors),
        "errors": errors[:5],
        "duplicate_count": duplicate_count
    }


@router.post("/import/confirm")
async def confirm_import(
    req: ImportConfirmRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Validate, normalize, and commit imported financial transactions
    into the active dataset, and trigger an automated reconciliation pass.
    """
    rows = req.parsed_rows or []
    if not rows and req.raw_content:
        # Re-parse from raw content
        try:
            reader = csv.DictReader(io.StringIO(req.raw_content.strip()))
            rows = [r for r in reader if any(r.values())]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse content: {str(e)}")

    if not rows:
        raise HTTPException(status_code=400, detail="No records provided to import.")

    mapping = req.mapping
    date_col = mapping.get("date")
    amt_col = mapping.get("amount")
    desc_col = mapping.get("description")
    ref_col = mapping.get("ref_id")
    acc_col = mapping.get("account_id")

    if not amt_col or not desc_col:
        raise HTTPException(status_code=400, detail="Amount and Description column mappings are required.")

    import_id = f"IMP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    normalized_records = []

    for i, r in enumerate(rows):
        amt = _clean_amount(r.get(amt_col))
        dt = _clean_date(r.get(date_col))
        desc = str(r.get(desc_col, "")).strip() or "Imported Transaction"
        ref = str(r.get(ref_col, "")).strip() if ref_col and r.get(ref_col) else f"REF-{import_id[-6:]}-{i+1:04d}"
        acc = str(r.get(acc_col, "")).strip() if acc_col and r.get(acc_col) else ("ACC-BANK-001" if req.source_type == "bank" else "1010-Operating-Cash")

        rec_id = f"{'BNK' if req.source_type == 'bank' else 'LED'}-IMP-{uuid.uuid4().hex[:6].upper()}"
        normalized_records.append({
            "id": rec_id,
            "date": dt,
            "amount": amt,
            "currency": "USD",
            "description": desc,
            "ref_id": ref,
            "account_id": acc,
            "raw_source": req.file_name if req.source_type == "bank" else "ERP General Ledger",
            "entity": "RazorPay Global Inc" if req.source_type == "ledger" else None,
            "gl_account": acc if req.source_type == "ledger" else None,
        })

    # Save to CSV files
    target_csv = f"{settings.data_dir}/{'bank_transactions.csv' if req.source_type == 'bank' else 'ledger_entries.csv'}"
    new_df = pd.DataFrame(normalized_records)

    if req.mode == "append" and pd.io.common.file_exists(target_csv):
        existing_df = pd.read_csv(target_csv)
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        combined_df.to_csv(target_csv, index=False)
    else:
        new_df.to_csv(target_csv, index=False)

    # Log in SQLite import history
    repo.add_import_log({
        "id": import_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "file_name": req.file_name,
        "source_type": req.source_type,
        "total_records": len(normalized_records),
        "imported_records": len(normalized_records),
        "warning_count": 0,
        "error_count": 0,
        "status": "completed",
        "details": {
            "mode": req.mode,
            "imported_by": current_user.username,
            "column_mapping": mapping
        }
    })

    # Audit Trail Entry
    repo.add_audit_log(AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="IMPORT_FINANCIAL_DATA",
        entity_type="dataset",
        entity_id=import_id,
        notes=f"Imported {len(normalized_records)} {req.source_type} records from file '{req.file_name}' ({req.mode} mode)."
    ))

    # Trigger reconciliation if requested
    reconcile_result = None
    if req.run_reconciliation_now:
        bank_txs, ledger_entries, ground_truth = load_reconciliation_data(settings.data_dir)
        rules_engine = RulesEngine(accept_threshold=settings.accept_threshold, exception_threshold=settings.exception_threshold)
        deterministic_matches, rem_bank, rem_ledger, candidates = rules_engine.run_deterministic_rules(bank_txs, ledger_entries)

        run_id = f"RUN-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        all_matches = list(deterministic_matches)
        ai_engine = AIEngine(api_key=settings.groq_api_key, accept_threshold=settings.accept_threshold)
        ai_resolved_count = 0
        for c in candidates:
            m = ai_engine.evaluate_candidates(c["bank_transaction"], c["candidates"], run_id=run_id)
            if m:
                all_matches.append(m)
                ai_resolved_count += 1

        matched_b_ids = {m.bank_transaction_id for m in all_matches}
        matched_l_ids = {lid for m in all_matches for lid in m.ledger_entry_ids}
        unmatched_bank = [b for b in bank_txs if b.id not in matched_b_ids]
        unmatched_ledger = [l for l in ledger_entries if l.id not in matched_l_ids]

        triage = ExceptionTriage(high_value_threshold=settings.high_value_threshold)
        exceptions = triage.triage_unmatched_records(
            unmatched_bank, unmatched_ledger, bank_txs, ledger_entries, run_id=run_id
        )

        scores = ReconciliationScorer.evaluate_run(
            all_matches, exceptions, len(bank_txs), len(ledger_entries), ground_truth
        )

        for m in all_matches:
            m.run_id = run_id

        run_data = {
            "run_id": run_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": current_user.full_name,
            "actor_role": current_user.role.value,
            "scores": scores,
            "matches": all_matches,
            "exceptions": exceptions,
            "notes": f"Automated pass following data import '{req.file_name}'",
            "status": "completed"
        }
        repo.save_run(run_data)
        reconcile_result = repo.get_run(run_id)

    return {
        "status": "success",
        "import_id": import_id,
        "imported_count": len(normalized_records),
        "source_type": req.source_type,
        "mode": req.mode,
        "new_run": reconcile_result
    }


@router.post("/manual-entry")
async def add_manual_transaction(
    req: ManualEntryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Manually add an individual transaction/voucher to the active books.
    """
    target_csv = f"{settings.data_dir}/{'bank_transactions.csv' if req.source_type == 'bank' else 'ledger_entries.csv'}"
    rec_id = f"{'BNK' if req.source_type == 'bank' else 'LED'}-MANUAL-{uuid.uuid4().hex[:6].upper()}"
    
    new_record = {
        "id": rec_id,
        "date": req.date,
        "amount": req.amount,
        "currency": req.currency,
        "description": req.description,
        "ref_id": req.ref_id or f"MAN-{uuid.uuid4().hex[:6].upper()}",
        "account_id": req.account_id or ("ACC-BANK-001" if req.source_type == "bank" else "1010-Operating-Cash"),
        "raw_source": f"Manual Entry by {current_user.full_name}",
        "entity": "RazorPay Global Inc" if req.source_type == "ledger" else None,
        "gl_account": req.account_id or "1010-Operating-Cash" if req.source_type == "ledger" else None,
    }

    new_df = pd.DataFrame([new_record])
    if pd.io.common.file_exists(target_csv):
        existing_df = pd.read_csv(target_csv)
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        combined_df.to_csv(target_csv, index=False)
    else:
        new_df.to_csv(target_csv, index=False)

    repo.add_audit_log(AuditLog(
        id=f"aud-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        actor_role=current_user.role,
        action="MANUAL_TRANSACTION_ENTRY",
        entity_type="transaction",
        entity_id=rec_id,
        notes=f"Manually created {req.source_type} record '{req.description}' for ${req.amount:,.2f}"
    ))

    return {
        "status": "success",
        "record": new_record,
        "message": f"Successfully created {req.source_type} transaction '{rec_id}'."
    }


@router.get("/imports")
async def list_imports(current_user: User = Depends(get_current_user)):
    """
    Retrieve import history for financial file management audit.
    """
    return repo.list_import_logs()


@router.post("/reset-demo")
async def reset_demo_data(current_user: User = Depends(get_current_user)):
    """
    Reset dataset to standard 50+ record benchmark.
    """
    generate_synthetic_dataset(settings.data_dir)
    return {
        "status": "success",
        "message": "Reset to 50+ record demo benchmark."
    }


@router.get("/demo-files")
async def list_demo_files(current_user: User = Depends(get_current_user)):
    """
    Return available sample demo files for quick-load testing.
    """
    files_info = [
        {
            "filename": "chase_operating_statement_feb2026.csv",
            "title": "Chase Commercial Operating Statement",
            "subtitle": "Feb 2026 Monthly Statement Feed (15 rows)",
            "source_type": "bank",
            "format": "CSV",
            "row_count": 15,
            "highlight": "AWS, Gusto Payroll, Client Wires, and Card Sweeps"
        },
        {
            "filename": "netsuite_gl1010_cash_vouchers_feb2026.csv",
            "title": "NetSuite GL-1010 Cash Journal Vouchers",
            "subtitle": "ERP General Ledger Export (13 rows)",
            "source_type": "ledger",
            "format": "CSV",
            "row_count": 13,
            "highlight": "Timing lag entries & journal voucher records"
        },
        {
            "filename": "stripe_merchant_settlement_batch.csv",
            "title": "Stripe Merchant Settlement Batch",
            "subtitle": "Payment Gateway Payouts (7 rows)",
            "source_type": "bank",
            "format": "CSV",
            "row_count": 7,
            "highlight": "Gross/Net fee calculations & dispute reserves"
        },
        {
            "filename": "apex_wire_exceptions_batch.json",
            "title": "Apex Wire Exceptions Feed",
            "subtitle": "High-Value Wire Discrepancies (5 rows)",
            "source_type": "bank",
            "format": "JSON",
            "row_count": 5,
            "highlight": "Cross-border wires with intermediary fee deltas"
        },
        {
            "filename": "corporate_payroll_tax_sweep.tsv",
            "title": "Corporate Payroll & Tax Sweep",
            "subtitle": "Tab-Separated Tax & 401k Sweep (5 rows)",
            "source_type": "ledger",
            "format": "TSV",
            "row_count": 5,
            "highlight": "Federal 941, EDD, and Fidelity 401k employer match"
        }
    ]
    return files_info


@router.get("/demo-files/{filename}")
async def get_demo_file_content(filename: str, current_user: User = Depends(get_current_user)):
    """
    Fetch the content of a chosen demo file for 1-click preview and loading.
    """
    file_path = os.path.join(DEMO_DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Demo file '{filename}' not found.")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {
        "filename": filename,
        "content": content,
        "source_type": "ledger" if ("gl" in filename.lower() or "voucher" in filename.lower()) else "bank"
    }

