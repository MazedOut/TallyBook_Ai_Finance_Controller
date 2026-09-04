import React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "soft" | "outline" | "ember"
  size?: "sm" | "md"
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "soft",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 font-medium rounded-[18px] select-none transition-colors"
  
  const variants = {
    solid: "bg-ink text-paper border border-transparent",
    soft: "bg-canvas text-ink border border-hairline",
    outline: "bg-transparent text-ink border border-hairline",
    ember: "bg-[#fef2f2] text-ember border border-[#fee2e2]"
  }

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] leading-tight",
    md: "px-2.5 py-1 text-[12px] leading-tight"
  }

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  )
}
