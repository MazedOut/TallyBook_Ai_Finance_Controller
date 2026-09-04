import React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-[18px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:opacity-90"
    
    const variants = {
      primary: "bg-ink text-paper hover:bg-ink-soft border-none",
      secondary: "bg-canvas text-ink hover:bg-[#ebebeb] border-none",
      outline: "bg-transparent text-ink border border-hairline hover:bg-canvas hover:border-[#d4d4d4]",
      destructive: "bg-paper text-ember border border-[#fee2e2] hover:bg-[#fef2f2]"
    }

    const sizes = {
      sm: "h-[32px] px-3 text-[12.5px] gap-1.5",
      md: "h-[36px] px-4 text-[13.5px] gap-2",
      lg: "h-[42px] px-5 text-[14.5px] gap-2.5"
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
