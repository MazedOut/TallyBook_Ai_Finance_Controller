import React from "react"
import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3 text-mid-gray pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-[38px] rounded-[18px] bg-canvas text-ink text-[14px] px-3.5 outline-none transition-all placeholder:text-mid-gray",
            "border border-transparent focus:border-hairline focus:bg-paper focus:ring-1 focus:ring-hairline",
            icon && "pl-9",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = "Input"
