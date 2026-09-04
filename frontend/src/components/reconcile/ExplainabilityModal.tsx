import React, { useState } from "react"
import { Modal } from "../ui/Modal"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { ConfidenceBar } from "./ConfidenceBar"
import { formatCurrency } from "../../lib/utils"
import { useAuth } from "../../hooks/useAuth"
import { 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  SlidersHorizontal,
  ChevronDown,
  Terminal,
  FileText
} from "lucide-react"
import type { MatchRecord } from "../../types"

interface ExplainabilityModalProps {
  match: MatchRecord | null
  isOpen: boolean
  onClose: () => void
  onOverride: (matchId: string, action: "accept" | "reject" | "reassign", reason: string) => Promise<void>
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  match,
  isOpen,
  onClose,
  onOverride
}) => {
  const { isAnalyst, isController } = useAuth()
  const [overrideReason, setOverrideReason] = useState("")
  const [showRawPrompt, setShowRawPrompt] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!match) return null

  const handleAction = async (action: "accept" | "reject") => {
    if (!overrideReason.trim()) {
      alert("Please provide an audit justification comment before saving an override.")
      return
    }
    setIsSubmitting(true)
    try {
      await onOverride(match.id, action, overrideReason)
      setOverrideReason("")
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAiResolved = match.resolved_by.startsWith("AI:")
  const isRuleResolved = match.resolved_by.startsWith("RULE:")
  const isManual = match.resolved_by.startsWith("MANUAL:")

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-2.5">
          <span>Explainability Trace & Ground Truth Verification</span>
          <Badge variant={isAiResolved ? "solid" : "soft"}>
            {isAiResolved ? "AI Reasoning Pass" : isRuleResolved ? "Deterministic Rule" : "Manual Override"}
          </Badge>
        </div>
      }
      description={`Record ID: ${match.id} • Run: ${match.run_id || "Live Batch"}`}
    >
      <div className="space-y-6">
        {/* Top Summary Metric Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-[18px] bg-canvas border border-hairline">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-mid-gray font-medium">Confidence Score</div>
            <div className="mt-1 flex items-center gap-2">
              <ConfidenceBar confidence={match.confidence} />
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-mid-gray font-medium">Resolution Engine</div>
            <div className="mt-1 font-mono text-[13px] font-semibold text-ink truncate">
              {match.rule_name || match.resolved_by}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-mid-gray font-medium">Ground Truth Audit</div>
            <div className="mt-1 flex items-center gap-1.5">
              {match.is_ground_truth_correct === true && (
                <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink">
                  <CheckCircle2 className="w-4 h-4 text-ink" /> Verified True Positive
                </span>
              )}
              {match.is_ground_truth_correct === false && (
                <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ember">
                  <AlertCircle className="w-4 h-4 text-ember" /> False Match Detected
                </span>
              )}
              {match.is_ground_truth_correct === undefined && (
                <span className="text-[12.5px] text-mid-gray">Self-Graded</span>
              )}
            </div>
          </div>
        </div>

        {/* Side-by-side Feed Comparison */}
        <div>
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-mid-gray mb-2">
            Counterpart Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Side */}
            <div className="p-4 rounded-[18px] bg-paper border border-hairline shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                <span className="text-[12px] font-semibold text-ink uppercase tracking-wide">Bank Feed</span>
                <span className="font-mono text-[11px] text-mid-gray">{match.bank_transaction_id}</span>
              </div>
              <div className="text-[20px] font-semibold text-ink tracking-tight">
                {formatCurrency(match.bank_amount)}
              </div>
              <div className="text-[13px] text-ink font-medium leading-snug">
                {match.bank_description}
              </div>
              <div className="text-[12px] text-mid-gray flex items-center justify-between pt-1">
                <span>Date: {match.bank_date}</span>
                <span className="font-mono text-[11px]">Ref: {match.bank_ref_id || "None"}</span>
              </div>
            </div>

            {/* Ledger Side */}
            <div className="p-4 rounded-[18px] bg-paper border border-hairline shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                <span className="text-[12px] font-semibold text-ink uppercase tracking-wide">Ledger Entry</span>
                <span className="font-mono text-[11px] text-mid-gray">{match.ledger_entry_ids.join(", ")}</span>
              </div>
              <div className="text-[20px] font-semibold text-ink tracking-tight flex items-center justify-between">
                <span>{formatCurrency(match.ledger_amount)}</span>
                {match.amount_delta !== 0 && (
                  <span className="text-[12px] font-mono font-normal text-mid-gray bg-canvas px-2 py-0.5 rounded-[6px] border border-hairline">
                    &Delta; ${match.amount_delta.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-[13px] text-ink font-medium leading-snug">
                {match.ledger_descriptions.join(" + ")}
              </div>
              <div className="text-[12px] text-mid-gray flex items-center justify-between pt-1">
                <span>Date: {match.ledger_date}</span>
                <span className="font-mono text-[11px]">Ref: {match.ledger_ref_ids.join(", ") || "None"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Reasoning & Justification */}
        <div className="p-4 rounded-[18px] bg-canvas border border-hairline space-y-2">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink uppercase tracking-wider">
            <FileText className="w-4 h-4 text-ink" />
            <span>AI Reasoning & Evidence Justification</span>
          </div>
          <p className="text-[14px] text-ink leading-relaxed">
            {match.justification}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {match.flags.map((flag, idx) => (
              <Badge key={idx} variant="outline" size="sm" className="font-mono text-[11px]">
                #{flag}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI Prompt & Raw JSON Inspector (Expandable) */}
        {isAiResolved && (
          <div className="border border-hairline rounded-[18px] overflow-hidden">
            <button
              onClick={() => setShowRawPrompt(!showRawPrompt)}
              className="w-full flex items-center justify-between px-4 py-3 bg-canvas text-left text-[13px] font-medium text-ink cursor-pointer hover:bg-canvas/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-mid-gray" />
                <span>View Full AI Inference Prompt & Structured Output</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-mid-gray transition-transform ${showRawPrompt ? "rotate-180" : ""}`} />
            </button>

            {showRawPrompt && (
              <div className="p-4 bg-[#0a0a0a] text-[#fafafa] font-mono text-[12px] space-y-4 max-h-64 overflow-y-auto">
                <div>
                  <div className="text-mid-gray text-[11px] mb-1">// PROMPT SENT TO AI REASONING LAYER</div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-[#e5e5e5]">
                    {match.ai_prompt || "Standard structured reconciliation prompt"}
                  </pre>
                </div>
                {match.ai_response && (
                  <div className="pt-2 border-t border-hairline/30">
                    <div className="text-mid-gray text-[11px] mb-1">// STRUCTURED JSON RETURNED</div>
                    <pre className="text-emerald-400">
                      {JSON.stringify(match.ai_response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual Override Action for Analyst / Controller */}
        {isAnalyst && (
          <div className="p-4 rounded-[18px] border border-hairline bg-paper space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">Controller / Analyst Override</span>
              <span className="text-[11px] text-mid-gray">Every override is logged in the immutable audit trail</span>
            </div>
            <input
              type="text"
              placeholder="Reason for manual override (mandatory for compliance)..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="input-field w-full"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction("reject")}
                disabled={isSubmitting || !overrideReason.trim()}
              >
                Reject Match & Escalate
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction("accept")}
                disabled={isSubmitting || !overrideReason.trim()}
              >
                Accept & Confirm Match
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
