import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixPasswords() {
  const correctPassword = 'wasim@7058';

  // Fix SB-2026-0101 in students table (currently has null email and null password)
  console.log("=== Fixing SB-2026-0101 in students table ===");
  const { error: e1 } = await supabase
    .from('students')
    .update({ email: 'wasimhavaldar70@gmail.com', password: correctPassword })
    .eq('id', 'SB-2026-0101');
  console.log(e1 ? `Error: ${e1.message}` : "✅ Fixed students.SB-2026-0101");

  // Fix SB-2026-0101 in users table (currently has wasim@7958)
  console.log("\n=== Fixing SB-2026-0101 in users table ===");
  const { error: e2 } = await supabase
    .from('users')
    .update({ password: correctPassword })
    .eq('id', 'SB-2026-0101');
  console.log(e2 ? `Error: ${e2.message}` : "✅ Fixed users.SB-2026-0101");

  // Verify the fix
  console.log("\n=== Verifying ===");
  const { data: s } = await supabase.from('students').select('id, email, password').eq('id', 'SB-2026-0101').single();
  console.log("Students:", s);
  const { data: u } = await supabase.from('users').select('id, email, password').eq('id', 'SB-2026-0101').single();
  console.log("Users:", u);
}

fixPasswords();
