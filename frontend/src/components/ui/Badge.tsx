import React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "soft" | "outline" | "ember" | "emerald" | "indigo" | "amber" | "purple" | "teal"
  size?: "sm" | "md"
  pulse?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "soft",
  size = "md",
  pulse = false,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 font-medium rounded-[18px] select-none transition-colors"
  
  const variants = {
    solid: "bg-ink text-paper border border-transparent",
    soft: "bg-canvas text-ink border border-hairline",
    outline: "bg-transparent text-ink border border-hairline",
    ember: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    indigo: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
    teal: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30",
  }

  const pulseDotColors = {
    solid: "bg-paper",
    soft: "bg-ink",
    outline: "bg-ink",
    ember: "bg-rose-500",
    emerald: "bg-emerald-500",
    indigo: "bg-blue-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    teal: "bg-teal-500",
  }

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] leading-tight",
    md: "px-2.5 py-1 text-[12px] leading-tight"
  }

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 mr-0.5">
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseDotColors[variant])} />
          <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", pulseDotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  )
}
