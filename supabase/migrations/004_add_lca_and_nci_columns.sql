-- Migration: Add LCA and NCI columns to applicants table
-- This stores Loan Consequence Awareness scores and Neurocognitive Index

-- Add LCA and NCI columns
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS lca_raw_score NUMERIC;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS lca_percent NUMERIC;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS nci_score NUMERIC;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_applicants_lca_percent ON applicants(lca_percent);
CREATE INDEX IF NOT EXISTS idx_applicants_nci_score ON applicants(nci_score);

-- Add comments for documentation
COMMENT ON COLUMN applicants.lca_raw_score IS 'LCA raw score (0-15 points from 5 questions)';
COMMENT ON COLUMN applicants.lca_percent IS 'LCA percentage score (0-100%)';
COMMENT ON COLUMN applicants.nci_score IS 'Neurocognitive Index: 60% ASFN + 40% LCA (0-100)';
