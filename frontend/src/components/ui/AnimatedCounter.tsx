import React, { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  formatNumber?: boolean
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  formatNumber = true,
}) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => {
    const rounded = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString()
    if (formatNumber) {
      const parts = rounded.split(".")
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      return `${prefix}${parts.join(".")}${suffix}`
    }
    return `${prefix}${rounded}${suffix}`
  })

  const [displayValue, setDisplayValue] = useState<string>(() => {
    const rounded = decimals > 0 ? (0).toFixed(decimals) : "0"
    return `${prefix}${rounded}${suffix}`
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest)
    })
    return () => unsubscribe()
  }, [display])

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  )
}
