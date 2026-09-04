-- ============================================================================
-- Tallybook — AI Finance Controller & Bank Reconciliation
-- Supabase Schema & Initial Data Migration
-- ============================================================================

-- 1. Reconciliation Runs
CREATE TABLE IF NOT EXISTS reconciliation_runs (
    run_id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    scores JSONB DEFAULT '{}'::jsonb,
    duration_ms NUMERIC DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'completed'
);

-- 2. Matched Records
CREATE TABLE IF NOT EXISTS reconciliation_matches (
    id TEXT PRIMARY KEY,
    run_id TEXT REFERENCES reconciliation_runs(run_id) ON DELETE CASCADE,
    bank_transaction_id TEXT NOT NULL,
    bank_ref_id TEXT,
    bank_description TEXT NOT NULL,
    bank_date DATE NOT NULL,
    bank_amount NUMERIC(15, 2) NOT NULL,
    ledger_entry_ids JSONB DEFAULT '[]'::jsonb,
    ledger_ref_ids JSONB DEFAULT '[]'::jsonb,
    ledger_descriptions JSONB DEFAULT '[]'::jsonb,
    ledger_date TEXT,
    ledger_amount NUMERIC(15, 2) NOT NULL,
    amount_delta NUMERIC(15, 2) DEFAULT 0.0,
    confidence NUMERIC(5, 4) NOT NULL,
    resolved_by TEXT NOT NULL,
    rule_name TEXT,
    ai_prompt TEXT,
    ai_response JSONB,
    justification TEXT NOT NULL,
    flags JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'accepted',
    override_reason TEXT,
    overridden_by TEXT,
    overridden_at TIMESTAMPTZ,
    is_ground_truth_correct BOOLEAN
);

-- 3. Triaged Exceptions
CREATE TABLE IF NOT EXISTS reconciliation_exceptions (
    id TEXT PRIMARY KEY,
    run_id TEXT REFERENCES reconciliation_runs(run_id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- 'bank' or 'ledger'
    transaction_id TEXT NOT NULL,
    ref_id TEXT,
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence NUMERIC(5, 4) DEFAULT 0.0,
    what_would_resolve TEXT NOT NULL,
    candidate_ids JSONB DEFAULT '[]'::jsonb,
    reasoning TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'approved', 'escalated', 'written_off'
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    aging_days INT DEFAULT 1
);

-- 4. Accounting Periods
CREATE TABLE IF NOT EXISTS accounting_periods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'locked'
    closed_by TEXT,
    closed_at TIMESTAMPTZ,
    total_volume NUMERIC(15, 2) DEFAULT 0.0,
    bank_records_count INT DEFAULT 0,
    ledger_records_count INT DEFAULT 0,
    match_count INT DEFAULT 0,
    exception_count INT DEFAULT 0,
    accuracy_score NUMERIC(5, 2) DEFAULT 0.0,
    summary_notes TEXT
);

-- 5. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    notes TEXT
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_matches_run_id ON reconciliation_matches(run_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_run_id ON reconciliation_exceptions(run_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_category ON reconciliation_exceptions(category);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_periods_status ON accounting_periods(status);

-- Initial seed accounting periods
INSERT INTO accounting_periods (id, name, start_date, end_date, status, closed_by, closed_at, total_volume, accuracy_score, summary_notes)
VALUES 
    ('prd-2026-01', 'January 2026', '2026-01-01', '2026-01-31', 'locked', 'Marcus Vance (Controller)', NOW(), 482590.25, 98.50, 'Period audited and certified by Deloitte. Zero variance.'),
    ('prd-2026-02', 'February 2026 (Active)', '2026-02-01', '2026-02-28', 'open', NULL, NULL, 521890.10, 0.0, 'Current reconciliation cycle in progress.')
ON CONFLICT (id) DO NOTHING;
