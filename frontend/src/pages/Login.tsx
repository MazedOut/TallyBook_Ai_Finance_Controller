import React, { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ArrowRight, Sparkles, Lock, User as UserIcon, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { useAuth } from "../hooks/useAuth"

export const Login: React.FC = () => {
  const { login, enterDemoMode, isLoading } = useAuth()
  const [username, setUsername] = useState("controller")
  const [password, setPassword] = useState("controller123")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(username.trim(), password)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid credentials. Try 'controller' / 'controller123' or explore Demo Mode.")
    }
  }

  return (
    <div className="min-h-screen w-full bg-canvas flex flex-col items-center justify-center p-4 antialiased text-ink selection:bg-ink selection:text-paper font-sans">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        {/* Main Login Card */}
        <div className="bg-paper rounded-[24px] border border-hairline p-8 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_4px_16px_rgba(0,0,0,0.06)]">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-ink flex items-center justify-center text-paper font-semibold text-[18px] mb-3 shadow-sm">
              T
            </div>
            <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">
              Tallybook
            </h1>
            <p className="text-[13px] text-mid-gray mt-1 font-medium">
              Autonomous AI Finance Controller
            </p>
          </div>

          {/* Standard Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[14px] bg-[#fff5f5] border border-[#fed7d7] text-[12.5px] text-ember flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-[12px] font-semibold text-mid-gray uppercase tracking-wider block mb-1">
                Username / Role
              </label>
              <Input
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                placeholder="controller, analyst, auditor, admin"
                icon={<UserIcon className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-mid-gray uppercase tracking-wider block mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-[40px] text-[14px]"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          {/* Clean Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline/80"></div>
            </div>
            <span className="relative bg-paper px-3 text-[11px] font-medium uppercase tracking-wider text-mid-gray">
              or
            </span>
          </div>

          {/* Dedicated Demo Mode Button */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => enterDemoMode("controller")}
              className="w-full h-[42px] border-hairline bg-canvas hover:bg-[#eaeaea] text-ink font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-ink" />
              <span>Explore in Demo Mode (1-Click)</span>
            </Button>
            <p className="text-[11.5px] text-center text-mid-gray leading-relaxed">
              Pre-loaded with 50+ batch synthetic reconciliation data & live AI traces.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-[12px] text-mid-gray">
          Razorpay Buildathon 2026 &bull; AI Finance Controller
        </div>
      </motion.div>
    </div>
  )
}
