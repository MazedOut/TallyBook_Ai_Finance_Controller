import React, { useState } from "react"
import { GitCompare, AlertCircle, FileSpreadsheet, FileText, Download, Play, RotateCw } from "lucide-react"
import { MatchTable } from "../components/reconcile/MatchTable"
import { ExceptionPanel } from "../components/reconcile/ExceptionPanel"
import { ExplainabilityModal } from "../components/reconcile/ExplainabilityModal"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { api } from "../lib/api"
import type { ReconciliationRun, MatchRecord } from "../types"

interface ReconcileProps {
  currentRun: ReconciliationRun | null
  onRunBatch: () => void
  isRunning: boolean
}

export const Reconcile: React.FC<ReconcileProps> = ({
  currentRun,
  onRunBatch,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<"matches" | "exceptions">("matches")
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const matches = currentRun?.matches || []
  const exceptions = currentRun?.exceptions || []
  const runId = currentRun?.run_id || "CURRENT"

  const handleSelectMatch = (match: MatchRecord) => {
    setSelectedMatch(match)
    setIsModalOpen(true)
  }

  const handleOverride = async (matchId: string, action: "accept" | "reject" | "reassign", reason: string) => {
    await api.matches.override(matchId, action, reason)
    // Update local record
    if (selectedMatch && selectedMatch.id === matchId) {
      setSelectedMatch({
        ...selectedMatch,
        status: action === "accept" ? "accepted" : "rejected",
        resolved_by: "MANUAL:OVERRIDE",
        override_reason: reason
      })
    }
  }

  const handleApproveException = async (excId: string, action: "approve" | "write_off" | "escalate", notes: string) => {
    await api.exceptions.approve(excId, action, notes)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-hairline/60">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink">
            Transaction Matching
          </h2>
          <p className="text-[13px] text-mid-gray mt-0.5">
            Automated verification across bank statements and company ledger records.
          </p>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentRun?.run_id && (
            <>
              <a
                href={api.data.getCsvExportUrl(currentRun.run_id)}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-hairline bg-paper text-[13px] font-medium text-ink hover:bg-canvas transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
              <a
                href={api.data.getPdfExportUrl(currentRun.run_id)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-hairline bg-paper text-[13px] font-medium text-ink hover:bg-canvas transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Report (PDF)</span>
              </a>
            </>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onRunBatch}
            disabled={isRunning}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            {isRunning ? "Matching..." : "Auto-Match Now"}
          </Button>
        </div>
      </div>

      {/* Primary Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-hairline/80 pb-3">
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-[14px] font-medium transition-all cursor-pointer ${
            activeTab === "matches"
              ? "bg-ink text-paper shadow-xs"
              : "bg-canvas text-mid-gray hover:text-ink"
          }`}
        >
          <GitCompare className="w-4 h-4" />
          <span>Matched Records</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-paper/20">
            {matches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("exceptions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-[14px] font-medium transition-all cursor-pointer ${
            activeTab === "exceptions"
              ? "bg-ink text-paper shadow-xs"
              : "bg-canvas text-mid-gray hover:text-ink"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Unmatched Items</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-paper/20">
            {exceptions.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "matches" ? (
        <MatchTable
          matches={matches}
          onSelectMatch={handleSelectMatch}
        />
      ) : (
        <ExceptionPanel
          exceptions={exceptions}
          onApproveException={handleApproveException}
        />
      )}

      {/* Drill-down Explainability Modal */}
      <ExplainabilityModal
        match={selectedMatch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOverride={handleOverride}
      />
    </div>
  )
}
