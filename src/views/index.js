import { renderStudentPortal, renderStudentApplicationsList, renderStudentJobBoard } from './student.js';
import { renderInstituteERP } from './institute.js';
import { renderCompanyDashboard, renderCompanyKanban } from './company.js';
import { renderAdminPanel } from './admin.js';
import { renderLandingStats, renderApprenticeshipMarketplace, renderMobileApp } from './landing.js';
import { renderInstituteDirectory, renderCompanyDirectory } from './directories.js';
import { renderInbox, renderChatThreadsList, renderChatMessages, selectChatThread, sendInboxMessage, filterChatThreads, updateUnreadBadges } from './chat.js';

export function renderAllViews() {
  renderLandingStats();
  renderApprenticeshipMarketplace();
  renderStudentPortal();
  renderInstituteERP();
  renderCompanyDashboard();
  renderAdminPanel();
  renderMobileApp();
}

window.renderStudentPortal = renderStudentPortal;
window.renderStudentApplicationsList = renderStudentApplicationsList;
window.renderStudentJobBoard = renderStudentJobBoard;
window.renderInstituteERP = renderInstituteERP;
window.renderCompanyDashboard = renderCompanyDashboard;
window.renderCompanyKanban = renderCompanyKanban;
window.renderAdminPanel = renderAdminPanel;
window.renderInstituteDirectory = renderInstituteDirectory;
window.renderCompanyDirectory = renderCompanyDirectory;
window.renderInbox = renderInbox;
window.renderChatThreadsList = renderChatThreadsList;
window.renderChatMessages = renderChatMessages;
window.selectChatThread = selectChatThread;
window.sendInboxMessage = sendInboxMessage;
window.filterChatThreads = filterChatThreads;
window.renderAllViews = renderAllViews;

export { renderStudentPortal, renderStudentApplicationsList, renderStudentJobBoard, renderInstituteERP, renderCompanyDashboard, renderCompanyKanban, renderAdminPanel, renderInstituteDirectory, renderCompanyDirectory, renderInbox, renderChatThreadsList, renderChatMessages, selectChatThread, sendInboxMessage, filterChatThreads, updateUnreadBadges };


