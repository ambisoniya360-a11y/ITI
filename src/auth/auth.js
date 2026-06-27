import { db, dbFetchUserByEmail, dbInsertStudent, dbInsertInstitute, dbInsertCompany, dbInsertUser } from '../api/db.js';
import { showToast } from '../utils/ui.js';
import { getSkillsForTrade } from '../utils/helpers.js';

// Session State Initialization
db.session = JSON.parse(localStorage.getItem("skillbridge_session")) || { loggedIn: false, role: null, user: null };
export let loginRole = "Student"; // currently selected login role tab
export let adminModeActive = false; // toggle for secure admin mode
export let authMode = "signin";

export const demoCredentials = {
  "Student": { email: "student@skillbridge.in", password: "password", name: "Rahul Verma", id: "SB-2026-081" },
  "Institute": { email: "pune@iti.gov.in", password: "password", name: "Govt ITI Pune ERP", id: "SB-INST-01" },
  "Company": { email: "tata@tatamotors.com", password: "password", name: "Tata Motors Recruiter", id: "SB-COMP-01" },
  "Admin": { email: "admin@skillbridge.in", password: "password", name: "System Admin", id: "SB-ADMIN-01" }
};

// --- Role-Based Access Control & Authentication ---

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
  }, 800);
};
