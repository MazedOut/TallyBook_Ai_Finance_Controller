import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  ArrowRight, 
  RotateCcw, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  UploadCloud, 
  Sliders, 
  ShieldCheck, 
  FileSpreadsheet,
  Minimize2,
  Maximize2
} from "lucide-react"
import { api } from "../../lib/api"
import type { ChatMessage } from "../../types"

interface AIAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: string) => void
  onRunBatch: () => void
  onOpenImportSheet: (type?: "bank" | "ledger") => void
  onResetDemo: () => void
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "assistant",
    text: `### Tallybook AI Finance Controller\n\nI am your autonomous financial copilot. I monitor bank transactions against your General Ledger (GL-1010), highlight variances, and guide regulatory reconciliation.\n\nHow can I help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggested_actions: [
      "How do I import bank transactions?",
      "Current reconciliation status",
      "Explain outstanding variance",
      "Check Controller Approvals",
      "What-If Simulator tips",
      "Where is the demo data?"
    ],
    metrics_snapshot: {
      match_rate: "94.7%",
      reconciled_volume: "$1,248,590.25",
      variance_exposure: "$42,150.00",
      cleared_count: 71,
      exceptions_count: 30,
      high_value_pending: 4
    }
  }
]

const QUICK_PROMPTS = [
  { label: "Import Data", query: "How do I import financial data?" },
  { label: "Reconciliation Status", query: "What is the current reconciliation status?" },
  { label: "Explain Variance", query: "Analyze outstanding variance and root causes" },
  { label: "Controller Sign-Offs", query: "What items require controller approval?" },
  { label: "What-If Simulator", query: "How does the what-if simulator work?" },
  { label: "Benchmark Batches", query: "What sample demo files are available?" }
]

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRunBatch,
  onOpenImportSheet,
  onResetDemo,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
      scrollToBottom()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputMessage("")
    setIsLoading(true)

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender,
        content: m.text
      }))

      const res = await api.assistant.sendMessage(text, historyPayload)

      const assistantMsg: ChatMessage = {
        id: res.id || `assistant-${Date.now()}`,
        sender: "assistant",
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggested_actions: res.suggested_actions,
        metrics_snapshot: res.metrics_snapshot
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error("Assistant chat failed:", err)
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "Apologies, I encountered an issue connecting to the reconciliation engine. Please make sure the local server is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionClick = (action: string) => {
    const lower = action.toLowerCase()

    if (lower.includes("open import sheet") || lower.includes("import") || lower.includes("chase batch")) {
      onOpenImportSheet("bank")
    } else if (lower.includes("run") || lower.includes("reconcile batch")) {
      onRunBatch()
    } else if (lower.includes("cleared") || lower.includes("transactions") || lower.includes("differences in reconcile")) {
      onNavigate("reconcile")
    } else if (lower.includes("variance") || lower.includes("open variance")) {
      onNavigate("reconcile")
    } else if (lower.includes("approval") || lower.includes("sign-off") || lower.includes("controller")) {
      onNavigate("approvals")
    } else if (lower.includes("what-if") || lower.includes("simulator") || lower.includes("counterfactual")) {
      onNavigate("what-if")
    } else if (lower.includes("audit") || lower.includes("trail")) {
      onNavigate("audit")
    } else if (lower.includes("analytics") || lower.includes("stats")) {
      onNavigate("stats")
    } else if (lower.includes("reset") || lower.includes("benchmark")) {
      onResetDemo()
    } else {
      // Send as follow-up query
      handleSendMessage(action)
    }
  }

  // Simple Markdown parser for clean formatting
  const renderMarkdown = (content: string) => {
    const lines = content.split("\n")
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-semibold text-[14px] text-primary-ink mt-2 mb-1.5 flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h4>
        )
      }
      // Bullet point
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const itemText = line.replace(/^[-*]\s+/, "")
        return (
          <li key={idx} className="text-[12.5px] leading-relaxed text-primary-ink/90 ml-4 list-disc my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </li>
        )
      }
      // Numbered item
      if (/^\d+\.\s+/.test(line)) {
        const itemText = line.replace(/^\d+\.\s+/, "")
        return (
          <div key={idx} className="text-[12.5px] leading-relaxed text-primary-ink/90 ml-2 my-1 flex items-start gap-1.5">
            <span className="font-mono text-electric-blue shrink-0">{line.match(/^\d+\./)?.[0]}</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </div>
        )
      }
      // Blank line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />
      }
      // Normal paragraph
      return (
        <p key={idx} className="text-[12.5px] leading-relaxed text-primary-ink/90 my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      )
    })
  }

  const formatInline = (text: string) => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary-ink">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-mid-gray">$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="font-mono text-[11px] bg-canvas px-1.5 py-0.5 rounded border border-hairline text-electric-blue">$1</code>')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
        {/* Backdrop for mobile / outside click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary-ink/20 backdrop-blur-xs pointer-events-auto"
        />

        {/* Apple-styled Slide-Over Panel */}
        <motion.div
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className={`relative h-full bg-paper/95 backdrop-blur-xl border-l border-hairline shadow-2xl flex flex-col pointer-events-auto transition-all duration-200 z-50 ${
            isExpanded ? "w-[680px]" : "w-[440px]"
          }`}
        >
          {/* Header Bar */}
          <div className="h-14 px-4 border-b border-hairline flex items-center justify-between bg-paper/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-paper" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[13.5px] text-ink">AI Finance Controller</span>
                  <span className="text-[10px] font-mono text-mid-gray bg-canvas px-1.5 py-0.2 rounded-[10px] border border-hairline">
                    Copilot
                  </span>
                </div>
                <div className="text-[11px] text-mid-gray">
                  Autonomous Reconciliation & Policy Advisor
                </div>
              </div>
            </div>

            {/* Header Window Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages(INITIAL_MESSAGES)}
                title="Reset conversation"
                className="p-1.5 rounded-[8px] hover:bg-cool-wash text-mid-gray hover:text-primary-ink transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Standard width" : "Expand width"}
                className="p-1.5 rounded-[8px] hover:bg-cool-wash text-mid-gray hover:text-primary-ink transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                title="Close (Esc)"
                className="p-1.5 rounded-[8px] hover:bg-cool-wash text-mid-gray hover:text-primary-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Horizontal Scroll Strip */}
          <div className="px-3 py-2 bg-canvas border-b border-hairline overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(qp.query)}
                className="px-2.5 py-1 rounded-full bg-paper hover:bg-cool-wash border border-hairline text-[11.5px] font-medium text-primary-ink/90 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => {
              const isAssistant = m.sender === "assistant"

              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isAssistant ? "items-start" : "items-end justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-blue flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2.5 ${isAssistant ? "" : "flex flex-col items-end"}`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 rounded-[16px] text-[13px] leading-relaxed select-text shadow-2xs ${
                        isAssistant
                          ? "bg-paper border border-hairline text-primary-ink rounded-tl-[4px]"
                          : "bg-electric-blue text-paper rounded-tr-[4px]"
                      }`}
                    >
                      {isAssistant ? (
                        <div>{renderMarkdown(m.text)}</div>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}
                    </div>

                    {/* Financial Metrics Strip if attached to message */}
                    {isAssistant && m.metrics_snapshot && (
                      <div className="p-2.5 rounded-[12px] bg-canvas border border-hairline grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        {m.metrics_snapshot.match_rate && (
                          <div>
                            <div className="text-mid-gray text-[10px]">Match Rate</div>
                            <div className="font-semibold text-primary-ink text-[12px]">
                              {m.metrics_snapshot.match_rate}
                            </div>
                          </div>
                        )}
                        {m.metrics_snapshot.reconciled_volume && (
                          <div>
                            <div className="text-mid-gray text-[10px]">Cleared Volume</div>
                            <div className="font-semibold font-mono text-primary-ink text-[12px]">
                              {m.metrics_snapshot.reconciled_volume}
                            </div>
                          </div>
                        )}
                        {m.metrics_snapshot.variance_exposure && (
                          <div>
                            <div className="text-mid-gray text-[10px]">Open Variance</div>
                            <div className="font-semibold font-mono text-ember text-[12px]">
                              {m.metrics_snapshot.variance_exposure}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactive Suggested Actions */}
                    {isAssistant && m.suggested_actions && m.suggested_actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.suggested_actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper hover:bg-cool-wash border border-hairline hover:border-electric-blue text-[11.5px] font-medium text-electric-blue transition-all cursor-pointer shadow-2xs group"
                          >
                            <span>{act}</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Timestamp */}
                    <div className="text-[10px] text-mid-gray px-1">
                      {m.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-primary-ink text-paper flex items-center justify-center shrink-0 mb-1 text-[10px] font-semibold">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-mid-gray text-[12px] p-2">
                <div className="w-5 h-5 rounded-full bg-cool-wash flex items-center justify-center animate-spin">
                  <Sparkles className="w-3 h-3 text-electric-blue" />
                </div>
                <span>Analyzing ledger entries and financial rules...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 border-t border-hairline bg-paper shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="relative flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about variances, import procedures, or rules..."
                className="w-full h-10 pl-3.5 pr-11 bg-canvas border border-hairline rounded-[12px] text-[13px] text-primary-ink placeholder:text-mid-gray outline-none focus:border-electric-blue focus:bg-paper transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-1.5 w-7 h-7 rounded-[8px] bg-electric-blue text-paper disabled:opacity-30 disabled:bg-cool-wash disabled:text-mid-gray flex items-center justify-center hover:bg-[#0077ed] transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-mid-gray mt-2 px-1">
              <span>Press <kbd className="font-mono bg-canvas px-1 py-0.5 rounded border border-hairline">Enter</kbd> to send</span>
              <span>Autonomous Local Engine &bull; Zero External Leaks</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
