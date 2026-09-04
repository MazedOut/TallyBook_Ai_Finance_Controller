import React, { useState, useMemo } from "react"
import { AlertCircle, CheckCircle2, Check, ArrowRight } from "lucide-react"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { formatCurrency } from "../../lib/utils"
import { useAuth } from "../../hooks/useAuth"
import type { ExceptionRecord } from "../../types"

interface ExceptionPanelProps {
  exceptions: ExceptionRecord[]
  onApproveException: (excId: string, action: "approve" | "write_off" | "escalate", notes: string) => Promise<void>
}

export const ExceptionPanel: React.FC<ExceptionPanelProps> = ({
  exceptions,
  onApproveException
}) => {
  const { isController } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [selectedExc, setSelectedExc] = useState<ExceptionRecord | null>(null)
  const [signOffNote, setSignOffNote] = useState("")
  const [isApproving, setIsApproving] = useState(false)

  const categories = [
    { id: "all", label: "All Differences", count: exceptions.length },
    { id: "duplicate_fee_noise", label: "Bank Charges & Fees", count: exceptions.filter(e => e.category === "duplicate_fee_noise").length },
    { id: "no_counterpart", label: "Missing from Ledger", count: exceptions.filter(e => e.category === "no_counterpart").length },
    { id: "split_payment_partial", label: "Partial / Split", count: exceptions.filter(e => e.category === "split_payment_partial").length },
    { id: "date_lag_possible", label: "Timing Differences", count: exceptions.filter(e => e.category === "date_lag_possible").length },
  ]

  const filteredExceptions = useMemo(() => {
    if (activeCategory === "all") return exceptions
    return exceptions.filter(e => e.category === activeCategory)
  }, [exceptions, activeCategory])

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "duplicate_fee_noise":
        return "Bank Fee / Charge"
      case "no_counterpart":
        return "Missing from Books"
      case "ambiguous_candidates":
        return "Multiple Candidates"
      case "split_payment_partial":
        return "Partial Payment"
      case "date_lag_possible":
        return "Timing Difference"
      case "unresolved_discrepancy":
        return "Open Difference"
      default:
        return cat.replace(/_/g, " ")
    }
  }

  const handleSignOff = async (action: "approve" | "write_off" | "escalate") => {
    if (!selectedExc) return
    setIsApproving(true)
    try {
      await onApproveException(
        selectedExc.id,
        action,
        signOffNote || `Controller adjustment executed via exception workflow.`
      )
      setSelectedExc(null)
      setSignOffNote("")
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Financial Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-[18px] border border-hairline overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[14px] text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat.id
                ? "bg-paper text-ink shadow-xs"
                : "text-mid-gray hover:text-ink"
            }`}
          >
            <span>{cat.label}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-canvas border border-hairline/80">
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Exception Items List */}
      <div className="space-y-3">
        {filteredExceptions.length === 0 ? (
          <div className="p-10 text-center bg-paper rounded-[24px] border border-hairline text-mid-gray text-[13.5px]">
            No outstanding discrepancies under this category.
          </div>
        ) : (
          filteredExceptions.map((exc) => {
            const isApproved = exc.status === "approved" || exc.status === "written_off"
            const isHighValue = exc.amount >= 10000 || exc.approval_required

            return (
              <div
                key={exc.id}
                className="p-5 rounded-[24px] bg-paper border border-hairline shadow-card transition-all hover:border-[#d4d4d4]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-hairline/60">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-mono uppercase bg-canvas px-2 py-0.5 rounded-[6px] border border-hairline text-mid-gray">
                      {exc.source_type === "bank" ? "Bank Feed" : "Ledger Entry"}
                    </span>
                    <span className="text-[12px] text-mid-gray font-mono">{exc.date}</span>
                    <Badge variant={isApproved ? "soft" : "ember"} size="sm">
                      {getCategoryLabel(exc.category)}
                    </Badge>
                    {isHighValue && !isApproved && (
                      <Badge variant="ember" size="sm">
                        Manager Sign-Off Required (&ge; $10k)
                      </Badge>
                    )}
                    {isApproved && (
                      <Badge variant="soft" size="sm">
                        Resolved & Posted
                      </Badge>
                    )}
                  </div>

                  <div className="font-mono text-[16px] font-bold text-ink">
                    {formatCurrency(exc.amount)}
                  </div>
                </div>

                <div className="py-3 space-y-1.5">
                  <div className="font-semibold text-ink text-[14px]">
                    {exc.description}
                  </div>
                  <div className="text-[13px] text-mid-gray leading-relaxed">
                    <span className="font-medium text-ink">Reason: </span>
                    {exc.reasoning || exc.what_would_resolve}
                  </div>
                  {exc.what_would_resolve && (
                    <div className="text-[12.5px] text-mid-gray bg-canvas p-2.5 rounded-[12px] border border-hairline/80 flex items-start gap-2">
                      <span className="font-medium text-ink shrink-0">Recommended Action:</span>
                      <span>{exc.what_would_resolve}</span>
                    </div>
                  )}
                </div>

                {/* Controller Action Row */}
                {!isApproved && (
                  <div className="pt-3 border-t border-hairline/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-[11.5px] text-mid-gray">
                      Ref ID: <span className="font-mono text-ink">{exc.transaction_id}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {selectedExc?.id === exc.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Adjustment note..."
                            value={signOffNote}
                            onChange={(e) => setSignOffNote(e.target.value)}
                            className="text-[12px] px-3 py-1.5 rounded-[14px] border border-hairline bg-canvas text-ink focus:outline-none focus:ring-1 focus:ring-ink w-48"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSignOff("approve")}
                            disabled={isApproving}
                          >
                            Confirm Entry
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedExc(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSignOff("write_off")}
                            disabled={isApproving}
                          >
                            Write Off Difference
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedExc(exc)}
                          >
                            Approve & Post Entry
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
