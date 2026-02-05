/**
 * Batch 5 - Recompute Scores Script
 *
 * This script recomputes all derived fields for legacy/pre-fix records:
 * - ASFN scores (Level 1, Level 2, Overall)
 * - LCA score (capped at 15, percent)
 * - NCI score (50% ASFN + 50% LCA)
 * - Five Cs (0-100 normalized, including Collateral from Q59, Q16b, Q16e)
 * - Gaming flags + gaming_risk_level
 * - CWI/FinPsych score
 *
 * Usage:
 *   npx tsx scripts/recompute-scores.ts [--dry-run] [--limit N]
 *
 * Options:
 *   --dry-run    Preview changes without writing to database
 *   --limit N    Process only N records (for testing)
 *   --verbose    Show detailed output for each record
 */

import { createClient } from '@supabase/supabase-js';
import { calculateCWI, type RawResponses, type ScoringResult } from '../packages/scoring/src/engine';
import { validateResponses, deriveGamingRiskLevel } from '../packages/validation/src/index';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SCORING_VERSION_LEGACY = 'pre-fix-beta';
const SCORING_VERSION_RECOMPUTED = 'v2.0_recomputed';
const SCORING_VERSION_NEW = 'v2.0';

// Legacy record identification criteria:
// 1. scoring_version is NULL, empty, or 'pre-fix-beta'
// 2. OR created before scoring fixes were deployed
const LEGACY_CUTOFF_DATE = '2026-02-04T00:00:00Z'; // Date of Batch 1-4 fixes

// =============================================================================
// TYPES
// =============================================================================

interface ApplicantRecord {
  id: string;
  session_id: string;
  full_name: string | null;
  email: string | null;
  country: string | null;
  scoring_version: string | null;
  submitted_at: string;
  // Current computed values (to be snapshotted)
  cwi_score: number | null;
  risk_category: string | null;
  quality_score: number | null;
  gaming_risk_level: string | null;
  validation_result: any | null;
  asfn_level1_score: number | null;
  asfn_level2_score: number | null;
  asfn_overall_score: number | null;
  asfn_tier: string | null;
  lca_raw_score: number | null;
  lca_percent: number | null;
  nci_score: number | null;
  previous_scores: any | null;
  recomputed_at: string | null;
}

interface ScoreRecord {
  id: string;
  applicant_id: string;
  scoring_version: string | null;
  character_score: number | null;
  capacity_score: number | null;
  capital_score: number | null;
  collateral_score: number | null;
  conditions_score: number | null;
  cwi_raw: number | null;
  cwi_normalized: number | null;
  cwi_0_100: number | null;
  risk_band: string | null;
  previous_scores: any | null;
}

interface ResponseRecord {
  question_id: string;
  answer: string;
}

interface RecomputeResult {
  applicantId: string;
  status: 'success' | 'skipped' | 'error';
  reason?: string;
  oldValues?: any;
  newValues?: any;
}

interface RecomputeSummary {
  totalLegacy: number;
  recomputed: number;
  skipped: number;
  errors: number;
  results: RecomputeResult[];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a record is legacy and needs recompute
 */
function isLegacyRecord(applicant: ApplicantRecord): boolean {
  // Already recomputed - skip
  if (applicant.scoring_version === SCORING_VERSION_RECOMPUTED) {
    return false;
  }

  // Explicit legacy version
  if (
    applicant.scoring_version === SCORING_VERSION_LEGACY ||
    applicant.scoring_version === null ||
    applicant.scoring_version === ''
  ) {
    return true;
  }

  // Records before the fix date are legacy
  if (applicant.submitted_at && new Date(applicant.submitted_at) < new Date(LEGACY_CUTOFF_DATE)) {
    return true;
  }

  return false;
}

/**
 * Create a snapshot of current computed values
 */
function snapshotCurrentValues(applicant: ApplicantRecord, score: ScoreRecord | null): any {
  return {
    snapshot_at: new Date().toISOString(),
    previous_version: applicant.scoring_version,
    applicant: {
      cwi_score: applicant.cwi_score,
      risk_category: applicant.risk_category,
      quality_score: applicant.quality_score,
      gaming_risk_level: applicant.gaming_risk_level,
      asfn_level1_score: applicant.asfn_level1_score,
      asfn_level2_score: applicant.asfn_level2_score,
      asfn_overall_score: applicant.asfn_overall_score,
      asfn_tier: applicant.asfn_tier,
      lca_raw_score: applicant.lca_raw_score,
      lca_percent: applicant.lca_percent,
      nci_score: applicant.nci_score,
    },
    score: score ? {
      character_score: score.character_score,
      capacity_score: score.capacity_score,
      capital_score: score.capital_score,
      collateral_score: score.collateral_score,
      conditions_score: score.conditions_score,
      cwi_raw: score.cwi_raw,
      cwi_normalized: score.cwi_normalized,
      cwi_0_100: score.cwi_0_100,
      risk_band: score.risk_band,
    } : null,
  };
}

/**
 * Convert responses array to RawResponses object
 */
function responsesToObject(responses: ResponseRecord[]): RawResponses {
  const result: RawResponses = {};
  for (const r of responses) {
    result[r.question_id] = r.answer;
  }
  return result;
}

/**
 * Compute ASFN scores from responses
 */
function computeASFNScores(responses: RawResponses): {
  level1Score: number;
  level2Score: number;
  overallScore: number;
  tier: string;
} {
  // ASFN Level 1 questions (asfn1_q1 through asfn1_q5)
  const level1Questions = ['asfn1_q1', 'asfn1_q2', 'asfn1_q3', 'asfn1_q4', 'asfn1_q5'];
  const level1Correct: Record<string, string> = {
    'asfn1_q1': '150',
    'asfn1_q2': '20',
    'asfn1_q3': 'More than ₦102',
    'asfn1_q4': '₦110',
    'asfn1_q5': '2 years',
  };

  let level1Correct_count = 0;
  let level1Answered = 0;
  for (const q of level1Questions) {
    if (responses[q]) {
      level1Answered++;
      if (responses[q] === level1Correct[q]) {
        level1Correct_count++;
      }
    }
  }
  const level1Score = level1Answered > 0 ? (level1Correct_count / level1Questions.length) * 100 : 0;

  // ASFN Level 2 questions (asfn2_q1 through asfn2_q5)
  const level2Questions = ['asfn2_q1', 'asfn2_q2', 'asfn2_q3', 'asfn2_q4', 'asfn2_q5'];
  const level2Correct: Record<string, string> = {
    'asfn2_q1': 'Plan A',
    'asfn2_q2': 'Plan B',
    'asfn2_q3': 'Plan A',
    'asfn2_q4': 'Plan A',
    'asfn2_q5': 'Plan B',
  };

  let level2Correct_count = 0;
  let level2Answered = 0;

  // Level 2 only unlocks if Level 1 score >= 60%
  const level2Unlocked = level1Score >= 60;

  if (level2Unlocked) {
    for (const q of level2Questions) {
      if (responses[q]) {
        level2Answered++;
        if (responses[q] === level2Correct[q]) {
          level2Correct_count++;
        }
      }
    }
  }
  const level2Score = level2Answered > 0 ? (level2Correct_count / level2Questions.length) * 100 : 0;

  // Overall ASFN = 60% Level 1 + 40% Level 2
  const overallScore = level2Unlocked
    ? (level1Score * 0.6) + (level2Score * 0.4)
    : level1Score;

  // Tier classification
  let tier: string;
  if (overallScore >= 75) {
    tier = 'HIGH';
  } else if (overallScore >= 50) {
    tier = 'MEDIUM';
  } else {
    tier = 'LOW';
  }

  return { level1Score, level2Score, overallScore, tier };
}

/**
 * Compute LCA scores from responses
 * LCA = 5 questions, 0-3 points each, max 15 points
 * NCI formula: 50% ASFN + 50% LCA (as per Batch 1 fix)
 */
function computeLCAScores(responses: RawResponses): {
  rawScore: number;
  percent: number;
} {
  const lcaQuestions = ['lca1', 'lca2', 'lca3', 'lca4', 'lca5'];
  const lcaMaxScore = 15; // 5 questions * 3 points max

  // Correct answers for LCA (0 = wrong, 3 = correct)
  const lcaCorrect: Record<string, string> = {
    'lca1': 'They may have to pay more interest over time',
    'lca2': 'It could lower their credit score',
    'lca3': 'Pay off the entire balance each month',
    'lca4': 'The lender may repossess or foreclose on the asset',
    'lca5': 'Continue making full payments',
  };

  let rawScore = 0;
  for (const q of lcaQuestions) {
    if (responses[q] && responses[q] === lcaCorrect[q]) {
      rawScore += 3;
    }
  }

  // Cap at max (overflow protection from Batch 1)
  if (rawScore > lcaMaxScore) {
    console.warn(`LCA OVERFLOW: Raw score ${rawScore} exceeds max ${lcaMaxScore}. Clamping.`);
    rawScore = lcaMaxScore;
  }

  const percent = (rawScore / lcaMaxScore) * 100;

  return { rawScore, percent };
}

/**
 * Compute NCI score
 * NCI = 50% ASFN + 50% LCA (Batch 1 fix: was 60/40, now 50/50)
 */
function computeNCI(asfnOverall: number, lcaPercent: number): number {
  return (asfnOverall * 0.5) + (lcaPercent * 0.5);
}

// =============================================================================
// MAIN RECOMPUTE FUNCTION
// =============================================================================

async function recomputeScores(options: {
  dryRun: boolean;
  limit?: number;
  verbose: boolean;
}): Promise<RecomputeSummary> {
  const { dryRun, limit, verbose } = options;

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const summary: RecomputeSummary = {
    totalLegacy: 0,
    recomputed: 0,
    skipped: 0,
    errors: 0,
    results: [],
  };

  console.log('\n' + '='.repeat(60));
  console.log('BATCH 5 - RECOMPUTE SCORES');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE (will write to DB)'}`);
  if (limit) console.log(`Limit: ${limit} records`);
  console.log('');

  // Fetch legacy applicants
  let query = supabase
    .from('applicants')
    .select('*')
    .lt('submitted_at', LEGACY_CUTOFF_DATE)
    .not('scoring_version', 'eq', SCORING_VERSION_RECOMPUTED)
    .order('submitted_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: applicants, error: applicantsError } = await query;

  if (applicantsError) {
    throw new Error(`Failed to fetch applicants: ${applicantsError.message}`);
  }

  if (!applicants || applicants.length === 0) {
    console.log('No legacy records found to recompute.');
    return summary;
  }

  summary.totalLegacy = applicants.length;
  console.log(`Found ${applicants.length} legacy records to process.\n`);

  // Process each applicant
  for (const applicant of applicants as ApplicantRecord[]) {
    const result: RecomputeResult = {
      applicantId: applicant.id,
      status: 'success',
    };

    try {
      // Check if already recomputed (idempotency)
      if (applicant.scoring_version === SCORING_VERSION_RECOMPUTED) {
        result.status = 'skipped';
        result.reason = 'Already recomputed';
        summary.skipped++;
        summary.results.push(result);
        if (verbose) console.log(`[SKIP] ${applicant.id}: Already recomputed`);
        continue;
      }

      // Check if previous_scores already has a snapshot (don't overwrite)
      if (applicant.previous_scores != null) {
        result.status = 'skipped';
        result.reason = 'Snapshot already exists';
        summary.skipped++;
        summary.results.push(result);
        if (verbose) console.log(`[SKIP] ${applicant.id}: Snapshot already exists`);
        continue;
      }

      // Fetch raw responses
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('question_id, answer')
        .eq('applicant_id', applicant.id);

      if (responsesError) {
        throw new Error(`Failed to fetch responses: ${responsesError.message}`);
      }

      if (!responses || responses.length === 0) {
        result.status = 'skipped';
        result.reason = 'No responses found';
        summary.skipped++;
        summary.results.push(result);
        if (verbose) console.log(`[SKIP] ${applicant.id}: No responses found`);
        continue;
      }

      // Convert to RawResponses object
      const rawResponses = responsesToObject(responses as ResponseRecord[]);

      // Fetch existing score record
      const { data: scoreRecords } = await supabase
        .from('scores')
        .select('*')
        .eq('applicant_id', applicant.id)
        .limit(1);

      const existingScore = scoreRecords?.[0] as ScoreRecord | null;

      // Snapshot old values
      const snapshot = snapshotCurrentValues(applicant, existingScore);
      result.oldValues = snapshot;

      // === RECOMPUTE ALL DERIVED FIELDS ===

      // 1. ASFN scores
      const asfn = computeASFNScores(rawResponses);

      // 2. LCA scores
      const lca = computeLCAScores(rawResponses);

      // 3. NCI score (50% ASFN + 50% LCA)
      const nciScore = computeNCI(asfn.overallScore, lca.percent);

      // 4. Validation and gaming flags
      const validation = validateResponses(rawResponses);
      const gamingRiskLevel = deriveGamingRiskLevel(validation);

      // 5. CWI/FinPsych score (using current scoring engine)
      const cwiResult = calculateCWI(rawResponses, applicant.country || 'NG');

      // Store new values
      result.newValues = {
        asfn_level1_score: asfn.level1Score,
        asfn_level2_score: asfn.level2Score,
        asfn_overall_score: asfn.overallScore,
        asfn_tier: asfn.tier,
        lca_raw_score: lca.rawScore,
        lca_percent: lca.percent,
        nci_score: nciScore,
        quality_score: validation.consistencyScore,
        gaming_risk_level: gamingRiskLevel,
        cwi_score: cwiResult.cwi0100,
        risk_category: cwiResult.riskBand,
        five_cs: cwiResult.fiveCScores,
      };

      if (verbose) {
        console.log(`\n[PROCESS] ${applicant.id} (${applicant.email || 'no email'})`);
        console.log(`  Old NCI: ${applicant.nci_score?.toFixed(2) || 'N/A'} -> New NCI: ${nciScore.toFixed(2)}`);
        console.log(`  Old CWI: ${applicant.cwi_score?.toFixed(2) || 'N/A'} -> New CWI: ${cwiResult.cwi0100.toFixed(2)}`);
        console.log(`  Gaming Risk: ${gamingRiskLevel}`);
      }

      // === WRITE TO DATABASE (if not dry run) ===
      if (!dryRun) {
        const now = new Date().toISOString();

        // Update applicants table
        const { error: updateApplicantError } = await supabase
          .from('applicants')
          .update({
            scoring_version: SCORING_VERSION_RECOMPUTED,
            recomputed_at: now,
            previous_scores: snapshot,
            cwi_score: cwiResult.cwi0100,
            risk_category: cwiResult.riskBand,
            quality_score: validation.consistencyScore,
            gaming_risk_level: gamingRiskLevel,
            validation_result: validation,
            asfn_level1_score: asfn.level1Score,
            asfn_level2_score: asfn.level2Score,
            asfn_overall_score: asfn.overallScore,
            asfn_tier: asfn.tier,
            lca_raw_score: lca.rawScore,
            lca_percent: lca.percent,
            nci_score: nciScore,
          })
          .eq('id', applicant.id);

        if (updateApplicantError) {
          throw new Error(`Failed to update applicant: ${updateApplicantError.message}`);
        }

        // Update or insert scores table
        if (existingScore) {
          const { error: updateScoreError } = await supabase
            .from('scores')
            .update({
              scoring_version: SCORING_VERSION_RECOMPUTED,
              recomputed_at: now,
              previous_scores: snapshot.score,
              character_score: cwiResult.fiveCScores.character,
              capacity_score: cwiResult.fiveCScores.capacity,
              capital_score: cwiResult.fiveCScores.capital,
              collateral_score: cwiResult.fiveCScores.collateral,
              conditions_score: cwiResult.fiveCScores.conditions,
              cwi_raw: cwiResult.cwiRaw,
              cwi_normalized: cwiResult.cwiNormalized,
              cwi_0_100: cwiResult.cwi0100,
              risk_band: cwiResult.riskBand,
            })
            .eq('id', existingScore.id);

          if (updateScoreError) {
            throw new Error(`Failed to update score: ${updateScoreError.message}`);
          }
        } else {
          // Insert new score record
          const { error: insertScoreError } = await supabase
            .from('scores')
            .insert({
              applicant_id: applicant.id,
              scoring_version: SCORING_VERSION_RECOMPUTED,
              recomputed_at: now,
              construct_scores: cwiResult.constructScores || {},
              construct_z_scores: cwiResult.constructZScores || {},
              character_score: cwiResult.fiveCScores.character,
              capacity_score: cwiResult.fiveCScores.capacity,
              capital_score: cwiResult.fiveCScores.capital,
              collateral_score: cwiResult.fiveCScores.collateral,
              conditions_score: cwiResult.fiveCScores.conditions,
              cwi_raw: cwiResult.cwiRaw,
              cwi_normalized: cwiResult.cwiNormalized,
              cwi_0_100: cwiResult.cwi0100,
              risk_band: cwiResult.riskBand,
              risk_percentile: cwiResult.riskPercentile || 50,
              country: applicant.country || 'NG',
              model_version: 'v2.0',
              scored_at: now,
            });

          if (insertScoreError) {
            throw new Error(`Failed to insert score: ${insertScoreError.message}`);
          }
        }
      }

      summary.recomputed++;
      summary.results.push(result);

    } catch (error) {
      result.status = 'error';
      result.reason = error instanceof Error ? error.message : String(error);
      summary.errors++;
      summary.results.push(result);
      console.error(`[ERROR] ${applicant.id}: ${result.reason}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('RECOMPUTE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total legacy records found: ${summary.totalLegacy}`);
  console.log(`Successfully recomputed:    ${summary.recomputed}`);
  console.log(`Skipped (already done):     ${summary.skipped}`);
  console.log(`Errors:                     ${summary.errors}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\n[DRY RUN] No changes were written to the database.');
    console.log('Run without --dry-run to apply changes.\n');
  }

  return summary;
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  let limit: number | undefined;
  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    limit = parseInt(args[limitIndex + 1], 10);
    if (isNaN(limit)) {
      console.error('Invalid --limit value');
      process.exit(1);
    }
  }

  try {
    const summary = await recomputeScores({ dryRun, limit, verbose });

    // Exit with error code if there were failures
    if (summary.errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
