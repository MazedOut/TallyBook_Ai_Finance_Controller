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
  AlertTriangle,
  CheckCircle2, 
  UploadCloud, 
  Sliders, 
  ShieldCheck, 
  FileSpreadsheet,
  Minimize2,
  Maximize2,
  Globe,
  BarChart3,
  Languages
} from "lucide-react"
import { api } from "../../lib/api"
import { cn } from "../../lib/utils"
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

const LANGUAGES = [
  { code: "en", name: "English", short: "EN", label: "Executive Briefing" },
  { code: "es", name: "Español", short: "ES", label: "Informe Ejecutivo" },
  { code: "fr", name: "Français", short: "FR", label: "Briefing Exécutif" },
  { code: "de", name: "Deutsch", short: "DE", label: "Vorstandsbericht" },
  { code: "ja", name: "日本語", short: "JA", label: "エグゼクティブ報告" },
  { code: "zh", name: "中文", short: "ZH", label: "执行对账简报" },
  { code: "pt", name: "Português", short: "PT", label: "Relatório Executivo" },
  { code: "hi", name: "हिन्दी", short: "HI", label: "कार्यकारी विवरण" },
]

const MULTILINGUAL_BRIEFINGS: Record<string, string> = {
  en: `### Executive Financial Controller Briefing (English)

**Autonomous Bank Reconciliation & Cash Positioning Summary**
- **Reconciliation Clearance Rate**: 98.4% (87 transactions verified autonomously).
- **Verified Book Volume**: $1,420,500.00 reconciled against General Ledger GL-1010.
- **Unresolved Variances**: $18,450.00 across 10 open exceptions under active triage.
- **High-Value Items (≥$10,000)**: 2 records pending dual-authorization controller sign-off.
- **Regulatory Integrity**: SOX 404 append-only SHA-256 hash chain verified.

*Controller Recommendation*: Authorize the 2 pending high-value items in the **Approvals** tab before initiating the month-end lock.`,

  es: `### Informe Ejecutivo de Control Financiero (Español)

**Resumen de Conciliación Bancaria y Posición de Caja**
- **Tasa de Conciliación Automática**: 98.4% (87 partidas liquidadas de forma autónoma).
- **Volumen Verificado en Libros**: $1,420,500.00 comprobado contra la cuenta mayor GL-1010.
- **Variaciones Pendientes**: $18,450.00 distribuidos en 10 diferencias por liquidar.
- **Aprobaciones de Alto Valor (≥$10,000)**: 2 partidas que requieren doble firma del Contralor.
- **Cumplimiento SOX 404**: Cadena criptográfica SHA-256 verificada e inmutable.

*Recomendación del Asistente*: Proceder a autorizar las 2 excepciones en la pestaña **Aprobaciones** para congelar el período fiscal.`,

  fr: `### Rapport Exécutif du Contrôleur Financier (Français)

**Synthèse du Rapprochement Bancaire et de Clôture**
- **Taux de Rapprochement Automatisé** : 98,4 % (87 transactions vérifiées de manière autonome).
- **Volume Rapproché au Grand Livre** : 1 420 500,00 $ validé avec le compte GL-1010.
- **Écarts en Suspens** : 18 450,00 $ répartis sur 10 écritures à analyser.
- **Signatures Haute Valeur (≥ 10 000 $)** : 2 éléments nécessitant la double autorisation du Contrôleur.
- **Conformité Réglementaire SOX 404** : Chaîne cryptographique SHA-256 validée et inaltérable.

*Recommandation de l'IA* : Valider les 2 exceptions dans l'onglet **Approbations** avant le gel de clôture mensuelle.`,

  de: `### Vorstandsbericht Finanz-Controller (Deutsch)

**Zusammenfassung des Bankabstimmungs- und Kassenstatus**
- **Automatische Abstimmungsquote**: 98,4 % (87 Buchungen autonom abgeglichen).
- **Verifiziertes Kassenvolumen**: 1.420.500,00 $ erfolgreich mit Hauptbuch GL-1010 synchronisiert.
- **Offene Differenzen**: 18.450,00 $ verteilt auf 10 Klärungsfälle.
- **Hochwertige Freigaben (≥ 10.000 $)**: 2 Positionen erfordern das Vier-Augen-Prinzip des Controllers.
- **SOX 404 Revisionssicherheit**: Kryptografische SHA-256-Hashkette lückenlos validiert.

*Empfehlung des KI-Controllers*: Zeichnen Sie die 2 offenen Posten unter **Genehmigungen** gegen, um den Monatsabschluss zu sperren.`,

  ja: `### 財務コントローラー エグゼクティブ報告 (日本語)

**銀行照合および残高統制サマリー**
- **自動照合完了率**: 98.4% (87件の取引をルールエンジンにより自動照合)。
- **検証済み総額**: $1,420,500.00 (一般会計元帳 GL-1010 と完全一致)。
- **未解消差異残高**: $18,450.00 (10件の調査対象トランザクション)。
- **高額承認案件 (1万ドル以上)**: コントローラーによる二重承認が必要な案件が2件。
- **SOX 404内部統制基準**: 暗号化SHA-256ハッシュチェーン検証完了。改ざん耐性担保。

*AIコントローラーの推奨事項*: **承認待ちキュー**で該当2件を確認・承認し、月次締め処理を確定してください。`,

  zh: `### 财务总监执行对账简报 (中文)

**银行对账与资金头寸管控摘要**
- **自主对账率**: 98.4% (87笔交易已通过多层确定性规则自动核销)。
- **总账核实入账金额**: $1,420,500.00 (已与GL-1010总账完全核对同步)。
- **未核销差异头寸**: $18,450.00 (共涉及10笔待排查未对账记录)。
- **高额审批事项 (≥$10,000)**: 2笔需财务总监双重签字授权的重大差异。
- **SOX 404合规审计**: SHA-256防篡改哈希链全部校验通过，满足法定合规标准。

*AI智能财务官建议*: 请在**审批中心**完成高额凭证会签，随后执行财务期间封账锁定。`,

  pt: `### Relatório Executivo do Controlador Financeiro (Português)

**Resumo da Conciliação Bancária e Posição de Caixa**
- **Taxa de Conciliação Autônoma**: 98,4% (87 lançamentos compensados automaticamente).
- **Volume Verificado no Livro-Razão**: $1.420.500,00 sincronizado com a conta GL-1010.
- **Divergências Pendentes**: $18.450,00 distribuídos em 10 itens para análise.
- **Aprovações de Alto Valor (≥ $10.000)**: 2 itens aguardando dupla autorização do Controlador.
- **Conformidade SOX 404**: Encadeamento criptográfico SHA-256 verificado e imutável.

*Recomendação da IA*: Proceda com a assinatura das 2 exceções na fila de **Aprovações** para concluir o fechamento mensal.`,

  hi: `### वित्तीय नियंत्रक कार्यकारी विवरण (हिन्दी)

**बैंक समाधान एवं नकदी स्थिति सारांश**
- **स्वचालित समाधान दर**: 98.4% (87 लेन-देन स्वतः सत्यापित और स्वीकृत)।
- **खाताबही सत्यापित कुल**: $1,420,500.00 (GL-1010 खाते के साथ पूर्ण समाधान)।
- **लंबित अंतर राशि**: $18,450.00 (समीक्षा हेतु 10 अनसुलझे अंतर)।
- **उच्च मूल्य अनुमोदन (≥ $10,000)**: नियंत्रक द्वारा दोहरे हस्ताक्षर हेतु 2 मदें।
- **SOX 404 अनुपालन**: क्रिप्टोग्राफ़िक SHA-256 हैश शृंखला पूरी तरह सत्यापित और सुरक्षित।

*एआई नियंत्रक अनुशंसा*: कृपया माह-अंत समाधान बंद करने से पहले **अनुमोदन** अनुभाग में 2 लंबित मामलों को अधिकृत करें।`
}

interface QuickPrompt {
  label: string
  query: string
  icon: React.ComponentType<{ className?: string }>
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "Status Summary", query: "Current reconciliation status and book balance", icon: BarChart3 },
  { label: "Variance Drivers", query: "Explain outstanding variances and fee deductions", icon: AlertTriangle },
  { label: "Dual Approvals", query: "Check Controller Approvals and high-value exceptions", icon: ShieldCheck },
  { label: "What-If Tips", query: "What-If Simulator tips and interchange fee testing", icon: TrendingUp },
  { label: "Import Guide", query: "How do I import bank transactions and ledger data?", icon: UploadCloud }
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
  const [selectedLang, setSelectedLang] = useState<string>("en")
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

  const handleGenerateBriefing = (langCode: string) => {
    const briefingText = MULTILINGUAL_BRIEFINGS[langCode] || MULTILINGUAL_BRIEFINGS["en"]
    const activeLangObj = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0]

    const briefingMsg: ChatMessage = {
      id: `briefing-${Date.now()}`,
      sender: "assistant",
      text: briefingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggested_actions: [
        "Explain high-value exceptions",
        "View cash velocity trajectory",
        "Check SOX hash chain status"
      ],
      metrics_snapshot: {
        match_rate: "98.4%",
        reconciled_volume: "$1,420,500.00",
        variance_exposure: "$18,450.00",
        cleared_count: 87,
        exceptions_count: 10,
        high_value_pending: 2
      }
    }
    setMessages(prev => [...prev, briefingMsg])
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
      const activeLangObj = LANGUAGES.find(l => l.code === selectedLang)
      const promptQuery = selectedLang !== "en" && activeLangObj
        ? `${text} (Please provide the response in ${activeLangObj.name})`
        : text

      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender,
        content: m.text
      }))

      const res = await api.assistant.sendMessage(promptQuery, historyPayload)

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

          {/* Executive Control & Language Bar */}
          <div className="px-3.5 py-2.5 bg-canvas/80 border-b border-hairline flex items-center justify-between gap-2.5 shrink-0">
            {/* Clean Segmented Language Chips with Globe Icon (NO EMOJIS, NO SCROLLBAR) */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] font-medium text-mid-gray shrink-0 mr-0.5 select-none">
                <Globe className="w-3.5 h-3.5 text-mid-gray" />
                <span className="font-semibold text-[10px] uppercase tracking-wider hidden sm:inline">Lang</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-1">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLang(lang.code)
                        handleGenerateBriefing(lang.code)
                      }}
                      className={cn(
                        "px-2 py-0.5 rounded-[6px] text-[10.5px] font-semibold transition-all cursor-pointer shrink-0 border select-none",
                        isSelected
                          ? "bg-ink text-paper border-ink shadow-2xs scale-105"
                          : "bg-paper text-mid-gray hover:text-ink hover:bg-canvas border-hairline/80"
                      )}
                      title={`${lang.name} (${lang.short}) — Click to switch and generate briefing`}
                    >
                      {lang.short}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Prominent Executive Briefing Trigger Button */}
            <button
              onClick={() => handleGenerateBriefing(selectedLang)}
              className="px-2.5 py-1 rounded-[8px] bg-ink hover:bg-ink-soft text-paper text-[11px] font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all select-none"
              title="Generate Executive Financial Briefing"
            >
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Briefing</span>
            </button>
          </div>

          {/* Clean Smooth Quick Action Chips (NO EMOJIS, SLEEK LUCIDE ICONS, NO SCROLLBAR) */}
          <div className="px-3.5 py-2 bg-paper/60 border-b border-hairline flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 select-none">
            {QUICK_PROMPTS.map((qp, i) => {
              const Icon = qp.icon
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.query)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas hover:bg-canvas/80 border border-hairline text-[11px] font-medium text-ink/90 hover:text-ink whitespace-nowrap transition-all cursor-pointer shadow-2xs hover:border-ink/20 active:scale-95 shrink-0"
                >
                  <Icon className="w-3 h-3 text-mid-gray shrink-0" />
                  <span>{qp.label}</span>
                </button>
              )
            })}
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
