// Synthetic financial dataset for each demo workspace.
// These values drive Dashboard KPIs and Statistics when switching workspaces.

export interface WorkspaceFinancialData {
  reconciledVolume: number
  exceptionsVolume: number
  matchRate: number
  matchCount: number
  exceptionCount: number
  highValuePending: number
  cashInflow: number
  cashOutflow: number
  netCash: number
  periodName: string
  timeSavedHours: number
  automationPct: number
  auditScore: number
  periodClose: number
  topVendors: Array<{ name: string; count: number; amount: number }>
  agingBuckets: Record<string, number>
  agingValues: Record<string, number>
  categoryCounts: Record<string, number>
  categoryValues: Record<string, number>
}

const WORKSPACE_DATA: Record<string, WorkspaceFinancialData> = {
  techcorp: {
    reconciledVolume: 1_248_590.25,
    exceptionsVolume: 42_150.00,
    matchRate: 96.4,
    matchCount: 50,
    exceptionCount: 8,
    highValuePending: 3,
    cashInflow: 812_384.00,
    cashOutflow: 436_206.25,
    netCash: 376_177.75,
    periodName: "February 2026",
    timeSavedHours: 7.5,
    automationPct: 94.2,
    auditScore: 100,
    periodClose: 98.4,
    topVendors: [
      { name: "Razorpay Gateway", count: 3, amount: 1420.50 },
      { name: "Amazon Web Services", count: 2, amount: 890.00 },
      { name: "Stripe Billing", count: 1, amount: 420.25 },
      { name: "JPMorgan Chase Bank", count: 2, amount: 135.00 },
    ],
    agingBuckets: { "< 3 days": 3, "3-7 days": 2, "8-14 days": 2, "15+ days": 1 },
    agingValues: { "< 3 days": 8400.00, "3-7 days": 18200.00, "8-14 days": 11250.00, "15+ days": 4300.00 },
    categoryCounts: { no_counterpart: 3, date_lag_possible: 2, duplicate_fee_noise: 2, ambiguous_candidates: 1 },
    categoryValues: { no_counterpart: 18500, date_lag_possible: 12000, duplicate_fee_noise: 7200, ambiguous_candidates: 4450 },
  },
  retailflow: {
    reconciledVolume: 3_674_120.50,
    exceptionsVolume: 128_340.00,
    matchRate: 93.7,
    matchCount: 145,
    exceptionCount: 22,
    highValuePending: 7,
    cashInflow: 2_940_800.00,
    cashOutflow: 733_320.50,
    netCash: 2_207_479.50,
    periodName: "Q4 2025",
    timeSavedHours: 21.75,
    automationPct: 89.6,
    auditScore: 98,
    periodClose: 91.5,
    topVendors: [
      { name: "Razorpay Settlements", count: 12, amount: 48_250.00 },
      { name: "Shiprocket Logistics", count: 6, amount: 24_100.00 },
      { name: "Shopify Payments", count: 3, amount: 18_720.00 },
      { name: "Delhivery Courier", count: 5, amount: 11_430.00 },
    ],
    agingBuckets: { "< 3 days": 8, "3-7 days": 7, "8-14 days": 5, "15+ days": 2 },
    agingValues: { "< 3 days": 31200.00, "3-7 days": 48900.00, "8-14 days": 33100.00, "15+ days": 15140.00 },
    categoryCounts: { no_counterpart: 8, split_payment_partial: 6, date_lag_possible: 5, unresolved_discrepancy: 3 },
    categoryValues: { no_counterpart: 52000, split_payment_partial: 38400, date_lag_possible: 24800, unresolved_discrepancy: 13140 },
  },
  healthplus: {
    reconciledVolume: 589_430.75,
    exceptionsVolume: 34_780.00,
    matchRate: 91.2,
    matchCount: 68,
    exceptionCount: 11,
    highValuePending: 5,
    cashInflow: 441_570.00,
    cashOutflow: 147_860.75,
    netCash: 293_709.25,
    periodName: "March 2026",
    timeSavedHours: 10.2,
    automationPct: 85.3,
    auditScore: 99,
    periodClose: 86.0,
    topVendors: [
      { name: "National Insurance Co", count: 4, amount: 12_400.00 },
      { name: "Medline Supplies Ltd", count: 3, amount: 9_870.00 },
      { name: "Star Health IRDA", count: 2, amount: 7_540.00 },
      { name: "Apollo Pharmacy", count: 3, amount: 4_970.00 },
    ],
    agingBuckets: { "< 3 days": 4, "3-7 days": 3, "8-14 days": 3, "15+ days": 1 },
    agingValues: { "< 3 days": 8400.00, "3-7 days": 11200.00, "8-14 days": 10500.00, "15+ days": 4680.00 },
    categoryCounts: { no_counterpart: 4, date_lag_possible: 3, ambiguous_candidates: 3, duplicate_fee_noise: 1 },
    categoryValues: { no_counterpart: 14200, date_lag_possible: 10800, ambiguous_candidates: 7180, duplicate_fee_noise: 2600 },
  }
}

export function getWorkspaceData(workspaceId: string): WorkspaceFinancialData {
  return WORKSPACE_DATA[workspaceId] || WORKSPACE_DATA["techcorp"]
}
