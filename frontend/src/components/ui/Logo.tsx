import React from "react"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showWordmark?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showWordmark = false,
  className = "",
}) => {
  const sizeMap = {
    xs: { box: 18, icon: 14, text: "text-[12px]", tag: "text-[9px]" },
    sm: { box: 26, icon: 20, text: "text-[13.5px]", tag: "text-[9.5px]" },
    md: { box: 34, icon: 24, text: "text-[16px]", tag: "text-[10px]" },
    lg: { box: 48, icon: 34, text: "text-[24px]", tag: "text-[12px]" },
    xl: { box: 64, icon: 46, text: "text-[30px]", tag: "text-[13px]" },
  }

  const { box, icon } = sizeMap[size]

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Monochromatic Financial Balance Mark */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-[10px] bg-ink border border-ink overflow-hidden"
        style={{
          width: box,
          height: box,
        }}
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Top Balance Bar */}
          <rect
            x="6"
            y="7"
            width="14"
            height="3.5"
            rx="1.75"
            fill="#ffffff"
          />

          {/* Central Stem */}
          <path
            d="M12 7 L12 25"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Precision Diamond Nexus */}
          <rect
            x="13.5"
            y="13.5"
            width="5"
            height="5"
            rx="1"
            transform="rotate(45 16 16)"
            fill="#ffffff"
          />

          {/* Secondary Balance Wing */}
          <rect
            x="16"
            y="21.5"
            width="10"
            height="3.5"
            rx="1.75"
            fill="#a3a3a3"
          />

          {/* Single Ember Accent Dot per DESIGN.md */}
          <circle
            cx="24"
            cy="10"
            r="2.2"
            fill="#e7000b"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-semibold tracking-[-0.03em] text-ink ${sizeMap[size].text}`}>
              Tallybook
            </span>
          </div>
          <span className={`font-mono text-mid-gray tracking-tight ${sizeMap[size].tag}`}>
            AI Finance Controller
          </span>
        </div>
      )}
    </div>
  )
}
