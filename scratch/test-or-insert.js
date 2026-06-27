import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const student = {
    id: 'SB-TEST-001',
    name: 'Test Student',
    trade: 'Electrician',
    institute: 'Test ITI',
    attendance: 90,
    practical_score: 85,
    theory_score: 80,
    safety_score: 95,
    employability_score: 88,
    skills: ['Wiring'],
    certifications: ['NTC'],
    status: 'Available',
    email: 'teststudent@skillbridge.in',
    password: 'password'
  };

  try {
    console.log('Inserting test student...');
    const { error: insErr } = await supabase.from('students').insert(student);
    if (insErr) {
      console.error('Insert error (might already exist):', insErr.message);
    } else {
      console.log('Insert success!');
    }

    // Now query by ID
    console.log('Querying by ID using OR...');
    const { data: dataById, error: errById } = await supabase
      .from('students')
      .select('id, name, email, password')
      .or(`email.eq.SB-TEST-001,id.eq.SB-TEST-001`)
      .single();
    
    console.log('Result for SB-TEST-001:', { dataById, errById });

    // Now query by email
    console.log('Querying by email using OR...');
    const { data: dataByEmail, error: errByEmail } = await supabase
      .from('students')
      .select('id, name, email, password')
      .or(`email.eq.teststudent@skillbridge.in,id.eq.teststudent@skillbridge.in`)
      .single();
    
    console.log('Result for teststudent@skillbridge.in:', { dataByEmail, errByEmail });

    // Clean up
    console.log('Cleaning up test student...');
    await supabase.from('students').delete().eq('id', 'SB-TEST-001');

  } catch (e) {
    console.error('Exception during run:', e);
  }
}

run();
