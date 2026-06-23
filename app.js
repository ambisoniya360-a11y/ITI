/**
 * SkillBridge India - Interactive Application Engine
 * Contains: State Store, Reactivity, Visual Charts, and Event Listeners
 */

import { supabase } from './supabase.js';

// ─── Centralized Trade-to-Skills Mapping ───
// Single source of truth for all 25 NCVT/CTS ITI Trades
function getSkillsForTrade(trade) {
  const tradeSkillsMap = {
    // Engineering Trades
    'Electrician': ['Industrial Wiring', 'Control Panels', 'Solar PV Install', 'Safety Protocols'],
    'Fitter': ['Lathe Operations', 'Technical Drawing', 'Pneumatics & Hydraulics', 'Precision Assembly'],
    'Welder': ['TIG Welding', 'MIG Welding', 'Structural Fabrication', 'Gas Cutting'],
    'Turner': ['Lathe Turning', 'Thread Cutting', 'Taper Turning', 'Precision Measurement'],
    'Machinist': ['Milling Operations', 'Surface Grinding', 'Tool Sharpening', 'CNC Basics'],
    'Electronics Mechanic': ['PCB Repair', 'Microcontrollers', 'Soldering & Desoldering', 'Circuit Testing'],
    'Refrigeration & AC': ['HVAC Systems', 'Refrigerant Handling', 'Compressor Repair', 'Thermostat Calibration'],
    'Mechanic Diesel': ['Fuel Injection Systems', 'Engine Overhaul', 'Turbocharger Maintenance', 'Emission Testing'],
    'Motor Mechanic (MMV)': ['Engine Diagnostics', 'Brake Systems', 'Transmission Repair', 'Vehicle Electrical'],
    'Wireman': ['Domestic Wiring', 'Cable Jointing', 'Switchgear Installation', 'Earthing Systems'],
    'Surveyor': ['Land Surveying', 'Total Station Operation', 'Auto Level', 'GIS Mapping'],
    'Draughtsman Civil': ['AutoCAD Drafting', 'Building Plan Design', 'Structural Detailing', 'Site Estimation'],
    'Draughtsman Mechanical': ['Mechanical CAD', 'Assembly Drawing', 'GD&T Standards', 'Machine Design'],
    'CNC Operator': ['CNC Programming', 'Precision Milling', 'Metrology', 'G-Code & M-Code'],
    'Solar Technician': ['Solar Panel Alignment', 'Inverter Commissioning', 'Battery Bank Setup', 'AC/DC Troubleshooting'],
    'IoT Technician': ['Sensor Integration', 'Arduino & Raspberry Pi', 'MQTT Protocol', 'Smart Device Setup'],
    'EV Technician': ['EV Battery Management', 'Charging Station Setup', 'Motor Controller Diagnostics', 'Regenerative Braking'],
    // Non-Engineering Trades
    'COPA': ['MS Office Suite', 'Internet & Networking', 'Programming Basics', 'Data Entry & Management'],
    'Stenographer': ['Shorthand Writing', 'Fast Typing (80+ WPM)', 'Office Management', 'Audio Transcription'],
    'Dress Making': ['Pattern Drafting', 'Fabric Cutting', 'Machine Stitching', 'Garment Finishing'],
    'Sewing Technology': ['Industrial Sewing Machines', 'Overlock Stitching', 'Quality Control', 'Fabric Analysis'],
    'Health Sanitary Inspector': ['Water Quality Testing', 'Food Safety Inspection', 'Waste Management', 'Epidemiology Basics'],
    'Food Production': ['Bakery & Confectionery', 'Indian Cuisine', 'Food Safety & Hygiene', 'Menu Planning'],
    'Hospitality Assistant': ['Front Office Operations', 'Housekeeping', 'Customer Service', 'Event Management'],
    'Digital Photographer': ['DSLR Camera Ops', 'Photo Editing (Lightroom)', 'Studio Lighting', 'Video Editing Basics']
  };
  return tradeSkillsMap[trade] || ['Industrial Safety', 'Basic Tools', 'Workshop Practice', 'Technical Drawing'];
}

// Initialize Data Store (Live database - loads from Supabase)
const db = {
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
  notifications: [],
  companies: []
};

// Session State Initialization
db.session = JSON.parse(localStorage.getItem("skillbridge_session")) || { loggedIn: false, role: null, user: null };
let loginRole = "Student"; // currently selected login role tab
let adminModeActive = false; // toggle for secure admin mode

const demoCredentials = {
  "Student": { email: "student@skillbridge.in", password: "password", name: "Rahul Verma", id: "SB-2026-081" },
  "Institute": { email: "pune@iti.gov.in", password: "password", name: "Govt ITI Pune ERP", id: "SB-INST-01" },
  "Company": { email: "tata@tatamotors.com", password: "password", name: "Tata Motors Recruiter", id: "SB-COMP-01" },
  "Admin": { email: "admin@skillbridge.in", password: "password", name: "System Admin", id: "SB-ADMIN-01" }
};

// Global Chart References to allow destroying on theme toggle
let placementTrendChartInstance = null;
let hiringTradesChartInstance = null;
let pipelineChartInstance = null;

// --- Database Mapping Helpers ---
function mapStudentFromDb(s) {
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

function mapStudentToDb(s) {
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

function mapJobFromDb(j) {
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

function mapJobToDb(j) {
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

function mapApplicationFromDb(a) {
  return {
    id: a.id,
    studentId: a.student_id,
    jobId: a.job_id,
    status: a.status,
    appliedOn: a.applied_on
  };
}

function mapApplicationToDb(a) {
  return {
    id: a.id,
    student_id: a.studentId,
    job_id: a.jobId,
    status: a.status,
    applied_on: a.appliedOn
  };
}

function mapInstituteFromDb(i) {
  return {
    id: i.id,
    name: i.name,
    state: i.state,
    rating: i.rating,
    verified: i.verified,
    studentsCount: i.students_count
  };
}

function mapInstituteToDb(i) {
  return {
    id: i.id,
    name: i.name,
    state: i.state,
    rating: i.rating,
    verified: i.verified,
    students_count: i.studentsCount
  };
}

function mapCompanyFromDb(c) {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry,
    location: c.location,
    activeRoles: c.active_roles,
    verified: c.verified
  };
}

function mapCompanyToDb(c) {
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
async function syncFromSupabase() {
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
async function dbInsertStudent(student) {
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

async function dbUpdateStudent(student) {
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

async function dbInsertApplication(application) {
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

async function dbUpdateApplication(application) {
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

async function dbInsertInstitute(institute) {
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

async function dbInsertCompany(company) {
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
async function dbInsertUser(user) {
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

async function dbFetchUserByEmail(email, role) {
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

// Initialize Application UI
document.addEventListener("DOMContentLoaded", async () => {
  // Init Theme
  initTheme();
  
  // Init Portal Navigation
  initRouter();

  // Render initial components
  renderAllViews();
  
  // Setup Interactivity Hooks
  setupEventHandlers();
  
  // Update Navigation and Auth UI state
  updateNavigationUI();
  
  // Setup Chart Rendering
  setTimeout(() => {
    initCharts();
  }, 100);

  // Sync from Supabase asynchronously if configured
  await syncFromSupabase();
  // Re-render and re-init charts after data load
  renderAllViews();
  setTimeout(() => {
    initCharts();
  }, 100);
  
  // Init ecosystem challenges floating particles
  initEcoParticles();
});

// --- Ecosystem Section Floating Particles ---
function initEcoParticles() {
  const container = document.getElementById("eco-particles");
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "eco-particle";
    p.style.left = Math.random() * 100 + "%";
    p.style.bottom = Math.random() * 100 + "%";
    p.style.width = (2 + Math.random() * 4) + "px";
    p.style.height = p.style.width;
    p.style.animationDelay = (Math.random() * 8) + "s";
    p.style.animationDuration = (8 + Math.random() * 10) + "s";
    container.appendChild(p);
  }
}

// --- Theme Management ---
function initTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeButtonUI(currentTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeButtonUI(newTheme);
  
  // Redraw charts with theme appropriate styling
  initCharts();
}

function updateThemeButtonUI(theme) {
  const btn = document.querySelector(".theme-toggle-btn");
  if (!btn) return;
  if (theme === "dark") {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  }
}

// --- Router / Portal Switches ---
function initRouter() {
  const buttons = document.querySelectorAll(".demo-btn");
  const views = document.querySelectorAll(".portal-view");

  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetViewId = btn.getAttribute("data-view");
      
      // Router Guard Check
      const protectedViews = {
        "student-portal": "Student",
        "institute-erp": "Institute",
        "company-dashboard": "Company",
        "admin-panel": "Admin"
      };
      
      if (protectedViews[targetViewId]) {
        const requiredRole = protectedViews[targetViewId];
        if (!db.session.loggedIn) {
          showToast("Access Denied", "Please sign in to access this portal.", "warning");
          e.preventDefault();
          e.stopPropagation();
          
          // Switch to landing view manually
          buttons.forEach(b => b.classList.remove("active"));
          const landingBtn = document.getElementById("nav-btn-landing");
          if (landingBtn) landingBtn.classList.add("active");
          
          views.forEach(v => {
            v.classList.remove("active");
            if (v.id === "landing-page") {
              v.classList.add("active");
            }
          });
          return;
        }
        
        if (db.session.role !== requiredRole) {
          showToast("Access Denied", `Only users with the "${requiredRole}" role can view this page.`, "warning");
          e.preventDefault();
          e.stopPropagation();
          
          // Switch to landing view manually
          buttons.forEach(b => b.classList.remove("active"));
          const landingBtn = document.getElementById("nav-btn-landing");
          if (landingBtn) landingBtn.classList.add("active");
          
          views.forEach(v => {
            v.classList.remove("active");
            if (v.id === "landing-page") {
              v.classList.add("active");
            }
          });
          return;
        }
      }
      
      // Update buttons
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Update views
      views.forEach(v => {
        v.classList.remove("active");
        if (v.id === targetViewId) {
          v.classList.add("active");
          // Scroll page to top on switch
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      });

      // Special re-initialization actions if switching to dashboards
      if (targetViewId === "institute-erp" || targetViewId === "company-dashboard" || targetViewId === "admin-panel") {
        setTimeout(initCharts, 50);
      }
    });
  });
}

// --- View Rendering ---
function renderAllViews() {
  renderLandingStats();
  renderApprenticeshipMarketplace();
  renderStudentPortal();
  renderInstituteERP();
  renderCompanyDashboard();
  renderAdminPanel();
  renderMobileApp();
}

function renderLandingStats() {
  // Update Hero statistics elements if they exist
  const landingStudents = document.getElementById("landing-students");
  const landingCompanies = document.getElementById("landing-companies");
  const landingApprenticeships = document.getElementById("landing-apprenticeships");
  const landingPlacements = document.getElementById("landing-placements");

  if (landingStudents) landingStudents.textContent = db.stats.totalStudents.toLocaleString('en-IN');
  if (landingCompanies) landingCompanies.textContent = db.stats.activeCompanies.toLocaleString('en-IN');
  if (landingApprenticeships) landingApprenticeships.textContent = db.stats.apprenticeships.toLocaleString('en-IN');
  if (landingPlacements) landingPlacements.textContent = db.stats.placementsCompleted.toLocaleString('en-IN');

  // National Impact metrics
  const impactStudents = document.getElementById("impact-students");
  const impactCompanies = document.getElementById("impact-companies");
  const impactPlacements = document.getElementById("impact-placements");
  const impactApprenticeships = document.getElementById("impact-apprenticeships");

  if (impactStudents) {
    impactStudents.textContent = (db.stats.totalStudents / 100000).toFixed(2) + " Lakh+";
  }
  if (impactCompanies) {
    impactCompanies.textContent = db.stats.activeCompanies.toLocaleString('en-IN') + "+";
  }
  if (impactPlacements) {
    impactPlacements.textContent = db.stats.placementsCompleted.toLocaleString('en-IN') + "+";
  }
  if (impactApprenticeships) {
    impactApprenticeships.textContent = db.stats.apprenticeships.toLocaleString('en-IN') + "+";
  }
}

function renderApprenticeshipMarketplace() {
  const container = document.getElementById("job-cards-container");
  if (!container) return;

  container.innerHTML = "";

  db.jobs.forEach(job => {
    const isApplied = db.applications.some(app => app.studentId === "SB-2026-081" && app.jobId === job.id); // Rahul Verma checking
    const buttonText = isApplied ? "Applied ✓" : "Apply Now";
    const buttonClass = isApplied ? "btn-secondary" : "btn-primary";
    const disabledAttr = isApplied ? "disabled" : "";

    const jobCardHtml = `
      <div class="card job-card" id="job-card-${job.id}">
        <div class="job-card-header">
          <div class="company-logo-placeholder">${job.company[0]}</div>
          <span class="badge ${job.type === 'Apprenticeship' ? 'badge-accent' : 'badge-primary'}">${job.type}</span>
        </div>
        <div class="job-details-info">
          <h4>${job.title}</h4>
          <p style="font-size: 13px; font-weight: 500; color: var(--text-main); margin-bottom: 8px;">
            ${job.company} &bull; ${job.location}
          </p>
          <p style="font-size: 12px; margin-bottom: 12px;">Duration: ${job.duration}</p>
          <div class="job-meta-pills">
            ${job.skillsRequired.map(skill => `<span class="job-pill">${skill}</span>`).join('')}
            <span class="job-pill" style="border-color: rgba(var(--primary-rgb), 0.3); color: var(--primary);">Trade: ${job.trade}</span>
          </div>
        </div>
        <div class="job-card-footer">
          <div class="job-salary">${job.salary}</div>
          <button class="btn btn-sm ${buttonClass}" onclick="applyForJob('${job.id}')" ${disabledAttr}>${buttonText}</button>
        </div>
      </div>
    `;
    container.innerHTML += jobCardHtml;
  });
}

function renderStudentPortal() {
  // Student Portal is logged in as Rahul Verma (SB-2026-081)
  const student = db.students.find(s => s.id === "SB-2026-081");
  if (!student) return;

  // Render Passport sidebar info
  const passName = document.getElementById("student-pass-name");
  const passTrade = document.getElementById("student-pass-trade");
  const passId = document.getElementById("student-pass-id");
  const passInst = document.getElementById("student-pass-inst");

  if (passName) passName.textContent = student.name;
  if (passTrade) passTrade.textContent = student.trade + " Trade";
  if (passId) passId.textContent = student.id;
  if (passInst) passInst.textContent = student.institute;

  // Draw radial score background in SVG
  const scoreRadial = document.getElementById("student-score-radial");
  if (scoreRadial) {
    const strokeDashOffset = 440 - (440 * student.employabilityScore) / 100;
    scoreRadial.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--border-strong)" stroke-width="8"></circle>
        <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--accent)" stroke-width="8"
          stroke-dasharray="440" stroke-dashoffset="${strokeDashOffset}" stroke-linecap="round" transform="rotate(-90 80 80)"></circle>
      </svg>
    `;
  }
  
  const scoreNum = document.getElementById("student-score-num");
  if (scoreNum) scoreNum.textContent = student.employabilityScore;

  // Render student stats
  const statAttendance = document.getElementById("student-stat-attendance");
  const statPractical = document.getElementById("student-stat-practical");
  const statTheory = document.getElementById("student-stat-theory");
  const statSafety = document.getElementById("student-stat-safety");

  if (statAttendance) statAttendance.textContent = student.attendance + "%";
  if (statPractical) statPractical.textContent = student.practicalScore + "/100";
  if (statTheory) statTheory.textContent = student.theoryScore + "/100";
  if (statSafety) statSafety.textContent = student.safetyScore + "/100";

  // Skills tag listing
  const skillsContainer = document.getElementById("student-skills-list");
  if (skillsContainer) {
    skillsContainer.innerHTML = student.skills.map(skill => `
      <span class="skill-tag skill-tag-verified">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ${skill}
      </span>
    `).join('') + `
      <span class="skill-tag" style="border-style: dashed; cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="showAddSkillModal()">
        + Add Skill
      </span>
    `;
  }

  // Certifications list
  const certContainer = document.getElementById("student-certs-list");
  if (certContainer) {
    certContainer.innerHTML = student.certifications.map(cert => `
      <div class="card" style="padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; border-color: rgba(16, 185, 129, 0.2);">
        <div style="color: var(--success)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg></div>
        <div>
          <h5 style="font-size: 13px; font-weight:600;">${cert}</h5>
          <span style="font-size: 10px; color: var(--text-light)">VERIFIED &bull; SKILLBRIDGE SECURE SHIELD</span>
        </div>
      </div>
    `).join('');
  }

  // Render job applications list
  renderStudentApplicationsList();
  renderStudentJobBoard();

  // Update live resume metrics on render
  if (window.updateLiveResume) {
    window.updateLiveResume();
  }
}

function renderStudentApplicationsList() {
  const container = document.getElementById("student-applications-table");
  if (!container) return;

  const applications = db.applications.filter(app => app.studentId === "SB-2026-081");
  
  if (applications.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">No applications submitted yet.</td></tr>`;
    return;
  }

  container.innerHTML = "";
  applications.forEach(app => {
    const job = db.jobs.find(j => j.id === app.jobId);
    if (!job) return;

    let badgeClass = "badge-primary";
    if (app.status === "Shortlisted") badgeClass = "badge-warning";
    if (app.status === "Interviewing") badgeClass = "badge-accent";
    if (app.status === "Offered") badgeClass = "badge-success";

    const tr = `
      <tr>
        <td>
          <div style="font-weight: 600;">${job.title}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${job.company}</div>
        </td>
        <td>${job.type}</td>
        <td>${app.appliedOn}</td>
        <td><span class="badge ${badgeClass}">${app.status}</span></td>
      </tr>
    `;
    container.innerHTML += tr;
  });
}

function renderStudentJobBoard() {
  const container = document.getElementById("student-job-board");
  if (!container) return;

  container.innerHTML = "";
  // Show jobs matching Student trade first (Electrician)
  const student = db.students.find(s => s.id === "SB-2026-081");

  db.jobs.forEach(job => {
    const isApplied = db.applications.some(app => app.studentId === "SB-2026-081" && app.jobId === job.id);
    const btnText = isApplied ? "Applied" : "Apply";
    const btnClass = isApplied ? "btn-secondary" : "btn-primary";
    const disabledAttr = isApplied ? "disabled" : "";
    const isMatched = job.trade === student.trade;

    const row = `
      <div class="card" style="padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-color: ${isMatched ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--border)'}">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h5 style="font-size: 15px;">${job.title}</h5>
            ${isMatched ? '<span class="badge badge-success" style="font-size: 8px; padding: 2px 6px;">Trade Match</span>' : ''}
          </div>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
            ${job.company} &bull; ${job.location} &bull; <strong>${job.salary}</strong>
          </p>
        </div>
        <button class="btn btn-sm ${btnClass}" onclick="applyForJob('${job.id}')" ${disabledAttr} style="padding: 6px 12px; font-size:12px;">${btnText}</button>
      </div>
    `;
    container.innerHTML += row;
  });
}

function renderInstituteERP() {
  const roster = document.getElementById("institute-roster-body");
  if (!roster) return;

  roster.innerHTML = "";
  // Populate student list
  db.students.forEach(student => {
    let statusClass = "badge-primary";
    if (student.status === "Placed") statusClass = "badge-success";
    if (student.status === "Interviewing") statusClass = "badge-warning";

    const tr = `
      <tr>
        <td>
          <div style="font-weight: 600;">${student.name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${student.id}</div>
        </td>
        <td>${student.trade}</td>
        <td><span class="badge ${statusClass}">${student.status}</span></td>
      </tr>
    `;
    roster.innerHTML += tr;
  });

  // Render Institute Stats — all 8 cards
  const instStatsTotal = document.getElementById("inst-stats-total");
  const instStatsPlaced = document.getElementById("inst-stats-placed");
  const instStatsRate = document.getElementById("inst-stats-rate");
  const instStatsPartners = document.getElementById("inst-stats-partners");
  const instStatsCompanies = document.getElementById("inst-stats-companies");
  const instStatsPositions = document.getElementById("inst-stats-positions");
  const instStatsAlerts = document.getElementById("inst-stats-alerts");
  const instStatsDrives = document.getElementById("inst-stats-drives");
  const instStatsApprenticeships = document.getElementById("inst-stats-apprenticeships");

  if (instStatsTotal) instStatsTotal.textContent = db.students.length;
  
  const placedCount = db.students.filter(s => s.status === "Placed").length;
  if (instStatsPlaced) instStatsPlaced.textContent = placedCount;

  const placementRate = db.students.length > 0 ? Math.round((placedCount / db.students.length) * 100) : 0;
  if (instStatsRate) instStatsRate.textContent = placementRate + "%";

  // Partner ITIs
  if (instStatsPartners) instStatsPartners.textContent = db.institutes.length;

  // Hiring companies (unique company names from jobs)
  const uniqueCompanies = [...new Set(db.jobs.map(j => j.company))];
  if (instStatsCompanies) instStatsCompanies.textContent = uniqueCompanies.length;

  // Open Positions
  if (instStatsPositions) instStatsPositions.textContent = db.jobs.length;

  // Opportunity Alerts (count of unread notifications aimed at institutes)
  const instAlerts = db.notifications.filter(n => n.receiverRole === "Institute" && !n.read).length;
  if (instStatsAlerts) instStatsAlerts.textContent = instAlerts || 7;

  // Upcoming Drives (mock — number of apprenticeship type jobs)
  const upcomingDrives = db.jobs.filter(j => j.type === "Apprenticeship").length;
  if (instStatsDrives) instStatsDrives.textContent = upcomingDrives || 4;

  // Apprenticeship Programs
  const apprenticeshipCount = db.jobs.filter(j => j.type === "Apprenticeship").length;
  if (instStatsApprenticeships) instStatsApprenticeships.textContent = apprenticeshipCount || 12;
}

function renderCompanyDashboard() {
  const roster = document.getElementById("company-student-search-body");
  if (!roster) return;

  // Filter conditions from UI controls
  const searchVal = (document.getElementById("search-student-input")?.value || "").toLowerCase();
  const tradeFilter = document.getElementById("filter-trade")?.value || "All";
  const scoreFilter = parseInt(document.getElementById("filter-score")?.value || "0");

  roster.innerHTML = "";

  const filteredStudents = db.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchVal) || student.skills.some(s => s.toLowerCase().includes(searchVal));
    const matchesTrade = tradeFilter === "All" || student.trade === tradeFilter;
    const matchesScore = student.employabilityScore >= scoreFilter;
    return matchesSearch && matchesTrade && matchesScore;
  });

  if (filteredStudents.length === 0) {
    roster.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">No students found matching filters.</td></tr>`;
    return;
  }

  filteredStudents.forEach(student => {
    // Generate verified badge markup
    const verificationBadge = student.status === "Placed" 
      ? `<span class="badge badge-success">✓ Verified</span>` 
      : `<button class="btn btn-sm btn-glass" onclick="verifyStudentPassport('${student.id}')" style="padding: 4px 8px; font-size: 10px;">Verify Secure</button>`;

    const tr = `
      <tr id="company-row-${student.id}">
        <td>
          <div style="font-weight: 600;">${student.name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${student.institute}</div>
        </td>
        <td>${student.trade}</td>
        <td>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 250px;">
            ${student.skills.map(s => `<span class="job-pill" style="font-size:10px;">${s}</span>`).join('')}
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--primary);">${student.employabilityScore}</div>
        </td>
        <td>${verificationBadge}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openScheduleModal('${student.id}')" style="padding: 6px 12px; font-size:11px;">
            Schedule
          </button>
        </td>
      </tr>
    `;
    roster.innerHTML += tr;
  });

  // Render Kanban Columns
  renderCompanyKanban();
}

function renderCompanyKanban() {
  const cols = {
    "Applied": document.getElementById("kanban-applied"),
    "Shortlisted": document.getElementById("kanban-shortlisted"),
    "Interviewing": document.getElementById("kanban-interviewing"),
    "Offered": document.getElementById("kanban-offered")
  };

  if (!cols["Applied"]) return;

  // Clear cols
  Object.keys(cols).forEach(key => {
    if (cols[key]) cols[key].innerHTML = "";
  });

  // Render Kanban cards based on applications
  db.applications.forEach(app => {
    const student = db.students.find(s => s.id === app.studentId);
    const job = db.jobs.find(j => j.id === app.jobId);
    if (!student || !job) return;

    const column = app.status;
    const colContainer = cols[column];
    if (!colContainer) return;

    const cardHtml = `
      <div class="kanban-card" id="kcard-${app.id}">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="font-size: 13px; color: var(--text-main);">${student.name}</strong>
          <span style="font-size: 10px; color: var(--text-light)">${student.trade}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 12px;">
          Applied: ${job.company} &bull; ${job.title}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 10px; font-weight:700; color: var(--accent);">Score: ${student.employabilityScore}</div>
          <div style="display:flex; gap: 4px;">
            ${column !== 'Offered' ? `<button class="btn btn-sm" onclick="advanceApplicationStatus('${app.id}')" style="padding: 2px 6px; font-size: 9px; background: rgba(var(--primary-rgb), 0.08); border:none; color: var(--primary);">Advance →</button>` : `<span style="font-size: 9px; color: var(--success); font-weight:bold;">Offer Sent</span>`}
          </div>
        </div>
      </div>
    `;
    colContainer.innerHTML += cardHtml;
  });

  // Update counts
  Object.keys(cols).forEach(key => {
    const colCountEl = document.getElementById(`count-${key.toLowerCase()}`);
    if (colCountEl && cols[key]) {
      colCountEl.textContent = cols[key].children.length;
    }
  });
}

function renderAdminPanel() {
  const table = document.getElementById("admin-logs-body");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <td><span class="badge badge-success">INFO</span></td>
      <td>Sync completed with NCVT Skill Registry</td>
      <td>Just Now</td>
      <td>System Gate</td>
    </tr>
    <tr>
      <td><span class="badge badge-primary">AUTH</span></td>
      <td>Government ITI Nagpur verified credentials</td>
      <td>12 mins ago</td>
      <td>Verification API</td>
    </tr>
    <tr>
      <td><span class="badge badge-accent">APP</span></td>
      <td>Tata Motors updated apprenticeship counts to 850</td>
      <td>1 hour ago</td>
      <td>Company Portal</td>
    </tr>
    <tr>
      <td><span class="badge badge-warning">WARN</span></td>
      <td>Bulk enrollment queue: 50 candidates processing</td>
      <td>3 hours ago</td>
      <td>Admin Portal</td>
    </tr>
  `;
}

function renderMobileApp() {
  const mStudent = db.students.find(s => s.id === "SB-2026-081");
  if (!mStudent) return;

  // Render Mobile Home Screen
  const mName = document.getElementById("mobile-home-name");
  const mTrade = document.getElementById("mobile-home-trade");
  const mScore = document.getElementById("mobile-home-score");

  if (mName) mName.textContent = "Namaste, " + mStudent.name;
  if (mTrade) mTrade.textContent = mStudent.trade + " Student";
  if (mScore) mScore.textContent = mStudent.employabilityScore;

  // Render Mobile Passport View Tab content
  const mPassId = document.getElementById("mobile-pass-id");
  const mPassSkills = document.getElementById("mobile-pass-skills");

  if (mPassId) mPassId.textContent = mStudent.id;
  if (mPassSkills) {
    mPassSkills.innerHTML = mStudent.skills.map(s => `
      <span style="font-size: 10px; padding: 2px 6px; background: rgba(var(--primary-rgb), 0.08); border-radius: 4px; color: var(--primary);">
        ${s}
      </span>
    `).join('');
  }

  // Render Mobile Jobs Roster
  const mJobs = document.getElementById("mobile-jobs-list");
  if (mJobs) {
    mJobs.innerHTML = "";
    db.jobs.slice(0, 3).forEach(job => {
      const isApplied = db.applications.some(app => app.studentId === "SB-2026-081" && app.jobId === job.id);
      mJobs.innerHTML += `
        <div style="background: var(--surface); padding: 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border); display:flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 12px; display:block;">${job.title}</strong>
            <span style="font-size: 10px; color: var(--text-muted);">${job.company}</span>
          </div>
          <button class="btn btn-sm ${isApplied ? 'btn-secondary' : 'btn-primary'}" onclick="applyForJob('${job.id}')" style="padding: 4px 8px; font-size:10px;" ${isApplied ? 'disabled' : ''}>
            ${isApplied ? 'Applied' : 'Apply'}
          </button>
        </div>
      `;
    });
  }
}

// --- Interactive Database Actions ---

// Student Application
window.applyForJob = function(jobId) {
  const studentId = "SB-2026-081"; // Active logged-in demo student (Rahul Verma)
  const job = db.jobs.find(j => j.id === jobId);
  
  if (!job) return;

  // Add application
  const newApp = {
    id: `APP-0${db.applications.length + 100}`,
    studentId: studentId,
    jobId: jobId,
    status: "Applied",
    appliedOn: new Date().toISOString().split('T')[0]
  };

  db.applications.push(newApp);
  
  // Insert application in Supabase
  dbInsertApplication(newApp);
  
  // Increment job's applications count
  job.applicantsCount++;

  // Increment Placements / Active statistics
  db.stats.apprenticeships++;
  
  // Re-render
  renderAllViews();
  initCharts();

  // Trigger floating alert toast
  showToast(`Application Sent!`, `Applied for ${job.title} at ${job.company}. Recruiting team notified.`);
};

// ERP Add Student
window.registerStudentFromERP = function(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("new-student-name")?.value || "Aarav Kumar";
  const trade = document.getElementById("new-student-trade")?.value || "Electrician";
  const attendance = parseInt(document.getElementById("new-student-attendance")?.value || "90");
  
  // Generate random scores
  const practicalScore = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
  const theoryScore = Math.floor(Math.random() * (100 - 75 + 1)) + 75;
  const safetyScore = Math.floor(Math.random() * (100 - 90 + 1)) + 90;
  const employabilityScore = Math.round((practicalScore * 0.5) + (theoryScore * 0.3) + (safetyScore * 0.2));

  // Determine skills based on trade (centralized helper)
  const skills = getSkillsForTrade(trade);

  const id = `SB-2026-0${db.students.length + 100}`;
  const newStudent = {
    id,
    name,
    trade,
    institute: "Government ITI Pune",
    attendance,
    practicalScore,
    theoryScore,
    safetyScore,
    employabilityScore,
    skills,
    certifications: [`NCVT ${trade} Trade Certificate`],
    status: "Available",
    appliedJobs: []
  };

  db.students.unshift(newStudent);
  dbInsertStudent(newStudent);
  db.stats.totalStudents++;

  // Close modal
  closeModal('modal-add-student');

  // Re-render
  renderAllViews();
  
  // Show notification
  showToast(`Student Registered!`, `${name} successfully added to the SkillBridge national registry.`);
};

// Skill Verification Action
window.verifyStudentPassport = function(studentId) {
  const student = db.students.find(s => s.id === studentId);
  if (!student) return;

  // Show a verification spinner simulation
  showToast(`Securing Blockchain Hash...`, `Verifying skill credentials for ${student.name}.`, `info`);
  
  setTimeout(() => {
    // Modify status
    student.status = "Placed"; // Simulate placing/verifying
    dbUpdateStudent(student);
    renderAllViews();
    showToast(`Verification Successful`, `${student.name}'s digital skill passport has been sealed and verified.`, `success`);
  }, 1500);
};

// Run AI Assessment Simulation
window.triggerSkillAssessment = function(studentId) {
  const student = db.students.find(s => s.id === studentId);
  if (!student) return;

  showToast(`Running AI Assessor...`, `Evaluating practical scores and simulation responses for ${student.name}.`, `info`);

  setTimeout(() => {
    // Tweak employability score upwards
    const bonus = Math.floor(Math.random() * 5) + 1;
    student.employabilityScore = Math.min(100, student.employabilityScore + bonus);
    dbUpdateStudent(student);
    
    renderAllViews();
    showToast(`Evaluation Complete`, `${student.name}'s AI score upgraded to ${student.employabilityScore}.`, `success`);
  }, 1200);
};

// Interview Scheduler Actions
let activeInterviewStudentId = null;
window.openScheduleModal = function(studentId) {
  activeInterviewStudentId = studentId;
  const student = db.students.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById("modal-schedule-title").innerText = `Schedule Interview: ${student.name}`;
  openModal('modal-schedule-interview');
};

window.scheduleInterviewSubmit = function(e) {
  if (e) e.preventDefault();
  
  const student = db.students.find(s => s.id === activeInterviewStudentId);
  if (!student) return;

  const date = document.getElementById("interview-date")?.value || "Tomorrow";
  const mode = document.getElementById("interview-mode")?.value || "Virtual";

  student.status = "Interviewing";
  dbUpdateStudent(student);
  
  // Also make sure we have a mock application for this student to show in interviewing kanban
  let app = db.applications.find(a => a.studentId === student.id);
  if (app) {
    app.status = "Interviewing";
    dbUpdateApplication(app);
  } else {
    // Add dummy application
    const newApp = {
      id: `APP-0${db.applications.length + 100}`,
      studentId: student.id,
      jobId: "JOB-001",
      status: "Interviewing",
      appliedOn: new Date().toISOString().split('T')[0]
    };
    db.applications.push(newApp);
    dbInsertApplication(newApp);
  }

  closeModal('modal-schedule-interview');
  renderAllViews();
  showToast(`Interview Scheduled`, `${mode} interview for ${student.name} booked on ${date}.`, `success`);
};

// Kanban Column Advance
window.advanceApplicationStatus = function(appId) {
  const app = db.applications.find(a => a.id === appId);
  if (!app) return;

  const current = app.status;
  let next = current;
  if (current === "Applied") next = "Shortlisted";
  else if (current === "Shortlisted") next = "Interviewing";
  else if (current === "Interviewing") next = "Offered";

  app.status = next;
  dbUpdateApplication(app);

  // Sync back to student record
  const student = db.students.find(s => s.id === app.studentId);
  if (student) {
    if (next === "Offered") {
      student.status = "Placed";
      db.stats.placementsCompleted++;
    } else {
      student.status = next;
    }
    dbUpdateStudent(student);
  }

  renderAllViews();
  initCharts();
  showToast(`Status Updated`, `Candidate progressed to ${next} state.`, `success`);
};

// --- Mobile App Navigation Toggling ---
window.switchMobileTab = function(tabName, el) {
  const sections = document.querySelectorAll(".mobile-app-section");
  const tabItems = document.querySelectorAll(".mobile-tab-item");

  sections.forEach(s => {
    s.style.display = "none";
    if (s.id === `mobile-section-${tabName}`) {
      s.style.display = "block";
    }
  });

  tabItems.forEach(t => t.classList.remove("active"));
  el.classList.add("active");
};

// --- Modal Helper Functions ---
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("show");
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("show");
};

// Add skills modal trigger
window.showAddSkillModal = function() {
  const skillName = prompt("Enter verified NCVT/Industry skill to add:");
  if (skillName) {
    const student = db.students.find(s => s.id === "SB-2026-081");
    if (student && !student.skills.includes(skillName)) {
      student.skills.push(skillName);
      student.employabilityScore = Math.min(100, student.employabilityScore + 2); // Boost score!
      dbUpdateStudent(student);
      renderAllViews();
      showToast(`Skill Certified!`, `Added "${skillName}" to your digital skill passport. Score updated.`);
    }
  }
};

// Company Search Filters Hook
function setupEventHandlers() {
  const searchInput = document.getElementById("search-student-input");
  const tradeFilter = document.getElementById("filter-trade");
  const scoreFilter = document.getElementById("filter-score");

  if (searchInput) searchInput.addEventListener("input", renderCompanyDashboard);
  if (tradeFilter) tradeFilter.addEventListener("change", renderCompanyDashboard);
  if (scoreFilter) scoreFilter.addEventListener("input", () => {
    document.getElementById("score-filter-val").innerText = scoreFilter.value;
    renderCompanyDashboard();
  });

  // Bind Corporate Sourcing Directory filters inside Institute ERP
  const compSearch = document.getElementById("filter-comp-name");
  const compSector = document.getElementById("filter-comp-sector");
  const compLocation = document.getElementById("filter-comp-location");
  const compVerified = document.getElementById("filter-comp-verified");

  if (compSearch) compSearch.addEventListener("input", renderCompanyDirectory);
  if (compSector) compSector.addEventListener("change", renderCompanyDirectory);
  if (compLocation) compLocation.addEventListener("input", renderCompanyDirectory);
  if (compVerified) compVerified.addEventListener("change", renderCompanyDirectory);


  // Set up Inbox textarea Enter-key send handlers
  const inboxSetups = [
    { id: "student-inbox-message-textarea", role: "Student" },
    { id: "institute-inbox-message-textarea", role: "Institute" },
    { id: "company-inbox-message-textarea", role: "Company" },
    { id: "admin-inbox-message-textarea", role: "Admin" }
  ];
  inboxSetups.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          window.sendInboxMessage(s.role);
        }
      });
    }
  });
}

// --- Floating Toast Alerts ---
function showToast(title, message, type = "success") {
  const toast = document.getElementById("notification-toast");
  const icon = document.getElementById("toast-icon-wrap");
  const tTitle = document.getElementById("toast-title");
  const tMsg = document.getElementById("toast-message");

  if (!toast) return;

  // Set colors based on type
  if (type === "success") {
    toast.style.borderColor = "rgba(16, 185, 129, 0.4)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === "info") {
    toast.style.borderColor = "rgba(59, 130, 246, 0.4)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  } else if (type === "warning") {
    toast.style.borderColor = "rgba(245, 158, 11, 0.4)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  tTitle.textContent = title;
  tMsg.textContent = message;

  toast.classList.add("show");
  
  // Clear previous timers
  if (toast.timer) clearTimeout(toast.timer);
  
  toast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// --- Visual Chart Rendering (Using Chart.js) ---
function initCharts() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  
  // Theme styling overrides
  const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 98, 254, 0.05)";
  const labelColor = isDark ? "#94A3B8" : "#64748B";
  const primaryColor = isDark ? "#3B82F6" : "#1062FE";
  const accentColor = isDark ? "#FF7A45" : "#FF5A1F";
  const surfaceColor = isDark ? "#161b26" : "#FFFFFF";

  // Chart 1: Placement Trends (Line Chart on ERP Dashboard)
  const lineCtx = document.getElementById("chart-placement-trend")?.getContext("2d");
  if (lineCtx) {
    if (placementTrendChartInstance) placementTrendChartInstance.destroy();
    
    // Set mock data based on placements
    const activePlacements = db.stats.placementsCompleted;
    
    placementTrendChartInstance = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Placements Completed',
          data: [20000, 24000, 27000, 29000, 31000, activePlacements - 200, activePlacements],
          borderColor: primaryColor,
          backgroundColor: 'transparent',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: accentColor,
          pointBorderColor: '#FFF',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: labelColor }
          }
        }
      }
    });
  }

  // Chart 2: Top Hiring Trades (Doughnut Chart on ERP/Landing Dashboard)
  const doughnutCtx = document.getElementById("chart-hiring-trades")?.getContext("2d");
  if (doughnutCtx) {
    if (hiringTradesChartInstance) hiringTradesChartInstance.destroy();
    
    hiringTradesChartInstance = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Electrician', 'Fitter', 'Welder', 'CNC Operator', 'Solar Tech'],
        datasets: [{
          data: [2125, 1700, 1275, 1020, 680],
          backgroundColor: [
            primaryColor,
            accentColor,
            '#10B981', // Success green
            '#F59E0B', // Gold
            '#8B5CF6'  // Purple
          ],
          borderColor: surfaceColor,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: labelColor, boxWidth: 12 }
          }
        },
        cutout: '60%'
      }
    });
  }

  // Chart 3: Placement Pipeline (Horizontal Bar Chart on Company Portal)
  const pipeCtx = document.getElementById("chart-placement-pipeline")?.getContext("2d");
  if (pipeCtx) {
    if (pipelineChartInstance) pipelineChartInstance.destroy();

    const appliedCount = db.applications.filter(a => a.status === 'Applied').length + 45000;
    const shortlistedCount = db.applications.filter(a => a.status === 'Shortlisted').length + 18000;
    const interviewingCount = db.applications.filter(a => a.status === 'Interviewing').length + 10000;
    const offeredCount = db.applications.filter(a => a.status === 'Offered').length + 5000;

    pipelineChartInstance = new Chart(pipeCtx, {
      type: 'bar',
      data: {
        labels: ['Applications', 'Shortlisted', 'Interviewing', 'Selected/Offered'],
        datasets: [{
          data: [appliedCount, shortlistedCount, interviewingCount, offeredCount],
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#8B5CF6'
          ],
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          y: {
            grid: { display: false },
            ticks: { color: labelColor }
          }
        }
      }
    });
  }
}
window.toggleTheme = toggleTheme;

// --- Role-Based Access Control & Authentication ---
let authMode = "signin";

window.setAuthMode = function(mode) {
  authMode = mode;

  const signinBtn = document.getElementById("auth-mode-signin-btn");
  const signupBtn = document.getElementById("auth-mode-signup-btn");
  const nameGroup = document.getElementById("signup-name-group");
  const submitBtn = document.getElementById("login-submit-btn");
  const autofillSec = document.getElementById("login-autofill-sec");

  if (mode === "signin") {
    if (signinBtn) signinBtn.classList.add("active");
    if (signupBtn) signupBtn.classList.remove("active");

    if (nameGroup) nameGroup.style.display = "none";
    if (autofillSec) autofillSec.style.display = "block";
    if (submitBtn) submitBtn.textContent = "Sign In to Portal";

    const title = document.getElementById("login-card-title");
    const sub = document.getElementById("login-card-subtitle");
    if (title) title.textContent = "Sign In to Dashboard";
    if (sub) sub.textContent = "Select your role to access your verified portal.";

    window.setLoginRole(loginRole);
  } else {
    if (signinBtn) signinBtn.classList.remove("active");
    if (signupBtn) signupBtn.classList.add("active");

    if (nameGroup) nameGroup.style.display = "block";
    if (autofillSec) autofillSec.style.display = "none";
    if (submitBtn) submitBtn.textContent = "Create Account & Sign Up";

    const title = document.getElementById("login-card-title");
    const sub = document.getElementById("login-card-subtitle");
    if (title) title.textContent = "Create New Account";
    if (sub) sub.textContent = "Register your profile on the national skill network.";

    window.updateSignupRoleFields();
  }

  const nameInput = document.getElementById("login-name");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";
};

window.updateSignupRoleFields = function() {
  const studentFields = document.getElementById("signup-student-fields");
  const instituteFields = document.getElementById("signup-institute-fields");
  const companyFields = document.getElementById("signup-company-fields");
  const nameLabel = document.getElementById("login-name-label");
  const emailLabel = document.getElementById("login-email-label");
  const emailInput = document.getElementById("login-email");

  if (studentFields) studentFields.style.display = "none";
  if (instituteFields) instituteFields.style.display = "none";
  if (companyFields) companyFields.style.display = "none";

  if (loginRole === "Student") {
    if (studentFields) studentFields.style.display = "block";
    if (nameLabel) nameLabel.textContent = "Full Name";
    if (emailLabel) emailLabel.textContent = "Student Email Address";
    if (emailInput) emailInput.placeholder = "student@skillbridge.in";
  } else if (loginRole === "Institute") {
    if (instituteFields) instituteFields.style.display = "block";
    if (nameLabel) nameLabel.textContent = "Institute Name";
    if (emailLabel) emailLabel.textContent = "Institute Corporate Email";
    if (emailInput) emailInput.placeholder = "pune@iti.gov.in";
  } else if (loginRole === "Company") {
    if (companyFields) companyFields.style.display = "block";
    if (nameLabel) nameLabel.textContent = "Company Name";
    if (emailLabel) emailLabel.textContent = "Company Hiring Email";
    if (emailInput) emailInput.placeholder = "tata@tatamotors.com";
  }
};

window.updateNavigationUI = function() {
  const navBtnStudent = document.getElementById("nav-btn-student");
  const navBtnInstitute = document.getElementById("nav-btn-institute");
  const navBtnCompany = document.getElementById("nav-btn-company");
  const navBtnAdmin = document.getElementById("nav-btn-admin");
  const navBtnLogin = document.getElementById("nav-btn-login");

  if (navBtnStudent) navBtnStudent.style.display = "none";
  if (navBtnInstitute) navBtnInstitute.style.display = "none";
  if (navBtnCompany) navBtnCompany.style.display = "none";
  if (navBtnAdmin) navBtnAdmin.style.display = "none";
  if (navBtnLogin) navBtnLogin.style.display = "none";

  const headerActions = document.getElementById("landing-header-actions");

  if (db.session.loggedIn) {
    const roleBtnMap = {
      "Student": navBtnStudent,
      "Institute": navBtnInstitute,
      "Company": navBtnCompany,
      "Admin": navBtnAdmin
    };
    const activeBtn = roleBtnMap[db.session.role];
    if (activeBtn) activeBtn.style.display = "inline-flex";

    if (headerActions) {
      const dashboardBtnId = {
        "Student": "nav-btn-student",
        "Institute": "nav-btn-institute",
        "Company": "nav-btn-company",
        "Admin": "nav-btn-admin"
      }[db.session.role];

      headerActions.innerHTML = `
        <span style="font-size: 13px; font-weight: 600; color: var(--text-main); margin-right: 8px;">
          Namaste, ${db.session.user}
        </span>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('${dashboardBtnId}').click();">Dashboard</button>
        <button class="btn btn-primary btn-sm" onclick="handleLogout(event)">Logout</button>
      `;
    }

    const studentFooter = document.getElementById("student-sidebar-footer");
    if (studentFooter) studentFooter.textContent = `Logged in as ${db.session.user}`;

    const instFooter = document.getElementById("institute-sidebar-footer");
    if (instFooter) instFooter.textContent = db.session.role === "Institute" ? db.session.user : "Govt ITI Pune";

    const companyFooter = document.getElementById("company-sidebar-footer");
    if (companyFooter) companyFooter.textContent = db.session.role === "Company" ? db.session.user : "Tata Motors";

    const adminFooter = document.getElementById("admin-sidebar-footer");
    if (adminFooter) adminFooter.textContent = `System Admin`;

    // Configure plan status indicators on load
    const instPlanBadge = document.getElementById("inst-plan-badge");
    const instPlanContainer = document.getElementById("inst-plan-container");
    const compPlanBadge = document.getElementById("comp-plan-badge");
    const compPlanContainer = document.getElementById("comp-plan-container");
    const instDirBadgeHeader = document.getElementById("inst-dir-badge-header");
    const compDirBadgeHeader = document.getElementById("comp-dir-badge-header");

    const tier = db.session.tier || "Freemium";

    if (tier === "Premium") {
      if (instPlanBadge) {
        instPlanBadge.textContent = "Premium Plan";
        instPlanBadge.className = "plan-badge plan-badge-premium";
      }
      if (instPlanContainer) {
        const upgradeBtn = instPlanContainer.querySelector("button");
        if (upgradeBtn) upgradeBtn.style.display = "none";
      }
      if (compPlanBadge) {
        compPlanBadge.textContent = "Premium Plan";
        compPlanBadge.className = "plan-badge plan-badge-premium";
      }
      if (compPlanContainer) {
        const upgradeBtn = compPlanContainer.querySelector("button");
        if (upgradeBtn) upgradeBtn.style.display = "none";
      }
      if (instDirBadgeHeader) {
        instDirBadgeHeader.textContent = "Premium Unrestricted Database Active";
        instDirBadgeHeader.className = "plan-badge plan-badge-premium";
      }
      if (compDirBadgeHeader) {
        compDirBadgeHeader.textContent = "Premium Unrestricted Database Active";
        compDirBadgeHeader.className = "plan-badge plan-badge-premium";
      }
    } else {
      if (instPlanBadge) {
        instPlanBadge.textContent = "Freemium Plan";
        instPlanBadge.className = "plan-badge plan-badge-freemium";
      }
      if (instPlanContainer) {
        const upgradeBtn = instPlanContainer.querySelector("button");
        if (upgradeBtn) upgradeBtn.style.display = "inline-block";
      }
      if (compPlanBadge) {
        compPlanBadge.textContent = "Freemium Plan";
        compPlanBadge.className = "plan-badge plan-badge-freemium";
      }
      if (compPlanContainer) {
        const upgradeBtn = compPlanContainer.querySelector("button");
        if (upgradeBtn) upgradeBtn.style.display = "inline-block";
      }
      if (instDirBadgeHeader) {
        instDirBadgeHeader.textContent = "Freemium Limit Active (5 visible)";
        instDirBadgeHeader.className = "plan-badge plan-badge-freemium";
      }
      if (compDirBadgeHeader) {
        compDirBadgeHeader.textContent = "Freemium Limit Active (5 visible)";
        compDirBadgeHeader.className = "plan-badge plan-badge-freemium";
      }
    }

  } else {
    if (navBtnLogin) navBtnLogin.style.display = "inline-flex";

    if (headerActions) {
      headerActions.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('nav-btn-login').click();">Login</button>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('nav-btn-login').click();">Get Started</button>
      `;
    }
  }

  // Hydrate Lucide Icons
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
};

window.setLoginRole = function(role) {
  if (adminModeActive) {
    window.toggleAdminMode();
  }
  loginRole = role;

  document.querySelectorAll("#login-role-tabs .role-sel-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-role") === role) {
      btn.classList.add("active");
    }
  });

  if (authMode === "signup") {
    window.updateSignupRoleFields();
    return;
  }

  const emailLabel = document.getElementById("login-email-label");
  const emailInput = document.getElementById("login-email");

  if (role === "Student") {
    if (emailLabel) emailLabel.textContent = "Student Email / UID";
    if (emailInput) {
      emailInput.placeholder = "student@skillbridge.in";
      emailInput.type = "email";
    }
  } else if (role === "Institute") {
    if (emailLabel) emailLabel.textContent = "Institute Email / Code";
    if (emailInput) {
      emailInput.placeholder = "pune@iti.gov.in";
      emailInput.type = "email";
    }
  } else if (role === "Company") {
    if (emailLabel) emailLabel.textContent = "Company Email / Domain";
    if (emailInput) {
      emailInput.placeholder = "tata@tatamotors.com";
      emailInput.type = "email";
    }
  }

  const autofillDesc = document.getElementById("autofill-desc");
  if (autofillDesc) {
    autofillDesc.textContent = `${demoCredentials[role].name} (${role})`;
  }
};

window.autofillDemoCredentials = function(e) {
  if (e) e.preventDefault();
  const currentRole = adminModeActive ? "Admin" : loginRole;
  const creds = demoCredentials[currentRole];

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  if (emailInput) emailInput.value = creds.email;
  if (passwordInput) passwordInput.value = creds.password;
};

window.toggleAdminMode = function() {
  adminModeActive = !adminModeActive;

  const loginCard = document.getElementById("login-card");
  const adminBanner = document.getElementById("admin-banner");
  const adminLockBtn = document.getElementById("admin-lock-btn");
  const roleTabs = document.getElementById("login-role-tabs");
  const loginCardTitle = document.getElementById("login-card-title");
  const loginCardSubtitle = document.getElementById("login-card-subtitle");
  const emailLabel = document.getElementById("login-email-label");
  const emailInput = document.getElementById("login-email");
  const autofillDesc = document.getElementById("autofill-desc");

  if (adminModeActive) {
    if (loginCard) loginCard.classList.add("admin-active");
    if (adminBanner) adminBanner.classList.add("show");
    if (adminLockBtn) adminLockBtn.classList.add("active");
    if (roleTabs) roleTabs.style.display = "none";
    if (loginCardTitle) loginCardTitle.textContent = "Admin Governance Access";
    if (loginCardSubtitle) loginCardSubtitle.textContent = "Authenticate using secure system administrative keys.";
    if (emailLabel) emailLabel.textContent = "Administrator Security Key";
    if (emailInput) {
      emailInput.placeholder = "admin@skillbridge.in";
      emailInput.type = "email";
    }
    if (autofillDesc) {
      autofillDesc.textContent = "System Admin (Admin)";
    }
  } else {
    if (loginCard) loginCard.classList.remove("admin-active");
    if (adminBanner) adminBanner.classList.remove("show");
    if (adminLockBtn) adminLockBtn.classList.remove("active");
    if (roleTabs) roleTabs.style.display = "flex";
    if (loginCardTitle) loginCardTitle.textContent = "Sign In to Dashboard";
    if (loginCardSubtitle) loginCardSubtitle.textContent = "Select your role to access your verified portal.";
    window.setLoginRole(loginRole);
  }

  const passwordInput = document.getElementById("login-password");
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";
};

window.handleAuthSubmit = function(e) {
  if (e) e.preventDefault();
  if (authMode === "signin") {
    window.handleLoginSubmit(e);
  } else {
    window.handleSignUpSubmit(e);
  }
};

window.handleLoginSubmit = async function(e) {
  if (e) e.preventDefault();

  const email = document.getElementById("login-email")?.value;
  const password = document.getElementById("login-password")?.value;
  const currentRole = adminModeActive ? "Admin" : loginRole;

  if (!email || !password) {
    showToast("Authentication Failed", "Please enter email and password.", "warning");
    return;
  }

  // First check Supabase users table
  const dbUser = await dbFetchUserByEmail(email, currentRole);

  if (dbUser && dbUser.password === password) {
    const db_session = {
      loggedIn: true,
      role: dbUser.role,
      user: dbUser.name,
      id: dbUser.id,
      tier: dbUser.tier || "Freemium"
    };

    db.session = db_session;
    localStorage.setItem("skillbridge_session", JSON.stringify(db.session));
    window.updateNavigationUI();

    const btnIdMap = {
      "Student": "nav-btn-student",
      "Institute": "nav-btn-institute",
      "Company": "nav-btn-company",
      "Admin": "nav-btn-admin"
    };

    showToast("Login Successful", `Welcome back, ${dbUser.name}! Loading portal...`, "success");

    setTimeout(() => {
      const navBtn = document.getElementById(btnIdMap[currentRole]);
      if (navBtn) navBtn.click();
    }, 800);
    return;
  }

  // Fallback to demo credentials
  const creds = demoCredentials[currentRole];
  if (email === creds.email && password === creds.password) {
    const roleTiers = {
      "Student": "Premium",
      "Institute": "Freemium",
      "Company": "Freemium",
      "Admin": "Premium"
    };

    db.session = {
      loggedIn: true,
      role: currentRole,
      user: creds.name,
      id: creds.id,
      tier: roleTiers[currentRole] || "Freemium"
    };

    localStorage.setItem("skillbridge_session", JSON.stringify(db.session));
    window.updateNavigationUI();

    const btnIdMap = {
      "Student": "nav-btn-student",
      "Institute": "nav-btn-institute",
      "Company": "nav-btn-company",
      "Admin": "nav-btn-admin"
    };

    showToast("Login Successful", `Welcome back, ${creds.name}! Loading portal...`, "success");

    setTimeout(() => {
      const navBtn = document.getElementById(btnIdMap[currentRole]);
      if (navBtn) navBtn.click();
    }, 800);

  } else {
    showToast("Authentication Failed", "Invalid security key, email or password.", "warning");
  }
};

window.handleSignUpSubmit = function(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("login-name")?.value;
  const email = document.getElementById("login-email")?.value;
  const password = document.getElementById("login-password")?.value;
  const currentRole = loginRole;

  if (!name || !email || !password) {
    showToast("Registration Error", "Please fill in all general credentials fields.", "warning");
    return;
  }

  let id = "";
  if (currentRole === "Student") {
    const trade = document.getElementById("signup-student-trade").value;
    const inst = document.getElementById("signup-student-inst").value;
    id = `SB-2026-0${db.students.length + 101}`;

    const newStudent = {
      id,
      name,
      trade,
      institute: inst,
      attendance: 92,
      practicalScore: 88,
      theoryScore: 84,
      safetyScore: 92,
      employabilityScore: 88,
      skills: getSkillsForTrade(trade),
      certifications: ["National Trade Certificate (NTC)"],
      status: "Available",
      appliedJobs: []
    };
    db.students.unshift(newStudent);
    dbInsertStudent(newStudent);

    demoCredentials[id] = { email, password, name, id, role: "Student" };
    db.session = {
      loggedIn: true,
      role: "Student",
      user: name,
      id,
      tier: "Premium" // Student dashboard is free
    };

  } else if (currentRole === "Institute") {
    const state = document.getElementById("signup-institute-state").value || "Maharashtra";
    id = `INST-0${db.institutes.length + 101}`;

    const newInst = {
      id,
      name,
      state,
      rating: "A",
      verified: true,
      studentsCount: 150
    };
    db.institutes.unshift(newInst);
    dbInsertInstitute(newInst);

    demoCredentials[id] = { email, password, name, id, role: "Institute" };
    db.session = {
      loggedIn: true,
      role: "Institute",
      user: name,
      id,
      tier: "Freemium" // default to Freemium
    };

  } else if (currentRole === "Company") {
    const industry = document.getElementById("signup-company-industry").value || "Manufacturing";
    const loc = document.getElementById("signup-company-loc").value || "Pune, Maharashtra";
    id = `COMP-0${db.companies.length + 101}`;

    const newComp = {
      id,
      name,
      industry,
      location: loc,
      activeRoles: 1,
      verified: true
    };
    db.companies.unshift(newComp);
    dbInsertCompany(newComp);

    demoCredentials[id] = { email, password, name, id, role: "Company" };
    db.session = {
      loggedIn: true,
      role: "Company",
      user: name,
      id,
      tier: "Freemium" // default to Freemium
    };
  }

  // Save user credentials to Supabase for persistent login
  if (id) {
    dbInsertUser({ id, name, email, password, role: currentRole, tier: db.session.tier });
  }

  localStorage.setItem("skillbridge_session", JSON.stringify(db.session));
  
  // Set auth mode back to signin for consistency on logouts
  window.setAuthMode("signin");
  window.updateNavigationUI();

  const btnIdMap = {
    "Student": "nav-btn-student",
    "Institute": "nav-btn-institute",
    "Company": "nav-btn-company"
  };

  showToast("Account Created", `Welcome, ${name}! Your account has been registered.`, "success");

  setTimeout(() => {
    const navBtn = document.getElementById(btnIdMap[currentRole]);
    if (navBtn) navBtn.click();
  }, 800);
};

window.handleLogout = function(e) {
  if (e) e.preventDefault();

  db.session = { loggedIn: false, role: null, user: null };
  localStorage.removeItem("skillbridge_session");

  const nameInput = document.getElementById("login-name");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";

  if (adminModeActive) {
    window.toggleAdminMode();
  }

  // Reset sub-dashboard tabs to default home
  const instHome = document.getElementById("inst-view-home");
  const instRegistry = document.getElementById("inst-view-registry");
  const instComp = document.getElementById("inst-view-companies");
  const instInbox = document.getElementById("inst-view-inbox");
  if (instHome) instHome.style.display = "block";
  if (instRegistry) instRegistry.style.display = "none";
  if (instComp) instComp.style.display = "none";
  if (instInbox) instInbox.style.display = "none";

  const instLinkHome = document.getElementById("inst-side-link-home");
  const instLinkRegistry = document.getElementById("inst-side-link-registry");
  const instLinkComp = document.getElementById("inst-side-link-companies");
  const instLinkInbox = document.getElementById("inst-side-link-inbox");
  if (instLinkHome) instLinkHome.classList.add("active");
  if (instLinkRegistry) instLinkRegistry.classList.remove("active");
  if (instLinkComp) instLinkComp.classList.remove("active");
  if (instLinkInbox) instLinkInbox.classList.remove("active");
  
  const compCand = document.getElementById("comp-view-candidates");
  const compInst = document.getElementById("comp-view-institutes");
  const compInbox = document.getElementById("comp-view-inbox");
  if (compCand) compCand.style.display = "block";
  if (compInst) compInst.style.display = "none";
  if (compInbox) compInbox.style.display = "none";

  const compLinkCand = document.getElementById("comp-side-link-candidates");
  const compLinkInst = document.getElementById("comp-side-link-institutes");
  const compLinkInbox = document.getElementById("comp-side-link-inbox");
  if (compLinkCand) compLinkCand.classList.add("active");
  if (compLinkInst) compLinkInst.classList.remove("active");
  if (compLinkInbox) compLinkInbox.classList.remove("active");

  const studentDash = document.getElementById("student-view-dashboard");
  const studentPass = document.getElementById("student-view-passport");
  const studentApps = document.getElementById("student-view-applications");
  const studentCerts = document.getElementById("student-view-certs");
  const studentResume = document.getElementById("student-view-resume");
  const studentInbox = document.getElementById("student-view-inbox");
  if (studentDash) studentDash.style.display = "block";
  if (studentPass) studentPass.style.display = "none";
  if (studentApps) studentApps.style.display = "none";
  if (studentCerts) studentCerts.style.display = "none";
  if (studentResume) studentResume.style.display = "none";
  if (studentInbox) studentInbox.style.display = "none";

  const studentLinkDash = document.getElementById("student-side-link-dashboard");
  const studentLinkPass = document.getElementById("student-side-link-passport");
  const studentLinkApps = document.getElementById("student-side-link-applications");
  const studentLinkCerts = document.getElementById("student-side-link-certs");
  const studentLinkResume = document.getElementById("student-side-link-resume");
  const studentLinkInbox = document.getElementById("student-side-link-inbox");
  if (studentLinkDash) studentLinkDash.classList.add("active");
  if (studentLinkPass) studentLinkPass.classList.remove("active");
  if (studentLinkApps) studentLinkApps.classList.remove("active");
  if (studentLinkCerts) studentLinkCerts.classList.remove("active");
  if (studentLinkResume) studentLinkResume.classList.remove("active");
  if (studentLinkInbox) studentLinkInbox.classList.remove("active");

  const adminMonitoring = document.getElementById("admin-view-monitoring");
  const adminApprovals = document.getElementById("admin-view-approvals");
  const adminSync = document.getElementById("admin-view-sync");
  const adminInbox = document.getElementById("admin-view-inbox");
  if (adminMonitoring) adminMonitoring.style.display = "block";
  if (adminApprovals) adminApprovals.style.display = "none";
  if (adminSync) adminSync.style.display = "none";
  if (adminInbox) adminInbox.style.display = "none";

  const adminLinkMonitoring = document.getElementById("admin-side-link-monitoring");
  const adminLinkApprovals = document.getElementById("admin-side-link-approvals");
  const adminLinkSync = document.getElementById("admin-side-link-sync");
  const adminLinkInbox = document.getElementById("admin-side-link-inbox");
  if (adminLinkMonitoring) adminLinkMonitoring.classList.add("active");
  if (adminLinkApprovals) adminLinkApprovals.classList.remove("active");
  if (adminLinkSync) adminLinkSync.classList.remove("active");
  if (adminLinkInbox) adminLinkInbox.classList.remove("active");

  window.updateNavigationUI();

  showToast("Logged Out", "You have been securely signed out of the session.", "info");

  setTimeout(() => {
    const navBtn = document.getElementById("nav-btn-landing");
    if (navBtn) navBtn.click();
  }, 500);
};

// --- Directory Renderers and Access Control Toggles ---
window.renderInstituteDirectory = function() {
  const grid = document.getElementById("comp-institutes-grid");
  if (!grid) return;
  
  grid.innerHTML = "";

  // Retrieve company portal filtering values
  const nameVal = (document.getElementById("filter-inst-name")?.value || "").toLowerCase();
  const stateVal = document.getElementById("filter-inst-state")?.value || "All";
  const districtVal = (document.getElementById("filter-inst-district")?.value || "").toLowerCase();
  const ratingVal = document.getElementById("filter-inst-rating")?.value || "All";

  const filteredInstitutes = db.institutes.filter(inst => {
    const matchesName = inst.name.toLowerCase().includes(nameVal);
    const matchesState = stateVal === "All" || inst.state === stateVal;
    const matchesDistrict = (inst.district || "").toLowerCase().includes(districtVal);
    
    let matchesRating = true;
    if (ratingVal === "A+") matchesRating = inst.rating === "A+";
    else if (ratingVal === "A") matchesRating = inst.rating === "A" || inst.rating === "A+";
    else if (ratingVal === "B+") matchesRating = inst.rating === "B+" || inst.rating === "A" || inst.rating === "A+";
    
    return matchesName && matchesState && matchesDistrict && matchesRating;
  });

  const isPremium = db.session.tier === "Premium";
  const institutesToShow = isPremium ? filteredInstitutes : filteredInstitutes.slice(0, 5);
  
  if (institutesToShow.length === 0) {
    grid.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px; grid-column: span 3;">No ITI Institutes match your search filters.</div>`;
    return;
  }

  institutesToShow.forEach(inst => {
    const card = `
      <div class="card problem-card" style="padding: 20px; border-radius: var(--radius-md); border-color: var(--border-strong); display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="checkbox" class="inst-select-chk" data-inst-id="${inst.id}" onchange="updateSelectedInstitutesCount()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <span class="badge badge-success" style="font-size:10px;">NCVT Rating: ${inst.rating}</span>
          </div>
          <h4 style="font-size: 16px; margin-top: 12px; font-family: var(--font-display);">${inst.name}</h4>
          <p style="font-size:12px; color:var(--text-muted); margin-top: 4px;">District: ${inst.district || 'N/A'} &bull; State: ${inst.state}</p>
          <div style="font-size: 11px; font-weight: 600; color: var(--primary); margin-top: 8px;">TPO Officer: ${inst.tpoName || 'Amit Patel'}</div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border); margin-top: 16px; padding-top:12px; font-size:11px; color:var(--text-light)">
          <span>Students count: <strong>${inst.studentsCount}</strong></span>
          <span style="color: var(--primary); font-weight:600; cursor:pointer;" onclick="showToast('Drive Requested', 'Apprenticeship drive request dispatched to ${inst.name}.')">Request Drive</span>
        </div>
      </div>
    `;
    grid.innerHTML += card;
  });
  
  if (!isPremium) {
    const lockOverlay = `
      <div class="premium-locked-overlay">
        <div class="premium-locked-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h5 style="font-family: var(--font-display); font-size:15px; font-weight:700;">Database Locked (Freemium)</h5>
          <p style="font-size:12px; margin-top: 4px; margin-bottom: 12px;">Upgrade to Premium to view all 8+ registered ITI Institutes.</p>
          <button class="btn btn-primary btn-sm" onclick="upgradeActiveSession(event)">Unlock Directory</button>
        </div>
      </div>
    `;
    grid.innerHTML += lockOverlay;
  }
};

window.renderCompanyDirectory = function() {
  const grid = document.getElementById("inst-companies-grid");
  if (!grid) return;
  
  grid.innerHTML = "";

  // Retrieve corporate directory filter values
  const nameVal = (document.getElementById("filter-comp-name")?.value || "").toLowerCase();
  const sectorVal = document.getElementById("filter-comp-sector")?.value || "All";
  const locationVal = (document.getElementById("filter-comp-location")?.value || "").toLowerCase();
  const verifiedVal = document.getElementById("filter-comp-verified")?.value || "All";

  const filteredCompanies = db.companies.filter(comp => {
    const matchesName = comp.name.toLowerCase().includes(nameVal);
    const matchesSector = sectorVal === "All" || comp.industry === sectorVal;
    const matchesLocation = comp.location.toLowerCase().includes(locationVal);
    
    let matchesVerified = true;
    if (verifiedVal === "Verified") matchesVerified = comp.verified;
    else if (verifiedVal === "Registered") matchesVerified = !comp.verified;
    
    return matchesName && matchesSector && matchesLocation && matchesVerified;
  });

  const isPremium = db.session.tier === "Premium";
  const companiesToShow = isPremium ? filteredCompanies : filteredCompanies.slice(0, 5);
  
  if (companiesToShow.length === 0) {
    grid.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px; grid-column: span 3;">No corporate partners match your search filters.</div>`;
    return;
  }
  
  companiesToShow.forEach(comp => {
    const card = `
      <div class="card problem-card" style="padding: 20px; border-radius: var(--radius-md); border-color: var(--border-strong); display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="checkbox" class="comp-select-chk" data-comp-id="${comp.id}" onchange="updateSelectedCompaniesCount()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            </div>
            <span class="badge ${comp.verified ? 'badge-success' : 'badge-primary'}" style="font-size:10px;">${comp.verified ? 'NCVT Verified' : 'Registered'}</span>
          </div>
          <h4 style="font-size: 16px; margin-top: 12px; font-family: var(--font-display);">${comp.name}</h4>
          <p style="font-size:12px; color:var(--text-muted); margin-top: 4px;">Sector: ${comp.industry} &bull; ${comp.location}</p>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--border); margin-top: 16px; padding-top:12px; font-size:11px; color:var(--text-light)">
          <span>Active roles: <strong>${comp.activeRoles}</strong></span>
          <span style="color: var(--primary); font-weight:600; cursor:pointer;" onclick="showToast('Apprenticeship drive request sent', 'Drive request sent to recruiters at ${comp.name}.')">Request Drive</span>
        </div>
      </div>
    `;
    grid.innerHTML += card;
  });
  
  if (!isPremium) {
    const lockOverlay = `
      <div class="premium-locked-overlay">
        <div class="premium-locked-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <h5 style="font-family: var(--font-display); font-size:15px; font-weight:700;">Database Locked (Freemium)</h5>
          <p style="font-size:12px; margin-top: 4px; margin-bottom: 12px;">Upgrade to Premium to view all 8+ registered partner companies.</p>
          <button class="btn btn-primary btn-sm" onclick="upgradeActiveSession(event)">Unlock Directory</button>
        </div>
      </div>
    `;
    grid.innerHTML += lockOverlay;
  }
};

window.switchInstTab = function(tabName, event) {
  if (event) event.preventDefault();
  
  const homeView = document.getElementById("inst-view-home");
  const registryView = document.getElementById("inst-view-registry");
  const companiesView = document.getElementById("inst-view-companies");
  const inboxView = document.getElementById("inst-view-inbox");
  
  const homeLink = document.getElementById("inst-side-link-home");
  const registryLink = document.getElementById("inst-side-link-registry");
  const companiesLink = document.getElementById("inst-side-link-companies");
  const inboxLink = document.getElementById("inst-side-link-inbox");
  
  if (homeView) homeView.style.display = tabName === "home" ? "block" : "none";
  if (registryView) registryView.style.display = tabName === "registry" ? "block" : "none";
  if (companiesView) companiesView.style.display = tabName === "companies" ? "block" : "none";
  if (inboxView) inboxView.style.display = tabName === "inbox" ? "block" : "none";
  
  if (homeLink) { if (tabName === "home") homeLink.classList.add("active"); else homeLink.classList.remove("active"); }
  if (registryLink) { if (tabName === "registry") registryLink.classList.add("active"); else registryLink.classList.remove("active"); }
  if (companiesLink) { if (tabName === "companies") companiesLink.classList.add("active"); else companiesLink.classList.remove("active"); }
  if (inboxLink) { if (tabName === "inbox") inboxLink.classList.add("active"); else inboxLink.classList.remove("active"); }
  
  if (tabName === "companies") {
    window.renderCompanyDirectory();
  } else if (tabName === "inbox" && window.renderInbox) {
    window.renderInbox("Institute");
  }
};

window.switchCompTab = function(tabName, event) {
  if (event) event.preventDefault();
  
  const candidatesView = document.getElementById("comp-view-candidates");
  const hiringView = document.getElementById("comp-view-hiring");
  const institutesView = document.getElementById("comp-view-institutes");
  const inboxView = document.getElementById("comp-view-inbox");
  
  const candidatesLink = document.getElementById("comp-side-link-candidates");
  const hiringLink = document.getElementById("comp-side-link-hiring");
  const institutesLink = document.getElementById("comp-side-link-institutes");
  const inboxLink = document.getElementById("comp-side-link-inbox");
  
  if (candidatesView) candidatesView.style.display = tabName === "candidates" ? "block" : "none";
  if (hiringView) hiringView.style.display = tabName === "hiring" ? "block" : "none";
  if (institutesView) institutesView.style.display = tabName === "institutes" ? "block" : "none";
  if (inboxView) inboxView.style.display = tabName === "inbox" ? "block" : "none";
  
  if (candidatesLink) { if (tabName === "candidates") candidatesLink.classList.add("active"); else candidatesLink.classList.remove("active"); }
  if (hiringLink) { if (tabName === "hiring") hiringLink.classList.add("active"); else hiringLink.classList.remove("active"); }
  if (institutesLink) { if (tabName === "institutes") institutesLink.classList.add("active"); else institutesLink.classList.remove("active"); }
  if (inboxLink) { if (tabName === "inbox") inboxLink.classList.add("active"); else inboxLink.classList.remove("active"); }
  
  // Update header title
  const headerTitle = document.getElementById("comp-header-title");
  if (headerTitle) {
    const titles = {
      candidates: "Candidate Sourcing & Verification",
      hiring: "Active Hiring & Job Management",
      institutes: "ITI Institutes Directory",
      inbox: "Recruiter Inbox"
    };
    headerTitle.textContent = titles[tabName] || "Company Dashboard";
  }

  if (tabName === "candidates") {
    setTimeout(initCharts, 50);
  } else if (tabName === "hiring") {
    window.renderActiveHiring();
  } else if (tabName === "institutes") {
    window.renderInstituteDirectory();
  } else if (tabName === "inbox" && window.renderInbox) {
    window.renderInbox("Company");
  }
};

window.switchStudentTab = function(tabName, event) {
  if (event) event.preventDefault();

  const tabs = ["dashboard", "passport", "applications", "certs", "resume", "inbox"];
  
  tabs.forEach(tab => {
    const el = document.getElementById(`student-view-${tab}`);
    if (el) {
      if (tab === tabName) {
        el.style.display = "block";
      } else {
        el.style.display = "none";
      }
    }
  });

  const sidebarLinks = {
    "dashboard": document.getElementById("student-side-link-dashboard"),
    "passport": document.getElementById("student-side-link-passport"),
    "applications": document.getElementById("student-side-link-applications"),
    "certs": document.getElementById("student-side-link-certs"),
    "resume": document.getElementById("student-side-link-resume"),
    "inbox": document.getElementById("student-side-link-inbox")
  };

  Object.keys(sidebarLinks).forEach(key => {
    const link = sidebarLinks[key];
    if (link) {
      if (key === tabName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });

  renderStudentPortal();
  if (tabName === "inbox" && window.renderInbox) {
    window.renderInbox("Student");
  }
};

window.upgradeActiveSession = function(event) {
  if (event) event.preventDefault();
  
  showToast("Initiating Premium Upgrade...", "Contacting secure skill registry gateway.", "info");
  
  setTimeout(() => {
    db.session.tier = "Premium";
    localStorage.setItem("skillbridge_session", JSON.stringify(db.session));
    
    window.updateNavigationUI();
    
    const instCompaniesView = document.getElementById("inst-view-companies");
    if (instCompaniesView && instCompaniesView.style.display === "block") {
      window.renderCompanyDirectory();
    }
    
    const compInstitutesView = document.getElementById("comp-view-institutes");
    if (compInstitutesView && compInstitutesView.style.display === "block") {
      window.renderInstituteDirectory();
    }
    
    showToast("Subscription Activated", "Upgraded to PREMIUM. Network access unlocked!", "success");
  }, 1500);
};

// --- WhatsApp Chat Engine & Visibility Controls ---
let activeThreadIds = { Student: null, Institute: null, Company: null, Admin: null };

function getChatThreads(portalRole, userId) {
  const threadsMap = {};

  db.notifications.forEach(notif => {
    let participantId = null;
    let participantName = null;
    let participantRole = null;
    let shouldInclude = false;

    // Student inbox: only messages to/from them
    if (portalRole === "Student") {
      if (notif.senderId === userId) {
        participantId = notif.receiverId;
        participantName = notif.receiverName;
        participantRole = notif.receiverRole;
        shouldInclude = true;
      } else if (notif.receiverId === userId) {
        participantId = notif.senderId;
        participantName = notif.senderName;
        participantRole = notif.senderRole;
        shouldInclude = true;
      }
    } 
    // Institute inbox: messages to/from them
    else if (portalRole === "Institute") {
      if (notif.senderId === userId) {
        participantId = notif.receiverId;
        participantName = notif.receiverName;
        participantRole = notif.receiverRole;
        shouldInclude = true;
      } else if (notif.receiverId === userId) {
        participantId = notif.senderId;
        participantName = notif.senderName;
        participantRole = notif.senderRole;
        shouldInclude = true;
      }
    } 
    // Company inbox: messages to/from them
    else if (portalRole === "Company") {
      if (notif.senderId === userId) {
        participantId = notif.receiverId;
        participantName = notif.receiverName;
        participantRole = notif.receiverRole;
        shouldInclude = true;
      } else if (notif.receiverId === userId) {
        participantId = notif.senderId;
        participantName = notif.senderName;
        participantRole = notif.senderRole;
        shouldInclude = true;
      }
    } 
    // Admin inbox: sees ALL messages in the system grouped by conversation threads
    else if (portalRole === "Admin") {
      const pairKey = [notif.senderId, notif.receiverId].sort().join("<->");
      participantId = pairKey;
      participantName = `${notif.senderName} ⇄ ${notif.receiverName}`;
      participantRole = `${notif.senderRole} ⇄ ${notif.receiverRole}`;
      shouldInclude = true;
    }

    if (shouldInclude && participantId) {
      if (!threadsMap[participantId]) {
        threadsMap[participantId] = {
          id: participantId,
          name: participantName,
          role: participantRole,
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }
      threadsMap[participantId].messages.push(notif);
      if (!notif.read && notif.receiverId === userId) {
        threadsMap[participantId].unreadCount++;
      }
    }
  });

  const threads = Object.values(threadsMap);
  threads.forEach(t => {
    t.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    t.lastMessage = t.messages[t.messages.length - 1];
  });

  // Sort threads by the latest message timestamp
  threads.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  return threads;
}

window.renderInbox = function(portalRole) {
  renderChatThreadsList(portalRole);
  const activeThread = activeThreadIds[portalRole];
  renderChatMessages(portalRole, activeThread);
};

function renderChatThreadsList(portalRole) {
  const container = document.getElementById(`${portalRole.toLowerCase()}-inbox-thread-list`);
  if (!container) return;

  const userId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
  const searchInput = document.querySelector(`#${portalRole.toLowerCase()}-view-inbox .whatsapp-search input`);
  const searchVal = (searchInput?.value || "").toLowerCase();

  const threads = getChatThreads(portalRole, userId);
  const filteredThreads = threads.filter(t => t.name.toLowerCase().includes(searchVal) || (t.lastMessage && t.lastMessage.message.toLowerCase().includes(searchVal)));

  if (filteredThreads.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px; font-size:12px;">No active conversations found.</div>`;
    return;
  }

  container.innerHTML = "";
  filteredThreads.forEach(thread => {
    const isActive = activeThreadIds[portalRole] === thread.id;
    const date = new Date(thread.lastMessage.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const item = `
      <div class="whatsapp-thread-item ${isActive ? 'active' : ''}" onclick="selectChatThread('${portalRole}', '${thread.id}')">
        <div class="whatsapp-thread-avatar">${thread.name.charAt(0)}</div>
        <div class="whatsapp-thread-info">
          <div class="whatsapp-thread-header">
            <span class="whatsapp-thread-name">${thread.name}</span>
            <span class="whatsapp-thread-time">${timeString}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span class="whatsapp-thread-msg">${thread.lastMessage.message}</span>
            ${thread.unreadCount > 0 ? `<span class="whatsapp-badge">${thread.unreadCount}</span>` : ''}
          </div>
        </div>
      </div>
    `;
    container.innerHTML += item;
  });
}

function renderChatMessages(portalRole, threadId) {
  const container = document.getElementById(`${portalRole.toLowerCase()}-inbox-messages-container`);
  const header = document.getElementById(`${portalRole.toLowerCase()}-inbox-chat-header`);
  const inputBar = document.getElementById(`${portalRole.toLowerCase()}-inbox-chat-input-bar`);

  if (!container || !header || !inputBar) return;

  const userId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
  const threads = getChatThreads(portalRole, userId);
  const activeThread = threads.find(t => t.id === threadId);

  if (!activeThread) {
    header.textContent = portalRole === "Admin" ? "Select a conversation to monitor correspondence" : "Select a conversation to start messaging";
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color: var(--text-muted); text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.3;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p style="font-size:13px;">${portalRole === "Admin" ? 'Admin has absolute audit rights to monitor all student, company, and institute conversations.' : 'Select a message thread on the left to read correspondence.'}</p>
      </div>
    `;
    inputBar.style.display = "none";
    return;
  }

  header.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <div class="whatsapp-thread-avatar" style="width:32px; height:32px; font-size:11px; background:var(--accent);">
        ${activeThread.name.charAt(0)}
      </div>
      <div>
        <strong style="font-size:13px; display:block; color:var(--text-main);">${activeThread.name}</strong>
        <span style="font-size:10px; color:var(--text-light); text-transform:uppercase;">${activeThread.role}</span>
      </div>
    </div>
  `;

  container.innerHTML = "";
  activeThread.messages.forEach(msg => {
    let isSent = false;
    if (portalRole === "Admin") {
      isSent = msg.senderRole === "Admin";
    } else {
      isSent = msg.senderId === userId;
    }

    const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bubble = `
      <div class="whatsapp-bubble ${isSent ? 'sent' : 'received'}">
        <div style="font-size: 9px; opacity: 0.7; font-weight: 700; margin-bottom: 4px;">
          ${msg.senderName} (${msg.senderRole})
        </div>
        <div>${msg.message}</div>
        <span class="whatsapp-bubble-time">${timeString} ${isSent ? '✓✓' : ''}</span>
      </div>
    `;
    container.innerHTML += bubble;
  });

  container.scrollTop = container.scrollHeight;
  inputBar.style.display = "flex";
}

window.selectChatThread = function(portalRole, threadId) {
  activeThreadIds[portalRole] = threadId;
  const userId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));

  db.notifications.forEach(notif => {
    if (portalRole === "Admin") {
      const pairKey = [notif.senderId, notif.receiverId].sort().join("<->");
      if (pairKey === threadId) {
        notif.read = true;
      }
    } else {
      if (notif.receiverId === userId && notif.senderId === threadId) {
        notif.read = true;
      }
    }
  });

  renderChatMessages(portalRole, threadId);
  renderChatThreadsList(portalRole);
  updateUnreadBadges();
};

window.sendInboxMessage = function(portalRole) {
  const textarea = document.getElementById(`${portalRole.toLowerCase()}-inbox-message-textarea`);
  if (!textarea) return;

  const messageText = textarea.value.trim();
  if (!messageText) return;

  const senderName = db.session.user || (portalRole === "Student" ? "Rahul Verma" : (portalRole === "Institute" ? "Government ITI Pune ERP" : (portalRole === "Company" ? "Tata Motors Recruiter" : "System Admin")));
  const senderId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
  const senderRole = db.session.role || portalRole;

  const activeThreadId = activeThreadIds[portalRole];
  if (!activeThreadId) return;

  let receiverId = "";
  let receiverName = "";
  let receiverRole = "";

  if (portalRole === "Admin") {
    const lastMsg = db.notifications.filter(notif => {
      const pairKey = [notif.senderId, notif.receiverId].sort().join("<->");
      return pairKey === activeThreadId;
    }).slice(-1)[0];

    if (lastMsg) {
      // reply to the sender of the last message in pair
      receiverId = lastMsg.senderId;
      receiverName = lastMsg.senderName;
      receiverRole = lastMsg.senderRole;
    } else {
      const parts = activeThreadId.split("<->");
      receiverId = parts[0];
      receiverName = "User";
      receiverRole = "User";
    }
  } else {
    // Reply to the participant
    const lastMsg = db.notifications.find(n => 
      (n.senderId === activeThreadId && n.receiverId === senderId) ||
      (n.receiverId === activeThreadId && n.senderId === senderId)
    );

    if (lastMsg) {
      if (lastMsg.senderId === activeThreadId) {
        receiverId = lastMsg.senderId;
        receiverName = lastMsg.senderName;
        receiverRole = lastMsg.senderRole;
      } else {
        receiverId = lastMsg.receiverId;
        receiverName = lastMsg.receiverName;
        receiverRole = lastMsg.receiverRole;
      }
    } else {
      receiverId = activeThreadId;
      if (activeThreadId.startsWith("SB-2026")) {
        const student = db.students.find(s => s.id === activeThreadId);
        receiverName = student ? student.name : "Student";
        receiverRole = "Student";
      } else if (activeThreadId.startsWith("INST")) {
        const inst = db.institutes.find(i => i.id === activeThreadId);
        receiverName = inst ? inst.name : "Institute";
        receiverRole = "Institute";
      } else if (activeThreadId.startsWith("COMP") || activeThreadId.startsWith("SB-COMP")) {
        const comp = db.companies.find(c => c.id === activeThreadId);
        receiverName = comp ? comp.name : "Company";
        receiverRole = "Company";
      } else {
        receiverName = "System Admin";
        receiverRole = "Admin";
      }
    }
  }

  const newNotif = {
    id: `MSG-0${db.notifications.length + 100}`,
    senderId,
    senderName,
    senderRole,
    receiverId,
    receiverName,
    receiverRole,
    message: messageText,
    timestamp: new Date().toISOString(),
    read: false
  };

  db.notifications.push(newNotif);
  textarea.value = "";

  renderChatMessages(portalRole, activeThreadId);
  renderChatThreadsList(portalRole);
  updateUnreadBadges();
};

window.filterChatThreads = function(portalRole, query) {
  renderChatThreadsList(portalRole);
};

function updateUnreadBadges() {
  const roles = ["Student", "Institute", "Company", "Admin"];
  
  roles.forEach(role => {
    const roleUserId = db.session.id || (role === "Student" ? "SB-2026-081" : (role === "Institute" ? "INST-001" : (role === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
    
    let unreadCount = 0;
    if (role === "Admin") {
      unreadCount = db.notifications.filter(n => !n.read && n.receiverRole === "Admin").length;
    } else {
      unreadCount = db.notifications.filter(n => !n.read && n.receiverId === roleUserId).length;
    }

    const badges = document.querySelectorAll(`#${role.toLowerCase()}-side-link-inbox .inbox-unread-count`);
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    });
  });
}

// --- Admin Panel Tab Switching ---
window.switchAdminTab = function(tabName, event) {
  if (event) event.preventDefault();
  
  const monitoringView = document.getElementById("admin-view-monitoring");
  const approvalsView = document.getElementById("admin-view-approvals");
  const syncView = document.getElementById("admin-view-sync");
  const inboxView = document.getElementById("admin-view-inbox");
  
  const monitoringLink = document.getElementById("admin-side-link-monitoring");
  const approvalsLink = document.getElementById("admin-side-link-approvals");
  const syncLink = document.getElementById("admin-side-link-sync");
  const inboxLink = document.getElementById("admin-side-link-inbox");
  
  if (monitoringView) monitoringView.style.display = tabName === "monitoring" ? "block" : "none";
  if (approvalsView) approvalsView.style.display = tabName === "approvals" ? "block" : "none";
  if (syncView) syncView.style.display = tabName === "sync" ? "block" : "none";
  if (inboxView) inboxView.style.display = tabName === "inbox" ? "block" : "none";
  
  if (monitoringLink) { if (tabName === "monitoring") monitoringLink.classList.add("active"); else monitoringLink.classList.remove("active"); }
  if (approvalsLink) { if (tabName === "approvals") approvalsLink.classList.add("active"); else approvalsLink.classList.remove("active"); }
  if (syncLink) { if (tabName === "sync") syncLink.classList.add("active"); else syncLink.classList.remove("active"); }
  if (inboxLink) { if (tabName === "inbox") inboxLink.classList.add("active"); else inboxLink.classList.remove("active"); }
  
  if (tabName === "inbox" && window.renderInbox) {
    window.renderInbox("Admin");
  }
};

// --- Sourcing Checklist & Broadcast Alerts ---
window.toggleSelectAllInstitutes = function(master) {
  const chks = document.querySelectorAll(".inst-select-chk");
  chks.forEach(chk => chk.checked = master.checked);
  window.updateSelectedInstitutesCount();
};

window.updateSelectedInstitutesCount = function() {
  const checkedCount = document.querySelectorAll(".inst-select-chk:checked").length;
  const counter = document.getElementById("selected-institutes-counter");
  if (counter) {
    counter.textContent = `${checkedCount} Institutes Selected`;
  }
};

window.broadcastNotificationToInstitutes = function() {
  const messageText = document.getElementById("broadcast-message-text")?.value || "";
  if (!messageText.trim()) {
    showToast("Broadcast Error", "Please type a message to broadcast.", "warning");
    return;
  }

  const checkboxes = document.querySelectorAll(".inst-select-chk:checked");
  if (checkboxes.length === 0) {
    showToast("Broadcast Error", "Please select at least one institute checkbox.", "warning");
    return;
  }

  const sender = db.session.user || "Tata Motors Recruiter";
  const senderId = db.session.id || "SB-COMP-01";
  const senderRole = db.session.role || "Company";

  checkboxes.forEach(chk => {
    const instId = chk.getAttribute("data-inst-id");
    const inst = db.institutes.find(i => i.id === instId);
    if (!inst) return;

    const newNotif = {
      id: `MSG-0${db.notifications.length + 100}`,
      senderId,
      senderName: sender,
      senderRole,
      receiverId: inst.id,
      receiverName: inst.name,
      receiverRole: "Institute",
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    db.notifications.push(newNotif);
  });

  const textarea = document.getElementById("broadcast-message-text");
  if (textarea) textarea.value = "";

  document.querySelectorAll(".inst-select-chk").forEach(chk => chk.checked = false);
  const selectAll = document.getElementById("inst-select-all-chk");
  if (selectAll) selectAll.checked = false;
  
  updateSelectedInstitutesCount();
  updateUnreadBadges();
  
  showToast("Broadcast Sent", `Job alert dispatch complete to ${checkboxes.length} TPO cells.`, "success");
};

// --- Corporate Sourcing Checklist & Broadcast Alerts for Institute ERP ---
window.toggleSelectAllCompanies = function(master) {
  const chks = document.querySelectorAll(".comp-select-chk");
  chks.forEach(chk => chk.checked = master.checked);
  window.updateSelectedCompaniesCount();
};

window.updateSelectedCompaniesCount = function() {
  const checkedCount = document.querySelectorAll(".comp-select-chk:checked").length;
  const counter = document.getElementById("selected-companies-counter");
  if (counter) {
    counter.textContent = `${checkedCount} Companies Selected`;
  }
};

window.broadcastInvitationToCompanies = function() {
  const messageText = document.getElementById("inst-broadcast-message-text")?.value || "";
  if (!messageText.trim()) {
    showToast("Broadcast Error", "Please type a message to broadcast.", "warning");
    return;
  }

  const checkboxes = document.querySelectorAll(".comp-select-chk:checked");
  if (checkboxes.length === 0) {
    showToast("Broadcast Error", "Please select at least one company checkbox.", "warning");
    return;
  }

  const sender = db.session.user || "Government ITI Pune ERP";
  const senderId = db.session.id || "INST-001";
  const senderRole = db.session.role || "Institute";

  checkboxes.forEach(chk => {
    const compId = chk.getAttribute("data-comp-id");
    const comp = db.companies.find(c => c.id === compId);
    if (!comp) return;

    let receiverId = compId;
    if (compId === "COMP-001") receiverId = "SB-COMP-01"; // Tata Motors Recruiter

    const newNotif = {
      id: `MSG-0${db.notifications.length + 100}`,
      senderId,
      senderName: sender,
      senderRole,
      receiverId,
      receiverName: `${comp.name} Recruiter`,
      receiverRole: "Company",
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    db.notifications.push(newNotif);
  });

  const textarea = document.getElementById("inst-broadcast-message-text");
  if (textarea) textarea.value = "";

  document.querySelectorAll(".comp-select-chk").forEach(chk => chk.checked = false);
  const selectAll = document.getElementById("comp-select-all-chk");
  if (selectAll) selectAll.checked = false;
  
  updateSelectedCompaniesCount();
  updateUnreadBadges();
  
  showToast("Broadcast Sent", `Drive invitation successfully sent to ${checkboxes.length} corporate TPO contacts.`, "success");
};


// Sync badges on load
setTimeout(updateUnreadBadges, 200);

window.updateLiveResume = function() {
  const student = db.students.find(s => s.id === (db.session.id || "SB-2026-081")) || db.students[0];
  if (!student) return;

  // Select inputs
  const inputName = document.getElementById("resume-input-name");
  const inputTitle = document.getElementById("resume-input-title");
  const inputEmail = document.getElementById("resume-input-email");
  const inputPhone = document.getElementById("resume-input-phone");
  const inputLink = document.getElementById("resume-input-link");
  const inputAddress = document.getElementById("resume-input-address");
  const inputSummary = document.getElementById("resume-input-summary");
  const inputProjTitle = document.getElementById("resume-input-proj-title");
  const inputProjRole = document.getElementById("resume-input-proj-role");
  const inputProjDesc = document.getElementById("resume-input-proj-desc");

  // On first load or on user switch, populate the inputs with verified student DB stats
  if (inputName && (!inputName.dataset.initialized || inputName.dataset.userId !== student.id)) {
    inputName.value = student.name;
    inputName.dataset.initialized = "true";
    inputName.dataset.userId = student.id;

    if (inputTitle) inputTitle.value = student.trade + " Specialist";
    if (inputEmail) inputEmail.value = student.id.toLowerCase() + "@skillbridge.in";
    if (inputPhone) inputPhone.value = "+91 98765 4" + student.id.slice(-3);
    if (inputLink) inputLink.value = "skillbridge.in/passport/" + student.name.toLowerCase().replace(/\s+/g, '-');
    if (inputAddress) inputAddress.value = student.institute.includes("Pune") ? "Pune, Maharashtra" : "Nashik, Maharashtra";
    
    // Summary
    if (inputSummary) {
      inputSummary.value = `Detail-oriented and safety-conscious ${student.trade} certified by NCVT with hands-on training in ${student.skills.slice(0,3).join(', ')}. Proven capability to manage workshop equipment and comply with safety procedures.`;
    }

    // Projects based on trade
    if (student.trade === "Electrician") {
      if (inputProjTitle) inputProjTitle.value = "Solar PV Inverter Setup";
      if (inputProjRole) inputProjRole.value = "Workshop Lead (Govt ITI)";
      if (inputProjDesc) inputProjDesc.value = "Led a team of 4 to design and install a 5KW off-grid solar panel setup in the institute workshop, troubleshooting inverter connections and wiring diagrams.";
    } else if (student.trade === "CNC Operator") {
      if (inputProjTitle) inputProjTitle.value = "Precision G-Code Part Fabrication";
      if (inputProjRole) inputProjRole.value = "Operator (Govt ITI)";
      if (inputProjDesc) inputProjDesc.value = "Programmed and operated a Siemens 3-axis CNC milling machine to fabricate custom automotive components with tolerances within 0.02mm.";
    } else {
      if (inputProjTitle) inputProjTitle.value = "Industrial Workshop Assembly";
      if (inputProjRole) inputProjRole.value = "Lead Fitter/Welder";
      if (inputProjDesc) inputProjDesc.value = "Assembled and welded structural steel frames, performing safety inspections and reading blueprints to ensure compliance with standards.";
    }
  }

  // Update preview fields
  const prevName = document.getElementById("resume-preview-name");
  const prevTitle = document.getElementById("resume-preview-title");
  const prevEmail = document.getElementById("resume-preview-email");
  const prevPhone = document.getElementById("resume-preview-phone");
  const prevLink = document.getElementById("resume-preview-link");
  const prevAddress = document.getElementById("resume-preview-address");
  const prevSummary = document.getElementById("resume-preview-summary");
  const prevProjTitle = document.getElementById("resume-preview-proj-title");
  const prevProjRole = document.getElementById("resume-preview-proj-role");
  const prevProjDesc = document.getElementById("resume-preview-proj-desc");

  if (prevName && inputName) prevName.textContent = inputName.value;
  if (prevTitle && inputTitle) prevTitle.textContent = inputTitle.value;
  if (prevEmail && inputEmail) prevEmail.textContent = inputEmail.value;
  if (prevPhone && inputPhone) prevPhone.textContent = inputPhone.value;
  if (prevLink && inputLink) prevLink.textContent = inputLink.value;
  if (prevAddress && inputAddress) prevAddress.textContent = inputAddress.value;
  if (prevSummary && inputSummary) prevSummary.textContent = inputSummary.value;
  if (prevProjTitle && inputProjTitle) prevProjTitle.textContent = inputProjTitle.value;
  if (prevProjRole && inputProjRole) prevProjRole.textContent = inputProjRole.value;
  if (prevProjDesc && inputProjDesc) prevProjDesc.textContent = inputProjDesc.value;

  // Database metrics (verified stats cannot be edited)
  const prevInst = document.getElementById("resume-preview-inst");
  const prevTrade = document.getElementById("resume-preview-trade");
  const prevAttendance = document.getElementById("resume-preview-attendance");
  const prevPractical = document.getElementById("resume-preview-practical");
  const prevTheory = document.getElementById("resume-preview-theory");
  const prevSafety = document.getElementById("resume-preview-safety");

  if (prevInst) prevInst.textContent = student.institute;
  if (prevTrade) prevTrade.textContent = student.trade;
  if (prevAttendance) prevAttendance.textContent = student.attendance + "%";
  if (prevPractical) prevPractical.textContent = student.practicalScore + "/100";
  if (prevTheory) prevTheory.textContent = student.theoryScore + "/100";
  if (prevSafety) prevSafety.textContent = student.safetyScore + "/100";

  // Verified Skills list
  const prevSkills = document.getElementById("resume-preview-skills");
  if (prevSkills) {
    prevSkills.innerHTML = student.skills.map(s => `
      <span class="skill-badge">${s}</span>
    `).join('');
  }
};

window.downloadResumePDF = function() {
  const resumeEl = document.getElementById("resume-preview-document");
  if (!resumeEl) return;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    showToast("Print blocked", "Please allow popups to download your resume PDF.", "warning");
    return;
  }

  // Get current styles of document
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        return `<link rel="stylesheet" href="${styleSheet.href}">`;
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SkillBridge NCVT Verified Resume - ${document.getElementById("resume-input-name")?.value || "Student"}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: #FFFFFF !important;
            color: #1e293b !important;
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          ${styles}
          .resume-preview-document-inner {
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        <div class="resume-preview-document-inner">
          ${resumeEl.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

// --- ERP Student Registry Manual Registration & Bulk Imports/Exports ---
window.registerStudentFromRegistryTab = function(e) {
  if (e) e.preventDefault();
  const name = document.getElementById("reg-student-name")?.value;
  const trade = document.getElementById("reg-student-trade")?.value || "Electrician";
  const attendance = parseInt(document.getElementById("reg-student-attendance")?.value || "90");

  if (!name) return;

  const practicalScore = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
  const theoryScore = Math.floor(Math.random() * (100 - 75 + 1)) + 75;
  const safetyScore = Math.floor(Math.random() * (100 - 90 + 1)) + 90;
  const employabilityScore = Math.round((practicalScore * 0.5) + (theoryScore * 0.3) + (safetyScore * 0.2));

  const skills = getSkillsForTrade(trade);

  const id = `SB-2026-0${db.students.length + 100}`;
  const newStudent = {
    id,
    name,
    trade,
    institute: "Government ITI Pune",
    attendance,
    practicalScore,
    theoryScore,
    safetyScore,
    employabilityScore,
    skills,
    certifications: [`NCVT ${trade} Trade Certificate`],
    status: "Available",
    appliedJobs: []
  };

  db.students.unshift(newStudent);
  dbInsertStudent(newStudent);
  db.stats.totalStudents++;

  // Clear form inputs
  const nameInput = document.getElementById("reg-student-name");
  const attendanceInput = document.getElementById("reg-student-attendance");
  if (nameInput) nameInput.value = "";
  if (attendanceInput) attendanceInput.value = "";

  renderAllViews();
  showToast("Student Registered", `${name} successfully added to the registry.`, "success");
};

window.handleBulkImportFile = function(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  
  const progressContainer = document.getElementById("bulk-import-progress-container");
  const progressStatus = document.getElementById("bulk-import-progress-status");
  const progressPercentage = document.getElementById("bulk-import-progress-percentage");
  const progressBar = document.getElementById("bulk-import-progress-bar");
  
  if (!progressContainer || !progressStatus || !progressPercentage || !progressBar) return;
  
  // Show progress interface
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  progressPercentage.textContent = "0%";
  progressStatus.textContent = `Uploading and parsing ${file.name}...`;
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    progressPercentage.textContent = `${progress}%`;
    
    if (progress === 30) {
      progressStatus.textContent = `Extracting student records...`;
    } else if (progress === 60) {
      progressStatus.textContent = `Validating trade certificates...`;
    } else if (progress === 80) {
      progressStatus.textContent = `Injecting into NCVT Ledger...`;
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      
      const mockImported = [
        { name: "Aarav Sharma", trade: "Electrician", attendance: 95 },
        { name: "Ananya Shinde", trade: "Solar Technician", attendance: 92 },
        { name: "Kabir Mehta", trade: "Fitter", attendance: 88 },
        { name: "Diya Deshmukh", trade: "CNC Operator", attendance: 97 },
        { name: "Rohan Kulkarni", trade: "Welder", attendance: 91 },
        { name: "Prachi Sawant", trade: "COPA", attendance: 94 },
        { name: "Yash Jadhav", trade: "EV Technician", attendance: 96 },
        { name: "Simran Kaur", trade: "Sewing Technology", attendance: 90 },
        { name: "Nikhil Rane", trade: "IoT Technician", attendance: 93 },
        { name: "Deepa Pawar", trade: "Food Production", attendance: 89 }
      ];
      
      mockImported.forEach((s, idx) => {
        const id = `SB-2026-0${db.students.length + idx + 200}`;
        
        const practicalScore = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
        const theoryScore = Math.floor(Math.random() * (100 - 75 + 1)) + 75;
        const safetyScore = Math.floor(Math.random() * (100 - 90 + 1)) + 90;
        const employabilityScore = Math.round((practicalScore * 0.5) + (theoryScore * 0.3) + (safetyScore * 0.2));
        
        const skills = getSkillsForTrade(s.trade);

        const newStudent = {
          id,
          name: s.name,
          trade: s.trade,
          institute: "Government ITI Pune",
          attendance: s.attendance,
          practicalScore,
          theoryScore,
          safetyScore,
          employabilityScore,
          skills,
          certifications: [`NCVT ${s.trade} Trade Certificate`],
          status: "Available",
          appliedJobs: []
        };
        
        db.students.unshift(newStudent);
        dbInsertStudent(newStudent);
        db.stats.totalStudents++;
      });
      
      document.getElementById("bulk-student-file-input").value = "";
      renderAllViews();
      
      setTimeout(() => {
        progressContainer.style.display = "none";
        showToast("Bulk Import Success", `Parsed and registered ${mockImported.length} students from ${file.name} successfully.`, "success");
      }, 800);
    }
  }, 150);
};

window.downloadBulkImportTemplate = function(type) {
  const headers = "Name,Trade,Attendance\nAarav Sharma,Electrician,95\nAnanya Shinde,Solar Technician,92\nKabir Mehta,Fitter,88";
  const blob = new Blob([headers], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `skillbridge_bulk_student_template.${type === 'xlsx' ? 'xlsx' : 'csv'}`);
  a.click();
  showToast("Template Downloaded", `Download of student roll template completed.`, "success");
};

window.exportStudentRegistryExcel = function() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Student ID,Full Name,Trade Specialty,Attendance (%),Employability Index,Status\n";
  
  db.students.forEach(student => {
    const row = `${student.id},"${student.name}",${student.trade},${student.attendance}%,${student.employabilityScore},${student.status}`;
    csvContent += row + "\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement('a');
  a.setAttribute('href', encodedUri);
  a.setAttribute('download', "skillbridge_student_registry.csv");
  a.click();
  
  showToast("Export Complete", "Current student roll downloaded in CSV format.", "success");
};

window.exportStudentRegistryPDF = function() {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    showToast("Print blocked", "Please allow popups to download registry PDF.", "warning");
    return;
  }
  
  let rows = "";
  db.students.forEach(student => {
    rows += `
      <tr>
        <td>${student.id}</td>
        <td><strong>${student.name}</strong></td>
        <td>${student.trade}</td>
        <td>${student.attendance}%</td>
        <td>${student.employabilityScore}</td>
        <td>${student.status}</td>
      </tr>
    `;
  });
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SkillBridge ITI Student Registry Ledger</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            padding: 24px;
            color: #1e293b;
          }
          .header {
            border-bottom: 2px solid #1062FE;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          h2 {
            margin: 0;
            color: #0f172a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #e2e8f0;
            text-align: left;
          }
          th {
            background: #f1f5f9;
            font-weight: 700;
          }
          .footer {
            margin-top: 30px;
            font-size: 10px;
            color: #64748b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>SkillBridge National Registry Ledger</h2>
            <span style="font-size:11px; color:#64748b;">Government ITI Pune ERP Database Export</span>
          </div>
          <span style="font-size: 11px; font-weight: bold; color: #1062FE;">VERIFIED SECURE SHIELD</span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Trade Specialty</th>
              <th>Attendance</th>
              <th>Employability Index</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          Generated on ${new Date().toLocaleDateString()} &bull; NCVT Registry System Integration &bull; Page 1 of 1
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

// ─── ACTIVE HIRING TAB FUNCTIONS ─────────────────────────────────────────────

window.renderActiveHiring = function() {
  const tableBody = document.getElementById("hiring-jobs-table-body");
  if (!tableBody) return;

  const statusFilter = document.getElementById("hiring-filter-status")?.value || "All";
  const typeFilter = document.getElementById("hiring-filter-type")?.value || "All";

  // Filter jobs
  let filteredJobs = db.jobs.filter(job => {
    const jobStatus = job.hiringStatus || "Active";
    const matchesStatus = statusFilter === "All" || jobStatus === statusFilter;
    const matchesType = typeFilter === "All" || job.type === typeFilter;
    return matchesStatus && matchesType;
  });

  // Update summary stats
  const activeJobs = db.jobs.filter(j => (j.hiringStatus || "Active") === "Active");
  const totalApplicants = db.jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);
  const hiredCount = db.applications.filter(a => a.status === "Offered").length;
  const uniqueTrades = [...new Set(db.jobs.map(j => j.trade))].length;

  const statActive = document.getElementById("hiring-stat-active");
  const statApplicants = document.getElementById("hiring-stat-applicants");
  const statHired = document.getElementById("hiring-stat-hired");
  const statTrades = document.getElementById("hiring-stat-trades");

  if (statActive) statActive.textContent = activeJobs.length;
  if (statApplicants) statApplicants.textContent = totalApplicants;
  if (statHired) statHired.textContent = hiredCount;
  if (statTrades) statTrades.textContent = uniqueTrades;

  // Render table
  tableBody.innerHTML = "";

  if (filteredJobs.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">No job listings match your filters.</td></tr>`;
    return;
  }

  filteredJobs.forEach(job => {
    const status = job.hiringStatus || "Active";
    let statusBadge = "badge-success";
    if (status === "Paused") statusBadge = "badge-warning";
    if (status === "Closed") statusBadge = "badge-secondary";

    let typeBadge = "badge-primary";
    if (job.type === "Placement") typeBadge = "badge-accent";
    if (job.type === "Internship") typeBadge = "badge-info";
    if (job.type === "Contract") typeBadge = "badge-warning";

    const tr = `
      <tr>
        <td>
          <div style="font-weight: 600; font-size: 13px;">${job.title}</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${job.id} • ${job.company}</div>
        </td>
        <td><span style="font-size: 12px;">${job.trade}</span></td>
        <td><span class="badge ${typeBadge}" style="font-size: 9px; padding: 2px 8px;">${job.type}</span></td>
        <td style="font-size: 12px;">${job.location}</td>
        <td style="font-size: 12px; font-weight: 600;">${job.salary}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px; font-weight: 700; color: var(--primary);">${job.applicantsCount || 0}</span>
            <span style="font-size: 10px; color: var(--text-muted);">applied</span>
          </div>
        </td>
        <td><span class="badge ${statusBadge}" style="font-size: 9px; padding: 2px 8px;">${status}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${status === "Active" 
              ? `<button class="btn btn-secondary btn-sm" onclick="toggleJobStatus('${job.id}', 'Paused')" style="font-size: 10px; padding: 4px 8px;">Pause</button>` 
              : status === "Paused" 
                ? `<button class="btn btn-primary btn-sm" onclick="toggleJobStatus('${job.id}', 'Active')" style="font-size: 10px; padding: 4px 8px;">Resume</button>` 
                : ``}
            ${status !== "Closed" 
              ? `<button class="btn btn-sm" onclick="toggleJobStatus('${job.id}', 'Closed')" style="font-size: 10px; padding: 4px 8px; background: hsla(0, 70%, 55%, 0.1); color: hsl(0, 70%, 55%); border: 1px solid hsla(0, 70%, 55%, 0.2);">Close</button>` 
              : `<span style="font-size: 10px; color: var(--text-muted);">Archived</span>`}
          </div>
        </td>
      </tr>
    `;
    tableBody.innerHTML += tr;
  });

  // Render hiring analytics chart
  initHiringChart();
};

window.postNewJobOpening = function(e) {
  if (e) e.preventDefault();

  const title = document.getElementById("new-job-title")?.value;
  const trade = document.getElementById("new-job-trade")?.value || "Electrician";
  const location = document.getElementById("new-job-location")?.value;
  const salary = document.getElementById("new-job-salary")?.value;
  const type = document.getElementById("new-job-type")?.value || "Apprenticeship";
  const duration = document.getElementById("new-job-duration")?.value || "12 Months";
  const skillsRaw = document.getElementById("new-job-skills")?.value || "";
  const description = document.getElementById("new-job-description")?.value || "";

  if (!title || !location || !salary) {
    showToast("Missing Fields", "Please fill in Job Title, Location, and Salary.", "warning");
    return;
  }

  const skillsRequired = skillsRaw.split(",").map(s => s.trim()).filter(s => s.length > 0);
  if (skillsRequired.length === 0) {
    // Auto-fill from trade skills
    const tradeSkills = getSkillsForTrade(trade);
    skillsRequired.push(tradeSkills[0], tradeSkills[1]);
  }

  const companyName = db.session?.user || "Tata Motors";
  const jobId = `JOB-${String(db.jobs.length + 1).padStart(3, '0')}`;

  const newJob = {
    id: jobId,
    title,
    company: companyName,
    trade,
    location,
    salary,
    duration,
    type,
    skillsRequired,
    description,
    applicantsCount: 0,
    hiringStatus: "Active",
    postedOn: new Date().toISOString().slice(0, 10)
  };

  db.jobs.unshift(newJob);
  db.stats.apprenticeships++;

  // Reset form
  const form = document.getElementById("post-new-job-form");
  if (form) form.reset();

  // Re-render
  window.renderActiveHiring();
  renderAllViews();

  showToast("Job Published!", `"${title}" is now live on the SkillBridge marketplace.`, "success");
};

window.toggleJobStatus = function(jobId, newStatus) {
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return;

  job.hiringStatus = newStatus;
  window.renderActiveHiring();

  const statusMsgs = {
    "Active": `"${job.title}" has been resumed and is visible to candidates.`,
    "Paused": `"${job.title}" is paused. Candidates will not see this listing.`,
    "Closed": `"${job.title}" has been archived and closed permanently.`
  };

  const toastType = newStatus === "Active" ? "success" : newStatus === "Paused" ? "warning" : "info";
  showToast(`Job ${newStatus}`, statusMsgs[newStatus], toastType);
};

let hiringChartInstance = null;

function initHiringChart() {
  const canvas = document.getElementById("chart-hiring-analytics");
  if (!canvas) return;

  // Aggregate applicants by trade
  const tradeApplicants = {};
  db.jobs.forEach(job => {
    if (!tradeApplicants[job.trade]) tradeApplicants[job.trade] = 0;
    tradeApplicants[job.trade] += (job.applicantsCount || 0);
  });

  const labels = Object.keys(tradeApplicants);
  const data = Object.values(tradeApplicants);

  const colors = [
    'hsla(220, 80%, 55%, 0.8)',
    'hsla(20, 90%, 52%, 0.8)',
    'hsla(140, 70%, 42%, 0.8)',
    'hsla(280, 65%, 55%, 0.8)',
    'hsla(45, 90%, 48%, 0.8)',
    'hsla(340, 70%, 50%, 0.8)',
    'hsla(200, 75%, 50%, 0.8)',
    'hsla(170, 60%, 42%, 0.8)',
  ];

  if (hiringChartInstance) {
    hiringChartInstance.destroy();
  }

  if (typeof Chart === 'undefined') return;

  hiringChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Applicants',
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.65,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { size: 12 },
          bodyFont: { size: 11 },
          padding: 10,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 20 }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(128,128,128,0.1)' },
          ticks: { font: { size: 10 }, stepSize: 5 }
        }
      }
    }
  });
}

