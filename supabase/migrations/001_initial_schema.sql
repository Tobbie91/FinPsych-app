-- ============================================================================
-- CREDIT WORTHINESS QUESTIONNAIRE DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- APPLICANTS TABLE
-- Stores basic applicant information
-- ============================================================================
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- QUESTIONNAIRE RESPONSES TABLE
-- Stores the questionnaire answers and progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,

  -- All responses stored as JSONB for flexibility
  responses JSONB DEFAULT '{}'::jsonb,

  -- Progress tracking
  current_section INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each applicant can only have one active questionnaire
  UNIQUE(applicant_id)
);

-- ============================================================================
-- CREDIT SCORES TABLE
-- Stores calculated 5C credit scores
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  questionnaire_response_id UUID NOT NULL REFERENCES questionnaire_responses(id) ON DELETE CASCADE,

  -- 5C Scores (0-100 scale)
  character_score NUMERIC(5,2) NOT NULL,
  capacity_score NUMERIC(5,2) NOT NULL,
  capital_score NUMERIC(5,2) NOT NULL,
  conditions_score NUMERIC(5,2) NOT NULL,
  collateral_score NUMERIC(5,2) NOT NULL,

  -- Total weighted score
  total_score NUMERIC(5,2) NOT NULL,

  -- Risk categorization
  risk_category TEXT NOT NULL CHECK (risk_category IN ('low', 'medium', 'high')),

  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_applicant ON questionnaire_responses(applicant_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_status ON questionnaire_responses(status);
CREATE INDEX IF NOT EXISTS idx_credit_scores_applicant ON credit_scores(applicant_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_risk ON credit_scores(risk_category);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at
  BEFORE UPDATE ON questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Policies for applicants (public access for now - can be restricted later)
CREATE POLICY "Allow insert for all" ON applicants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own data" ON applicants
  FOR SELECT USING (true);

CREATE POLICY "Allow update own data" ON applicants
  FOR UPDATE USING (true);

-- Policies for questionnaire_responses
CREATE POLICY "Allow insert for all" ON questionnaire_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own data" ON questionnaire_responses
  FOR SELECT USING (true);

CREATE POLICY "Allow update own data" ON questionnaire_responses
  FOR UPDATE USING (true);

-- Policies for credit_scores (read-only for applicants)
CREATE POLICY "Allow select own scores" ON credit_scores
  FOR SELECT USING (true);
