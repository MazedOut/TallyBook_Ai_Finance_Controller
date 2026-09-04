import React, { useState } from "react"
import { 
  Search, 
  Plus, 
  Play, 
  UploadCloud, 
  FileText, 
  History, 
  PanelLeft, 
  ChevronDown,
  RotateCcw,
  LogOut,
  Sparkles
} from "lucide-react"
import { Badge } from "../ui/Badge"
import { useAuth } from "../../hooks/useAuth"
import { useWorkspace, WorkspaceIcon } from "../../hooks/useWorkspace"

interface MacWindowFrameProps {
  children: React.ReactNode
  currentTab: string
  setCurrentTab: (tab: string) => void
  onRunBatch: () => void
  isRunning: boolean
  latestRunId?: string
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOpenImportSheet: (type?: "bank" | "ledger") => void
  onOpenManualEntry: (type?: "bank" | "ledger") => void
  onOpenImportHistory: () => void
  onResetDemo: () => void
  onOpenAssistant: () => void
}

export const MacWindowFrame: React.FC<MacWindowFrameProps> = ({
  children,
  currentTab,
  setCurrentTab,
  onRunBatch,
  isRunning,
  latestRunId,
  isSidebarOpen,
  setIsSidebarOpen,
  onOpenImportSheet,
  onOpenManualEntry,
  onOpenImportHistory,
  onResetDemo,
  onOpenAssistant,
}) => {
  const { user, isDemoMode, logout } = useAuth()
  const { activeWorkspace } = useWorkspace()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)

  const tabLabels: Record<string, string> = {
    dashboard: "Overview & Accounts",
    reconcile: "Book Matching",
    "what-if": "Scenario Simulator",
    stats: "Financial Reports & Trends",
    approvals: "Review & Approvals",
    audit: "Activity History",
    periods: "Month-End Close",
    admin: "Matching Rules",
    design: "Design System & Tokens",
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas text-ink overflow-hidden font-sans select-none antialiased">
      {/* Unified Professional macOS Top Bar (Height: 52px) */}
      <header className="h-[52px] bg-paper border-b border-hairline px-4 flex items-center justify-between shrink-0 z-40 gap-4">
        {/* Left: Window Controls + Sidebar Toggle + View Title + Account Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* macOS Traffic Lights */}
          <div className="flex items-center gap-2 group">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center cursor-pointer shadow-xs">
              <span className="text-[9px] text-[#4a0002] opacity-0 group-hover:opacity-100 font-bold leading-none select-none">
                &times;
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center cursor-pointer shadow-xs">
              <span className="text-[10px] text-[#5e3e00] opacity-0 group-hover:opacity-100 font-bold leading-none -mt-1 select-none">
                &minus;
              </span>
            </div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center cursor-pointer shadow-xs">
              <span className="text-[7px] text-[#004f0c] opacity-0 group-hover:opacity-100 font-bold leading-none select-none">
                &#43;
              </span>
            </div>
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen((prev: boolean) => !prev)}
            title="Toggle Sidebar (⌘B)"
            className="p-1.5 rounded-[8px] hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-hairline" />

          {/* Active View Label */}
          <div className="flex items-center gap-2">
            <h1 className="text-[14.5px] font-semibold text-ink tracking-tight">
              {tabLabels[currentTab] || "Overview"}
            </h1>
            <span className="text-[11px] font-mono text-mid-gray bg-canvas px-2 py-0.5 rounded-[6px] border border-hairline">
              {activeWorkspace.glAccount}
            </span>
          </div>
        </div>

        {/* Center: Corporate Subsidiary Breadcrumb (Clean Vector Emblem, No Emojis) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-[14px] bg-canvas border border-hairline text-[12px] font-medium text-ink shadow-2xs shrink-0">
          <WorkspaceIcon id={activeWorkspace.id} className="w-3.5 h-3.5 text-ink" />
          <span className="font-semibold">{activeWorkspace.shortName}</span>
          <span className="text-mid-gray/40">&middot;</span>
          <span className="text-mid-gray font-normal">{activeWorkspace.bankAccount}</span>
          <span className="text-mid-gray/40">&rarr;</span>
          <span className="font-mono text-mid-gray font-semibold">
            {activeWorkspace.glAccount}
          </span>
          <span className="text-mid-gray/30">|</span>
          <span className="text-[10px] font-mono text-mid-gray">
            {isDemoMode ? "Sample Data" : "Live"}
          </span>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Search Field */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-mid-gray pointer-events-none" />
            <input
              type="text"
              placeholder="Search (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[34px] w-40 lg:w-48 rounded-[18px] bg-canvas border border-hairline pl-9 pr-7 text-[12.5px] text-ink outline-none focus:border-ink/40 focus:w-52 transition-all placeholder:text-mid-gray"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-mid-gray hover:text-ink text-[14px] cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>

          {/* Add Action Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="h-[34px] px-3 rounded-[18px] bg-canvas hover:bg-[#ebebeb] text-ink text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-hairline"
              title="Add data or manual record"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
              <ChevronDown className="w-3 h-3 text-mid-gray" />
            </button>

            {isAddMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAddMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 w-60 bg-paper rounded-[14px] border border-hairline p-1.5 shadow-lg z-50 text-[12.5px] space-y-0.5">
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false)
                      onOpenImportSheet("bank")
                    }}
                    className="w-full px-3 py-2 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2.5 text-ink cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-ink" />
                    <div>
                      <div className="font-medium">Import Bank Statement…</div>
                      <div className="text-[11px] text-mid-gray">CSV, TSV, or JSON export</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false)
                      onOpenImportSheet("ledger")
                    }}
                    className="w-full px-3 py-2 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2.5 text-ink cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-ink" />
                    <div>
                      <div className="font-medium">Import Ledger Entries…</div>
                      <div className="text-[11px] text-mid-gray">ERP General Ledger export</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-hairline" />

                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false)
                      onOpenManualEntry("bank")
                    }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-ink cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-mid-gray" />
                    <span>Add Bank Transaction</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false)
                      onOpenManualEntry("ledger")
                    }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-ink cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-mid-gray" />
                    <span>Add Ledger Voucher</span>
                  </button>

                  <div className="my-1 border-t border-hairline" />

                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false)
                      onOpenImportHistory()
                    }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-ink cursor-pointer"
                  >
                    <History className="w-4 h-4 text-mid-gray" />
                    <span>View Import History</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false)
                      onResetDemo()
                    }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-mid-gray hover:text-ink cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* AI Copilot Button */}
          <button
            onClick={onOpenAssistant}
            className="h-[34px] px-3 rounded-[18px] bg-paper hover:bg-canvas border border-hairline hover:border-[#d4d4d4] text-ink text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs group"
            title="Open AI Assistant (⌘J)"
          >
            <Sparkles className="w-3.5 h-3.5 text-ink group-hover:rotate-12 transition-transform" />
            <span>AI Assistant</span>
            <span className="font-mono text-[9.5px] text-mid-gray bg-canvas px-1 py-0.2 rounded-[4px] border border-hairline">⌘J</span>
          </button>

          {/* Primary Action Button: Auto-Match */}
          <button
            onClick={onRunBatch}
            disabled={isRunning}
            className="h-[34px] px-3.5 rounded-[18px] bg-ink text-paper text-[12.5px] font-medium hover:bg-ink-soft active:opacity-90 disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-pulse" : ""}`} />
            <span>{isRunning ? "Matching…" : "Auto-Match"}</span>
          </button>

          {/* User Sign-Out */}
          <button
            onClick={logout}
            title="Sign Out / Return to Login"
            className="h-[34px] w-[34px] rounded-[18px] hover:bg-canvas text-mid-gray hover:text-ink transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-hairline"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Canvas & Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  )
}
