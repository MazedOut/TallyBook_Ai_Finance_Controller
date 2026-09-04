import React, { createContext, useContext, useState } from "react"
import { Building2, ShoppingBag, Activity, Server, Globe } from "lucide-react"

export interface Workspace {
  id: string
  name: string
  shortName: string
  entityName: string
  industry: string
  bankAccount: string
  bankLabel: string
  glAccount: string
  glLabel: string
  colorAccent: string
  iconKey: "building" | "shopping-bag" | "activity" | "server" | "globe"
  description: string
}

interface WorkspaceContextType {
  workspaces: Workspace[]
  activeWorkspace: Workspace
  switchWorkspace: (id: string) => void
}

export const WorkspaceIcon: React.FC<{ id: string; className?: string }> = ({ id, className = "w-4 h-4" }) => {
  switch (id) {
    case "techcorp":
      return <Building2 className={className} />
    case "retailflow":
      return <ShoppingBag className={className} />
    case "healthplus":
      return <Activity className={className} />
    case "cloudscale":
      return <Server className={className} />
    case "globallogistics":
      return <Globe className={className} />
    default:
      return <Building2 className={className} />
  }
}

export const DEMO_WORKSPACES: Workspace[] = [
  {
    id: "techcorp",
    name: "TechCorp Inc",
    shortName: "TechCorp",
    entityName: "TechCorp Global Inc",
    industry: "SaaS / Technology",
    bankAccount: "Chase Commercial #4991",
    bankLabel: "Chase Bank",
    glAccount: "GL-1010",
    glLabel: "Operating Cash Books",
    colorAccent: "#0a0a0a",
    iconKey: "building",
    description: "SaaS enterprise with AWS, Stripe, Razorpay subscriptions"
  },
  {
    id: "retailflow",
    name: "RetailFlow Ltd",
    shortName: "RetailFlow",
    entityName: "RetailFlow Commerce Ltd",
    industry: "E-Commerce / Retail",
    bankAccount: "HDFC Current #2280",
    bankLabel: "HDFC Bank",
    glAccount: "GL-2050",
    glLabel: "Retail Operating Ledger",
    colorAccent: "#0a0a0a",
    iconKey: "shopping-bag",
    description: "E-commerce brand with seasonal Razorpay settlements & inventory"
  },
  {
    id: "healthplus",
    name: "HealthPlus Clinic",
    shortName: "HealthPlus",
    entityName: "HealthPlus Medical Group",
    industry: "Healthcare",
    bankAccount: "Kotak Medical #7714",
    bankLabel: "Kotak Mahindra Bank",
    glAccount: "GL-3020",
    glLabel: "Clinical Revenue Ledger",
    colorAccent: "#0a0a0a",
    iconKey: "activity",
    description: "Healthcare clinic with insurance payouts & medical equipment leases"
  }
]

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(DEMO_WORKSPACES[0].id)

  const activeWorkspace = DEMO_WORKSPACES.find(w => w.id === activeWorkspaceId) || DEMO_WORKSPACES[0]

  const switchWorkspace = (id: string) => {
    if (DEMO_WORKSPACES.some(w => w.id === id)) {
      setActiveWorkspaceId(id)
    }
  }

  return (
    <WorkspaceContext.Provider value={{ workspaces: DEMO_WORKSPACES, activeWorkspace, switchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = (): WorkspaceContextType => {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}
