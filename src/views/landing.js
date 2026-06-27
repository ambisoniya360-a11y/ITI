import { db } from '../api/db.js';

export function renderLandingStats() {
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
}

export function renderApprenticeshipMarketplace() {
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

export function renderMobileApp() {
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
