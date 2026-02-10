import { createClient } from '@supabase/supabase-js';
import { calculateCWI, type RawResponses } from '../packages/scoring/src/engine';

const supabase = createClient(
  'https://uxbznksmtdlfqbltjbmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzMzMTUwMywiZXhwIjoyMDgyOTA3NTAzfQ.lnz1UIjL8s6_j9oVn9GEqkhhkf0fKO9N5zHCqYV57qE'
);

async function debugCWI100() {
  // Get most recent applicant
  const { data: applicant } = await supabase
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  console.log('Debugging:', applicant.email);
  console.log('Stored CWI:', applicant.cwi_score);

  // Get responses
  const { data: responseRows } = await supabase
    .from('responses')
    .select('question_id, answer')
    .eq('applicant_id', applicant.id);

  const rawResponses: RawResponses = {};
  responseRows?.forEach(r => {
    rawResponses[r.question_id] = r.answer;
  });

  console.log('Total responses:', Object.keys(rawResponses).length);

  // Calculate CWI
  const result = calculateCWI(rawResponses, applicant.country || 'NG');

  console.log('\n--- CWI Calculation ---');
  console.log('CWI Raw:', result.cwiRaw);
  console.log('CWI Normalized:', result.cwiNormalized);
  console.log('CWI 0-100:', result.cwi0100);
  console.log('Risk Band:', result.riskBand);

  console.log('\n--- Five Cs ---');
  console.log('Character:', result.fiveCScores.character);
  console.log('Capacity:', result.fiveCScores.capacity);
  console.log('Capital:', result.fiveCScores.capital);
  console.log('Collateral:', result.fiveCScores.collateral);
  console.log('Conditions:', result.fiveCScores.conditions);

  // Check if scores table has different value
  const { data: scoreRecord } = await supabase
    .from('scores')
    .select('cwi_0_100, cwi_raw')
    .eq('applicant_id', applicant.id)
    .single();

  console.log('\n--- Scores Table ---');
  console.log('Stored CWI 0-100:', scoreRecord?.cwi_0_100);
  console.log('Stored CWI Raw:', scoreRecord?.cwi_raw);
}

debugCWI100();
