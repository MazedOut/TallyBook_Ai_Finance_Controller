import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Database,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  HelpCircle,
  Copy
} from "lucide-react"
import { api } from "../../lib/api"
import { Badge } from "../ui/Badge"
import type { ImportPreviewResult, ColumnMapping } from "../../types"

interface ImportSheetProps {
  isOpen: boolean
  onClose: () => void
  initialSourceType?: "bank" | "ledger"
  onSuccess: () => void
}

const SAMPLE_CSV = `Date,Description,Amount,Reference,Account
2026-03-01,Stripe Settlement Payout,12500.00,STR-9941,CHASE-9901
2026-03-02,AWS Cloud Infrastructure,-1840.50,INV-AWS-2026-03,CHASE-9901
2026-03-03,Salesforce Enterprise Annual,-14200.00,SFDC-88192,CHASE-9901
2026-03-03,Client Wire - Apex Global,8500.00,WIRE-APX-301,CHASE-9901
2026-03-04,Google Workspace Suite,-340.00,GSUITE-4401,CHASE-9901
2026-03-05,Payroll Tax Sweep,-24100.00,TAX-PAY-0305,CHASE-9901
2026-03-05,Merchant Reserve Release,3200.00,RES-REL-110,CHASE-9901`

export const ImportSheet: React.FC<ImportSheetProps> = ({
  isOpen,
  onClose,
  initialSourceType = "bank",
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [sourceType, setSourceType] = useState<"bank" | "ledger">(initialSourceType)
  const [fileName, setFileName] = useState<string>("")
  const [rawContent, setRawContent] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [isCommitting, setIsCommitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Preview and mapping state
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: "",
    description: "",
    amount: "",
    ref_id: "",
    account_id: "",
  })
  const [commitMode, setCommitMode] = useState<"append" | "replace">("append")
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setRawContent(content)
      analyzeContent(content, file.name, sourceType)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    const sampleName = sourceType === "bank" ? "chase_bank_batch_march.csv" : "netsuite_gl_batch_march.csv"
    setFileName(sampleName)
    setRawContent(SAMPLE_CSV)
    analyzeContent(SAMPLE_CSV, sampleName, sourceType)
  }

  const analyzeContent = async (content: string, name: string, type: "bank" | "ledger") => {
    setIsAnalyzing(true)
    setErrorMsg(null)
    try {
      const result = await api.data.previewImport({
        raw_content: content,
        file_name: name,
        source_type: type,
      })
      setPreviewResult(result)
      setMapping(result.suggested_mapping || {
        date: result.detected_columns[0] || "",
        description: result.detected_columns[1] || "",
        amount: result.detected_columns[2] || "",
        ref_id: result.detected_columns[3] || "",
        account_id: result.detected_columns[4] || "",
      })
      setStep(2)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to analyze document format.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCommit = async () => {
    if (!previewResult) return
    setIsCommitting(true)
    setErrorMsg(null)
    try {
      await api.data.confirmImport({
        file_name: fileName || "imported_dataset.csv",
        source_type: sourceType,
        mode: commitMode,
        mapping: mapping as Record<string, string>,
        raw_content: rawContent,
        run_reconciliation_now: true,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to commit import.")
    } finally {
      setIsCommitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 bg-black/35 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-paper rounded-[24px] border border-hairline overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* macOS Sheet Title Bar */}
        <div className="h-14 px-6 border-b border-hairline bg-paper/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-electric-blue/10 text-electric-blue flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-primary-ink tracking-tight">
                Import Financial Data
              </h2>
              <p className="text-[11.5px] text-mid-gray">
                Sniff, map, validate, and detect duplicates against active books
              </p>
            </div>
          </div>

          {/* Step Indicator Pills */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-mid-gray">
            <span className={`px-2 py-0.5 rounded-full ${step === 1 ? "bg-primary-ink text-paper" : "bg-canvas"}`}>
              1. Source
            </span>
            <span className="text-mid-gray/40">&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 2 ? "bg-primary-ink text-paper" : "bg-canvas"}`}>
              2. Map
            </span>
            <span className="text-mid-gray/40">&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 3 ? "bg-primary-ink text-paper" : "bg-canvas"}`}>
              3. Scorecard
            </span>
            <span className="text-mid-gray/40">&rarr;</span>
            <span className={`px-2 py-0.5 rounded-full ${step === 4 ? "bg-primary-ink text-paper" : "bg-canvas"}`}>
              4. Review
            </span>

            <button
              onClick={onClose}
              className="ml-4 w-7 h-7 rounded-full bg-cool-wash hover:bg-mid-gray/20 text-mid-gray hover:text-primary-ink flex items-center justify-center cursor-pointer transition-colors text-[14px]"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-[#ff3b30]/10 border-b border-[#ff3b30]/20 px-6 py-2.5 flex items-center gap-2 text-[12px] text-[#c92a20]">
            <XCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Sheet Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: SOURCE & FILE SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Target dataset selector */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray mb-2 block">
                  Select Target Ledger / Destination
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSourceType("bank")}
                    className={`p-4 rounded-[18px] border text-left transition-all cursor-pointer ${
                      sourceType === "bank"
                        ? "border-electric-blue bg-electric-blue/5 ring-1 ring-electric-blue/30"
                        : "border-hairline bg-canvas hover:bg-cool-wash"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13.5px] font-semibold text-primary-ink">Bank Statement Feed</span>
                      {sourceType === "bank" && <Check className="w-4 h-4 text-electric-blue" />}
                    </div>
                    <p className="text-[11.5px] text-mid-gray">
                      Appends to Chase Operating transactions for statement reconciliation.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceType("ledger")}
                    className={`p-4 rounded-[18px] border text-left transition-all cursor-pointer ${
                      sourceType === "ledger"
                        ? "border-electric-blue bg-electric-blue/5 ring-1 ring-electric-blue/30"
                        : "border-hairline bg-canvas hover:bg-cool-wash"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13.5px] font-semibold text-primary-ink">General Ledger Entries</span>
                      {sourceType === "ledger" && <Check className="w-4 h-4 text-electric-blue" />}
                    </div>
                    <p className="text-[11.5px] text-mid-gray">
                      Appends to internal ERP journal vouchers (GL-1010 Cash Account).
                    </p>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray mb-2 block">
                  Upload Statement File (CSV, TSV, or JSON)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.tsv,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-hairline rounded-[22px] p-10 flex flex-col items-center justify-center bg-canvas hover:bg-cool-wash/50 hover:border-mid-gray/40 transition-all cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-paper border border-hairline flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-electric-blue">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-[14px] font-medium text-primary-ink mb-1">
                    Click to choose file or drag and drop here
                  </div>
                  <div className="text-[12px] text-mid-gray">
                    Supports comma-delimited CSV, tab-separated TSV, and JSON formats up to 10MB
                  </div>
                </div>
              </div>

              {/* Instant Sample Loader */}
              <div className="flex items-center justify-between p-4 rounded-[18px] bg-canvas border border-hairline">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-mid-gray" />
                  <div>
                    <div className="text-[13px] font-medium text-primary-ink">No CSV file on hand?</div>
                    <div className="text-[11.5px] text-mid-gray">
                      Load our standard test batch with real wire, payroll, and SaaS transactions
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  disabled={isAnalyzing}
                  className="px-4 py-1.5 rounded-full bg-paper border border-hairline hover:bg-cool-wash text-[12px] font-medium text-primary-ink transition-colors cursor-pointer"
                >
                  {isAnalyzing ? "Sniffing..." : "Load Sample CSV"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AUTOMATED & MANUAL COLUMN MAPPING */}
          {step === 2 && previewResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <h3 className="text-[14px] font-semibold text-primary-ink">Field Mapping</h3>
                  <p className="text-[12px] text-mid-gray">
                    File: <span className="font-mono text-primary-ink">{fileName}</span> ({previewResult.detected_columns.length} columns detected)
                  </p>
                </div>
                <Badge variant="soft" size="sm">
                  {previewResult.total_rows} rows sniffed
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="p-3.5 rounded-[16px] bg-canvas border border-hairline space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-primary-ink">Transaction Date *</span>
                    <span className="text-[10px] text-electric-blue font-mono">ISO or MM/DD/YYYY</span>
                  </div>
                  <select
                    value={mapping.date}
                    onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                    className="w-full h-9 rounded-[10px] bg-paper border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue cursor-pointer"
                  >
                    <option value="">-- Select Column --</option>
                    {previewResult.detected_columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="p-3.5 rounded-[16px] bg-canvas border border-hairline space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-primary-ink">Description / Memo *</span>
                    <span className="text-[10px] text-mid-gray font-mono">Counterparty name</span>
                  </div>
                  <select
                    value={mapping.description}
                    onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                    className="w-full h-9 rounded-[10px] bg-paper border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue cursor-pointer"
                  >
                    <option value="">-- Select Column --</option>
                    {previewResult.detected_columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div className="p-3.5 rounded-[16px] bg-canvas border border-hairline space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-primary-ink">Amount ($ USD) *</span>
                    <span className="text-[10px] text-electric-blue font-mono">Signed (+ / -)</span>
                  </div>
                  <select
                    value={mapping.amount}
                    onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                    className="w-full h-9 rounded-[10px] bg-paper border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue cursor-pointer"
                  >
                    <option value="">-- Select Column --</option>
                    {previewResult.detected_columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Reference ID */}
                <div className="p-3.5 rounded-[16px] bg-canvas border border-hairline space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-primary-ink">Reference ID (Optional)</span>
                    <span className="text-[10px] text-mid-gray font-mono">Check # / Ref</span>
                  </div>
                  <select
                    value={mapping.ref_id || ""}
                    onChange={(e) => setMapping({ ...mapping, ref_id: e.target.value })}
                    className="w-full h-9 rounded-[10px] bg-paper border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue cursor-pointer"
                  >
                    <option value="">-- Autogenerate if blank --</option>
                    {previewResult.detected_columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mapping helper note */}
              <div className="p-3 rounded-[14px] bg-cool-wash/50 border border-hairline flex items-center gap-2.5 text-[12px] text-mid-gray">
                <HelpCircle className="w-4 h-4 text-mid-gray shrink-0" />
                <span>Our AI column parser has automatically inferred the best matching fields above. Adjust if needed.</span>
              </div>
            </div>
          )}

          {/* STEP 3: VALIDATION & DUPLICATE SCORECARD */}
          {step === 3 && previewResult && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[14px] font-semibold text-primary-ink">Validation & Duplication Scorecard</h3>
                <p className="text-[12px] text-mid-gray">
                  Cross-referenced against current SQLite ledger records
                </p>
              </div>

              {/* 4 Key Metric Tiles */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 rounded-[18px] bg-canvas border border-hairline text-center">
                  <div className="text-[11px] font-semibold text-mid-gray uppercase tracking-wider mb-1">
                    Total Rows
                  </div>
                  <div className="text-[24px] font-bold tracking-tight text-primary-ink">
                    {previewResult.total_rows}
                  </div>
                </div>

                <div className="p-4 rounded-[18px] bg-canvas border border-hairline text-center">
                  <div className="text-[11px] font-semibold text-mid-gray uppercase tracking-wider mb-1">
                    Valid Records
                  </div>
                  <div className="text-[24px] font-bold tracking-tight text-[#34c759]">
                    {previewResult.valid_rows_count}
                  </div>
                </div>

                <div className="p-4 rounded-[18px] bg-canvas border border-hairline text-center">
                  <div className="text-[11px] font-semibold text-mid-gray uppercase tracking-wider mb-1">
                    Duplicates
                  </div>
                  <div className={`text-[24px] font-bold tracking-tight ${
                    previewResult.duplicate_count > 0 ? "text-[#ff9500]" : "text-mid-gray"
                  }`}>
                    {previewResult.duplicate_count}
                  </div>
                </div>

                <div className="p-4 rounded-[18px] bg-canvas border border-hairline text-center">
                  <div className="text-[11px] font-semibold text-mid-gray uppercase tracking-wider mb-1">
                    Warnings/Errors
                  </div>
                  <div className={`text-[24px] font-bold tracking-tight ${
                    previewResult.error_count > 0 ? "text-[#ff3b30]" : "text-mid-gray"
                  }`}>
                    {previewResult.error_count + previewResult.warning_count}
                  </div>
                </div>
              </div>

              {/* Warnings and Duplicate List */}
              {previewResult.warnings && previewResult.warnings.length > 0 ? (
                <div className="p-4 rounded-[18px] bg-[#ff9500]/5 border border-[#ff9500]/20 space-y-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-[#b86200]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Audit Notice & Duplicate Warnings ({previewResult.warnings.length}):</span>
                  </div>
                  <ul className="text-[11.5px] text-[#8f4d00] space-y-1 list-disc list-inside">
                    {previewResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-[18px] bg-[#34c759]/5 border border-[#34c759]/20 flex items-center gap-2.5 text-[12.5px] text-[#1f8738]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All records passed syntax, currency normalization, and duplicate integrity checks.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PREVIEW TABLE & COMMIT SETTINGS */}
          {step === 4 && previewResult && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[14px] font-semibold text-primary-ink">Preview & Ingestion Mode</h3>
                <p className="text-[12px] text-mid-gray">
                  Review the mapped records before committing to the active ledger
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="p-4 rounded-[18px] bg-canvas border border-hairline space-y-2">
                <div className="text-[12px] font-semibold text-primary-ink">Commit Strategy:</div>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setCommitMode("append")}
                    className={`p-3 rounded-[14px] border flex items-center gap-3 cursor-pointer transition-colors ${
                      commitMode === "append"
                        ? "bg-paper border-electric-blue ring-1 ring-electric-blue/30"
                        : "bg-canvas border-hairline hover:bg-cool-wash"
                    }`}
                  >
                    <input
                      type="radio"
                      name="commitMode"
                      checked={commitMode === "append"}
                      onChange={() => setCommitMode("append")}
                      className="accent-electric-blue"
                    />
                    <div>
                      <div className="text-[12.5px] font-semibold text-primary-ink">Append to Active Books</div>
                      <div className="text-[11px] text-mid-gray">Keeps existing data, merges new batch</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setCommitMode("replace")}
                    className={`p-3 rounded-[14px] border flex items-center gap-3 cursor-pointer transition-colors ${
                      commitMode === "replace"
                        ? "bg-paper border-[#ff3b30] ring-1 ring-[#ff3b30]/30"
                        : "bg-canvas border-hairline hover:bg-cool-wash"
                    }`}
                  >
                    <input
                      type="radio"
                      name="commitMode"
                      checked={commitMode === "replace"}
                      onChange={() => setCommitMode("replace")}
                      className="accent-[#ff3b30]"
                    />
                    <div>
                      <div className="text-[12.5px] font-semibold text-primary-ink">Replace Entire Dataset</div>
                      <div className="text-[11px] text-[#c92a20]">Clears existing records & resets with this batch</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Data preview table */}
              <div className="border border-hairline rounded-[18px] overflow-hidden bg-paper">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-[12px] text-left border-collapse">
                    <thead className="bg-canvas border-b border-hairline sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold text-mid-gray">Date</th>
                        <th className="py-2.5 px-3 font-semibold text-mid-gray">Description</th>
                        <th className="py-2.5 px-3 font-semibold text-mid-gray text-right">Amount</th>
                        <th className="py-2.5 px-3 font-semibold text-mid-gray">Reference</th>
                        <th className="py-2.5 px-3 font-semibold text-mid-gray">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {previewResult.preview_rows.slice(0, 10).map((row, idx) => {
                        const dateVal = mapping.date ? row[mapping.date] : "—"
                        const descVal = mapping.description ? row[mapping.description] : "—"
                        const rawAmount = mapping.amount ? row[mapping.amount] : "0"
                        const amountVal = parseFloat(String(rawAmount || "0").replace(/[^0-9.-]/g, ""))
                        const refVal = (mapping.ref_id && row[mapping.ref_id]) || `AUTO-${idx + 1}`

                        return (
                          <tr key={idx} className="hover:bg-cool-wash/30">
                            <td className="py-2 px-3 font-mono text-[11.5px] text-mid-gray">
                              {dateVal || "—"}
                            </td>
                            <td className="py-2 px-3 font-medium text-primary-ink truncate max-w-xs">
                              {descVal || "—"}
                            </td>
                            <td className={`py-2 px-3 font-mono text-right font-medium ${
                              amountVal < 0 ? "text-primary-ink" : "text-[#34c759]"
                            }`}>
                              {isNaN(amountVal) ? "—" : (amountVal >= 0 ? `+$${amountVal.toFixed(2)}` : `-$${Math.abs(amountVal).toFixed(2)}`)}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-mid-gray">
                              {refVal}
                            </td>
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1 text-[10.5px] text-[#1f8738] bg-[#34c759]/10 px-2 py-0.5 rounded-full font-medium">
                                <Check className="w-3 h-3" /> Valid
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {previewResult.preview_rows.length > 10 && (
                  <div className="py-2 px-3 bg-canvas text-center text-[11px] text-mid-gray border-t border-hairline">
                    Showing first 10 of {previewResult.preview_rows.length} records.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* macOS Bottom Action Bar */}
        <div className="h-16 px-6 border-t border-hairline bg-paper flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-full border border-hairline hover:bg-cool-wash text-[12.5px] font-medium text-primary-ink flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-hairline hover:bg-cool-wash text-[12.5px] font-medium text-mid-gray hover:text-primary-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                disabled={!rawContent || isAnalyzing}
                onClick={() => previewResult && setStep(2)}
                className="px-5 py-2 rounded-full bg-electric-blue text-paper text-[12.5px] font-medium hover:bg-[#0077ed] disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
              >
                <span>Continue to Column Mapping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                disabled={!mapping.date || !mapping.description || !mapping.amount}
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-full bg-electric-blue text-paper text-[12.5px] font-medium hover:bg-[#0077ed] disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
              >
                <span>Validate & Check Duplicates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2 rounded-full bg-electric-blue text-paper text-[12.5px] font-medium hover:bg-[#0077ed] transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
              >
                <span>Review & Commit Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                disabled={isCommitting}
                onClick={handleCommit}
                className="px-6 py-2 rounded-full bg-electric-blue text-paper text-[12.5px] font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-none"
              >
                {isCommitting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing & Reconciling...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Commit Import & Reconcile Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
