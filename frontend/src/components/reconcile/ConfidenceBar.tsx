import React from "react"
import { cn } from "../../lib/utils"

interface ConfidenceBarProps {
  confidence: number // 0.00 to 1.00
  showPercent?: boolean
  className?: string
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  showPercent = true,
  className
}) => {
  const pct = Math.min(100, Math.max(0, Math.round(confidence * 100)))

  // Color styling adhering strictly to monochromatic system + single destructive accent
  const barColor = pct >= 80 ? "bg-ink" : pct >= 55 ? "bg-mid-gray" : "bg-ember"

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div className="w-16 h-2 bg-canvas rounded-full overflow-hidden border border-hairline/80">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showPercent && (
        <span className="font-mono text-[12px] font-medium text-ink min-w-[34px]">
          {pct}%
        </span>
      )}
    </div>
  )
}
