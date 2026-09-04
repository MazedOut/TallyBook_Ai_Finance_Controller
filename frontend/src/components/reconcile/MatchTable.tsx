import React, { useState, useMemo } from "react"
import { Search, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "../ui/Badge"
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
  const [typeFilter, setTypeFilter] = useState("all")

  // Human-friendly finance match label
  const getFinanceMatchTag = (m: MatchRecord) => {
    if (m.amount_delta !== 0 && Math.abs(m.amount_delta) <= 50) {
      return { label: `Fee Diff: $${m.amount_delta.toFixed(2)}`, variant: "soft" as const }
    }
    if (m.resolved_by.includes("LAG") || m.rule_name?.toLowerCase().includes("lag")) {
      return { label: "Timing Difference", variant: "soft" as const }
    }
    if (m.resolved_by.startsWith("AI:")) {
      return { label: "Smart Match", variant: "solid" as const }
    }
    if (m.status === "overridden") {
      return { label: "Manual Match", variant: "ember" as const }
    }
    return { label: "Direct Match", variant: "soft" as const }
  }

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
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

      // Financial type
      let matchType = true
      if (typeFilter === "exact") {
        matchType = m.amount_delta === 0 && !m.resolved_by.includes("LAG")
      } else if (typeFilter === "lag") {
        matchType = m.resolved_by.includes("LAG") || (m.rule_name || "").toLowerCase().includes("lag")
      } else if (typeFilter === "fee") {
        matchType = m.amount_delta !== 0
      }

      return matchSearch && matchStatus && matchType
    })
  }, [matches, searchQuery, statusFilter, typeFilter])

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search vendor, reference, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status filters */}
          <div className="inline-flex p-1 bg-canvas rounded-[18px] border border-hairline text-[12px]">
            {[
              { id: "all", label: "All Records" },
              { id: "accepted", label: "Matched" },
              { id: "flagged", label: "Flagged" },
              { id: "overridden", label: "Manual" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-[14px] font-medium transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-paper text-ink shadow-xs"
                    : "text-mid-gray hover:text-ink"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Match Category filter */}
          <div className="inline-flex p-1 bg-canvas rounded-[18px] border border-hairline text-[12px]">
            {[
              { id: "all", label: "All Types" },
              { id: "exact", label: "Direct Match" },
              { id: "lag", label: "Timing Difference" },
              { id: "fee", label: "Fee Differences" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1 rounded-[14px] font-medium transition-all cursor-pointer ${
                  typeFilter === t.id
                    ? "bg-paper text-ink shadow-xs"
                    : "text-mid-gray hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Financial Match Table */}
      <div className="overflow-x-auto rounded-[24px] border border-hairline bg-paper shadow-card">
        <table className="w-full text-left border-collapse text-[13.5px]">
          <thead>
            <tr className="border-b border-hairline/80 bg-canvas text-[11.5px] uppercase tracking-wider text-mid-gray font-semibold">
              <th className="py-3.5 px-4">Bank Transaction</th>
              <th className="py-3.5 px-4">Company Book Record</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Match Type</th>
              <th className="py-3.5 px-4">Match Explanation</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline/60">
            {filteredMatches.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-mid-gray text-[13.5px]">
                  No records match the selected filter.
                </td>
              </tr>
            ) : (
              filteredMatches.map((m) => {
                const tag = getFinanceMatchTag(m)
                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMatch(m)}
                    className="hover:bg-canvas/50 transition-colors cursor-pointer group"
                  >
                    {/* Bank Statement Record */}
                    <td className="py-3 px-4 max-w-[240px]">
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

                    {/* General Ledger Entry */}
                    <td className="py-3 px-4 max-w-[240px]">
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

                    {/* Amount & Variance */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-ink font-mono text-[13.5px]">
                        {formatCurrency(m.bank_amount)}
                      </div>
                      {m.amount_delta !== 0 ? (
                        <div className="text-[11px] font-mono text-ember font-medium">
                          Variance: &Delta; ${m.amount_delta.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-mid-gray font-mono">Zero variance</div>
                      )}
                    </td>

                    {/* Reconciliation Type Tag */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={tag.variant} size="sm">
                        {tag.label}
                      </Badge>
                    </td>

                    {/* Plain English Audit Note */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <p className="text-[12px] text-mid-gray truncate leading-tight">
                        {m.justification}
                      </p>
                    </td>

                    {/* Review Button */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectMatch(m)
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-ink hover:underline group-hover:translate-x-0.5 transition-transform"
                      >
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[12px] text-mid-gray px-2">
        <span>Showing {filteredMatches.length} of {matches.length} reconciled transactions</span>
        <span>Click any row to view complete audit trail & adjustment history</span>
      </div>
    </div>
  )
}
