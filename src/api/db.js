import { supabase } from '../../supabase.js';
import { showToast } from '../utils/ui.js';

export const db = {
  students: [],
  jobs: [],
  applications: [],
  stats: {
    totalStudents: 0,
    activeCompanies: 0,
    apprenticeships: 0,
    placementsCompleted: 0,
    institutesOnboarded: 0
  },
  institutes: [],
  notifications: [
    { id: 1, title: 'Interview Scheduled', msg: 'Tata Motors scheduled an interview for tomorrow.', time: '2h ago', type: 'success' },
    { id: 2, title: 'Profile Viewed', msg: 'L&T Construction viewed your verified passport.', time: '5h ago', type: 'info' }
  ],
  messages: [
    { id: 1, from: 'Priya (Tata Motors)', msg: 'Please bring your original NCVT certificate.', time: '1d ago' },
    { id: 2, from: 'Admin', msg: 'Your new skill has been verified.', time: '2d ago' }
  ],
  companies: [
    { id: 'c1', name: 'Tata Motors', logo: 'T', industry: 'Automotive', activeRoles: 12 },
    { id: 'c2', name: 'L&T', logo: 'L', industry: 'Construction', activeRoles: 8 },
    { id: 'c3', name: 'Reliance', logo: 'R', industry: 'Energy', activeRoles: 15 }
  ],
  savedJobs: [],
  jobAlerts: [],
  interviews: [
    { id: 1, company: 'Tata Motors', role: 'Electrician - Plant', date: 'Tomorrow, 10:00 AM', mode: 'In-person' },
    { id: 2, company: 'L&T Construction', role: 'Site Supervisor', date: 'Jul 2, 2:00 PM', mode: 'Video Call' }
  ],
  skillCourses: [],
  courseEnrollments: []
};

// --- Database Mapping Helpers ---
export function mapStudentFromDb(s) {
  return {
    id: s.id,
    name: s.name,
    trade: s.trade,
    institute: s.institute,
    attendance: s.attendance,
    practicalScore: s.practical_score,
    theoryScore: s.theory_score,
    safetyScore: s.safety_score,
    employabilityScore: s.employability_score,
    skills: s.skills || [],
    certifications: s.certifications || [],
    status: s.status,
    appliedJobs: []
  };
}

export function mapStudentToDb(s) {
  return {
    id: s.id,
    name: s.name,
    trade: s.trade,
    institute: s.institute,
    attendance: s.attendance,
    practical_score: s.practicalScore,
    theory_score: s.theoryScore,
    safety_score: s.safetyScore,
    employability_score: s.employabilityScore,
    skills: s.skills,
    certifications: s.certifications,
    status: s.status
  };
}

export function mapJobFromDb(j) {
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    trade: j.trade,
    location: j.location,
    salary: j.salary,
    duration: j.duration,
    type: j.type,
    skillsRequired: j.skills_required || [],
    applicantsCount: j.applicants_count
  };
}

export function mapJobToDb(j) {
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    trade: j.trade,
    location: j.location,
    salary: j.salary,
    duration: j.duration,
    type: j.type,
    skills_required: j.skillsRequired,
    applicants_count: j.applicantsCount
  };
}

export function mapApplicationFromDb(a) {
  return {
    id: a.id,
    studentId: a.student_id,
    jobId: a.job_id,
    status: a.status,
    appliedOn: a.applied_on
  };
}

export function mapApplicationToDb(a) {
  return {
    id: a.id,
    student_id: a.studentId,
    job_id: a.jobId,
    status: a.status,
    applied_on: a.appliedOn
  };
}

export function mapInstituteFromDb(i) {
  return {
    id: i.id,
    name: i.name,
    state: i.state,
    rating: i.rating,
    verified: i.verified,
    studentsCount: i.students_count
  };
}

export function mapInstituteToDb(i) {
  return {
    id: i.id,
    name: i.name,
    state: i.state,
    rating: i.rating,
    verified: i.verified,
    students_count: i.studentsCount
  };
}

export function mapCompanyFromDb(c) {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    location: c.location,
    activeRoles: c.active_roles,
    verified: c.verified
  };
}

export function mapCompanyToDb(c) {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    location: c.location,
    active_roles: c.activeRoles,
    verified: c.verified
  };
}

// --- Database Sync Functions ---
export async function syncFromSupabase() {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) {
    console.log("Supabase not configured. Using local in-memory mock database.");
    return;
  }

  try {
    console.log("Synchronizing datasets with live Supabase database...");

    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (studentsError) throw studentsError;

    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (jobsError) throw jobsError;

    const { data: appsData, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (appsError) throw appsError;

    const { data: instsData, error: instsError } = await supabase
      .from('institutes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (instsError) throw instsError;

    const { data: compsData, error: compsError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (compsError) throw compsError;

    if (studentsData) db.students = studentsData.map(mapStudentFromDb);
    if (jobsData) db.jobs = jobsData.map(mapJobFromDb);
    if (appsData) db.applications = appsData.map(mapApplicationFromDb);
    if (instsData) db.institutes = instsData.map(mapInstituteFromDb);
    if (compsData) db.companies = compsData.map(mapCompanyFromDb);

    db.stats.totalStudents = db.students.length;
    db.stats.activeCompanies = db.companies.length;
    db.stats.apprenticeships = db.jobs.filter(j => j.type === 'Apprenticeship').length;
    db.stats.placementsCompleted = db.students.filter(s => s.status === 'Placed').length;
    db.stats.institutesOnboarded = db.institutes.length;

    console.log("Successfully synchronized datasets with live Supabase database.");
  } catch (error) {
    console.error("Supabase sync failed, falling back to local database:", error);
    showToast("Sync Failed", "Could not connect to live database. Operating in offline fallback mode.", "warning");
  }
}

// --- Supabase Mutation Helpers ---
export async function dbInsertStudent(student) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('students')
      .insert(mapStudentToDb(student));
    if (error) throw error;
    console.log("Successfully inserted student into Supabase:", student.id);
  } catch (error) {
    console.error("Supabase student insertion failed:", error);
    showToast("Sync Error", "Failed to save student profile online.", "warning");
  }
}

export async function dbUpdateStudent(student) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('students')
      .update(mapStudentToDb(student))
      .eq('id', student.id);
    if (error) throw error;
    console.log("Successfully updated student in Supabase:", student.id);
  } catch (error) {
    console.error("Supabase student update failed:", error);
    showToast("Sync Error", "Failed to update student profile online.", "warning");
  }
}

export async function dbInsertApplication(application) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('applications')
      .insert(mapApplicationToDb(application));
    if (error) throw error;
    console.log("Successfully inserted application into Supabase:", application.id);
  } catch (error) {
    console.error("Supabase application insertion failed:", error);
    showToast("Sync Error", "Failed to save job application online.", "warning");
  }
}

export async function dbUpdateApplication(application) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('applications')
      .update(mapApplicationToDb(application))
      .eq('id', application.id);
    if (error) throw error;
    console.log("Successfully updated application in Supabase:", application.id);
  } catch (error) {
    console.error("Supabase application update failed:", error);
    showToast("Sync Error", "Failed to update application status online.", "warning");
  }
}

export async function dbInsertInstitute(institute) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('institutes')
      .insert(mapInstituteToDb(institute));
    if (error) throw error;
    console.log("Successfully inserted institute into Supabase:", institute.id);
  } catch (error) {
    console.error("Supabase institute insertion failed:", error);
    showToast("Sync Error", "Failed to save institute profile online.", "warning");
  }
}

export async function dbInsertCompany(company) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('companies')
      .insert(mapCompanyToDb(company));
    if (error) throw error;
    console.log("Successfully inserted company into Supabase:", company.id);
  } catch (error) {
    console.error("Supabase company insertion failed:", error);
    showToast("Sync Error", "Failed to save company profile online.", "warning");
  }
}

// --- User Authentication Supabase Helpers ---
export async function dbInsertUser(user) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        tier: user.tier || 'Freemium'
      });
    if (error) throw error;
    console.log("Successfully inserted user into Supabase:", user.id);
  } catch (error) {
    console.error("Supabase user insertion failed:", error);
    showToast("Sync Error", "Failed to save user credentials online.", "warning");
  }
}

export async function dbFetchUserByEmail(email, role) {
  const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Supabase user fetch failed:", error);
    return null;
  }
}
