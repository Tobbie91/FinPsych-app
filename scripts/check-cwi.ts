import { createClient } from '@supabase/supabase-js';
import { calculateCWI, type RawResponses } from '../packages/scoring/src/engine';

const supabase = createClient(
  'https://uxbznksmtdlfqbltjbmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzMzMTUwMywiZXhwIjoyMDgyOTA3NTAzfQ.lnz1UIjL8s6_j9oVn9GEqkhhkf0fKO9N5zHCqYV57qE'
);

async function checkCWI() {
  // Get applicant by email
  const { data: applicant, error } = await supabase
    .from('applicants')
    .select('*')
    .eq('email', 'cwi@yopmail.com')
    .single();

  if (error || !applicant) {
    console.log('Error fetching applicant:', error);
    return;
  }

  console.log('Email:', applicant.email);
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

  // Recalculate CWI
  const result = calculateCWI(rawResponses, applicant.country || 'NG');

  console.log('\nRecalculated CWI:', result.cwi0100);
  console.log('Risk Band:', result.riskBand);
  console.log('\nFive Cs:');
  console.log('  Character:', result.fiveCScores.character);
  console.log('  Capacity:', result.fiveCScores.capacity);
  console.log('  Capital:', result.fiveCScores.capital);
  console.log('  Collateral:', result.fiveCScores.collateral);
  console.log('  Conditions:', result.fiveCScores.conditions);
}

checkCWI();
