import React, { useState } from "react"
import { motion } from "framer-motion"
import { Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { Input } from "../components/ui/Input"
import { Logo } from "../components/ui/Logo"
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 antialiased text-ink font-sans bg-[#f5f5f5]">
      {/* Monochromatic Clinical Paper Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-paper rounded-[24px] border border-hairline p-8 shadow-sm">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3 p-2 rounded-[14px] bg-canvas border border-hairline">
              <Logo size="lg" />
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink">
              Tallybook
            </h1>
            <p className="text-[13px] text-mid-gray mt-0.5">
              AI Finance Assistant & Book Matching
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 rounded-[12px] bg-[#fef2f2] border border-[#fee2e2] text-[12.5px] text-ember flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-[11.5px] font-medium text-mid-gray uppercase tracking-wider block mb-1">
                Account ID / Username
              </label>
              <Input
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                placeholder="controller, analyst, auditor, admin"
                icon={<UserIcon className="w-4 h-4 text-mid-gray" />}
                required
              />
            </div>

            <div>
              <label className="text-[11.5px] font-medium text-mid-gray uppercase tracking-wider block mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4 text-mid-gray" />}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[40px] rounded-[18px] bg-ink text-paper text-[13.5px] font-medium hover:bg-ink-soft active:opacity-90 disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center mt-2 border-none"
            >
              {isLoading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          {/* Clean Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline"></div>
            </div>
            <span className="relative bg-paper px-3 text-[11px] font-medium uppercase tracking-wider text-mid-gray">
              or
            </span>
          </div>

          {/* Dedicated Single Demo Mode Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => enterDemoMode("controller")}
              className="w-full h-[42px] rounded-[18px] bg-canvas hover:bg-[#ebebeb] text-ink text-[13.5px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 border border-hairline shadow-xs"
            >
              <span>Explore in Demo Mode</span>
              <ArrowRight className="w-4 h-4 text-mid-gray" />
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-mid-gray pt-1">
              <ShieldCheck className="w-4 h-4 text-mid-gray" />
              <span>Instant access to sample records & matching history</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-4 text-[11.5px] text-mid-gray">
          Clean Financial Workspace &bull; Book Matching
        </div>
      </motion.div>
    </div>
  )
}
