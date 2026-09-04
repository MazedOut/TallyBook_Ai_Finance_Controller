import React, { useState } from "react"
import { 
  LayoutDashboard, 
  GitCompare, 
  FlaskConical, 
  BarChart3, 
  CheckSquare, 
  History, 
  CalendarClock, 
  Settings, 
  ShieldCheck,
  Palette,
  UploadCloud,
  PlusCircle,
  FileSpreadsheet,
  RotateCcw,
  ChevronDown,
  LogOut
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { Logo } from "../ui/Logo"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import { cn } from "../../lib/utils"
import type { UserRole } from "../../types"

interface SidebarProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
  onOpenImportSheet: (type?: "bank" | "ledger") => void
  onOpenManualEntry: (type?: "bank" | "ledger") => void
  onOpenImportHistory: () => void
  onResetDemo: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab,
  onOpenImportSheet,
  onOpenManualEntry,
  onOpenImportHistory,
  onResetDemo,
}) => {
  const { user, role, switchRole, logout, isDemoMode } = useAuth()
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false)
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  const workspaceNav = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-[18px] h-[18px] shrink-0" /> },
    { id: "reconcile", label: "Matching", icon: <GitCompare className="w-[18px] h-[18px] shrink-0" />, badge: "50+" },
    { id: "what-if", label: "Simulate", icon: <FlaskConical className="w-[18px] h-[18px] shrink-0" /> },
    { id: "stats", label: "Reports", icon: <BarChart3 className="w-[18px] h-[18px] shrink-0" /> },
  ]

  const governanceNav = [
    { id: "approvals", label: "Approvals", icon: <CheckSquare className="w-[18px] h-[18px] shrink-0" /> },
    { id: "audit", label: "Activity Log", icon: <History className="w-[18px] h-[18px] shrink-0" /> },
    { id: "periods", label: "Month-End Close", icon: <CalendarClock className="w-[18px] h-[18px] shrink-0" /> },
  ]

  const rolesList: { role: UserRole; name: string }[] = [
    { role: "analyst", name: "Sarah (Analyst)" },
    { role: "controller", name: "Marcus (Controller)" },
    { role: "auditor", name: "Elena (Auditor)" },
    { role: "admin", name: "Alex (Admin)" },
  ]

  const NavItem = ({ item }: { item: typeof workspaceNav[0] }) => {
    const isActive = currentTab === item.id
    return (
      <button
        key={item.id}
        onClick={() => setCurrentTab(item.id)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-[13.5px] font-medium rounded-[10px] transition-colors cursor-pointer text-left",
          isActive
            ? "bg-canvas text-ink font-semibold border border-hairline/80 shadow-2xs"
            : "text-mid-gray hover:text-ink hover:bg-canvas/50"
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn(isActive ? "text-ink" : "text-mid-gray")}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </div>
        {"badge" in item && item.badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[6px] bg-paper border border-hairline text-mid-gray">
            {item.badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="w-56 shrink-0 h-full bg-[#fbfbfd] border-r border-hairline flex flex-col justify-between select-none text-ink">
      {/* Scrollable nav area */}
      <div className="overflow-y-auto flex-1 py-3 space-y-3">
        {/* Brand header */}
        <div className="px-4 flex items-center justify-between">
          <Logo size="sm" showWordmark />
          <span className="text-[10.5px] font-mono text-mid-gray bg-paper px-1.5 py-0.5 rounded-[6px] border border-hairline">
            v1.0
          </span>
        </div>

        {/* Workspace Switcher (Excel-style sheet tabs) */}
        <WorkspaceSwitcher />

        {/* Divider */}
        <div className="mx-3 border-t border-hairline/60" />

        {/* 1. WORKSPACE NAV */}
        <div className="px-2">
          <div className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-mid-gray/70 mb-0.5">
            Workspace
          </div>
          <div className="space-y-0.5">
            {workspaceNav.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* 2. GOVERNANCE */}
        <div className="px-2">
          <div className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase text-mid-gray/70 mb-0.5">
            Governance
          </div>
          <div className="space-y-0.5">
            {governanceNav.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* 3. DATA — Collapsed into single dropdown button */}
        <div className="px-2">
          <div className="relative">
            <button
              onClick={() => setIsDataMenuOpen(p => !p)}
              className="w-full flex items-center justify-between px-3 py-2 text-[13.5px] font-medium rounded-[10px] text-mid-gray hover:text-ink hover:bg-canvas/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <UploadCloud className="w-[18px] h-[18px] text-mid-gray shrink-0" />
                <span>Add Data</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-mid-gray transition-transform", isDataMenuOpen && "rotate-180")} />
            </button>

            {isDataMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsDataMenuOpen(false)} />
                <div className="absolute left-0 top-10 w-56 bg-paper rounded-[14px] border border-hairline p-1 shadow-lg z-40 text-[12.5px] space-y-0.5">
                  <button
                    onClick={() => { setIsDataMenuOpen(false); onOpenImportSheet("bank") }}
                    className="w-full px-3 py-2 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 cursor-pointer text-ink"
                  >
                    <UploadCloud className="w-4 h-4 text-ink" />
                    <div>
                      <div className="font-medium">Import Bank Statement</div>
                      <div className="text-[10.5px] text-mid-gray">CSV, TSV or JSON</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setIsDataMenuOpen(false); onOpenImportSheet("ledger") }}
                    className="w-full px-3 py-2 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 cursor-pointer text-ink"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-ink" />
                    <div>
                      <div className="font-medium">Import Ledger Entries</div>
                      <div className="text-[10.5px] text-mid-gray">ERP GL export</div>
                    </div>
                  </button>
                  <div className="my-0.5 border-t border-hairline/70" />
                  <button
                    onClick={() => { setIsDataMenuOpen(false); onOpenManualEntry("bank") }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-ink cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-mid-gray" />
                    <span>Manual Entry</span>
                  </button>
                  <button
                    onClick={() => { setIsDataMenuOpen(false); onOpenImportHistory() }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-ink cursor-pointer"
                  >
                    <History className="w-4 h-4 text-mid-gray" />
                    <span>Import History</span>
                  </button>
                  <button
                    onClick={() => { setIsDataMenuOpen(false); onResetDemo() }}
                    className="w-full px-3 py-1.5 rounded-[8px] hover:bg-canvas text-left flex items-center gap-2 text-mid-gray hover:text-ink cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Rule Config Link */}
          <button
            onClick={() => setCurrentTab("admin")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-[13.5px] font-medium rounded-[10px] transition-colors cursor-pointer text-left mt-0.5",
              currentTab === "admin"
                ? "bg-canvas text-ink font-semibold border border-hairline/80 shadow-2xs"
                : "text-mid-gray hover:text-ink hover:bg-canvas/50"
            )}
          >
            <Settings className={cn("w-[18px] h-[18px] shrink-0", currentTab === "admin" ? "text-ink" : "text-mid-gray")} />
            <span>Matching Rules</span>
          </button>

          {/* Design System Reference Link */}
          <button
            onClick={() => setCurrentTab("design")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-[13.5px] font-medium rounded-[10px] transition-colors cursor-pointer text-left mt-0.5",
              currentTab === "design"
                ? "bg-canvas text-ink font-semibold border border-hairline/80 shadow-2xs"
                : "text-mid-gray hover:text-ink hover:bg-canvas/50"
            )}
          >
            <Palette className={cn("w-[18px] h-[18px] shrink-0", currentTab === "design" ? "text-ink" : "text-mid-gray")} />
            <span>Design System</span>
          </button>
        </div>
      </div>

      {/* Footer — compact user card */}
      <div className="p-3 border-t border-hairline shrink-0">
        <div
          className="flex items-center gap-2 p-2 rounded-[10px] hover:bg-canvas transition-colors cursor-pointer"
          onClick={() => setShowRoleSwitcher(p => !p)}
        >
          <div className="w-7 h-7 rounded-full bg-ink text-paper text-[11px] font-semibold flex items-center justify-center shrink-0">
            {user?.avatar_initials || "TB"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium text-ink truncate">
              {user?.full_name || "Marcus Vance"}
            </div>
            <div className="text-[10.5px] text-mid-gray capitalize">
              {role}
            </div>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-mid-gray shrink-0 transition-transform", showRoleSwitcher && "rotate-180")} />
        </div>

        {/* Role Switcher — revealed on click */}
        {showRoleSwitcher && (
          <div className="mt-2 space-y-1.5">
            <div className="text-[10px] text-mid-gray px-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-mid-gray" />
              <span>Switch role (demo)</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {rolesList.map(r => (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded-[6px] border transition-colors text-left truncate cursor-pointer",
                    role === r.role
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper hover:bg-canvas border-hairline text-ink"
                  )}
                >
                  {r.name.split(" ")[0]}
                </button>
              ))}
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-1.5 text-[11.5px] text-mid-gray hover:text-ink transition-colors cursor-pointer px-1 pt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
