import React, { useState, useEffect } from "react"
import { History, Search, Shield, Filter, ChevronDown, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Input } from "../components/ui/Input"
import { api } from "../lib/api"
import type { AuditLog } from "../types"

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const fetchAudit = async () => {
    try {
      const data = await api.audit.list()
      setLogs(data)
    } catch (err) {
      console.error("Failed to load audit logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudit()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.actor_name.toLowerCase().includes(q) ||
      log.entity_id.toLowerCase().includes(q) ||
      (log.notes && log.notes.toLowerCase().includes(q))

    const matchRole = roleFilter === "all" || log.actor_role.toLowerCase() === roleFilter.toLowerCase()

    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink flex items-center gap-2">
            <History className="w-5 h-5 text-ink" />
            Immutable Financial Audit Trail
          </h2>
          <p className="text-[13px] text-mid-gray mt-0.5">
            Append-only verification record. Every AI match, analyst override, and controller sign-off is cryptographically verifiable.
          </p>
        </div>
        <Badge variant="solid" className="font-mono text-[11px]">
          SOX & Statutory Audit Ready
        </Badge>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search action, actor, or entity..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-[18px] border border-hairline text-[12px]">
          {["all", "controller", "analyst", "system"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-[14px] capitalize font-medium transition-all cursor-pointer ${
                roleFilter === r ? "bg-paper text-ink shadow-xs" : "text-mid-gray hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <Card>
        <CardHeader>
          <CardTitle>Event Timeline ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Chronological audit events recorded across all reconciliation cycles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-mid-gray text-[14px]">
                No audit entries recorded for the current search filter.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-[18px] bg-paper border border-hairline hover:border-[#d4d4d4] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[13px] font-bold text-ink">
                            {log.action}
                          </span>
                          <Badge variant="soft" size="sm" className="capitalize">
                            {log.actor_role}
                          </Badge>
                          <span className="font-mono text-[11px] text-mid-gray bg-canvas px-1.5 py-0.5 rounded-[6px] border border-hairline">
                            {log.entity_id}
                          </span>
                        </div>
                        <div className="text-[13px] text-ink font-medium">
                          {log.notes || "Standard system event."}
                        </div>
                        <div className="text-[11.5px] text-mid-gray flex items-center gap-2 pt-0.5">
                          <span>Actor: {log.actor_name}</span>
                          <span>&bull;</span>
                          <span className="font-mono">{log.timestamp.replace("T", " ").slice(0, 19)} UTC</span>
                        </div>
                      </div>

                      {/* State Inspection Button */}
                      {(log.before_state || log.after_state) && (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-[12px] font-medium text-ink hover:underline flex items-center gap-1 shrink-0 cursor-pointer pt-1"
                        >
                          <span>{isExpanded ? "Hide State Diff" : "Inspect Diff"}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>

                    {/* Diff Inspector */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-hairline/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px] font-mono">
                        {log.before_state && (
                          <div className="p-3 bg-canvas rounded-[14px] border border-hairline">
                            <div className="text-mid-gray text-[11px] mb-1 uppercase font-sans font-semibold">
                              Before State:
                            </div>
                            <pre className="text-mid-gray whitespace-pre-wrap overflow-x-auto max-h-48">
                              {JSON.stringify(log.before_state, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.after_state && (
                          <div className="p-3 bg-paper rounded-[14px] border border-hairline shadow-xs">
                            <div className="text-ink text-[11px] mb-1 uppercase font-sans font-semibold">
                              After State:
                            </div>
                            <pre className="text-ink whitespace-pre-wrap overflow-x-auto max-h-48">
                              {JSON.stringify(log.after_state, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
