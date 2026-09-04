import React, { useState, useMemo } from "react"
import { Search, SlidersHorizontal, Info, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react"
import { ConfidenceBar } from "./ConfidenceBar"
import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { formatCurrency } from "../../lib/utils"
import type { MatchRecord } from "../../types"

interface MatchTableProps {
  matches: MatchRecord[]
  onSelectMatch: (match: MatchRecord) => void
}

export const MatchTable: React.FC<MatchTableProps> = ({ matches, onSelectMatch }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [engineFilter, setEngineFilter] = useState("all")

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Search
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        m.bank_description.toLowerCase().includes(q) ||
        m.bank_ref_id?.toLowerCase().includes(q) ||
        m.ledger_descriptions.some((d) => d.toLowerCase().includes(q)) ||
        m.bank_amount.toString().includes(q) ||
        m.id.toLowerCase().includes(q)

      // Status
      const matchStatus = statusFilter === "all" || m.status === statusFilter

      // Engine
      const matchEngine =
        engineFilter === "all" ||
        (engineFilter === "ai" && m.resolved_by.startsWith("AI:")) ||
        (engineFilter === "rule" && m.resolved_by.startsWith("RULE:"))

      return matchSearch && matchStatus && matchEngine
    })
  }, [matches, searchQuery, statusFilter, engineFilter])

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search feed, reference, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status filters */}
          <div className="inline-flex p-1 bg-canvas rounded-[18px] border border-hairline text-[12px]">
            {["all", "accepted", "flagged", "overridden"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-[14px] capitalize font-medium transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-paper text-ink shadow-xs"
                    : "text-mid-gray hover:text-ink"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Engine filter */}
          <div className="inline-flex p-1 bg-canvas rounded-[18px] border border-hairline text-[12px]">
            {[
              { id: "all", label: "All Engines" },
              { id: "rule", label: "Rules" },
              { id: "ai", label: "AI Reasoning" },
            ].map((eng) => (
              <button
                key={eng.id}
                onClick={() => setEngineFilter(eng.id)}
                className={`px-3 py-1 rounded-[14px] font-medium transition-all cursor-pointer ${
                  engineFilter === eng.id
                    ? "bg-paper text-ink shadow-xs"
                    : "text-mid-gray hover:text-ink"
                }`}
              >
                {eng.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-[24px] border border-hairline bg-paper shadow-card">
        <table className="w-full text-left border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-hairline/80 bg-surface-alt/50 text-[11.5px] uppercase tracking-wider text-mid-gray font-semibold">
              <th className="py-3 px-4">Bank Transaction</th>
              <th className="py-3 px-4">Ledger Counterpart</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Engine</th>
              <th className="py-3 px-4">Justification</th>
              <th className="py-3 px-4 text-right">Drill-Down</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline/60">
            {filteredMatches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-mid-gray text-[14px]">
                  No matching reconciliation records found for the active filter.
                </td>
              </tr>
            ) : (
              filteredMatches.map((m) => {
                const isAi = m.resolved_by.startsWith("AI:")
                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMatch(m)}
                    className="hover:bg-canvas/60 transition-colors cursor-pointer group"
                  >
                    {/* Bank Tx */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-medium text-ink truncate">{m.bank_description}</div>
                      <div className="flex items-center gap-2 text-[11px] text-mid-gray mt-0.5">
                        <span>{m.bank_date}</span>
                        {m.bank_ref_id && (
                          <span className="font-mono bg-canvas px-1 rounded-[4px] border border-hairline/60 truncate max-w-[120px]">
                            {m.bank_ref_id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Ledger Counterpart */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-medium text-ink truncate">
                        {m.ledger_descriptions.join(" + ")}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-mid-gray mt-0.5">
                        <span>{m.ledger_date}</span>
                        <span className="font-mono text-mid-gray">
                          {m.ledger_entry_ids.join(", ")}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-ink font-mono text-[13px]">
                        {formatCurrency(m.bank_amount)}
                      </div>
                      {m.amount_delta !== 0 && (
                        <div className="text-[10.5px] font-mono text-mid-gray">
                          &Delta; ${m.amount_delta.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <ConfidenceBar confidence={m.confidence} />
                    </td>

                    {/* Engine */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={isAi ? "solid" : "soft"} size="sm" className="font-mono text-[11px]">
                        {isAi ? "AI:REASONING" : m.rule_name || "RULE"}
                      </Badge>
                    </td>

                    {/* Justification snippet */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <p className="text-[12.5px] text-mid-gray truncate leading-tight">
                        {m.justification}
                      </p>
                    </td>

                    {/* Drill down trigger */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectMatch(m)
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-ink hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        Trace <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Count */}
      <div className="flex items-center justify-between text-[12px] text-mid-gray px-2">
        <span>Showing {filteredMatches.length} of {matches.length} reconciled matches</span>
        <span>Click any row for complete AI prompt & rule proof chain</span>
      </div>
    </div>
  )
}
