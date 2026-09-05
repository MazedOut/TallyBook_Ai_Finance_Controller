import React from "react"
import { motion } from "framer-motion"
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
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
  Lock
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { AnimatedCounter } from "../components/ui/AnimatedCounter"
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
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

  const totalVolume = (reconciledVolume + exceptionsVolume) || 1
  const reconciledPct = Math.min(100, Math.max(0, (reconciledVolume / totalVolume) * 100))
  const exceptionsPct = Math.min(100, Math.max(0, (exceptionsVolume / totalVolume) * 100))

  const recentMatches = matches.slice(0, 4)
  const recentExceptions = exceptions.slice(0, 4)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 max-w-6xl mx-auto pb-8"
    >
      {/* ── Core Financial KPI Grid ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Match Rate */}
        <div className="stat-card group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="stat-label">Match Rate</span>
            <div className="w-8 h-8 rounded-[12px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center transition-transform group-hover:scale-110">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-value text-ink">
            <AnimatedCounter value={matchRate} decimals={1} suffix="%" />
          </div>
          <div className="text-[12px] text-mid-gray mt-2.5 flex items-center justify-between">
            <span>{matchCount} transactions matched</span>
            <Badge variant="emerald" size="sm">
              +3.8%
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-hairline/60">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, matchRate)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* KPI 2: Verified Cash Total */}
        <div className="stat-card group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="stat-label">Verified Cash Total</span>
            <div className="w-8 h-8 rounded-[12px] bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 flex items-center justify-center transition-transform group-hover:scale-110">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-value font-mono text-[24px] text-ink">
            <AnimatedCounter value={reconciledVolume} decimals={2} prefix="$" />
          </div>
          <div className="text-[12px] text-mid-gray mt-2.5 flex items-center justify-between truncate">
            <span className="truncate">Matched with Books</span>
            <Badge variant="indigo" size="sm">
              GL Synced
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-hairline/60">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${reconciledPct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            />
          </div>
        </div>

        {/* KPI 3: Unmatched Difference */}
        <div className="stat-card group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="stat-label">Unmatched Difference</span>
            <div className="w-8 h-8 rounded-[12px] bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center justify-center transition-transform group-hover:scale-110">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-value font-mono text-[24px] text-rose-500">
            <AnimatedCounter value={exceptionsVolume} decimals={2} prefix="$" />
          </div>
          <div className="text-[12px] text-mid-gray mt-2.5 flex items-center justify-between">
            <span>{exceptionCount} items needing review</span>
            <Badge variant="ember" size="sm">
              Triage
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-hairline/60">
            <motion.div
              className="h-full bg-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, exceptionsPct)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* KPI 4: Items Needing Sign-Off */}
        <div className="stat-card group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="stat-label">Items Needing Sign-Off</span>
            <div className="w-8 h-8 rounded-[12px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center transition-transform group-hover:scale-110">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="stat-value text-ink">
            <AnimatedCounter value={highValuePending} decimals={0} />
          </div>
          <div className="text-[12px] text-mid-gray mt-2.5 flex items-center justify-between">
            <span>Items ≥ $10,000</span>
            <Badge variant="amber" size="sm">
              Dual Sign-Off
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-hairline/60">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, highValuePending * 20)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Balance Alignment & Volume Distribution Strip ── */}
      <motion.div variants={itemVariants}>
        <Card className="border-hairline bg-paper" hoverEffect>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[17px]">
                  <span>Bank vs Company Books</span>
                  <Badge variant="soft" size="sm">
                    {wsData.periodName}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {activeWorkspace.bankLabel} ({activeWorkspace.bankAccount}) &harr; {activeWorkspace.glLabel} ({activeWorkspace.glAccount})
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-hairline bg-paper text-[12px] font-medium text-ink hover:bg-canvas transition-all shadow-2xs hover:border-[#cbd5e1]"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-mid-gray" />
                      <span>CSV</span>
                    </a>
                    <a
                      href={api.data.getPdfExportUrl(currentRun.run_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-hairline bg-paper text-[12px] font-medium text-ink hover:bg-canvas transition-all shadow-2xs hover:border-[#cbd5e1]"
                    >
                      <FileText className="w-3.5 h-3.5 text-mid-gray" />
                      <span>PDF</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-[18px] bg-canvas/70 border border-hairline/80">
              <div className="space-y-1">
                <div className="text-[11px] text-mid-gray uppercase font-semibold flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Bank Account Total</span>
                </div>
                <div className="text-[22px] font-mono font-bold text-ink">
                  {formatCurrency(reconciledVolume + exceptionsVolume)}
                </div>
                <div className="text-[11px] text-mid-gray">{activeWorkspace.bankAccount}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-mid-gray uppercase font-semibold flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Company Books Total</span>
                </div>
                <div className="text-[22px] font-mono font-bold text-ink">
                  {formatCurrency(reconciledVolume)}
                </div>
                <div className="text-[11px] text-mid-gray">{activeWorkspace.entityName} &middot; {activeWorkspace.glAccount}</div>
              </div>
            </div>

            {/* Segmented Volume Distribution Visual Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11.5px] font-medium text-mid-gray">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Cleared Cash: <strong className="text-ink">{reconciledPct.toFixed(1)}%</strong></span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Open Difference: <strong className="text-ink">{exceptionsPct.toFixed(1)}%</strong></span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-canvas rounded-full overflow-hidden flex border border-hairline p-0.5">
                <motion.div
                  className="h-full bg-emerald-500 rounded-l-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${reconciledPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                <motion.div
                  className="h-full bg-rose-500 rounded-r-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exceptionsPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>

            {exceptionsVolume > 0 && (
              <div className="mt-3 px-4 py-3 rounded-[16px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div className="text-[12.5px] text-ink flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span><strong>{formatCurrency(exceptionsVolume)}</strong> difference across {exceptionCount} unmatched bank records</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate("reconcile")} className="bg-paper shadow-2xs">
                  Review Unmatched
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Two Column: Recent Activity + Quick Actions ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left 3 cols: Recent Cleared */}
        <div className="lg:col-span-3">
          <Card className="h-full" hoverEffect>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px]">Recently Matched</CardTitle>
                  <CardDescription>Latest verified transactions against company books</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate("reconcile")}>
                  View All ({matchCount})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="divide-y divide-hairline/60">
                  {recentMatches.map((m: MatchRecord, idx: number) => {
                    const isDirect = m.amount_delta === 0
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="py-3 flex items-center justify-between gap-4 group/row hover:bg-canvas/40 px-2 rounded-[12px] -mx-2 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[13.5px] text-ink truncate flex items-center gap-2">
                            <span>{m.bank_description}</span>
                            <Badge variant={isDirect ? "emerald" : "indigo"} size="sm">
                              {isDirect ? "Exact" : "Adjusted"}
                            </Badge>
                          </div>
                          <div className="text-[11.5px] text-mid-gray mt-0.5 flex items-center gap-2">
                            <span>{m.bank_date}</span>
                            <span>&middot;</span>
                            <span className="font-mono text-[10.5px]">ID: {m.id.slice(0, 10)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-[13.5px] font-semibold text-ink">
                            {formatCurrency(m.bank_amount)}
                          </div>
                          <div className="text-[11px] text-mid-gray mt-0.5 font-medium">
                            {isDirect ? (
                              <span className="text-emerald-600">Direct Match</span>
                            ) : (
                              <span className="text-amber-600">&Delta; ${Math.abs(m.amount_delta).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-[13px] text-mid-gray">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-mid-gray/70" />
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
          <Card className="h-full" hoverEffect>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[16px]">Items Needing Review</CardTitle>
                <Badge variant="ember" pulse={exceptionCount > 0}>{exceptionCount}</Badge>
              </div>
              <CardDescription>Bank records without an automated match</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {recentExceptions.length > 0 ? (
                recentExceptions.map((exc: ExceptionRecord, idx: number) => {
                  const isHighValue = exc.amount >= 10000
                  return (
                    <motion.div
                      key={exc.id}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 rounded-[14px] bg-canvas/70 border border-hairline hover:border-hairline/80 transition-all hover:bg-canvas"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-mid-gray">{exc.date}</span>
                          {isHighValue && (
                            <Badge variant="amber" size="sm">
                              &ge; $10k
                            </Badge>
                          )}
                        </div>
                        <span className="font-semibold text-rose-600 font-mono text-[12.5px]">
                          {formatCurrency(exc.amount)}
                        </span>
                      </div>
                      <div className="text-[12.5px] font-medium text-ink truncate">
                        {exc.description}
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="text-[13px] text-mid-gray text-center py-6">
                  <CheckCircle2 className="w-7 h-7 mx-auto mb-1 text-emerald-500" />
                  <p>All records matched cleanly</p>
                </div>
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
      </motion.div>
    </motion.div>
  )
}
