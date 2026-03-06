/**
 * Population-Level Fairness Metrics (Section 3)
 *
 * Reusable function to compute SPD, DIR, and SMD across any protected attribute.
 * Approval is defined as FinPsych score >= 60.
 *
 * Metrics:
 * - SPD (Statistical Parity Difference): max(rates) - min(rates)
 * - DIR (Disparate Impact Ratio): min(rates) / max(rates)
 * - SMD (Standardized Mean Difference): Cohen's d, binary groups only
 */

export type FairnessStatus = 'COMPLIANT' | 'MONITOR' | 'REVIEW';

export interface FairnessResult {
  spd: number;
  dir: number;
  smd: number | null;
  spdStatus: FairnessStatus;
  dirStatus: FairnessStatus;
  smdStatus: FairnessStatus | null;
  approvalRates: Record<string, number>;
}

export interface FairnessApplicant {
  finpsychScore: number | null;
  group: string;
}

/**
 * Compute population-level fairness metrics for a set of applicants.
 *
 * @param applicants - Array of applicants with FinPsych scores and group labels
 * @returns FairnessResult with SPD, DIR, SMD, statuses, and per-group approval rates
 */
export function computeFairnessMetrics(
  applicants: FairnessApplicant[]
): FairnessResult {
  // Group applicants by protected attribute value, skip empty/null groups
  const groups: Record<string, FairnessApplicant[]> = {};
  for (const a of applicants) {
    const g = a.group?.trim();
    if (!g) continue;
    if (!groups[g]) groups[g] = [];
    groups[g].push(a);
  }

  const groupNames = Object.keys(groups);

  // Edge case: fewer than 2 groups — no meaningful comparison
  if (groupNames.length < 2) {
    return {
      spd: 0,
      dir: 1,
      smd: null,
      spdStatus: 'COMPLIANT',
      dirStatus: 'COMPLIANT',
      smdStatus: null,
      approvalRates: groupNames.length === 1
        ? { [groupNames[0]]: computeApprovalRate(groups[groupNames[0]]) }
        : {},
    };
  }

  // Compute approval rates per group (FinPsych >= 60 = approved)
  const approvalRates: Record<string, number> = {};
  for (const name of groupNames) {
    approvalRates[name] = computeApprovalRate(groups[name]);
  }

  const rates = Object.values(approvalRates);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);

  // SPD = max(rates) - min(rates)
  const spd = maxRate - minRate;

  // DIR = min(rates) / max(rates), default 1 if maxRate is 0
  const dir = maxRate > 0 ? minRate / maxRate : 1;

  // SPD status: binary groups use 0.10, multi-group uses 0.15
  const spdThreshold = groupNames.length === 2 ? 0.10 : 0.15;
  const spdStatus: FairnessStatus =
    spd <= spdThreshold ? 'COMPLIANT' : spd <= 0.20 ? 'MONITOR' : 'REVIEW';

  // DIR status
  const dirStatus: FairnessStatus =
    dir >= 0.80 ? 'COMPLIANT' : dir >= 0.70 ? 'MONITOR' : 'REVIEW';

  // SMD: only for exactly 2 groups (binary comparison)
  let smd: number | null = null;
  let smdStatus: FairnessStatus | null = null;

  if (groupNames.length === 2) {
    const scoresA = groups[groupNames[0]]
      .map(a => a.finpsychScore)
      .filter((s): s is number => s !== null);
    const scoresB = groups[groupNames[1]]
      .map(a => a.finpsychScore)
      .filter((s): s is number => s !== null);

    if (scoresA.length >= 2 && scoresB.length >= 2) {
      const meanA = mean(scoresA);
      const meanB = mean(scoresB);
      const varA = variance(scoresA, meanA);
      const varB = variance(scoresB, meanB);
      const pooledSd = Math.sqrt((varA + varB) / 2);

      smd = pooledSd > 0 ? Math.abs(meanA - meanB) / pooledSd : 0;
      smdStatus = smd < 0.20 ? 'COMPLIANT' : smd < 0.50 ? 'MONITOR' : 'REVIEW';
    }
  }

  return { spd, dir, smd, spdStatus, dirStatus, smdStatus, approvalRates };
}

// ─── Helpers ────────────────────────────────────────────────────

function computeApprovalRate(group: FairnessApplicant[]): number {
  if (group.length === 0) return 0;
  const approved = group.filter(
    a => a.finpsychScore !== null && a.finpsychScore >= 60
  ).length;
  return approved / group.length;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[], m: number): number {
  return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
}
