import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uxbznksmtdlfqbltjbmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzMzMTUwMywiZXhwIjoyMDgyOTA3NTAzfQ.lnz1UIjL8s6_j9oVn9GEqkhhkf0fKO9N5zHCqYV57qE'
);

async function debugCWI() {
  const { data: responseRows } = await supabase
    .from('responses')
    .select('question_id, answer')
    .eq('applicant_id', '871fe91a-d565-4920-bda9-cb935c4a8e07')
    .order('question_id');

  console.log('All responses:');
  responseRows?.forEach(r => {
    console.log(`  ${r.question_id}: ${r.answer.slice(0, 50)}`);
  });

  // Check if this is from an old score
  const { data: score } = await supabase
    .from('scores')
    .select('*')
    .eq('applicant_id', '871fe91a-d565-4920-bda9-cb935c4a8e07')
    .single();

  console.log('\n--- Old Score Record ---');
  console.log('CWI 0-100:', score?.cwi_0_100);
  console.log('Risk Band:', score?.risk_band);
  console.log('Model Version:', score?.model_version);
}

debugCWI();
