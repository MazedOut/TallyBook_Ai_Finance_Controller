import React, { useState } from "react"
import { FlaskConical, Play, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Zap } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { ConfidenceBar } from "../components/reconcile/ConfidenceBar"
import { formatCurrency } from "../lib/utils"
import { api } from "../lib/api"

export const WhatIf: React.FC = () => {
  const [feedType, setFeedType] = useState<"bank" | "ledger">("bank")
  const [amount, setAmount] = useState<number>(3420.50)
  const [date, setDate] = useState<string>("2026-02-15")
  const [description, setDescription] = useState<string>("AMZN AWS US-EAST CLOUD SVCS")
  const [refId, setRefId] = useState<string>("BNK-INJECT-9941")
  const [threshold, setThreshold] = useState<number>(0.80)
  
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any | null>(null)

  const presetScenarios = [
    {
      title: "Vendor Abbreviation (AI Reasoning)",
      type: "bank" as const,
      amount: 3420.50,
      date: "2026-02-15",
      description: "AMZN AWS US-EAST CLOUD SVCS",
      ref: "BNK-DEBIT-40001",
      note: "Tests semantic entity resolution matching 'AMZN' to 'Amazon Web Services'"
    },
    {
      title: "T+2 Settlement Lag",
      type: "bank" as const,
      amount: 4500.00,
      date: "2026-02-18",
      description: "Salesforce.com Inc ACH SETTLEMENT",
      ref: "ACH-CLEAR-8812",
      note: "Tests tolerance matching with 2-day bank clearing lag"
    },
    {
      title: "Wire Fee Delta ($2.00 Fee)",
      type: "bank" as const,
      amount: 2498.00,
      date: "2026-02-10",
      description: "Slack Technologies WIRE NET OF $2.00",
      ref: "REF-FEE-30002",
      note: "Tests fee delta rule matching $2,498 bank vs $2,500 ledger entry"
    },
    {
      title: "Unrecorded ATM Debit (Honest Exception)",
      type: "bank" as const,
      amount: 145.00,
      date: "2026-02-22",
      description: "CHASE BRANCH ATM CASH WITHDRAWAL",
      ref: "ATM-DEBIT-0012",
      note: "Deliberate unresolvable testing honest exception triage"
    }
  ]

  const runSimulation = async () => {
    setIsSimulating(true)
    try {
      const res = await api.reconcile.inject({
        type: feedType,
        amount: Number(amount),
        date,
        description,
        ref_id: refId,
        accept_threshold: threshold
      })
      setSimulationResult(res)
    } catch (e) {
      console.error("Simulation failed", e)
    } finally {
      setIsSimulating(false)
    }
  }

  const applyPreset = (preset: typeof presetScenarios[0]) => {
    setFeedType(preset.type)
    setAmount(preset.amount)
    setDate(preset.date)
    setDescription(preset.description)
    setRefId(preset.ref)
    setSimulationResult(null)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Page Header */}
      <div>
        <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-ink" />
          Scenario Simulator
        </h2>
        <p className="text-[13px] text-mid-gray mt-0.5">
          Test how transactions match against company books in real time.
        </p>
      </div>

      {/* Preset Quick Scenarios */}
      <div>
        <div className="text-[12px] font-semibold text-mid-gray uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-ink" />
          <span>Standard Accounting Test Cases:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presetScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => applyPreset(sc)}
              className="p-3.5 rounded-[18px] bg-paper border border-hairline hover:border-[#a3a3a3] text-left transition-all cursor-pointer shadow-xs group"
            >
              <div className="text-[13px] font-semibold text-ink group-hover:text-ink leading-tight">
                {sc.title}
              </div>
              <div className="text-[11.5px] font-mono text-mid-gray mt-1">
                {formatCurrency(sc.amount)} &bull; {sc.type === "bank" ? "Statement Feed" : "Ledger Entry"}
              </div>
              <div className="text-[11px] text-mid-gray mt-1.5 line-clamp-2 leading-relaxed">
                {sc.note}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Simulation Form */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulated Transaction Entry</CardTitle>
              <CardDescription>
                Enter transaction line attributes to evaluate against general ledger vouchers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Source Feed Toggle */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray block mb-1.5">
                  Source Feed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedType("bank")}
                    className={`py-2 px-3 rounded-[14px] text-[13px] font-medium border transition-all cursor-pointer ${
                      feedType === "bank"
                        ? "bg-ink text-paper border-ink"
                        : "bg-canvas text-ink border-hairline"
                    }`}
                  >
                    Bank Feed Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedType("ledger")}
                    className={`py-2 px-3 rounded-[14px] text-[13px] font-medium border transition-all cursor-pointer ${
                      feedType === "ledger"
                        ? "bg-ink text-paper border-ink"
                        : "bg-canvas text-ink border-hairline"
                    }`}
                  >
                    Internal Ledger Entry
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray block mb-1">
                    Amount ($ USD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray block mb-1">
                    Posting Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray block mb-1">
                  Transaction Description / Vendor
                </label>
                <Input
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                  placeholder="e.g. AMZN AWS US-EAST CLOUD SVCS"
                />
              </div>

              {/* Reference ID */}
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray block mb-1">
                  Reference Identifier
                </label>
                <Input
                  value={refId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefId(e.target.value)}
                  placeholder="e.g. BNK-DEBIT-40001 or REF-EX-10001"
                />
              </div>

              {/* Confidence Threshold Slider */}
              <div className="pt-2 border-t border-hairline/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-mid-gray">
                    Acceptance Confidence Threshold
                  </label>
                  <span className="font-mono text-[13px] font-bold text-ink">
                    {(threshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={threshold}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-canvas rounded-lg appearance-none cursor-pointer accent-ink"
                />
                <div className="flex items-center justify-between text-[11px] text-mid-gray mt-1">
                  <span>Lenient (50%)</span>
                  <span>Default (80%)</span>
                  <span>Strict (95%)</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mt-2"
                onClick={runSimulation}
                disabled={isSimulating}
                icon={<Play className="w-4 h-4" />}
              >
                {isSimulating ? "Running Inference..." : "Simulate Instant Reconciliation"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right 6 cols: Live Inference Result */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inference Outcome & Trace</CardTitle>
                {simulationResult && (
                  <Badge variant={simulationResult.simulation_outcome === "MATCHED" ? "solid" : "ember"}>
                    {simulationResult.simulation_outcome}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Deterministic rule evaluation and AI semantic reasoning trace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {!simulationResult ? (
                <div className="py-16 text-center text-mid-gray space-y-2 my-auto">
                  <FlaskConical className="w-10 h-10 mx-auto text-mid-gray/50" />
                  <p className="text-[14px]">
                    Select a scenario above or fill the form and click Simulate to evaluate.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Outcome Banner */}
                  <div className="p-4 rounded-[18px] bg-canvas border border-hairline space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {simulationResult.simulation_outcome === "MATCHED" ? (
                          <CheckCircle2 className="w-5 h-5 text-ink" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-ember" />
                        )}
                        <span className="font-semibold text-[15px] text-ink">
                          {simulationResult.simulation_outcome === "MATCHED"
                            ? "Reconciliation Match Confirmed"
                            : "Escalated to Categorized Exception"}
                        </span>
                      </div>
                      <Badge variant="soft" className="font-mono">
                        {simulationResult.resolved_by_engine}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[12px] text-mid-gray font-medium">Confidence Score</span>
                      <ConfidenceBar confidence={simulationResult.confidence} />
                    </div>
                  </div>

                  {/* Counterpart matched */}
                  <div className="p-4 rounded-[18px] bg-paper border border-hairline space-y-1.5 shadow-xs">
                    <div className="text-[11px] text-mid-gray uppercase font-semibold">
                      Matched Counterpart Record
                    </div>
                    <div className="text-[14px] font-semibold text-ink leading-snug">
                      {simulationResult.matched_counterpart}
                    </div>
                  </div>

                  {/* Justification */}
                  <div className="p-4 rounded-[18px] bg-canvas border border-hairline space-y-1.5">
                    <div className="text-[11px] text-ink font-semibold uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-ink" />
                      <span>Reasoning Trace</span>
                    </div>
                    <p className="text-[13.5px] text-ink leading-relaxed">
                      {simulationResult.justification}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
