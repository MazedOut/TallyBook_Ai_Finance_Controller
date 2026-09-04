import React from "react"
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
  Zap,
  ArrowRightLeft
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { Badge } from "../ui/Badge"
import { cn } from "../../lib/utils"
import type { UserRole } from "../../types"

interface SidebarProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, role, switchRole, demoAccounts, logout } = useAuth()

  const navItems = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "reconcile", label: "Reconciliation", icon: <GitCompare className="w-4 h-4" />, badge: "50+ Batch" },
    { id: "what-if", label: "What-If Simulator", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "stats", label: "Intelligence & Stats", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "approvals", label: "Sign-Off Approvals", icon: <CheckSquare className="w-4 h-4" />, roleGate: ["controller", "auditor", "admin"] },
    { id: "audit", label: "Immutable Audit", icon: <History className="w-4 h-4" /> },
    { id: "periods", label: "Period Close", icon: <CalendarClock className="w-4 h-4" /> },
    { id: "admin", label: "Settings & Rules", icon: <Settings className="w-4 h-4" />, roleGate: ["admin"] },
  ]

  const rolesList: { role: UserRole; name: string }[] = [
    { role: "analyst", name: "Sarah (Analyst)" },
    { role: "controller", name: "Marcus (Controller)" },
    { role: "auditor", name: "Elena (Auditor)" },
    { role: "admin", name: "Alex (Admin)" },
  ]

  return (
    <aside className="w-64 shrink-0 h-screen sidebar-surface flex flex-col justify-between select-none">
      {/* Brand & App Title */}
      <div>
        <div className="h-16 flex items-center px-6 gap-2.5 border-b border-hairline/70">
          <div className="w-8 h-8 rounded-[10px] bg-ink flex items-center justify-center text-paper font-semibold text-[15px] shadow-xs">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] tracking-[-0.025em] text-ink">Tallybook</span>
              <span className="text-[10px] font-mono bg-canvas px-1.5 py-0.5 rounded-[6px] border border-hairline text-mid-gray">v1.0</span>
            </div>
            <p className="text-[11px] text-mid-gray -mt-0.5 font-medium">AI Finance Controller</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-mid-gray">
            Operations & Controls
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-[13.5px] font-medium rounded-[14px] transition-all cursor-pointer",
                  isActive
                    ? "bg-canvas text-ink font-semibold shadow-xs"
                    : "text-mid-gray hover:text-ink hover:bg-canvas/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn(isActive ? "text-ink" : "text-mid-gray")}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-paper border border-hairline text-ink">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Role & Persona Switcher Card */}
      <div className="p-3 border-t border-hairline/80 bg-paper/50">
        <div className="px-2 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.05em] text-mid-gray">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Persona</span>
          </div>
          <Badge variant="solid" size="sm" className="capitalize text-[10px]">
            {role}
          </Badge>
        </div>

        {/* Current User Info */}
        <div className="flex items-center gap-2.5 p-2 rounded-[14px] bg-canvas border border-hairline/60 mb-2">
          <div className="w-7 h-7 rounded-full bg-ink text-paper text-[11px] font-semibold flex items-center justify-center shrink-0">
            {user?.avatar_initials || "TB"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink truncate leading-tight">
              {user?.full_name}
            </div>
            <div className="text-[11px] text-mid-gray truncate leading-tight mt-0.5">
              {user?.department}
            </div>
          </div>
        </div>

        {/* 1-Click Role Switcher Grid */}
        <div className="text-[10px] text-mid-gray px-1 mb-1 font-medium flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3" />
          <span>Switch Persona (Demo Mode):</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {rolesList.map((r) => (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={cn(
                "px-2 py-1.5 text-[11px] font-medium rounded-[10px] border transition-all text-left truncate cursor-pointer",
                role === r.role
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper hover:bg-canvas border-hairline text-ink"
              )}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Sign Out Action */}
        <div className="pt-2 text-center">
          <button
            onClick={logout}
            className="text-[11px] text-mid-gray hover:text-ink transition-colors cursor-pointer"
          >
            Sign out / Return to login
          </button>
        </div>
      </div>
    </aside>
  )
}
