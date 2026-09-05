import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Settings, 
  Palette, 
  Sliders, 
  Globe, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Sun,
  Moon,
  Zap,
  Flame,
  RotateCcw,
  DollarSign
} from "lucide-react"
import { useTheme, type ThemeMode } from "../../hooks/useTheme"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveToast?: (msg: string) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveToast,
}) => {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<"appearance" | "rules" | "localization" | "governance">("appearance")

  // Rule tolerances
  const [confidenceThreshold, setConfidenceThreshold] = useState(() => {
    return Number(localStorage.getItem("tb_conf_thresh") || 80)
  })
  const [lagTolerance, setLagTolerance] = useState(() => {
    return Number(localStorage.getItem("tb_lag_tol") || 3)
  })
  const [feeTolerance, setFeeTolerance] = useState(() => {
    return Number(localStorage.getItem("tb_fee_tol") || 2.50)
  })

  // Localization
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("tb_currency") || "USD"
  })
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem("tb_date_format") || "YYYY-MM-DD"
  })

  // Governance
  const [highValueCutoff, setHighValueCutoff] = useState(() => {
    return Number(localStorage.getItem("tb_high_val_cutoff") || 10000)
  })
  const [autoLockLedger, setAutoLockLedger] = useState(() => {
    return localStorage.getItem("tb_autolock") !== "false"
  })

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem("tb_conf_thresh", confidenceThreshold.toString())
    localStorage.setItem("tb_lag_tol", lagTolerance.toString())
    localStorage.setItem("tb_fee_tol", feeTolerance.toString())
    localStorage.setItem("tb_currency", currency)
    localStorage.setItem("tb_date_format", dateFormat)
    localStorage.setItem("tb_high_val_cutoff", highValueCutoff.toString())
    localStorage.setItem("tb_autolock", autoLockLedger.toString())

    if (onSaveToast) {
      onSaveToast("Preferences updated and applied.")
    }
    onClose()
  }

  const handleReset = () => {
    setTheme("light")
    setConfidenceThreshold(80)
    setLagTolerance(3)
    setFeeTolerance(2.50)
    setCurrency("USD")
    setDateFormat("YYYY-MM-DD")
    setHighValueCutoff(10000)
    setAutoLockLedger(true)
    if (onSaveToast) {
      onSaveToast("Reset to standard controller defaults.")
    }
  }

  const themesList: {
    id: ThemeMode
    title: string
    subtitle: string
    icon: React.ReactNode
    previewColors: string[]
    borderAccent: string
  }[] = [
    {
      id: "light",
      title: "Light Minimalist",
      subtitle: "Crisp white canvas with soft neutral borders",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      previewColors: ["#ffffff", "#f6f7f9", "#0a0a0a", "#10b981"],
      borderAccent: "border-slate-300",
    },
    {
      id: "dark",
      title: "Obsidian Slate",
      subtitle: "Deep charcoal OLED dark mode for night operations",
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      previewColors: ["#090d16", "#111827", "#f8fafc", "#3b82f6"],
      borderAccent: "border-indigo-500",
    },
    {
      id: "neon",
      title: "Electric Neon",
      subtitle: "Cyberpunk midnight with luminous cyan and magenta glow",
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      previewColors: ["#030712", "#0b0f19", "#38bdf8", "#ff0055"],
      borderAccent: "border-cyan-400 shadow-lg shadow-cyan-500/20",
    },
    {
      id: "bright",
      title: "Warm Ivory",
      subtitle: "Warm editorial paper with rich solarized navy text",
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      previewColors: ["#faf8f5", "#ffffff", "#0f172a", "#f59e0b"],
      borderAccent: "border-amber-400",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl bg-paper rounded-[24px] border border-hairline shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[12px] bg-canvas border border-hairline flex items-center justify-center">
              <Settings className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-ink">Controller Preferences & Settings</h3>
              <p className="text-[11.5px] text-mid-gray">System configuration, appearance themes, and tolerance calibration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-hairline bg-canvas/40 flex items-center gap-2 shrink-0">
          {[
            { id: "appearance", label: "Appearance & Themes", icon: <Palette className="w-3.5 h-3.5" /> },
            { id: "rules", label: "Matching Tolerances", icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: "localization", label: "Currencies & Formats", icon: <Globe className="w-3.5 h-3.5" /> },
            { id: "governance", label: "Governance & SOX", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-[12px] text-[12.5px] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-ink text-ink bg-paper font-semibold"
                  : "border-transparent text-mid-gray hover:text-ink"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 1. APPEARANCE & THEMES */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[14px] font-semibold text-ink">Display Themes</h4>
                <p className="text-[12px] text-mid-gray">Switch between 4 visual modes tailored for accounting controllers</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themesList.map((th) => {
                  const isSelected = theme === th.id
                  return (
                    <div
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`p-4 rounded-[18px] border-2 cursor-pointer transition-all relative ${
                        isSelected
                          ? `${th.borderAccent} bg-canvas/80 shadow-sm scale-[1.01]`
                          : "border-hairline bg-canvas/30 hover:border-hairline/80 hover:bg-canvas/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {th.icon}
                          <span className="text-[13.5px] font-semibold text-ink">{th.title}</span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-ink text-paper flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-mid-gray leading-relaxed mb-3">{th.subtitle}</p>
                      {/* Swatch preview */}
                      <div className="flex items-center gap-1.5 p-1.5 rounded-[10px] bg-paper border border-hairline w-fit">
                        {th.previewColors.map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. MATCHING RULES & TOLERANCES */}
          {activeTab === "rules" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-[14px] font-semibold text-ink">Autonomous Matching Strictness</h4>
                <p className="text-[12px] text-mid-gray">Calibrate rule engine tolerances for auto-clearing bank records</p>
              </div>

              {/* Confidence Threshold */}
              <div className="p-4 rounded-[18px] bg-canvas/50 border border-hairline space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-ink">Auto-Match Acceptance Threshold</div>
                    <div className="text-[11.5px] text-mid-gray">Pairs with confidence above this cutoff clear autonomously</div>
                  </div>
                  <Badge variant="indigo" size="sm" className="font-mono text-[12px]">
                    {confidenceThreshold}%
                  </Badge>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-ink"
                />
              </div>

              {/* Settlement Lag Window */}
              <div className="p-4 rounded-[18px] bg-canvas/50 border border-hairline space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-ink">Date Offset Tolerance (T+N Days)</div>
                    <div className="text-[11.5px] text-mid-gray">Allowable bank clearing lag for identical amounts</div>
                  </div>
                  <Badge variant="emerald" size="sm" className="font-mono text-[12px]">
                    &plusmn;{lagTolerance} Days
                  </Badge>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={lagTolerance}
                  onChange={(e) => setLagTolerance(Number(e.target.value))}
                  className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-ink"
                />
              </div>

              {/* Fee Delta */}
              <div className="p-4 rounded-[18px] bg-canvas/50 border border-hairline space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-ink">Allowable Wire / Fee Slippage</div>
                    <div className="text-[11.5px] text-mid-gray">Maximum auto-cleared bank fee deduction variance</div>
                  </div>
                  <Badge variant="amber" size="sm" className="font-mono text-[12px]">
                    ${feeTolerance.toFixed(2)}
                  </Badge>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="10.00"
                  step="0.50"
                  value={feeTolerance}
                  onChange={(e) => setFeeTolerance(Number(e.target.value))}
                  className="w-full h-1.5 bg-hairline rounded-lg appearance-none cursor-pointer accent-ink"
                />
              </div>
            </div>
          )}

          {/* 3. CURRENCIES & FORMATS */}
          {activeTab === "localization" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[14px] font-semibold text-ink">Accounting Currency & Formatting</h4>
                <p className="text-[12px] text-mid-gray">Standardized reporting display formats</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: "USD", symbol: "$", name: "US Dollar (Default)" },
                  { code: "EUR", symbol: "€", name: "Euro (€)" },
                  { code: "GBP", symbol: "£", name: "British Pound (£)" },
                  { code: "INR", symbol: "₹", name: "Indian Rupee (₹)" },
                ].map((c) => (
                  <div
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`p-3.5 rounded-[16px] border cursor-pointer transition-all flex items-center justify-between ${
                      currency === c.code
                        ? "border-ink bg-canvas font-semibold shadow-xs"
                        : "border-hairline bg-canvas/30 hover:bg-canvas/50"
                    }`}
                  >
                    <div>
                      <div className="text-[13px] text-ink">{c.name}</div>
                      <div className="text-[11px] text-mid-gray font-mono">{c.code} &middot; {c.symbol}</div>
                    </div>
                    {currency === c.code && <Check className="w-4 h-4 text-ink" />}
                  </div>
                ))}
              </div>

              {/* Date format */}
              <div className="p-4 rounded-[18px] bg-canvas/40 border border-hairline space-y-2">
                <div className="text-[13px] font-medium text-ink">Date Notation</div>
                <div className="grid grid-cols-3 gap-2">
                  {["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setDateFormat(fmt)}
                      className={`px-3 py-1.5 rounded-[10px] text-[12px] border transition-colors cursor-pointer ${
                        dateFormat === fmt
                          ? "bg-ink text-paper border-ink font-semibold"
                          : "bg-paper border-hairline text-ink hover:bg-canvas"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. GOVERNANCE & SOX */}
          {activeTab === "governance" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[14px] font-semibold text-ink">Internal Financial Controls & Approvals</h4>
                <p className="text-[12px] text-mid-gray">Compliance thresholds and statutory sign-off rules</p>
              </div>

              <div className="p-4 rounded-[18px] bg-canvas/50 border border-hairline space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-ink">Dual-Authorization Threshold</div>
                    <div className="text-[11.5px] text-mid-gray">Variances exceeding this amount require Controller sign-off</div>
                  </div>
                  <span className="font-mono text-[13px] font-bold text-ink">
                    ${highValueCutoff.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[5000, 10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setHighValueCutoff(amt)}
                      className={`px-3 py-1 rounded-[10px] text-[11.5px] border cursor-pointer transition-colors ${
                        highValueCutoff === amt
                          ? "bg-ink text-paper border-ink font-semibold"
                          : "bg-paper border-hairline text-ink hover:bg-canvas"
                      }`}
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto lock toggle */}
              <div className="p-4 rounded-[18px] bg-canvas/50 border border-hairline flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-ink">Automatic Period Lock on Close</div>
                  <div className="text-[11.5px] text-mid-gray">Freezes historical transactions when period status is closed</div>
                </div>
                <button
                  onClick={() => setAutoLockLedger(!autoLockLedger)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    autoLockLedger ? "bg-ink" : "bg-hairline"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-paper transition-transform ${
                      autoLockLedger ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-hairline bg-canvas/30 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="text-[12px] text-mid-gray hover:text-ink flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
