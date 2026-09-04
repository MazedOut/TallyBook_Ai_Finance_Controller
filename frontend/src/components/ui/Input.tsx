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
          <span className="absolute left-3.5 text-mid-gray pointer-events-none flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-[40px] rounded-full bg-canvas text-primary-ink text-[14px] px-4 outline-none transition-colors placeholder:text-mid-gray",
            "border border-hairline focus:border-electric-blue focus:bg-paper",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = "Input"
