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
    solid: "bg-[#171717] text-[#fafafa] border border-transparent",
    soft: "bg-[#f5f5f5] text-[#171717] border border-transparent",
    outline: "bg-transparent text-[#0a0a0a] border border-[#e5e5e5]",
    ember: "bg-[#fff5f5] text-[#e7000b] border border-[#fed7d7]"
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
