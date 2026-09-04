import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { History, CheckCircle2, AlertTriangle, XCircle, RotateCcw, Database } from "lucide-react"
import { api } from "../../lib/api"
import { Badge } from "../ui/Badge"
import type { ImportHistoryRecord } from "../../types"

interface ImportHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onResetDemo: () => void
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
  isOpen,
  onClose,
  onResetDemo,
}) => {
  const [history, setHistory] = useState<ImportHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const data = await api.data.getImportHistory()
      setHistory(data)
    } catch (err) {
      console.error("Failed to load import logs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-3xl bg-paper rounded-[24px] border border-hairline overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="h-14 px-6 border-b border-hairline flex items-center justify-between bg-paper shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-cool-wash text-primary-ink flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14.5px] font-semibold text-primary-ink">
                Ingestion & Audit History
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadHistory}
              title="Refresh History"
              className="p-1.5 rounded-full hover:bg-cool-wash text-mid-gray hover:text-primary-ink transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-cool-wash hover:bg-mid-gray/20 text-mid-gray hover:text-primary-ink flex items-center justify-center cursor-pointer transition-colors text-[14px]"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-mid-gray text-[13px]">
              Loading import activity log...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center mx-auto text-mid-gray">
                <Database className="w-5 h-5" />
              </div>
              <div className="text-[13.5px] font-medium text-primary-ink">No Custom Imports Logged Yet</div>
              <div className="text-[12px] text-mid-gray max-w-sm mx-auto">
                All uploaded statement batches and General Ledger CSV imports are recorded here with immutable audit hashes.
              </div>
            </div>
          ) : (
            <div className="border border-hairline rounded-[18px] overflow-hidden">
              <table className="w-full text-[12px] text-left border-collapse">
                <thead className="bg-canvas border-b border-hairline">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold text-mid-gray">Timestamp</th>
                    <th className="py-2.5 px-4 font-semibold text-mid-gray">Filename</th>
                    <th className="py-2.5 px-4 font-semibold text-mid-gray">Destination</th>
                    <th className="py-2.5 px-4 font-semibold text-mid-gray text-right">Rows</th>
                    <th className="py-2.5 px-4 font-semibold text-mid-gray text-center">Mode</th>
                    <th className="py-2.5 px-4 font-semibold text-mid-gray">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-cool-wash/30">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-mid-gray whitespace-nowrap">
                        {new Date(rec.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-primary-ink truncate max-w-[160px]">
                        {rec.file_name}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="capitalize text-primary-ink font-medium">
                          {rec.source_type === "bank" ? "Bank Feed" : "General Ledger"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-primary-ink">
                        {rec.imported_records}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-mono text-[10.5px] uppercase bg-canvas px-2 py-0.5 rounded-full border border-hairline text-mid-gray">
                          {rec.details?.mode || "append"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {rec.status === "completed" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#1f8738] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Successful
                          </span>
                        )}
                        {rec.status === "completed_with_warnings" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#b86200] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> {rec.warning_count} Warnings
                          </span>
                        )}
                        {rec.status === "failed" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#c92a20] font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-14 px-6 border-t border-hairline flex items-center justify-between bg-paper shrink-0">
          <button
            type="button"
            onClick={() => {
              onResetDemo()
              onClose()
            }}
            className="text-[12px] text-mid-gray hover:text-primary-ink flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Clean 50+ Benchmark</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-hairline hover:bg-cool-wash text-[12px] font-medium text-primary-ink transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
