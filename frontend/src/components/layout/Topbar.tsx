import React from "react"
import { Play, Sparkles, Database, ChevronRight, LogOut } from "lucide-react"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { useAuth } from "../../hooks/useAuth"

interface TopbarProps {
  currentTab: string
  onRunBatch: () => void
  isRunning: boolean
  latestRunId?: string
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onRunBatch,
  isRunning,
  latestRunId,
}) => {
  const { role, isDemoMode, logout } = useAuth()

  const tabLabels: Record<string, string> = {
    dashboard: "Executive Overview",
    reconcile: "Batch Reconciliation & Exceptions",
    "what-if": "What-If & Live Injection Simulator",
    stats: "AI Engine Performance & Honest Calibration",
    approvals: "Controller Sign-Offs",
    audit: "Immutable Ledger Audit Trail",
    periods: "Accounting Periods & Period Lock",
    admin: "Settings & Governance",
  }

  return (
    <header className="h-16 border-b border-hairline/70 bg-paper/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb Trail (Typographic hierarchy only per DESIGN.md) */}
      <div className="flex items-center gap-2 text-[14px]">
        <span className="text-mid-gray font-normal">Tallybook</span>
        <ChevronRight className="w-3.5 h-3.5 text-mid-gray/70" />
        <span className="font-medium text-ink">{tabLabels[currentTab] || "Workspace"}</span>
        {latestRunId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-mid-gray/70" />
            <span className="font-mono text-[11px] text-mid-gray bg-canvas px-2 py-0.5 rounded-[6px] border border-hairline">
              {latestRunId}
            </span>
          </>
        )}
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <Badge variant="soft" size="sm" className="font-mono text-[11px] border border-hairline">
            DEMO MODE
          </Badge>
        )}

        {/* Dataset status */}
        <div className="hidden lg:flex items-center gap-2 text-[12px] text-mid-gray bg-canvas px-3 py-1.5 rounded-[18px] border border-hairline">
          <Database className="w-3.5 h-3.5 text-ink" />
          <span>75 Bank Feed &bull; 79 Ledger</span>
        </div>

        {/* AI Engine Status (generic - no specific model name) */}
        <div className="hidden sm:flex items-center gap-1.5 text-[12px] bg-canvas px-3 py-1.5 rounded-[18px] border border-hairline">
          <Sparkles className="w-3.5 h-3.5 text-ink" />
          <span className="font-medium text-ink">AI Reasoning Engine &bull; Active</span>
        </div>

        {/* Run Batch Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={onRunBatch}
          disabled={isRunning}
          icon={<Play className={`w-3.5 h-3.5 ${isRunning ? "animate-pulse" : ""}`} />}
        >
          {isRunning ? "Reconciling..." : "Run Reconciliation"}
        </Button>

        {/* Sign Out / Exit Session */}
        <button
          onClick={logout}
          title="Sign out or exit demo"
          className="p-2 rounded-[18px] text-mid-gray hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
