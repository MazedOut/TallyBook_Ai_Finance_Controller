import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import { WorkspaceProvider } from "./hooks/useWorkspace"
import { MacWindowFrame } from "./components/layout/MacWindowFrame"
import { Sidebar } from "./components/layout/Sidebar"
import { Dashboard } from "./pages/Dashboard"
import { Reconcile } from "./pages/Reconcile"
import { WhatIf } from "./pages/WhatIf"
import { Statistics } from "./pages/Statistics"
import { Approvals } from "./pages/Approvals"
import { AuditTrail } from "./pages/AuditTrail"
import { Periods } from "./pages/Periods"
import { Admin } from "./pages/Admin"
import { Login } from "./pages/Login"
import { ImportSheet } from "./components/data/ImportSheet"
import { ManualEntryModal } from "./components/data/ManualEntryModal"
import { ImportHistoryModal } from "./components/data/ImportHistoryModal"
import { AIAssistantDrawer } from "./components/assistant/AIAssistantDrawer"
import { SettingsModal } from "./components/settings/SettingsModal"
import { ThemeProvider } from "./hooks/useTheme"
import { api } from "./lib/api"
import type { ReconciliationRun } from "./types"
import { CheckCircle2, Sparkles } from "lucide-react"

const MainWorkspace: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, "")
    return ["dashboard", "reconcile", "what-if", "stats", "approvals", "audit", "periods", "admin"].includes(hash)
      ? hash
      : "dashboard"
  })
  const [currentRun, setCurrentRun] = useState<ReconciliationRun | null>(null)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)

  // Data Ingestion Modal states
  const [isImportSheetOpen, setIsImportSheetOpen] = useState<boolean>(false)
  const [importSheetType, setImportSheetType] = useState<"bank" | "ledger">("bank")
  const [isManualEntryOpen, setIsManualEntryOpen] = useState<boolean>(false)
  const [manualEntryType, setManualEntryType] = useState<"bank" | "ledger">("bank")
  const [isImportHistoryOpen, setIsImportHistoryOpen] = useState<boolean>(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const loadLatestRun = async () => {
    try {
      const runs = await api.reconcile.getRuns()
      if (runs && runs.length > 0) {
        const fullRun = await api.reconcile.getResult(runs[0].run_id)
        setCurrentRun(fullRun)
      } else {
        handleRunBatch()
      }
    } catch (err) {
      console.warn("Could not load runs from backend, running fresh batch...", err)
      handleRunBatch()
    }
  }

  useEffect(() => {
    loadLatestRun()

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault()
        setIsAssistantOpen(prev => !prev)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        setIsSidebarOpen(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "")
      if (hash && ["dashboard", "reconcile", "what-if", "stats", "approvals", "audit", "periods", "admin"].includes(hash)) {
        setCurrentTab(hash)
      }
    }
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const handleRunBatch = async () => {
    setIsRunning(true)
    try {
      const run = await api.reconcile.run({
        notes: "Automated multi-source batch run initiated via UI trigger."
      })
      setCurrentRun(run)
      showToast("Reconciliation complete. All books synchronized.")
    } catch (err) {
      console.error("Batch run failed:", err)
    } finally {
      setIsRunning(false)
    }
  }

  const handleRegenerateData = async () => {
    setIsRegenerating(true)
    try {
      await api.data.generate()
      await handleRunBatch()
      showToast("Benchmark dataset regenerated successfully.")
    } catch (err) {
      console.error("Data regeneration failed:", err)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleResetDemo = async () => {
    try {
      await api.data.resetDemo()
      await handleRunBatch()
      showToast("Reset to pristine 50+ benchmark dataset.")
    } catch (err) {
      console.error("Failed to reset demo dataset:", err)
    }
  }

  const navigateTab = (tab: string) => {
    setCurrentTab(tab)
    window.location.hash = `#/${tab}`
  }

  const handleOpenImportSheet = (type: "bank" | "ledger" = "bank") => {
    setImportSheetType(type)
    setIsImportSheetOpen(true)
  }

  const handleOpenManualEntry = (type: "bank" | "ledger" = "bank") => {
    setManualEntryType(type)
    setIsManualEntryOpen(true)
  }

  const handleOpenImportHistory = () => {
    setIsImportHistoryOpen(true)
  }

  const handleImportSuccess = async () => {
    await handleRunBatch()
    showToast("Data imported and reconciled against active ledger.")
  }

  return (
    <>
      <MacWindowFrame
        currentTab={currentTab}
        setCurrentTab={navigateTab}
        onRunBatch={handleRunBatch}
        isRunning={isRunning}
        latestRunId={currentRun?.run_id}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onOpenImportSheet={handleOpenImportSheet}
        onOpenManualEntry={handleOpenManualEntry}
        onOpenImportHistory={handleOpenImportHistory}
        onResetDemo={handleResetDemo}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      >
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-primary-ink text-paper px-4 py-2 rounded-full text-[12.5px] font-medium shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        {isSidebarOpen && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={navigateTab}
            onOpenImportSheet={handleOpenImportSheet}
            onOpenManualEntry={handleOpenManualEntry}
            onOpenImportHistory={handleOpenImportHistory}
            onResetDemo={handleResetDemo}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-canvas">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="w-full h-full"
            >
              {currentTab === "dashboard" && (
                <Dashboard
                  currentRun={currentRun}
                  onNavigate={navigateTab}
                  onRunBatch={handleRunBatch}
                  isRunning={isRunning}
                />
              )}

              {currentTab === "reconcile" && (
                <Reconcile
                  currentRun={currentRun}
                  onRunBatch={handleRunBatch}
                  isRunning={isRunning}
                />
              )}

              {currentTab === "what-if" && <WhatIf />}

              {currentTab === "stats" && <Statistics />}

              {currentTab === "approvals" && (
                <Approvals
                  exceptions={currentRun?.exceptions || []}
                  onRefresh={loadLatestRun}
                />
              )}

              {currentTab === "audit" && <AuditTrail />}

              {currentTab === "periods" && <Periods />}

              {currentTab === "admin" && (
                <Admin
                  onRegenerateData={handleRegenerateData}
                  isRegenerating={isRegenerating}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Modals & Sheets */}
        <ImportSheet
          isOpen={isImportSheetOpen}
          onClose={() => setIsImportSheetOpen(false)}
          initialSourceType={importSheetType}
          onSuccess={handleImportSuccess}
        />

        <ManualEntryModal
          isOpen={isManualEntryOpen}
          onClose={() => setIsManualEntryOpen(false)}
          initialType={manualEntryType}
          onSuccess={handleImportSuccess}
        />

        <ImportHistoryModal
          isOpen={isImportHistoryOpen}
          onClose={() => setIsImportHistoryOpen(false)}
          onResetDemo={handleResetDemo}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSaveToast={showToast}
        />
      </MacWindowFrame>

      {/* Floating AI Controller Copilot Button */}
      {!isAssistantOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-5 right-5 z-40 h-9 px-3 rounded-[18px] bg-paper border border-hairline hover:border-[#d4d4d4] text-ink text-[12.5px] font-medium shadow-sm flex items-center gap-2 transition-colors cursor-pointer group"
          title="Open AI Finance Copilot (⌘J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-ink group-hover:rotate-12 transition-transform" />
          <span>AI Controller</span>
          <span className="text-[9.5px] font-mono text-mid-gray bg-canvas px-1 py-0.2 rounded-[6px] border border-hairline">⌘J</span>
        </motion.button>
      )}

      {/* AI Assistant Copilot Slide-over Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onNavigate={setCurrentTab}
        onRunBatch={handleRunBatch}
        onOpenImportSheet={handleOpenImportSheet}
        onResetDemo={handleResetDemo}
      />
    </>
  )
}

const AppRouter: React.FC = () => {
  const { user } = useAuth()

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="login-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <Login />
        </motion.div>
      ) : (
        <motion.div
          key="workspace-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
          <MainWorkspace />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <AppRouter />
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
