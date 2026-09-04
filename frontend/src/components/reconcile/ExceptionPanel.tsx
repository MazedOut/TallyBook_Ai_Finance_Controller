import React, { useState, useMemo } from "react"
import { AlertCircle, CheckCircle2, Clock, ArrowRight, Check, HelpCircle, FileEdit } from "lucide-react"
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
    { id: "all", label: "All Exceptions", count: exceptions.length },
    { id: "duplicate_fee_noise", label: "Duplicate & Fees", count: exceptions.filter(e => e.category === "duplicate_fee_noise").length },
    { id: "no_counterpart", label: "No Counterpart", count: exceptions.filter(e => e.category === "no_counterpart").length },
    { id: "split_payment_partial", label: "Split / Partial", count: exceptions.filter(e => e.category === "split_payment_partial").length },
    { id: "date_lag_possible", label: "Date Lag", count: exceptions.filter(e => e.category === "date_lag_possible").length },
  ]

  const filteredExceptions = useMemo(() => {
    if (activeCategory === "all") return exceptions
    return exceptions.filter(e => e.category === activeCategory)
  }, [exceptions, activeCategory])

  const handleSignOff = async (action: "approve" | "write_off" | "escalate") => {
    if (!selectedExc) return
    setIsApproving(true)
    try {
      await onApproveException(
        selectedExc.id,
        action,
        signOffNote || `Controller sign-off executed via exception workflow.`
      )
      setSelectedExc(null)
      setSignOffNote("")
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
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
          <div className="p-8 text-center bg-paper rounded-[24px] border border-hairline text-mid-gray">
            No exceptions found under this category.
          </div>
        ) : (
          filteredExceptions.map((exc) => {
            const isApproved = exc.status === "approved" || exc.status === "written_off"
            return (
              <div
                key={exc.id}
                className="p-5 rounded-[24px] bg-paper border border-hairline shadow-card transition-all hover:border-[#d4d4d4]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-hairline/60">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-mono uppercase bg-canvas px-2 py-0.5 rounded-[6px] border border-hairline text-mid-gray">
                      {exc.source_type} feed
                    </span>
                    <span className="font-mono text-[11px] text-mid-gray">{exc.transaction_id}</span>
                    <Badge variant={isApproved ? "soft" : "ember"} size="sm">
                      {exc.category.replace(/_/g, " ")}
                    </Badge>
                    {exc.approval_required && !isApproved && (
                      <Badge variant="ember" size="sm">
                        High-Value Sign-Off Required
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[12px] text-mid-gray">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Aging: {exc.aging_days}d</span>
                    </div>
                    <div className="text-[18px] font-semibold text-ink font-mono">
                      {formatCurrency(exc.amount)}
                    </div>
                  </div>
                </div>

                {/* Description & Diagnostic */}
                <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-mid-gray font-medium mb-1">
                      Transaction Description & Context
                    </div>
                    <div className="text-[14px] font-medium text-ink leading-snug">
                      {exc.description}
                    </div>
                    <div className="text-[12.5px] text-mid-gray mt-1 leading-relaxed">
                      {exc.reasoning}
                    </div>
                  </div>

                  {/* What would resolve this banner */}
                  <div className="p-3.5 rounded-[18px] bg-canvas border border-hairline/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-ink mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-ink" />
                        <span>What Would Resolve This</span>
                      </div>
                      <p className="text-[13px] text-ink leading-relaxed font-normal">
                        {exc.what_would_resolve}
                      </p>
                    </div>

                    {/* Controller Action */}
                    <div className="pt-2 flex items-center justify-between">
                      {isApproved ? (
                        <span className="text-[12px] font-medium text-ink flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-ink" />
                          Approved by {exc.approved_by}
                        </span>
                      ) : isController ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedExc(exc)}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          Sign-Off / Authorize
                        </Button>
                      ) : (
                        <span className="text-[11.5px] text-mid-gray italic">
                          Requires Controller role for sign-off
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Controller Sign-Off Modal */}
      {selectedExc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
          <div className="bg-paper rounded-[24px] border border-hairline p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-[18px] font-semibold text-ink">
              Controller Exception Sign-Off
            </h3>
            <p className="text-[13px] text-mid-gray">
              Authorize resolution or GL offset for record <span className="font-mono text-ink">{selectedExc.id}</span> ({formatCurrency(selectedExc.amount)}).
            </p>
            <textarea
              className="w-full rounded-[18px] bg-canvas border border-hairline p-3 text-[13.5px] outline-none placeholder:text-mid-gray"
              rows={3}
              placeholder="Enter resolution notes and compliance justification..."
              value={signOffNote}
              onChange={(e) => setSignOffNote(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedExc(null)}
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleSignOff("write_off")}
                disabled={isApproving}
              >
                Write-Off
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSignOff("approve")}
                disabled={isApproving}
              >
                Approve & Post GL Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
