let placementTrendChartInstance = null;
let hiringTradesChartInstance = null;
let pipelineChartInstance = null;
let hiringChartInstance = null;

import { db } from './api/db.js';

export function initCharts() {
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


