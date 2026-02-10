import { createClient } from '@supabase/supabase-js';
import { calculateCWI, calculateNCI } from '../packages/scoring/src/engine';

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzMzMTUwMywiZXhwIjoyMDgyOTA3NTAzfQ.lnz1UIjL8s6_j9oVn9GEqkhhkf0fKO9N5zHCqYV57qE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugResponses() {
  console.log('Checking applicant: 871fe91a-d565-4920-bda9-cb935c4a8e07 (michael.chen@example.com)');
  console.log('Old NCI: 75.20, Old CWI: 76.00\n');

  // Get applicant data
  const { data: applicant } = await supabase
    .from('applicants')
    .select('*')
    .eq('id', '871fe91a-d565-4920-bda9-cb935c4a8e07')
    .single();

  if (!applicant) {
    console.log('Applicant not found');
    return;
  }

  // Get responses from metadata or responses table
  let rawResponses: any = {};

  if (applicant.response_metadata?.session?.responses) {
    rawResponses = applicant.response_metadata.session.responses;
    console.log('Found responses in metadata');
  } else {
    // Try responses table
    const { data: responseRows } = await supabase
      .from('responses')
      .select('question_id, answer')
      .eq('applicant_id', applicant.id);

    if (responseRows) {
      responseRows.forEach(r => {
        rawResponses[r.question_id] = r.answer;
      });
      console.log('Found responses in responses table');
    }
  }

  console.log(`Total responses: ${Object.keys(rawResponses).length}`);

  // Check for NCI questions
  const nciKeys = Object.keys(rawResponses).filter(k =>
    k.includes('asfn') || k.includes('lca') || k === 'q62' || k === 'q63' || k === 'q64' || k === 'q65'
  );
  console.log(`NCI question keys found: ${nciKeys.length}`);
  console.log('NCI keys:', nciKeys);

  // Try to calculate CWI
  console.log('\n--- Calculating CWI ---');
  try {
    const cwiResult = calculateCWI(rawResponses, applicant.country || 'NG');
    console.log(`CWI Result: ${cwiResult.cwi0100.toFixed(2)}`);
    console.log(`Risk Band: ${cwiResult.riskBand}`);

    // Check construct scores
    console.log('\n--- Construct Scores ---');
    const constructKeys = Object.keys(cwiResult.constructScores);
    console.log(`Total constructs: ${constructKeys.length}`);

    // Look for NCI constructs
    const nciConstructs = ['cognitive_reflection', 'delay_discounting', 'financial_numeracy', 'loan_consequence_awareness'];
    console.log('\nNCI Constructs:');
    nciConstructs.forEach(key => {
      const value = cwiResult.constructScores[key];
      console.log(`  ${key}: ${value !== undefined ? value : 'MISSING'}`);
    });

    // Try to calculate NCI
    console.log('\n--- Calculating NCI ---');
    const nciScore = calculateNCI(cwiResult.constructScores);
    console.log(`NCI Result: ${nciScore !== null ? nciScore.toFixed(2) : 'NULL (missing constructs)'}`);

  } catch (err: any) {
    console.error('Error calculating scores:', err.message);
  }
}

debugResponses();
