import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunecuhklunhhrhyfcya.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bmVjdWhrbHVuaGhyaHlmY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjI4NjEsImV4cCI6MjA5Nzc5ODg2MX0.GGDB77j9pVry1y4sHVKw368B_wn_2g2JOza9CxAO6Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const demoCredentials = {
  "Student": { email: "student@skillbridge.in", password: "password", name: "Rahul Verma", id: "SB-2026-081" },
  "Institute": { email: "pune@iti.gov.in", password: "password", name: "Govt ITI Pune ERP", id: "SB-INST-01" },
  "Company": { email: "tata@tatamotors.com", password: "password", name: "Tata Motors Recruiter", id: "SB-COMP-01" },
  "Admin": { email: "admin@skillbridge.in", password: "password", name: "System Admin", id: "SB-ADMIN-01" }
};

async function dbFetchUserByEmail(email, role) {
  try {
    let query;
    if (role === 'Student') {
      query = supabase.from('students').select('id, name, email, password').or(`email.eq.${email},id.eq.${email}`).single();
    } else if (role === 'Company') {
      query = supabase.from('companies').select('id, name, email, password').or(`email.eq.${email},id.eq.${email}`).single();
    } else if (role === 'Institute') {
      query = supabase.from('institutes').select('id, name, email, password').or(`email.eq.${email},id.eq.${email}`).single();
    } else {
      query = supabase.from('users').select('*').eq('role', role).or(`email.eq.${email},id.eq.${email}`).single();
    }
    
    const { data, error } = await query;
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    
    if (data) {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: role,
        tier: role === 'Student' ? 'Premium' : 'Freemium'
      };
    }
    return null;
  } catch (error) {
    console.error("Supabase user fetch failed:", error);
    return null;
  }
}

async function test(email, password, role) {
  console.log(`\nTesting login for: ${email} / ${password} as ${role}`);
  try {
    const dbUser = await dbFetchUserByEmail(email, role);
    console.log('dbUser returned:', dbUser);

    if (dbUser && dbUser.password === password) {
      console.log('Login success via DB!');
      return;
    }

    // Fallback to demo credentials
    let matchedCreds = null;
    const defaultCreds = demoCredentials[role];
    if (defaultCreds && (email === defaultCreds.email || email === defaultCreds.id) && password === defaultCreds.password) {
      matchedCreds = defaultCreds;
    } else {
      for (const key in demoCredentials) {
        const c = demoCredentials[key];
        if (c && (email === c.email || email === c.id) && password === c.password && c.role === role) {
          matchedCreds = c;
          break;
        }
      }
    }

    if (matchedCreds) {
      console.log('Login success via Demo fallback!', matchedCreds);
    } else {
      console.log('Login failed!');
    }
  } catch (err) {
    console.error('Exception in test:', err);
  }
}

async function runAll() {
  await test('SB-2026-081', 'password', 'Student');
  await test('student@skillbridge.in', 'password', 'Student');
  await test('invalid-id', 'password', 'Student');
}

runAll();
