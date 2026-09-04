import React, { useState } from "react"
import { Settings, Sliders, Shield, Key, Check, Info, Database, RotateCw, Sparkles, Server } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { useAuth } from "../hooks/useAuth"

interface AdminProps {
  onRegenerateData?: () => void
  isRegenerating?: boolean
}

export const Admin: React.FC<AdminProps> = ({ onRegenerateData, isRegenerating = false }) => {
  const { isAdmin, role, isDemoMode } = useAuth()
  const [acceptThreshold, setAcceptThreshold] = useState(80)
  const [exceptionThreshold, setExceptionThreshold] = useState(55)
  const [highValueCutoff, setHighValueCutoff] = useState(10000)
  const [dateLagWindow, setDateLagWindow] = useState(3)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink flex items-center gap-2">
            <Settings className="w-5 h-5 text-ink" />
            Settings & Governance
          </h2>
          <p className="text-[13px] text-mid-gray mt-0.5">
            Configure matching rule strictness, approval cutoffs, Supabase persistence, and synthetic testing.
          </p>
        </div>
        <Badge variant={isAdmin ? "solid" : "soft"}>
          {isAdmin ? "Admin Full Access" : "Read-Only Configuration"}
        </Badge>
      </div>

      {/* Demo Mode Synthetic Dataset Generation Section (Only visible/enabled in Demo Mode) */}
      <Card className="border-ink/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-ink" />
              <CardTitle>Synthetic Reconciliation Dataset Generation</CardTitle>
            </div>
            <Badge variant={isDemoMode ? "solid" : "outline"}>
              {isDemoMode ? "Demo Mode Active" : "Production Mode"}
            </Badge>
          </div>
          <CardDescription>
            Generate a full 50+ record synthetic batch (75 bank feed transactions + 79 ledger vouchers) with injected edge cases and ground truth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDemoMode ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[18px] bg-canvas border border-hairline">
              <div className="space-y-1">
                <div className="text-[13.5px] font-semibold text-ink">
                  Re-seed 50+ Record Synthetic Batch
                </div>
                <div className="text-[12px] text-mid-gray leading-relaxed">
                  Regenerates 30 exact matches, 15 date-offset settlement lags, 8 wire fee deltas, 6 vendor typos, 4 split payments, and 8 deliberate unresolvables.
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={onRegenerateData}
                disabled={isRegenerating}
                icon={<RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />}
                className="shrink-0"
              >
                {isRegenerating ? "Generating Dataset..." : "Generate Dataset"}
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-[18px] bg-canvas border border-hairline flex items-center gap-2.5 text-[12.5px] text-mid-gray">
              <Info className="w-4 h-4 text-ink shrink-0" />
              <span>
                Dataset generation is available <strong>only in Demo Mode</strong> to prevent accidental data resets on live client ledgers.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules & Cutoff Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Matching Engine Thresholds</CardTitle>
            <CardDescription>
              Control cutoff boundaries between automated acceptance and exception escalation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-[13px] font-medium text-ink mb-1">
                <span>Acceptance Confidence Cutoff</span>
                <span className="font-mono font-bold">{acceptThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={acceptThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcceptThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-ink"
              />
              <p className="text-[11.5px] text-mid-gray mt-1">
                Records with confidence &ge; {acceptThreshold}% are automatically cleared.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] font-medium text-ink mb-1">
                <span>Exception Escalation Floor</span>
                <span className="font-mono font-bold">{exceptionThreshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="70"
                value={exceptionThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExceptionThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-ink"
              />
              <p className="text-[11.5px] text-mid-gray mt-1">
                Records below {exceptionThreshold}% are triaged as open exceptions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[12px] font-semibold text-mid-gray uppercase block mb-1">
                  Settlement Lag Window
                </label>
                <Input
                  type="number"
                  value={dateLagWindow}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateLagWindow(Number(e.target.value))}
                />
                <span className="text-[11px] text-mid-gray">&plusmn; days tolerance</span>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-mid-gray uppercase block mb-1">
                  High-Value Sign-Off Cutoff
                </label>
                <Input
                  type="number"
                  value={highValueCutoff}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHighValueCutoff(Number(e.target.value))}
                />
                <span className="text-[11px] text-mid-gray">$ USD amount</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full mt-2"
              onClick={handleSave}
              disabled={!isAdmin}
            >
              {saved ? "Thresholds Saved" : "Save Rule Parameters"}
            </Button>
          </CardContent>
        </Card>

        {/* Supabase Database Integration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Supabase Database Persistence</CardTitle>
              <Badge variant="soft">Cloud Sync Ready</Badge>
            </div>
            <CardDescription>
              Persist reconciliation runs, matches, exceptions, and audit logs to Supabase PostgreSQL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-[13px] leading-relaxed">
            <div className="p-4 rounded-[18px] bg-canvas border border-hairline space-y-2">
              <div className="flex items-center gap-2 font-medium text-ink">
                <Server className="w-4 h-4 text-ink" />
                <span>Supabase Credentials Setup</span>
              </div>
              <p className="text-mid-gray text-[12.5px]">
                To persist runs to your Supabase project, add your project credentials to <code className="font-mono bg-paper px-1.5 py-0.5 rounded-[4px] border border-hairline text-ink">backend/.env</code>:
              </p>
              <div className="p-2.5 bg-paper rounded-[12px] font-mono text-[11px] border border-hairline text-ink select-all space-y-0.5">
                <div>SUPABASE_URL=https://your-project.supabase.co</div>
                <div>SUPABASE_KEY=your_supabase_anon_or_service_key</div>
              </div>
            </div>

            <div className="p-3.5 bg-canvas rounded-[18px] border border-hairline space-y-1.5 text-[12px] text-mid-gray">
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-ink" />
                <span>One-Click Schema Ready</span>
              </div>
              <p className="leading-relaxed">
                Pre-written migration schema located at <code className="font-mono text-ink">backend/supabase_schema.sql</code> creates all 5 tables (<code className="font-mono text-ink">reconciliation_runs</code>, <code className="font-mono text-ink">matches</code>, <code className="font-mono text-ink">exceptions</code>, <code className="font-mono text-ink">periods</code>, <code className="font-mono text-ink">audit_logs</code>) in your Supabase SQL editor.
              </p>
            </div>

            <div className="pt-2 border-t border-hairline/60">
              <div className="text-[12px] font-semibold text-mid-gray uppercase mb-1.5">
                Connected Entity Books
              </div>
              <div className="p-3 bg-canvas rounded-[18px] border border-hairline space-y-1 text-[12.5px]">
                <div className="font-medium text-ink">RazorPay Global Inc</div>
                <div className="text-mid-gray font-mono text-[11px]">GL: 1010-Operating-Cash &bull; Chase Commercial Bank ACC-01</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
