import { createClient } from '@supabase/supabase-js';
import { calculateCWI, type RawResponses } from '../packages/scoring/src/engine';

const supabase = createClient(
  'https://uxbznksmtdlfqbltjbmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzMzMTUwMywiZXhwIjoyMDgyOTA3NTAzfQ.lnz1UIjL8s6_j9oVn9GEqkhhkf0fKO9N5zHCqYV57qE'
);

async function checkCWI() {
  const { data: applicant } = await supabase
    .from('applicants')
    .select('*')
    .eq('email', 'cwi@yopmail.com')
    .single();

  const { data: responseRows } = await supabase
    .from('responses')
    .select('question_id, answer')
    .eq('applicant_id', applicant.id);

  const rawResponses: RawResponses = {};
  responseRows?.forEach(r => {
    rawResponses[r.question_id] = r.answer;
  });

  const result = calculateCWI(rawResponses, applicant.country || 'NG');

  console.log('Five Cs (0-100 scale):');
  console.log('  Character:', result.fiveCScores.character?.toFixed(2));
  console.log('  Capacity:', result.fiveCScores.capacity?.toFixed(2));
  console.log('  Capital:', result.fiveCScores.capital?.toFixed(2));
  console.log('  Collateral:', result.fiveCScores.collateral?.toFixed(2) || '0 (no responses)');
  console.log('  Conditions:', result.fiveCScores.conditions?.toFixed(2));

  console.log('\nCWI Calculation Steps:');
  console.log('  CWI Raw (weighted mean):', result.cwiRaw?.toFixed(2));
  console.log('  CWI Normalized (z-score):', result.cwiNormalized?.toFixed(2));
  console.log('  Risk Percentile:', result.riskPercentile?.toFixed(4));
  console.log('  CWI 0-100:', result.cwi0100);
  console.log('  Risk Band:', result.riskBand);

  console.log('\nCountry:', applicant.country || 'NG');
}

checkCWI();
