import { supabase } from '../lib/supabase';

export interface QuestionnaireData {
  responses: Record<string, string>;
  currentSection: number;
  progressPercentage: number;
}

export interface ApplicantData {
  email: string;
  fullName?: string;
}

// Use untyped client for tables that may not have matching generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/**
 * Create or get an applicant by email
 */
export async function getOrCreateApplicant(data: ApplicantData) {
  // First try to find existing applicant
  const { data: existing } = await db
    .from('applicants')
    .select('*')
    .eq('email', data.email)
    .single();

  if (existing) {
    return { applicant: existing, error: null };
  }

  // Create new applicant
  const { data: newApplicant, error: createError } = await db
    .from('applicants')
    .insert({
      email: data.email,
      full_name: data.fullName,
    })
    .select()
    .single();

  return { applicant: newApplicant, error: createError };
}

/**
 * Save questionnaire responses (auto-save)
 */
export async function saveQuestionnaireResponses(
  applicantId: string,
  data: QuestionnaireData
) {
  const { data: response, error } = await db
    .from('questionnaire_responses')
    .upsert(
      {
        applicant_id: applicantId,
        responses: data.responses,
        current_section: data.currentSection,
        progress_percentage: data.progressPercentage,
        status: data.progressPercentage === 100 ? 'completed' : 'in_progress',
        completed_at: data.progressPercentage === 100 ? new Date().toISOString() : null,
      },
      {
        onConflict: 'applicant_id',
      }
    )
    .select()
    .single();

  return { response, error };
}

/**
 * Get existing questionnaire responses for an applicant
 */
export async function getQuestionnaireResponses(applicantId: string) {
  const { data, error } = await db
    .from('questionnaire_responses')
    .select('*')
    .eq('applicant_id', applicantId)
    .single();

  return { data, error };
}

/**
 * Submit the questionnaire (final submission)
 */
export async function submitQuestionnaire(applicantId: string) {
  const { data, error } = await db
    .from('questionnaire_responses')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('applicant_id', applicantId)
    .select()
    .single();

  return { data, error };
}

/**
 * Get applicant's credit score (if calculated)
 */
export async function getCreditScore(applicantId: string) {
  const { data, error } = await db
    .from('credit_scores')
    .select('*')
    .eq('applicant_id', applicantId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}
