import React, { useState } from "react"
import { CheckSquare, ShieldCheck, Check, X, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { useAuth } from "../hooks/useAuth"
import { formatCurrency } from "../lib/utils"
import { api } from "../lib/api"
import type { ExceptionRecord } from "../types"

interface ApprovalsProps {
  exceptions: ExceptionRecord[]
  onRefresh: () => void
}

export const Approvals: React.FC<ApprovalsProps> = ({ exceptions, onRefresh }) => {
  const { isController, role } = useAuth()
  const [selectedExcId, setSelectedExcId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pendingApprovals = exceptions.filter((e) => e.status === "open")

  const handleAction = async (excId: string, action: "approve" | "write_off" | "escalate") => {
    setIsSubmitting(true)
    try {
      await api.exceptions.approve(excId, action, note || "Controller approved GL adjustment.")
      setSelectedExcId(null)
      setNote("")
      onRefresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-ink" />
            Controller Sign-Off & Approval Workflow
          </h2>
          <p className="text-[13px] text-mid-gray mt-0.5">
            Audit-grade authorization queue for high-value items, disputed adjustments, and GL write-offs.
          </p>
        </div>
        <Badge variant={isController ? "solid" : "soft"}>
          {isController ? "Controller Access Authorized" : "Auditor Read-Only Mode"}
        </Badge>
      </div>

      {!isController && (
        <div className="p-4 rounded-[18px] bg-canvas border border-hairline flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-mid-gray shrink-0" />
          <p className="text-[13px] text-mid-gray">
            You are viewing this queue as <strong className="text-ink capitalize">{role}</strong>. Switch to the <strong>Controller</strong> persona in the sidebar to authorize write-offs or adjustments.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Authorization Queue</CardTitle>
            <Badge variant="ember">{pendingApprovals.length} Pending Sign-Off</Badge>
          </div>
          <CardDescription>
            All exceptions with amounts exceeding thresholds or classified as unresolved noise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-hairline/80 text-[11.5px] uppercase tracking-wider text-mid-gray font-semibold">
                  <th className="py-3 px-3">Transaction</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Aging</th>
                  <th className="py-3 px-3">Resolution Action Item</th>
                  <th className="py-3 px-3 text-right">Sign-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/60">
                {pendingApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-mid-gray">
                      All exceptions have been reviewed and authorized. No items pending sign-off.
                    </td>
                  </tr>
                ) : (
                  pendingApprovals.map((exc) => (
                    <tr key={exc.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-ink">{exc.description}</div>
                        <div className="text-[11px] font-mono text-mid-gray mt-0.5">
                          {exc.transaction_id} &bull; {exc.source_type}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant="soft" size="sm">
                          {exc.category.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-semibold text-ink">
                        {formatCurrency(exc.amount)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-mid-gray text-[12px]">
                        {exc.aging_days} days
                      </td>
                      <td className="py-3 px-3 max-w-[280px] text-[12.5px] text-mid-gray">
                        {exc.what_would_resolve}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {isController ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(exc.id, "approve")}
                              disabled={isSubmitting}
                              icon={<Check className="w-3.5 h-3.5" />}
                            >
                              Authorize
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleAction(exc.id, "write_off")}
                              disabled={isSubmitting}
                            >
                              Write-Off
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-mid-gray italic">Sign-off restricted</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
