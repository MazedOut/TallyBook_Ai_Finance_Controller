import React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-[18px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.99]"
    
    const variants = {
      primary: "bg-[#0a0a0a] text-[#fafafa] hover:bg-[#171717] border-none shadow-none",
      secondary: "bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#eaeaea] border-none",
      outline: "bg-transparent text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#f5f5f5] hover:border-[#d4d4d4]",
      destructive: "bg-transparent text-[#e7000b] border border-[#fed7d7] hover:bg-[#fff5f5]"
    }

    const sizes = {
      sm: "h-[32px] px-3 text-[13px] gap-1.5",
      md: "h-[38px] px-4 text-[14px] gap-2",
      lg: "h-[44px] px-5 text-[15px] gap-2.5"
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
