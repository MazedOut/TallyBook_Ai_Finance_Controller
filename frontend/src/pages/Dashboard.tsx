import React from "react"
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  DollarSign, 
  Building2, 
  BookOpen, 
  ArrowUpRight, 
  ShieldCheck 
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { formatCurrency } from "../lib/utils"
import { api } from "../lib/api"
import { useWorkspace } from "../hooks/useWorkspace"
import { getWorkspaceData } from "../lib/workspaceData"
import type { ReconciliationRun, MatchRecord, ExceptionRecord } from "../types"

interface DashboardProps {
  currentRun: ReconciliationRun | null
  onNavigate: (tab: string) => void
  onRunBatch: () => void
  isRunning: boolean
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentRun,
  onNavigate,
  onRunBatch,
  isRunning,
}) => {
  const { activeWorkspace } = useWorkspace()
  const wsData = getWorkspaceData(activeWorkspace.id)

  const scores = currentRun?.scores
  const matches = currentRun?.matches || []
  const exceptions = currentRun?.exceptions || []

  // Use real data when available, fall back to workspace synthetic data
  const matchRate = scores?.claimed_match_rate_pct || wsData.matchRate
  const reconciledVolume = matches.length > 0
    ? matches.reduce((acc, m) => acc + (m.bank_amount || 0), 0)
    : wsData.reconciledVolume
  const exceptionsVolume = exceptions.length > 0
    ? exceptions.reduce((acc, e) => acc + (e.amount || 0), 0)
    : wsData.exceptionsVolume
  const matchCount = matches.length || wsData.matchCount
  const exceptionCount = exceptions.length || wsData.exceptionCount
  const highValuePending = exceptions.filter(e => e.amount >= 10000 || e.approval_required).length || wsData.highValuePending

  const recentMatches = matches.slice(0, 3)
  const recentExceptions = exceptions.slice(0, 3)

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-8">

      {/* ── Clean KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="stat-label flex items-center justify-between">
            <span>Match Rate</span>
            <CheckCircle2 className="w-4 h-4 text-mid-gray" />
          </div>
          <div className="stat-value">{matchRate.toFixed(1)}%</div>
          <div className="text-[12px] text-mid-gray mt-2 flex items-center gap-1.5">
            <span>{matchCount} transactions matched</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label flex items-center justify-between">
            <span>Verified Cash Total</span>
            <TrendingUp className="w-4 h-4 text-mid-gray" />
          </div>
          <div className="stat-value font-mono text-[24px]">{formatCurrency(reconciledVolume)}</div>
          <div className="text-[12px] text-mid-gray mt-2 flex items-center gap-1.5 truncate">
            <span>Matched with Company Books</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label flex items-center justify-between">
            <span>Unmatched Difference</span>
            <AlertCircle className="w-4 h-4 text-ember" />
          </div>
          <div className="stat-value font-mono text-[24px] text-ember">{formatCurrency(exceptionsVolume)}</div>
          <div className="text-[12px] text-mid-gray mt-2 flex items-center gap-1.5">
            <span>{exceptionCount} items needing review</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label flex items-center justify-between">
            <span>Items Needing Sign-Off</span>
            <ShieldCheck className="w-4 h-4 text-mid-gray" />
          </div>
          <div className="stat-value">{highValuePending}</div>
          <div className="text-[12px] text-mid-gray mt-2 flex items-center gap-1.5">
            <span>High-value items ≥ $10,000</span>
          </div>
        </div>
      </div>

      {/* ── Balance Alignment Strip ── */}
      <Card className="border-hairline bg-paper">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bank vs Company Books</CardTitle>
              <CardDescription>
                {activeWorkspace.bankLabel} vs {activeWorkspace.glLabel} — {wsData.periodName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {currentRun?.run_id && (
                <>
                  <a
                    href={api.data.getCsvExportUrl(currentRun.run_id)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-hairline bg-paper text-[12px] font-medium text-ink hover:bg-canvas transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-mid-gray" />
                    <span>CSV</span>
                  </a>
                  <a
                    href={api.data.getPdfExportUrl(currentRun.run_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-hairline bg-paper text-[12px] font-medium text-ink hover:bg-canvas transition-colors"
                  >
                    <FileText className="w-4 h-4 text-mid-gray" />
                    <span>PDF</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 p-4 rounded-[18px] bg-canvas border border-hairline">
            <div className="space-y-1">
              <div className="text-[11px] text-mid-gray uppercase font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-mid-gray" />
                <span>Bank Account Total</span>
              </div>
              <div className="text-[22px] font-mono font-bold text-ink">
                {formatCurrency(reconciledVolume + exceptionsVolume)}
              </div>
              <div className="text-[11px] text-mid-gray">{activeWorkspace.bankAccount}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] text-mid-gray uppercase font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-mid-gray" />
                <span>Company Books Total</span>
              </div>
              <div className="text-[22px] font-mono font-bold text-ink">
                {formatCurrency(reconciledVolume)}
              </div>
              <div className="text-[11px] text-mid-gray">{activeWorkspace.entityName} · {activeWorkspace.glAccount}</div>
            </div>
          </div>
          {exceptionsVolume > 0 && (
            <div className="mt-3 px-4 py-2.5 rounded-[14px] bg-canvas border border-hairline flex items-center justify-between">
              <div className="text-[12.5px] text-ink flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-ember" />
                <span><strong>{formatCurrency(exceptionsVolume)}</strong> difference across {exceptionCount} unmatched items</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate("reconcile")}>
                Review Unmatched
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Two Column: Recent Activity + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left 3 cols: Recent Cleared */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recently Matched</CardTitle>
                  <CardDescription>Latest transactions verified against company books</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate("reconcile")}>
                  View All ({matchCount})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="divide-y divide-hairline/60">
                  {recentMatches.map((m: MatchRecord) => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[13.5px] text-ink truncate">{m.bank_description}</div>
                        <div className="text-[11.5px] text-mid-gray mt-0.5">{m.bank_date}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-[13.5px] font-semibold text-ink">{formatCurrency(m.bank_amount)}</div>
                        <div className="text-[11px] text-mid-gray mt-0.5">
                          {m.amount_delta === 0 ? "Direct Match" : `Difference: Δ $${Math.abs(m.amount_delta).toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-[13px] text-mid-gray">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-mid-gray" />
                  <p>Click Auto-Match to find matching transactions</p>
                  <Button variant="primary" size="sm" className="mt-3" onClick={onRunBatch} disabled={isRunning}>
                    {isRunning ? "Matching..." : "Auto-Match Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2 cols: Items needing review */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items Needing Review</CardTitle>
                <Badge variant="ember">{exceptionCount}</Badge>
              </div>
              <CardDescription>Bank records without a match</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentExceptions.length > 0 ? (
                recentExceptions.map((exc: ExceptionRecord) => (
                  <div key={exc.id} className="p-3 rounded-[14px] bg-canvas border border-hairline">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-mid-gray">{exc.date}</span>
                      <span className="font-semibold text-ink font-mono">{formatCurrency(exc.amount)}</span>
                    </div>
                    <div className="text-[12.5px] font-medium text-ink truncate">{exc.description}</div>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-mid-gray text-center py-4">All records matched</div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => onNavigate("approvals")}
              >
                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                Open Sign-Off Queue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
