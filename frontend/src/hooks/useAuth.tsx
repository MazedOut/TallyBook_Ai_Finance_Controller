import React, { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole, DemoAccount } from "../types"
import { api } from "../lib/api"

interface AuthContextType {
  user: User | null
  role: UserRole
  isDemoMode: boolean
  demoAccounts: DemoAccount[]
  isLoading: boolean
  login: (username: string, password?: string) => Promise<void>
  enterDemoMode: (role?: UserRole) => void
  switchRole: (role: UserRole) => Promise<void>
  logout: () => void
  isController: boolean
  isAnalyst: boolean
  isAuditor: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_DEMO_USERS: Record<UserRole, User> = {
  controller: {
    id: "usr-controller-01",
    username: "controller",
    email: "marcus.vance@tallybook.io",
    full_name: "Marcus Vance",
    role: "controller",
    avatar_initials: "MV",
    department: "Financial Controller Office"
  },
  analyst: {
    id: "usr-analyst-01",
    username: "analyst",
    email: "sarah.chen@tallybook.io",
    full_name: "Sarah Chen",
    role: "analyst",
    avatar_initials: "SC",
    department: "Operations Accounting"
  },
  auditor: {
    id: "usr-auditor-01",
    username: "auditor",
    email: "elena.rostova@deloitte-audit.com",
    full_name: "Elena Rostova",
    role: "auditor",
    avatar_initials: "ER",
    department: "Statutory Audit Partner"
  },
  admin: {
    id: "usr-admin-01",
    username: "admin",
    email: "sysadmin@tallybook.io",
    full_name: "Alex Mercer",
    role: "admin",
    avatar_initials: "AM",
    department: "IT & Enterprise Systems"
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start with user = null so the first page to open is the login page
  const [user, setUser] = useState<User | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accounts = await api.auth.getDemoAccounts()
        setDemoAccounts(accounts)
      } catch (err) {
        console.warn("Could not load remote demo accounts, using local presets.", err)
      }
    }
    initAuth()
  }, [])

  const enterDemoMode = (targetRole: UserRole = "controller") => {
    const demoUser = DEFAULT_DEMO_USERS[targetRole] || DEFAULT_DEMO_USERS.controller
    setIsDemoMode(true)
    setUser(demoUser)
    localStorage.setItem("tallybook_demo_mode", "true")
    localStorage.setItem("tallybook_demo_role", targetRole)
  }

  const login = async (username: string, password: string = `${username}123`) => {
    setIsLoading(true)
    try {
      const data = await api.auth.login(username, password)
      localStorage.setItem("tallybook_token", data.access_token)
      localStorage.setItem("tallybook_user", JSON.stringify(data.user))
      localStorage.removeItem("tallybook_demo_mode")
      setIsDemoMode(false)
      setUser(data.user)
    } catch (e) {
      console.warn("Remote login failed, checking demo credentials", e)
      if (DEFAULT_DEMO_USERS[username as UserRole]) {
        enterDemoMode(username as UserRole)
      } else {
        throw e
      }
    } finally {
      setIsLoading(false)
    }
  }

  const switchRole = async (targetRole: UserRole) => {
    if (isDemoMode) {
      enterDemoMode(targetRole)
    } else {
      await login(targetRole, `${targetRole}123`)
    }
  }

  const logout = () => {
    localStorage.removeItem("tallybook_token")
    localStorage.removeItem("tallybook_user")
    localStorage.removeItem("tallybook_demo_mode")
    localStorage.removeItem("tallybook_demo_role")
    setIsDemoMode(false)
    setUser(null)
  }

  const currentRole = user?.role || "controller"

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isDemoMode,
        demoAccounts,
        isLoading,
        login,
        enterDemoMode,
        switchRole,
        logout,
        isController: currentRole === "controller" || currentRole === "admin",
        isAnalyst: currentRole === "analyst" || currentRole === "controller" || currentRole === "admin",
        isAuditor: currentRole === "auditor" || currentRole === "controller" || currentRole === "admin",
        isAdmin: currentRole === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
