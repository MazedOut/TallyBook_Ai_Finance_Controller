import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AuthProvider, useAuth } from "./hooks/useAuth"
import { Sidebar } from "./components/layout/Sidebar"
import { Topbar } from "./components/layout/Topbar"
import { Dashboard } from "./pages/Dashboard"
import { Reconcile } from "./pages/Reconcile"
import { WhatIf } from "./pages/WhatIf"
import { Statistics } from "./pages/Statistics"
import { Approvals } from "./pages/Approvals"
import { AuditTrail } from "./pages/AuditTrail"
import { Periods } from "./pages/Periods"
import { Admin } from "./pages/Admin"
import { Login } from "./pages/Login"
import { api } from "./lib/api"
import type { ReconciliationRun } from "./types"

const MainWorkspace: React.FC = () => {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState<string>("dashboard")
  const [currentRun, setCurrentRun] = useState<ReconciliationRun | null>(null)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)

  // If user is not logged in, render minimal login page
  if (!user) {
    return <Login />
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
  }, [])

  const handleRunBatch = async () => {
    setIsRunning(true)
    try {
      const run = await api.reconcile.run({
        notes: "Automated multi-source batch run initiated via UI trigger."
      })
      setCurrentRun(run)
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
    } catch (err) {
      console.error("Data regeneration failed:", err)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas font-sans antialiased text-ink">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar
          currentTab={currentTab}
          onRunBatch={handleRunBatch}
          isRunning={isRunning}
          latestRunId={currentRun?.run_id}
        />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full h-full"
            >
              {currentTab === "dashboard" && (
                <Dashboard
                  currentRun={currentRun}
                  onNavigate={setCurrentTab}
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
      </div>
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <MainWorkspace />
    </AuthProvider>
  )
}

export default App
