import { supabase } from './supabase.js';
import { getSkillsForTrade } from './src/utils/helpers.js';
import { db, syncFromSupabase } from './src/api/db.js';
import { initTheme, toggleTheme, openModal, closeModal, showToast } from './src/utils/ui.js';
import './src/auth/auth.js';
import { renderAllViews } from './src/views/index.js';
import { initRouter, setupEventHandlers } from './src/interactions.js';
import { initCharts } from './src/charts.js';

// Expose UI and utility functions to global scope for HTML inline handlers
window.toggleTheme = toggleTheme;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.getSkillsForTrade = getSkillsForTrade;

// Initialize Application UI
document.addEventListener("DOMContentLoaded", async () => {
  // Init Theme
  initTheme();
  
  // Init Portal Navigation
  initRouter();

  // Render initial components
  renderAllViews();
  
  // Setup Interactivity Hooks
  setupEventHandlers();
  
  // Update Navigation and Auth UI state
  window.updateNavigationUI();
  
  // Setup Chart Rendering
  setTimeout(() => {
    initCharts();
  }, 100);

  // Sync from Supabase asynchronously if configured
  await syncFromSupabase();
  // Re-render and re-init charts after data load
  renderAllViews();
  setTimeout(() => {
    initCharts();
  }, 100);
});
