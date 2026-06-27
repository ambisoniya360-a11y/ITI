import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

export function renderStudentPortal() {
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

  // Render new dashboard widgets
  renderStudentDashboardWidgets(student);
}

export function renderStudentApplicationsList() {
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

export function renderStudentJobBoard() {
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

export function renderStudentDashboardWidgets(student) {
  const dashWelcomeName = document.getElementById("student-dash-welcome-name");
  if (dashWelcomeName) dashWelcomeName.textContent = student.name.split(' ')[0];

  // Render Badges
  const dashBadges = document.getElementById("student-dash-badges");
  if (dashBadges) {
    const topSkills = student.skills.slice(0, 3);
    dashBadges.innerHTML = topSkills.map(skill => `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(var(--primary-rgb), 0.1); padding: 12px; border-radius: 50%; width: 60px; height: 60px; border: 1px solid rgba(var(--primary-rgb), 0.2);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"></path></svg>
      </div>
      <span style="font-size: 10px; font-weight: 600; margin-top: 6px; text-align: center;">${skill}</span>
    `).join('');
  }

  // Render Dashboard Jobs List (Latest & Recommended)
  const dashJobsList = document.getElementById("student-dash-jobs-list");
  if (dashJobsList && db.jobs.length > 0) {
    const topJobs = db.jobs.slice(0, 3);
    dashJobsList.innerHTML = topJobs.map(job => {
      const isApplied = db.applications.some(app => app.studentId === "SB-2026-081" && app.jobId === job.id);
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface-hover);">
          <div>
            <h5 style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">${job.title}</h5>
            <div style="font-size: 12px; color: var(--text-muted);">${job.company} &bull; ${job.salary}</div>
          </div>
          <button class="btn btn-sm ${isApplied ? 'btn-secondary' : 'btn-primary'}" ${isApplied ? 'disabled' : ''} onclick="applyForJob('${job.id}')" style="padding: 4px 12px; font-size: 11px;">
            ${isApplied ? 'Applied' : '⚡ Quick Apply'}
          </button>
        </div>
      `;
    }).join('');
  }

  // Render Top Companies
  const dashCompanies = document.getElementById("student-dash-companies");
  if (dashCompanies && db.companies) {
    const topComps = db.companies.slice(0, 3);
    dashCompanies.innerHTML = topComps.map(comp => `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface-hover); text-align: center;">
        <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(var(--primary-rgb), 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; margin-bottom: 8px;">
          ${comp.logo || comp.name.charAt(0)}
        </div>
        <div style="font-size: 12px; font-weight: 700;">${comp.name}</div>
        <div style="font-size: 10px; color: var(--text-muted);">${comp.activeRoles} Roles</div>
      </div>
    `).join('');
  }

  // Render Upcoming Interviews
  const dashInterviews = document.getElementById("student-dash-interviews");
  if (dashInterviews && db.interviews) {
    if (db.interviews.length === 0) {
      dashInterviews.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">No upcoming interviews.</div>`;
    } else {
      dashInterviews.innerHTML = db.interviews.map(inv => `
        <div style="display: flex; gap: 12px; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--border);">
          <div style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent); padding: 8px; border-radius: var(--radius-md);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div>
            <h5 style="font-size: 13px; font-weight: 700; margin-bottom: 2px;">${inv.company}</h5>
            <div style="font-size: 11px; color: var(--text-muted);">${inv.role}</div>
            <div style="font-size: 11px; color: var(--primary); font-weight: 600; margin-top: 4px;">${inv.date} &bull; ${inv.mode}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // Render Recent Applications (Mini)
  const dashRecentApps = document.getElementById("student-dash-recent-apps");
  if (dashRecentApps) {
    const apps = db.applications.filter(app => app.studentId === "SB-2026-081").slice(0, 3);
    if (apps.length === 0) {
      dashRecentApps.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">No applications found.</div>`;
    } else {
      dashRecentApps.innerHTML = apps.map(app => {
        const job = db.jobs.find(j => j.id === app.jobId);
        if (!job) return '';
        let badgeClass = "badge-primary";
        if (app.status === "Shortlisted") badgeClass = "badge-warning";
        if (app.status === "Interviewing") badgeClass = "badge-accent";
        if (app.status === "Offered") badgeClass = "badge-success";
        
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed var(--border);">
            <div>
              <div style="font-size: 13px; font-weight: 600;">${job.title}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${job.company}</div>
            </div>
            <span class="badge ${badgeClass}" style="font-size: 9px; padding: 2px 6px;">${app.status}</span>
          </div>
        `;
      }).join('');
    }
  }

  // Render Notifications
  const dashNotifs = document.getElementById("student-dash-notifications");
  if (dashNotifs && db.notifications) {
    dashNotifs.innerHTML = db.notifications.map(notif => `
      <div style="display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: var(--radius-md); background: var(--surface-hover);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--${notif.type || 'primary'}); margin-top: 6px;"></div>
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span style="font-size: 13px; font-weight: 700;">${notif.title}</span>
            <span style="font-size: 10px; color: var(--text-light);">${notif.time}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${notif.msg}</div>
        </div>
      </div>
    `).join('');
  }
}

