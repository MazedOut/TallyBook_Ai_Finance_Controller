import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from app.config import settings
from app.models.user import User
from app.middleware.auth import get_current_user, require_role
from app.data.generator import generate_synthetic_dataset
from app.repository.memory import repo

router = APIRouter(prefix="/data", tags=["Data & Export"])

@router.post("/generate")
async def regenerate_dataset(current_user: User = Depends(require_role(["analyst", "controller", "admin"]))):
    result = generate_synthetic_dataset(settings.data_dir)
    return {
        "status": "success",
        "message": "Synthetic reconciliation dataset successfully regenerated with ground-truth mapping.",
        "details": result
    }

@router.get("/export/{run_id}/csv")
async def export_run_csv(run_id: str, current_user: User = Depends(get_current_user)):
    run = repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    matches = run.get("matches", [])
    export_rows = []
    for m in matches:
        m_dict = m if isinstance(m, dict) else m.dict()
        export_rows.append({
            "Match_ID": m_dict.get("id"),
            "Status": m_dict.get("status"),
            "Bank_Tx_ID": m_dict.get("bank_transaction_id"),
            "Bank_Date": m_dict.get("bank_date"),
            "Bank_Amount": m_dict.get("bank_amount"),
            "Bank_Description": m_dict.get("bank_description"),
            "Ledger_Entry_IDs": "; ".join(m_dict.get("ledger_entry_ids", [])),
            "Ledger_Date": m_dict.get("ledger_date"),
            "Ledger_Amount": m_dict.get("ledger_amount"),
            "Ledger_Description": "; ".join(m_dict.get("ledger_descriptions", [])),
            "Confidence": m_dict.get("confidence"),
            "Resolved_By": m_dict.get("resolved_by"),
            "Justification": m_dict.get("justification"),
            "Is_Ground_Truth_Correct": m_dict.get("is_ground_truth_correct")
        })

    df = pd.DataFrame(export_rows)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=tallybook_reconciliation_{run_id}.csv"
    return response

@router.get("/export/{run_id}/pdf")
async def export_run_pdf(run_id: str, current_user: User = Depends(get_current_user)):
    run = repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    scores = run.get("scores", {})
    matches = run.get("matches", [])
    exceptions = run.get("exceptions", [])

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        name="TitleStyle",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0a0a0a"),
        spaceAfter=8,
        fontName="Helvetica-Bold"
    )
    subtitle_style = ParagraphStyle(
        name="SubTitleStyle",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#737373"),
        spaceAfter=16,
        fontName="Helvetica"
    )

    elements.append(Paragraph("TALLYBOOK — RECONCILIATION AUDIT CERTIFICATE", title_style))
    elements.append(Paragraph(
        f"Batch Run ID: {run_id} &nbsp;|&nbsp; Certified at: {run.get('timestamp', '')} UTC &nbsp;|&nbsp; Auditor: {current_user.full_name}",
        subtitle_style
    ))
    elements.append(Spacer(1, 12))

    # KPI Summary Table
    kpi_data = [
        ["Claimed Match Rate", "Verified Accuracy", "Precision", "Recall", "F1 Score"],
        [
            f"{scores.get('claimed_match_rate_pct', 0)}%",
            f"{scores.get('verified_accuracy_pct', 0)}%",
            f"{round(scores.get('precision', 0) * 100, 1)}%",
            f"{round(scores.get('recall', 0) * 100, 1)}%",
            f"{round(scores.get('f1_score', 0) * 100, 1)}%"
        ],
        ["Total Matches", "Exceptions", "Rule Resolved", "AI Resolved", "Elapsed Time"],
        [
            str(len(matches)),
            str(len(exceptions)),
            str(scores.get("rule_resolved_count", 0)),
            str(scores.get("ai_resolved_count", 0)),
            f"{run.get('duration_ms', 0)} ms"
        ]
    ]

    t = Table(kpi_data, colWidths=[108, 108, 108, 108, 108])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f5f5f5")),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor("#f5f5f5")),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#0a0a0a")),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e5e5")),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 16))

    # Top Exceptions Sample
    elements.append(Paragraph("<b>Categorized Exceptions & What Would Resolve This:</b>", styles["Heading3"]))
    elements.append(Spacer(1, 6))

    exc_rows = [["ID", "Category", "Amount", "Aging", "Action Item / Resolution"]]
    for exc in exceptions[:8]:
        exc_dict = exc if isinstance(exc, dict) else exc.dict()
        exc_rows.append([
            exc_dict.get("id", ""),
            exc_dict.get("category", ""),
            f"${exc_dict.get('amount', 0.0):.2f}",
            f"{exc_dict.get('aging_days', 1)}d",
            exc_dict.get("what_would_resolve", "")[:45] + "..."
        ])

    exc_table = Table(exc_rows, colWidths=[80, 110, 65, 45, 240])
    exc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#171717")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#ffffff")),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e5e5")),
    ]))
    elements.append(exc_table)

    doc.build(elements)
    buffer.seek(0)

    response = StreamingResponse(buffer, media_type="application/pdf")
    response.headers["Content-Disposition"] = f"attachment; filename=tallybook_audit_certificate_{run_id}.pdf"
    return response
