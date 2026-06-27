import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("=== Checking ALL tables for data ===\n");

  // Check students
  const { data: students, error: sErr } = await supabase.from('students').select('id, name, email').limit(5);
  console.log("STUDENTS:", students?.length || 0, "rows");
  if (sErr) console.log("  Error:", sErr.message);
  if (students) students.forEach(s => console.log(`  - ${s.id} | ${s.name} | ${s.email}`));

  // Check companies
  const { data: companies, error: cErr } = await supabase.from('companies').select('id, name, email').limit(5);
  console.log("\nCOMPANIES:", companies?.length || 0, "rows");
  if (cErr) console.log("  Error:", cErr.message);
  if (companies) companies.forEach(c => console.log(`  - ${c.id} | ${c.name} | ${c.email}`));

  // Check institutes
  const { data: institutes, error: iErr } = await supabase.from('institutes').select('id, name, email').limit(5);
  console.log("\nINSTITUTES:", institutes?.length || 0, "rows");
  if (iErr) console.log("  Error:", iErr.message);
  if (institutes) institutes.forEach(i => console.log(`  - ${i.id} | ${i.name} | ${i.email}`));

  // Check users
  const { data: users, error: uErr } = await supabase.from('users').select('id, name, email, role').limit(5);
  console.log("\nUSERS:", users?.length || 0, "rows");
  if (uErr) console.log("  Error:", uErr.message);
  if (users) users.forEach(u => console.log(`  - ${u.id} | ${u.name} | ${u.email} | ${u.role}`));

  // Now simulate exact login flow for student@skillbridge.in
  console.log("\n=== Simulating login: student@skillbridge.in as Student ===");
  const email = 'student@skillbridge.in';
  const { data, error } = await supabase
    .from('students')
    .select('id, name, email, password')
    .or(`email.eq.${email},id.eq.${email}`)
    .single();
  console.log("Query result:", { data, error: error?.message || null });

  // Simulate login with ID
  console.log("\n=== Simulating login: SB-2026-081 as Student ===");
  const id = 'SB-2026-081';
  const { data: data2, error: error2 } = await supabase
    .from('students')
    .select('id, name, email, password')
    .or(`email.eq.${id},id.eq.${id}`)
    .single();
  console.log("Query result:", { data: data2, error: error2?.message || null });
}

run();
