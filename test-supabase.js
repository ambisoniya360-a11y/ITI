import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    console.log("Querying companies...");
    const { data: compData, error: compErr } = await supabase
      .from('companies')
      .select('id, name, email, password')
      .limit(1);
    if (compErr) console.error("Companies Error:", compErr);
    else console.log("Companies sample:", compData);

    console.log("Querying institutes...");
    const { data: instData, error: instErr } = await supabase
      .from('institutes')
      .select('id, name, email, password')
      .limit(1);
    if (instErr) console.error("Institutes Error:", instErr);
    else console.log("Institutes sample:", instData);
  } catch (err) {
    console.error("Test Exception:", err);
  }
}

test();
