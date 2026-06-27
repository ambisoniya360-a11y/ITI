import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

export function renderCompanyDashboard() {
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

export function renderCompanyKanban() {
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



export function renderActiveHiring() {
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

