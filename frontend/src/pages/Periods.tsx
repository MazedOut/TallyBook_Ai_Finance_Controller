import React, { useState, useEffect } from "react"
import { CalendarClock, Lock, CheckCircle2, FileText, AlertTriangle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { useAuth } from "../hooks/useAuth"
import { formatCurrency } from "../lib/utils"
import { api } from "../lib/api"
import type { Period } from "../types"

export const Periods: React.FC = () => {
  const { isController, user } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
  const [closeNotes, setCloseNotes] = useState("")
  const [isClosing, setIsClosing] = useState(false)

  const fetchPeriods = async () => {
    try {
      const data = await api.periods.list()
      setPeriods(data)
    } catch (err) {
      console.error("Failed to load periods:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  const handleClosePeriod = async () => {
    if (!selectedPeriod) return
    setIsClosing(true)
    try {
      await api.periods.close(
        selectedPeriod.id,
        closeNotes || "Reconciliation period closed, certified, and frozen by Controller."
      )
      setSelectedPeriod(null)
      setCloseNotes("")
      fetchPeriods()
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-ink flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-ink" />
            Period Close & Statutory Lock
          </h2>
          <p className="text-[13px] text-mid-gray mt-0.5">
            Freeze financial batches, certify reconciliation accuracy, and export audit schedules for regulators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {periods.map((p) => {
          const isLocked = p.status === "locked" || p.status === "closed"
          return (
            <Card key={p.id} className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{p.name}</CardTitle>
                    <Badge variant={isLocked ? "solid" : "soft"}>
                      {isLocked ? "Locked & Certified" : "Active Cycle"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Date range: {p.start_date} to {p.end_date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[18px] bg-canvas border border-hairline text-center">
                    <div>
                      <div className="text-[11px] text-mid-gray uppercase font-semibold">Total Cleared</div>
                      <div className="font-mono text-[16px] font-bold text-ink mt-0.5">
                        {formatCurrency(p.total_volume)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-mid-gray uppercase font-semibold">Accuracy Score</div>
                      <div className="font-mono text-[16px] font-bold text-ink mt-0.5">
                        {p.accuracy_score > 0 ? `${p.accuracy_score}%` : "In Progress"}
                      </div>
                    </div>
                  </div>

                  <div className="text-[13px] text-mid-gray leading-relaxed">
                    {p.summary_notes}
                  </div>

                  {isLocked && p.closed_by && (
                    <div className="text-[11.5px] font-mono text-mid-gray pt-2 border-t border-hairline/60">
                      Certified by: {p.closed_by} &bull; {p.closed_at?.slice(0, 10)}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-5 pt-0">
                {isLocked ? (
                  <div className="flex items-center gap-2 p-3 bg-canvas rounded-[18px] border border-hairline text-[12px] text-mid-gray font-medium">
                    <Lock className="w-4 h-4 text-ink" />
                    <span>Books are permanently frozen. No modifications allowed.</span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setSelectedPeriod(p)}
                    disabled={!isController}
                    icon={<Lock className="w-4 h-4" />}
                  >
                    {isController ? "Close & Lock This Period" : "Controller Sign-off Required"}
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Close Period Confirmation Modal */}
      {selectedPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
          <div className="bg-paper rounded-[24px] border border-hairline p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-ink">
              <AlertTriangle className="w-5 h-5 text-ink" />
              <h3 className="text-[18px] font-semibold">Confirm Period Close & Lock</h3>
            </div>
            <p className="text-[13px] text-mid-gray leading-relaxed">
              Closing <strong>{selectedPeriod.name}</strong> will officially lock all bank matches and open exceptions. No further adjustments can be made to this batch.
            </p>
            <textarea
              className="w-full rounded-[18px] bg-canvas border border-hairline p-3 text-[13.5px] outline-none placeholder:text-mid-gray"
              rows={3}
              placeholder="Enter final certification statement (e.g. Audited and certified by Corporate Controller)..."
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPeriod(null)}
                disabled={isClosing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleClosePeriod}
                disabled={isClosing}
              >
                {isClosing ? "Locking Books..." : "Certify & Lock Period"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
