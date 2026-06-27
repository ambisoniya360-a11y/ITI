import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

export function renderAdminPanel() {
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

