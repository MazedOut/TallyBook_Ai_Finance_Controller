import React, { useState } from "react"
import { Settings, Check, Info, Database, RotateCw, Server, HardDrive } from "lucide-react"
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
  const { isAdmin, isDemoMode } = useAuth()
  const [acceptThreshold, setAcceptThreshold] = useState(80)
  const [exceptionThreshold, setExceptionThreshold] = useState(55)
  const [highValueCutoff, setHighValueCutoff] = useState(10000)
  const [dateLagWindow, setDateLagWindow] = useState(3)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReseed = () => {
    onRegenerateData?.()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink flex items-center gap-2">
            <Settings className="w-5 h-5 text-ink" />
            Reconciliation Policies & Matching Rules
          </h2>
          <p className="text-[13px] text-mid-gray mt-0.5">
            Configure matching rule strictness, approval cutoffs, and database storage.
          </p>
        </div>
        <Badge variant={isAdmin ? "solid" : "soft"}>
          {isAdmin ? "Admin Full Access" : "Read-Only Configuration"}
        </Badge>
      </div>

      {/* Demo Mode Dataset Generator (Only visible/active in Demo Mode) */}
      <Card className="border-ink/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-ink" />
              <CardTitle>Synthetic Dataset Re-Seeding</CardTitle>
            </div>
            <Badge variant={isDemoMode ? "solid" : "outline"}>
              {isDemoMode ? "Demo Mode Active" : "Production Mode"}
            </Badge>
          </div>
          <CardDescription>
            Re-generate the ground-truth synthetic data batch (75 bank records vs 79 ledger entries).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDemoMode ? (
            <>
              <p className="text-[13px] text-mid-gray leading-relaxed">
                Re-seeds exact matches, wire fee deltas, timing differences, split disbursements, and intentional unresolvables.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReseed}
                disabled={isRegenerating || !isAdmin}
                className="flex items-center gap-2"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                <span>{isRegenerating ? "Re-seeding Batches..." : "Re-Seed Synthetic Batch"}</span>
              </Button>
            </>
          ) : (
            <div className="p-4 rounded-[18px] bg-canvas border border-hairline flex items-center gap-2.5 text-[12.5px] text-mid-gray">
              <Info className="w-4 h-4 text-ink shrink-0" />
              <span>
                Dataset generation is available <strong>only in Demo Mode</strong> to safeguard live client ledgers.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rules & Cutoff Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Matching Rules & Tolerances</CardTitle>
            <CardDescription>
              Control cutoff boundaries between automated acceptance and exception escalation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-[13px] font-medium text-ink mb-1">
                <span>Auto-Reconciliation Confidence Threshold</span>
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
                Transactions with match confidence &ge; {acceptThreshold}% are automatically cleared.
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
                Transactions below {exceptionThreshold}% confidence are flagged for manual review.
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
                <span className="text-[11px] text-mid-gray">$ USD threshold</span>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full mt-2"
              onClick={handleSave}
              disabled={!isAdmin}
            >
              {saved ? "Policies Saved" : "Save Matching Policies"}
            </Button>
          </CardContent>
        </Card>

        {/* Database Persistence Card (SQLite) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Database Persistence</CardTitle>
              <Badge variant="solid">Local SQLite Active</Badge>
            </div>
            <CardDescription>
              Embedded high-performance relational storage with ACID integrity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-[13px] leading-relaxed">
            <div className="p-4 rounded-[18px] bg-canvas border border-hairline space-y-2">
              <div className="flex items-center gap-2 font-medium text-ink">
                <HardDrive className="w-4 h-4 text-ink" />
                <span>Embedded SQLite 3 Storage</span>
              </div>
              <p className="text-mid-gray text-[12px]">
                All reconciliation runs, matches, exceptions, and immutable audit logs are stored locally without external network lag:
              </p>
              <div className="p-2.5 bg-paper rounded-[12px] font-mono text-[11.5px] border border-hairline text-ink select-all">
                backend/app/data/tallybook.db
              </div>
            </div>

            <div className="p-3.5 bg-canvas rounded-[18px] border border-hairline space-y-1.5 text-[12px] text-mid-gray">
              <div className="font-semibold text-ink flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-ink" />
                <span>Zero Cloud Credentials Needed</span>
              </div>
              <p className="leading-relaxed">
                Self-contained persistence ensures 100% offline capability, zero cloud secrets, and instant read/write transactions.
              </p>
            </div>

            <div className="pt-2 border-t border-hairline/60">
              <div className="text-[12px] font-semibold text-mid-gray uppercase mb-1.5">
                Connected General Ledger Books
              </div>
              <div className="p-3 bg-canvas rounded-[18px] border border-hairline space-y-1 text-[12.5px]">
                <div className="font-medium text-ink">RazorPay Global Inc</div>
                <div className="text-mid-gray font-mono text-[11px]">GL: 1010-Operating-Cash &bull; Chase Commercial Bank ACC-4991</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
