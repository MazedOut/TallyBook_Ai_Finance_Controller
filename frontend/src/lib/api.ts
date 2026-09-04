import axios from "axios"
import type { 
  User, 
  DemoAccount, 
  ReconciliationRun, 
  MatchRecord, 
  ExceptionRecord, 
  Period, 
  AuditLog, 
  StatisticsData 
} from "../types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach stored JWT token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("tallybook_token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<{ access_token: string; user: User }> => {
      const res = await apiClient.post("/auth/login", { username, password })
      return res.data
    },
    getMe: async (): Promise<User> => {
      const res = await apiClient.get("/auth/me")
      return res.data
    },
    getDemoAccounts: async (): Promise<DemoAccount[]> => {
      const res = await apiClient.get("/auth/demo-accounts")
      return res.data
    }
  },

  reconcile: {
    run: async (params?: { accept_threshold?: number; exception_threshold?: number; high_value_threshold?: number; notes?: string }): Promise<ReconciliationRun> => {
      const res = await apiClient.post("/reconcile/run", params || {})
      return res.data
    },
    getRuns: async (): Promise<any[]> => {
      const res = await apiClient.get("/reconcile/runs")
      return res.data
    },
    getResult: async (runId: string): Promise<ReconciliationRun> => {
      const res = await apiClient.get(`/reconcile/results/${runId}`)
      return res.data
    },
    inject: async (data: { type: "bank" | "ledger"; amount: number; date: string; description: string; ref_id?: string; accept_threshold?: number }) => {
      const res = await apiClient.post("/reconcile/inject", data)
      return res.data
    }
  },

  matches: {
    list: async (params?: { run_id?: string; status?: string; resolved_by?: string }): Promise<MatchRecord[]> => {
      const res = await apiClient.get("/matches", { params })
      return res.data
    },
    override: async (matchId: string, action: "accept" | "reject" | "reassign", reason: string, targetLedgerId?: string) => {
      const res = await apiClient.put(`/matches/${matchId}/override`, { action, reason, target_ledger_id: targetLedgerId })
      return res.data
    }
  },

  exceptions: {
    list: async (params?: { run_id?: string; category?: string; status?: string }): Promise<ExceptionRecord[]> => {
      const res = await apiClient.get("/exceptions", { params })
      return res.data
    },
    approve: async (excId: string, action: "approve" | "write_off" | "escalate", notes: string, glOffset?: string) => {
      const res = await apiClient.post(`/exceptions/${excId}/approve`, { action, notes, gl_adjustment_account: glOffset })
      return res.data
    },
    reclassify: async (excId: string, category: string, reason: string) => {
      const res = await apiClient.post(`/exceptions/${excId}/reclassify`, { category, reason })
      return res.data
    }
  },

  periods: {
    list: async (): Promise<Period[]> => {
      const res = await apiClient.get("/periods")
      return res.data
    },
    close: async (periodId: string, notes: string): Promise<{ status: string; period: Period }> => {
      const res = await apiClient.post("/periods/close", { period_id: periodId, notes })
      return res.data
    },
    get: async (periodId: string): Promise<Period> => {
      const res = await apiClient.get(`/periods/${periodId}`)
      return res.data
    }
  },

  audit: {
    list: async (params?: { entity_type?: string; actor_role?: string; action?: string }): Promise<AuditLog[]> => {
      const res = await apiClient.get("/audit", { params })
      return res.data
    }
  },

  stats: {
    get: async (): Promise<StatisticsData> => {
      const res = await apiClient.get("/stats")
      return res.data
    }
  },

  data: {
    generate: async () => {
      const res = await apiClient.post("/data/generate")
      return res.data
    },
    getCsvExportUrl: (runId: string) => `${API_BASE_URL}/data/export/${runId}/csv`,
    getPdfExportUrl: (runId: string) => `${API_BASE_URL}/data/export/${runId}/pdf`,
  }
}
