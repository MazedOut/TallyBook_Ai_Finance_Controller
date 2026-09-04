import React, { useState } from "react"
import { Plus, ChevronDown } from "lucide-react"
import { useWorkspace, DEMO_WORKSPACES, WorkspaceIcon } from "../../hooks/useWorkspace"
import { cn } from "../../lib/utils"

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="px-2 pb-1">
      {/* Active workspace chip — click to expand */}
      <button
        onClick={() => setIsExpanded(p => !p)}
        className="w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] bg-canvas border border-hairline hover:border-[#d1d1d6] transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-[8px] bg-paper border border-hairline flex items-center justify-center text-ink shrink-0 shadow-2xs">
            <WorkspaceIcon id={activeWorkspace.id} className="w-3.5 h-3.5 text-ink" />
          </div>
          <div className="min-w-0 text-left">
            <div className="text-[12.5px] font-semibold text-ink truncate leading-tight">
              {activeWorkspace.shortName}
            </div>
            <div className="text-[10.5px] text-mid-gray truncate leading-none mt-0.5">
              {activeWorkspace.industry}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-mid-gray shrink-0 transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded workspace list */}
      {isExpanded && (
        <div className="mt-1 rounded-[14px] border border-hairline bg-paper shadow-lg overflow-hidden">
          <div className="p-1 space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-mid-gray/70">
              Corporate Subsidiaries
            </div>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => {
                  switchWorkspace(ws.id)
                  setIsExpanded(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-left transition-colors cursor-pointer",
                  activeWorkspace.id === ws.id
                    ? "bg-canvas"
                    : "hover:bg-canvas"
                )}
              >
                <div className="w-6 h-6 rounded-[8px] bg-canvas border border-hairline flex items-center justify-center text-ink shrink-0">
                  <WorkspaceIcon id={ws.id} className="w-3.5 h-3.5 text-ink" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-ink truncate">{ws.name}</div>
                  <div className="text-[10.5px] text-mid-gray truncate">{ws.bankAccount}</div>
                </div>
                {activeWorkspace.id === ws.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Divider + Add */}
          <div className="border-t border-hairline/70 p-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-[12px] text-mid-gray hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subsidiary Ledger…</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
