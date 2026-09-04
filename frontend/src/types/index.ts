export type UserRole = "analyst" | "controller" | "auditor" | "admin"

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  role: UserRole
  avatar_initials: string
  department: string
}

export interface DemoAccount {
  username: string
  full_name: string
  role: UserRole
  title: string
  department: string
  description: string
  avatar_initials: string
}

export interface MatchRecord {
  id: string
  run_id: string
  bank_transaction_id: string
  bank_ref_id?: string
  bank_description: string
  bank_date: string
  bank_amount: number
  ledger_entry_ids: string[]
  ledger_ref_ids: string[]
  ledger_descriptions: string[]
  ledger_date: string
  ledger_amount: number
  amount_delta: number
  confidence: number
  resolved_by: string
  rule_name?: string
  ai_prompt?: string
  ai_response?: any
  justification: string
  flags: string[]
  status: "accepted" | "flagged" | "overridden" | "rejected"
  override_reason?: string
  overridden_by?: string
  overridden_at?: string
  is_ground_truth_correct?: boolean
}

export interface ExceptionRecord {
  id: string
  run_id: string
  source_type: "bank" | "ledger"
  transaction_id: string
  ref_id?: string
  amount: number
  date: string
  description: string
  category: "duplicate_fee_noise" | "no_counterpart" | "ambiguous_candidates" | "split_payment_partial" | "date_lag_possible" | "unresolved_discrepancy"
  confidence: number
  what_would_resolve: string
  candidate_ids: string[]
  reasoning: string
  status: "open" | "approved" | "escalated" | "written_off"
  approval_required: boolean
  approved_by?: string
  approved_at?: string
  approval_notes?: string
  aging_days: number
}

export interface RunScores {
  total_bank_records: number
  total_ledger_records: number
  total_matches_count: number
  total_exceptions_count: number
  true_positives: number
  false_positives: number
  false_negatives: number
  precision: number
  recall: number
  f1_score: number
  claimed_match_rate_pct: number
  verified_accuracy_pct: number
  mean_claimed_confidence: number
  confidence_accuracy_calibration_delta: number
  rule_resolved_count: number
  ai_resolved_count: number
  overridden_count: number
  rule_breakdown: Record<string, { total: number; correct: number; incorrect: number }>
  honest_exception_rate_pct: number
}

export interface ReconciliationRun {
  run_id: string
  timestamp: string
  actor: string
  actor_role: string
  parameters: {
    accept_threshold: number
    exception_threshold: number
    high_value_threshold: number
    ai_engine_active: boolean
    ai_model: string
  }
  scores: RunScores
  matches: MatchRecord[]
  exceptions: ExceptionRecord[]
  duration_ms: number
  notes: string
  status: string
}

export interface Period {
  id: string
  name: string
  start_date: string
  end_date: string
  status: "open" | "closed" | "locked"
  closed_by?: string
  closed_at?: string
  total_volume: number
  bank_records_count: number
  ledger_records_count: number
  match_count: number
  exception_count: number
  accuracy_score: number
  summary_notes?: string
}

export interface AuditLog {
  id: string
  timestamp: string
  actor_id: string
  actor_name: string
  actor_role: string
  action: string
  entity_type: string
  entity_id: string
  before_state?: any
  after_state?: any
  notes?: string
}

export interface StatisticsData {
  has_runs: boolean
  latest_run_id?: string
  summary: {
    total_matches: number
    total_exceptions: number
    claimed_match_rate: number
    verified_accuracy: number
    precision: number
    recall: number
    f1_score: number
    auto_resolved_value: number
    manual_resolved_value: number
    rule_resolved_count: number
    ai_resolved_count: number
    mean_claimed_confidence: number
    calibration_delta: number
  }
  category_counts: Record<string, number>
  category_values: Record<string, number>
  confidence_buckets: Record<string, number>
  aging_buckets: Record<string, number>
  rule_breakdown: Record<string, { total: number; correct: number; incorrect: number }>
  runs_trend: Array<{
    run_id: string
    timestamp: string
    match_rate: number
    precision: number
    recall: number
    f1: number
  }>
}
