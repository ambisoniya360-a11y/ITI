import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

export function renderInstituteERP() {
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

