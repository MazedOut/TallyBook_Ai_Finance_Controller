import React, { useState } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Check, XCircle, RotateCcw, Building2, BookOpen } from "lucide-react"
import { api } from "../../lib/api"

interface ManualEntryModalProps {
  isOpen: boolean
  onClose: () => void
  initialType?: "bank" | "ledger"
  onSuccess: () => void
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  initialType = "bank",
  onSuccess,
}) => {
  const [sourceType, setSourceType] = useState<"bank" | "ledger">(initialType)
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [refId, setRefId] = useState<string>("")
  const [accountId, setAccountId] = useState<string>(initialType === "bank" ? "CHASE-9901" : "GL-1010")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !date) {
      setErrorMsg("Please fill in Date, Description, and Amount.")
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) {
      setErrorMsg("Amount must be a valid number.")
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await api.data.manualEntry({
        source_type: sourceType,
        date,
        amount: numAmount,
        description,
        ref_id: refId || undefined,
        account_id: accountId || undefined,
        currency: "USD",
      })

      // Run reconciliation so changes immediately register
      try {
        await api.reconcile.run({
          notes: `Manual entry added: ${description} ($${numAmount})`,
        })
      } catch (rErr) {
        console.warn("Reconciliation triggered with note", rErr)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Failed to record manual transaction.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-lg bg-paper rounded-[24px] border border-hairline overflow-hidden flex flex-col"
      >
        {/* macOS Modal Header */}
        <div className="h-14 px-6 border-b border-hairline flex items-center justify-between bg-paper shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-electric-blue/10 text-electric-blue flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h2 className="text-[14.5px] font-semibold text-primary-ink">
              New Transaction Entry
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-cool-wash hover:bg-mid-gray/20 text-mid-gray hover:text-primary-ink flex items-center justify-center cursor-pointer transition-colors text-[14px]"
          >
            &times;
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-[#ff3b30]/10 border-b border-[#ff3b30]/20 px-6 py-2.5 flex items-center gap-2 text-[12px] text-[#c92a20]">
            <XCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Ledger Selection */}
          <div>
            <label className="text-[11.5px] font-semibold uppercase tracking-wider text-mid-gray block mb-1.5">
              Entry Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSourceType("bank")
                  setAccountId("CHASE-9901")
                }}
                className={`p-2.5 rounded-[12px] border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  sourceType === "bank"
                    ? "border-electric-blue bg-electric-blue/5 text-primary-ink"
                    : "border-hairline bg-canvas text-mid-gray hover:text-primary-ink"
                }`}
              >
                <Building2 className="w-4 h-4 text-electric-blue" />
                <div>
                  <div className="text-[12.5px] font-semibold leading-tight">Bank Feed</div>
                  <div className="text-[10.5px] text-mid-gray">Statement Record</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceType("ledger")
                  setAccountId("GL-1010")
                }}
                className={`p-2.5 rounded-[12px] border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  sourceType === "ledger"
                    ? "border-electric-blue bg-electric-blue/5 text-primary-ink"
                    : "border-hairline bg-canvas text-mid-gray hover:text-primary-ink"
                }`}
              >
                <BookOpen className="w-4 h-4 text-electric-blue" />
                <div>
                  <div className="text-[12.5px] font-semibold leading-tight">General Ledger</div>
                  <div className="text-[10.5px] text-mid-gray">Journal Voucher</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="text-[11.5px] font-semibold text-mid-gray block mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 rounded-[10px] bg-canvas border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11.5px] font-semibold text-mid-gray block mb-1">
                Amount ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="+500.00 or -250.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 rounded-[10px] bg-canvas border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11.5px] font-semibold text-mid-gray block mb-1">
              Description / Counterparty *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS EMEA Cloud Services Invoice"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 rounded-[10px] bg-canvas border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Reference ID */}
            <div>
              <label className="text-[11.5px] font-semibold text-mid-gray block mb-1">
                Reference ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. WIRE-88192"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                className="w-full h-9 rounded-[10px] bg-canvas border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue font-mono"
              />
            </div>

            {/* Account ID */}
            <div>
              <label className="text-[11.5px] font-semibold text-mid-gray block mb-1">
                Account ID
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full h-9 rounded-[10px] bg-canvas border border-hairline px-3 text-[12.5px] text-primary-ink outline-none focus:border-electric-blue font-mono"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-hairline hover:bg-cool-wash text-[12px] font-medium text-mid-gray hover:text-primary-ink transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-electric-blue text-paper text-[12px] font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-none"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="w-3 h-3 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Post Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
