import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Get ALL columns from students
  console.log("=== ALL student data (all columns) ===");
  const { data: students, error: sErr } = await supabase.from('students').select('*');
  if (sErr) console.log("Error:", sErr.message);
  if (students && students.length > 0) {
    console.log("Columns:", Object.keys(students[0]));
    students.forEach(s => console.log(JSON.stringify(s, null, 2)));
  } else {
    console.log("No students found");
  }

  // Get ALL columns from users
  console.log("\n=== ALL user data (all columns) ===");
  const { data: users, error: uErr } = await supabase.from('users').select('*');
  if (uErr) console.log("Error:", uErr.message);
  if (users && users.length > 0) {
    console.log("Columns:", Object.keys(users[0]));
    users.forEach(u => console.log(JSON.stringify(u, null, 2)));
  } else {
    console.log("No users found");
  }

  // Try to fetch student by email with OR query
  console.log("\n=== Query: wasimhavaldar70@gmail.com ===");
  const { data: d1, error: e1 } = await supabase
    .from('students')
    .select('*')
    .or('email.eq.wasimhavaldar70@gmail.com,id.eq.wasimhavaldar70@gmail.com')
    .maybeSingle();
  console.log("Result:", d1, "Error:", e1?.message);

  console.log("\n=== Query: wasimhavaldar70@gmial.com ===");
  const { data: d2, error: e2 } = await supabase
    .from('students')
    .select('*')
    .or('email.eq.wasimhavaldar70@gmial.com,id.eq.wasimhavaldar70@gmial.com')
    .maybeSingle();
  console.log("Result:", d2, "Error:", e2?.message);

  console.log("\n=== Query by ID: SB-2026-0101 ===");
  const { data: d3, error: e3 } = await supabase
    .from('students')
    .select('*')
    .or('email.eq.SB-2026-0101,id.eq.SB-2026-0101')
    .maybeSingle();
  console.log("Result:", d3, "Error:", e3?.message);

  // Also check users table
  console.log("\n=== Users query by email: wasimhavaldar70@gmail.com ===");
  const { data: d4, error: e4 } = await supabase
    .from('users')
    .select('*')
    .or('email.eq.wasimhavaldar70@gmail.com,id.eq.wasimhavaldar70@gmail.com')
    .maybeSingle();
  console.log("Result:", d4, "Error:", e4?.message);
}

run();
