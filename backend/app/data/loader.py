import os
import json
import pandas as pd
from typing import Tuple, List, Dict, Any
from app.models.transaction import BankTransaction, LedgerEntry

def load_reconciliation_data(data_dir: str = "./app/data") -> Tuple[List[BankTransaction], List[LedgerEntry], Dict[str, Any]]:
    bank_csv_path = os.path.join(data_dir, "bank_transactions.csv")
    ledger_csv_path = os.path.join(data_dir, "ledger_entries.csv")
    gt_json_path = os.path.join(data_dir, "ground_truth_mapping.json")

    if not os.path.exists(bank_csv_path) or not os.path.exists(ledger_csv_path):
        from app.data.generator import generate_synthetic_dataset
        generate_synthetic_dataset(data_dir)

    df_bank = pd.read_csv(bank_csv_path)
    df_ledger = pd.read_csv(ledger_csv_path)

    # Handle NaN in ref_id
    df_bank["ref_id"] = df_bank["ref_id"].fillna("").astype(str)
    df_ledger["ref_id"] = df_ledger["ref_id"].fillna("").astype(str)

    bank_transactions = [
        BankTransaction(
            id=row["id"],
            date=str(row["date"]),
            amount=float(row["amount"]),
            currency=str(row.get("currency", "USD")),
            description=str(row["description"]),
            ref_id=str(row["ref_id"]) if str(row["ref_id"]).strip() else None,
            account_id=str(row.get("account_id", "ACC-BANK-001")),
            raw_source=str(row.get("raw_source", "Chase Commercial Banking")),
        )
        for _, row in df_bank.iterrows()
    ]

    ledger_entries = [
        LedgerEntry(
            id=row["id"],
            date=str(row["date"]),
            amount=float(row["amount"]),
            currency=str(row.get("currency", "USD")),
            description=str(row["description"]),
            ref_id=str(row["ref_id"]) if str(row["ref_id"]).strip() else None,
            account_id=str(row.get("account_id", "ACC-GL-1010")),
            entity=str(row.get("entity", "RazorPay Global Inc")),
            gl_account=str(row.get("gl_account", "1010-Operating-Cash")),
        )
        for _, row in df_ledger.iterrows()
    ]

    ground_truth = {}
    if os.path.exists(gt_json_path):
        with open(gt_json_path, "r", encoding="utf-8") as f:
            ground_truth = json.load(f)

    return bank_transactions, ledger_entries, ground_truth
