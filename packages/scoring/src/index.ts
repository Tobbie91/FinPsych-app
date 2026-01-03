/**
 * CWI Scoring Engine Package
 * Exports all scoring functionality
 */

export { calculateCWI, MODEL_VERSION } from './engine';
export type { RawResponses, ConstructScores, FiveCScores, ScoringResult } from './engine';

export {
  PCA_WEIGHTS,
  GLOBAL_STATS,
  COUNTRY_STATS,
  FIVE_C_MAP,
  FIVE_C_WEIGHTS,
  RISK_BANDS,
  QUESTION_CONSTRUCT_MAP,
  REVERSE_SCORED_QUESTIONS,
} from './constants';
