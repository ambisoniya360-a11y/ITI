import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const emailOrId = 'SB-2026-081';
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, password')
      .or(`email.eq.${emailOrId},id.eq.${emailOrId}`)
      .single();
    
    console.log('Result for SB-2026-081 without quotes:', { data, error });
  } catch (e) {
    console.error('Error without quotes:', e);
  }

  const emailOrId2 = 'student@skillbridge.in';
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, password')
      .or(`email.eq.${emailOrId2},id.eq.${emailOrId2}`)
      .single();
    
    console.log('Result for student@skillbridge.in without quotes:', { data, error });
  } catch (e) {
    console.error('Error without quotes (email):', e);
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, password')
      .or(`email.eq."${emailOrId2}",id.eq."${emailOrId2}"`)
      .single();
    
    console.log('Result for student@skillbridge.in with quotes:', { data, error });
  } catch (e) {
    console.error('Error with quotes:', e);
  }
}

run();
