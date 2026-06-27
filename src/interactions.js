import { db, dbInsertStudent, dbUpdateApplication, dbInsertApplication } from './api/db.js';
import { showToast, openModal, closeModal } from './utils/ui.js';
import { renderAllViews, renderCompanyDashboard, renderCompanyKanban, renderStudentApplicationsList, renderStudentJobBoard, renderInstituteDirectory, renderCompanyDirectory, renderChatThreadsList, renderChatMessages, updateUnreadBadges } from './views/index.js';
import { initCharts } from './charts.js';

export function initRouter() {
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
export function setupEventHandlers() {
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



