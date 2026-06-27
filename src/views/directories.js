import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

export function renderInstituteDirectory() {
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

export function renderCompanyDirectory() {
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

