import { db, dbUpdateApplication, dbInsertApplication, dbUpdateStudent } from '../api/db.js';
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

  // Render initials helper
  const getInitials = (name) => {
    if (!name) return "S";
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const initials = getInitials(student.name);

  // Update Header Avatar
  const headerAvatar = document.getElementById("student-header-avatar");
  if (headerAvatar) {
    if (student.photoUrl) {
      headerAvatar.innerHTML = `<img src="${student.photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      headerAvatar.innerHTML = initials;
    }
  }

  // Update Passport Avatar
  const passportAvatar = document.getElementById("student-passport-avatar");
  if (passportAvatar) {
    if (student.photoUrl) {
      passportAvatar.style.backgroundImage = `url('${student.photoUrl}')`;
      passportAvatar.style.backgroundSize = "cover";
      passportAvatar.style.backgroundPosition = "center";
    } else {
      passportAvatar.style.backgroundImage = "url('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150')";
    }
  }

  // Update Mobile Passport Avatar
  const mobilePassAvatar = document.getElementById("student-mobile-passport-avatar");
  if (mobilePassAvatar) {
    if (student.photoUrl) {
      mobilePassAvatar.innerHTML = `<img src="${student.photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      mobilePassAvatar.innerHTML = initials;
    }
  }

  // Update Settings Avatar Preview
  const settingsAvatar = document.getElementById("settings-avatar-preview");
  if (settingsAvatar) {
    if (student.photoUrl) {
      settingsAvatar.innerHTML = `<img src="${student.photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      settingsAvatar.innerHTML = initials;
    }
  }

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
  
  // Render new full dashboard 14 tabs content
  renderStudentFullDashboard(student);
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

export function renderStudentFullDashboard(student) {
  // 1. Find Jobs (student-jobs-list)
  const jobsList = document.getElementById("student-jobs-list");
  if (jobsList && db.jobs) {
    jobsList.innerHTML = db.jobs.map(job => {
      const isApplied = db.applications.some(app => app.studentId === student.id && app.jobId === job.id);
      const isMatched = job.trade === student.trade;
      return `
        <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-color: ${isMatched ? 'rgba(var(--primary-rgb), 0.3)' : 'var(--border)'}">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <h5 style="font-size: 16px; font-weight: 700;">${job.title}</h5>
              ${isMatched ? '<span class="badge badge-success" style="font-size: 10px; padding: 2px 8px;">Trade Match</span>' : ''}
              <span class="badge badge-secondary" style="font-size: 10px;">${job.type}</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 12px;">
              <span><i data-lucide="building" style="width: 14px; height: 14px; display: inline-block; vertical-align: text-bottom; margin-right: 4px;"></i>${job.company}</span>
              <span><i data-lucide="map-pin" style="width: 14px; height: 14px; display: inline-block; vertical-align: text-bottom; margin-right: 4px;"></i>${job.location}</span>
              <span style="font-weight: 700; color: var(--text-main);">${job.salary}</span>
            </p>
          </div>
          <button class="btn ${isApplied ? 'btn-secondary' : 'btn-primary'}" onclick="applyForJob('${job.id}')" ${isApplied ? 'disabled' : ''}>
            ${isApplied ? 'Applied' : 'Apply Now'}
          </button>
        </div>
      `;
    }).join('');
  }

  // 2. Recommended Jobs (student-recommended-jobs-list)
  const recommendedList = document.getElementById("student-recommended-jobs-list");
  if (recommendedList && db.jobs) {
    const recommended = db.jobs.filter(job => job.trade === student.trade);
    recommendedList.innerHTML = recommended.map(job => `
      <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to right, rgba(var(--primary-rgb), 0.05), transparent);">
        <div>
          <h5 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">${job.title}</h5>
          <p style="font-size: 13px; color: var(--text-muted);">${job.company} &bull; ${job.location} &bull; <strong style="color: var(--primary);">${job.salary}</strong></p>
          <div style="margin-top: 12px; font-size: 11px; color: var(--success); font-weight: 600;">
            ✓ Matches your ${student.trade} trade skills
          </div>
        </div>
        <button class="btn btn-primary">Apply Now</button>
      </div>
    `).join('');
  }

  // 3. Job Alerts (student-alerts-list)
  const alertsList = document.getElementById("student-alerts-list");
  if (alertsList && db.jobAlerts) {
    alertsList.innerHTML = db.jobAlerts.map(alert => `
      <div class="card" style="padding: 16px; display: flex; align-items: flex-start; gap: 16px;">
        <div style="background: rgba(var(--primary-rgb), 0.1); color: var(--primary); padding: 12px; border-radius: 50%;">
          <i data-lucide="bell" style="width: 20px; height: 20px;"></i>
        </div>
        <div style="flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h5 style="font-size: 15px; font-weight: 700;">${alert.title}</h5>
            <span style="font-size: 11px; color: var(--text-light);">${alert.date}</span>
          </div>
          <span class="badge badge-secondary" style="font-size: 10px;">${alert.type}</span>
        </div>
      </div>
    `).join('');
  }

  // 4. Apprenticeships (student-apprenticeships-list)
  const appList = document.getElementById("student-apprenticeships-list");
  if (appList && db.apprenticeships) {
    appList.innerHTML = db.apprenticeships.map(app => `
      <div class="card" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--accent);">
        <div>
          <h5 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">${app.title}</h5>
          <p style="font-size: 13px; color: var(--text-muted);">
            ${app.company} &bull; ${app.location}
          </p>
          <div style="display: flex; gap: 16px; margin-top: 12px;">
            <span style="font-size: 12px; font-weight: 600;"><span style="color: var(--text-light);">Stipend:</span> ${app.stipend}</span>
            <span style="font-size: 12px; font-weight: 600;"><span style="color: var(--text-light);">Duration:</span> ${app.duration}</span>
          </div>
        </div>
        <button class="btn btn-primary">Apply Now</button>
      </div>
    `).join('');
  }

  // 5. Interviews (student-interviews-list-full)
  const interviewsList = document.getElementById("student-interviews-list-full");
  if (interviewsList && db.interviews) {
    if (db.interviews.length === 0) {
       interviewsList.innerHTML = `<div class="card" style="padding: 32px; text-align: center; color: var(--text-muted);">No upcoming interviews. Keep applying!</div>`;
    } else {
       interviewsList.innerHTML = db.interviews.map(inv => `
        <div class="card" style="padding: 20px; border: 1px solid rgba(var(--primary-rgb), 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <h5 style="font-size: 18px; font-weight: 800;">${inv.company}</h5>
              <div style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">${inv.role}</div>
            </div>
            <span class="badge badge-primary">${inv.mode}</span>
          </div>
          <div style="background: var(--background); padding: 12px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 700; color: var(--primary);">${inv.date}</div>
            ${inv.link ? `<a href="https://${inv.link}" target="_blank" class="btn btn-sm btn-primary">Join Meeting</a>` : '<span style="font-size: 12px; color: var(--text-muted);">Check email for location</span>'}
          </div>
        </div>
      `).join('');
    }
  }

  // 6. Skill Development (student-learning-list)
  const learningList = document.getElementById("student-learning-list");
  if (learningList && db.skillCourses) {
    learningList.innerHTML = db.skillCourses.map(course => `
      <div class="card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
        <div style="height: 100px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); position: relative;">
          <span class="badge badge-secondary" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.9); color: #000;">${course.type}</span>
        </div>
        <div style="padding: 16px; flex-grow: 1; display: flex; flex-direction: column;">
          <h5 style="font-size: 15px; font-weight: 700; margin-bottom: 4px; line-height: 1.3;">${course.title}</h5>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">by ${course.provider}</div>
          <div style="margin-top: auto;">
            ${course.progress > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; font-weight: 600;">
                <span>Progress</span>
                <span>${course.progress}%</span>
              </div>
              <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
                <div style="height: 100%; width: ${course.progress}%; background: var(--primary);"></div>
              </div>
              <button class="btn btn-sm btn-secondary" style="width: 100%;">${course.progress === 100 ? 'View Certificate' : 'Continue Course'}</button>
            ` : `
              <button class="btn btn-sm btn-primary" style="width: 100%;">Enroll for Free</button>
            `}
          </div>
        </div>
      </div>
    `).join('');
  }

  // 7. Saved Jobs (student-saved-jobs-list)
  const savedList = document.getElementById("student-saved-jobs-list");
  if (savedList && db.savedJobs) {
    if (db.savedJobs.length === 0) {
      savedList.innerHTML = `<div class="card" style="padding: 32px; text-align: center; color: var(--text-muted);">You have no saved jobs.</div>`;
    } else {
      const sJobs = db.jobs.filter(j => db.savedJobs.includes(j.id));
      savedList.innerHTML = sJobs.map(job => `
        <div class="card" style="padding: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h5 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${job.title}</h5>
            <div style="font-size: 12px; color: var(--text-muted);">${job.company} &bull; ${job.location}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-secondary" style="padding: 8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ef4444;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button class="btn btn-sm btn-primary">Apply Now</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Reload lucide icons after rendering new dynamic content
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

window.handleAvatarUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast("File Too Large", "Please select an image smaller than 2MB.", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function() {
    const student = db.students.find(s => s.id === "SB-2026-081");
    if (!student) return;

    student.photoUrl = reader.result;
    
    // Save to Supabase (if configured)
    await dbUpdateStudent(student);
    
    // Re-render
    renderStudentPortal();
    showToast("Profile Picture Updated", "Your profile photo has been updated successfully.", "success");
  };
  reader.readAsDataURL(file);
};

window.handleRemoveAvatar = async function() {
  const student = db.students.find(s => s.id === "SB-2026-081");
  if (!student) return;

  student.photoUrl = "";
  
  // Save to Supabase (if configured)
  await dbUpdateStudent(student);
  
  // Re-render
  renderStudentPortal();
  showToast("Profile Picture Removed", "Your profile photo has been removed.", "info");
};
