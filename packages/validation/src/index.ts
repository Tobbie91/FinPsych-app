export {
  validateResponses,
  formatValidationReport,
  type ValidationResult,
  type ConsistencyFlag,
  type QuestionnaireResponses,
} from './consistency-checks';

export {
  deriveGamingRiskLevel,
  getQualityBadge,
  getQualityBadgeFromRiskLevel,
  getQualityBadgeFromValidation,
  QUALITY_BADGES,
  type GamingRiskLevel,
  type QualityBadge,
} from './quality-badge';
