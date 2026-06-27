// --- Theme Management ---
export function initTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeButtonUI(currentTheme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeButtonUI(newTheme);
  
  // Dispatch event so other modules (like charts) can redraw
  window.dispatchEvent(new Event("themeToggled"));
}

export function updateThemeButtonUI(theme) {
  const btn = document.querySelector(".theme-toggle-btn");
  if (!btn) return;
  if (theme === "dark") {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  }
}

// --- Modal Helper Functions ---
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("show");
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("show");
}

// --- Floating Toast Alerts ---
export function showToast(title, message, type = "success") {
  const toast = document.getElementById("notification-toast");
  const icon = document.getElementById("toast-icon-wrap");
  const tTitle = document.getElementById("toast-title");
  const tMsg = document.getElementById("toast-message");

  if (!toast) return;

  // Set colors based on type
  if (type === "success") {
    toast.style.borderColor = "rgba(16, 185, 129, 0.4)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === "info") {
    toast.style.borderColor = "rgba(59, 130, 246, 0.4)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  } else if (type === "warning") {
    toast.style.borderColor = "rgba(245, 158, 11, 0.4)";
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  tTitle.textContent = title;
  tMsg.textContent = message;

  toast.classList.add("show");
  
  // Clear previous timers
  if (toast.timer) clearTimeout(toast.timer);
  
  toast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}
