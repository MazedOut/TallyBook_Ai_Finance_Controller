import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  maxWidth?: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = "max-w-2xl",
  children
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/30 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-paper rounded-[24px] border border-hairline shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col",
              maxWidth
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-hairline/60">
              <div>
                {title && <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink">{title}</h2>}
                {description && <p className="text-[13px] text-mid-gray mt-0.5">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-[18px] p-1.5 text-mid-gray hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 py-5 overflow-y-auto flex-1 text-ink text-[14px]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
