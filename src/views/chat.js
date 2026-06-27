export let activeThreadIds = { Student: null, Institute: null, Company: null, Admin: null };

export function getChatThreads(portalRole, userId) {
  const threadsMap = {};

  db.notifications.forEach(notif => {
    let participantId = null;
    let participantName = null;
    let participantRole = null;
    let shouldInclude = false;

    if (portalRole === "Student") {
      if (notif.senderId === userId) {
        participantId = notif.receiverId;
        participantName = notif.receiverName;
        participantRole = notif.receiverRole;
        shouldInclude = true;
      } else if (notif.receiverId === userId) {
        participantId = notif.senderId;
        participantName = notif.senderName;
        participantRole = notif.senderRole;
        shouldInclude = true;
      }
    } 
    else if (portalRole === "Institute") {
      if (notif.senderId === userId) {
        participantId = notif.receiverId;
        participantName = notif.receiverName;
        participantRole = notif.receiverRole;
        shouldInclude = true;
      } else if (notif.receiverId === userId) {
        participantId = notif.senderId;
        participantName = notif.senderName;
        participantRole = notif.senderRole;
        shouldInclude = true;
      }
    } 
    else if (portalRole === "Company") {
      if (notif.senderId === userId) {
        participantId = notif.receiverId;
        participantName = notif.receiverName;
        participantRole = notif.receiverRole;
        shouldInclude = true;
      } else if (notif.receiverId === userId) {
        participantId = notif.senderId;
        participantName = notif.senderName;
        participantRole = notif.senderRole;
        shouldInclude = true;
      }
    } 
    else if (portalRole === "Admin") {
      const pairKey = [notif.senderId, notif.receiverId].sort().join("<->");
      participantId = pairKey;
      participantName = `${notif.senderName} ⇄ ${notif.receiverName}`;
      participantRole = `${notif.senderRole} ⇄ ${notif.receiverRole}`;
      shouldInclude = true;
    }

    if (shouldInclude && participantId) {
      if (!threadsMap[participantId]) {
        threadsMap[participantId] = {
          id: participantId,
          name: participantName,
          role: participantRole,
          messages: [],
          lastMessage: null,
          unreadCount: 0
        };
      }

      threadsMap[participantId].messages.push(notif);
      if (!threadsMap[participantId].lastMessage || new Date(notif.timestamp) > new Date(threadsMap[participantId].lastMessage.timestamp)) {
        threadsMap[participantId].lastMessage = notif;
      }

      if (!notif.read && ((portalRole === "Admin" && notif.receiverRole === "Admin") || (portalRole !== "Admin" && notif.receiverId === userId))) {
        threadsMap[participantId].unreadCount++;
      }
    }
  });

  return Object.values(threadsMap).sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
}
import { db } from '../api/db.js';
import { showToast } from '../utils/ui.js';

export function renderInbox(portalRole) {
  renderChatThreadsList(portalRole);
  const activeThread = activeThreadIds[portalRole];
  renderChatMessages(portalRole, activeThread);
};

export function renderChatThreadsList(portalRole) {
  const container = document.getElementById(`${portalRole.toLowerCase()}-inbox-thread-list`);
  if (!container) return;

  const userId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
  const searchInput = document.querySelector(`#${portalRole.toLowerCase()}-view-inbox .whatsapp-search input`);
  const searchVal = (searchInput?.value || "").toLowerCase();

  const threads = getChatThreads(portalRole, userId);
  const filteredThreads = threads.filter(t => t.name.toLowerCase().includes(searchVal) || (t.lastMessage && t.lastMessage.message.toLowerCase().includes(searchVal)));

  if (filteredThreads.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px; font-size:12px;">No active conversations found.</div>`;
    return;
  }

  container.innerHTML = "";
  filteredThreads.forEach(thread => {
    const isActive = activeThreadIds[portalRole] === thread.id;
    const date = new Date(thread.lastMessage.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const item = `
      <div class="whatsapp-thread-item ${isActive ? 'active' : ''}" onclick="selectChatThread('${portalRole}', '${thread.id}')">
        <div class="whatsapp-thread-avatar">${thread.name.charAt(0)}</div>
        <div class="whatsapp-thread-info">
          <div class="whatsapp-thread-header">
            <span class="whatsapp-thread-name">${thread.name}</span>
            <span class="whatsapp-thread-time">${timeString}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span class="whatsapp-thread-msg">${thread.lastMessage.message}</span>
            ${thread.unreadCount > 0 ? `<span class="whatsapp-badge">${thread.unreadCount}</span>` : ''}
          </div>
        </div>
      </div>
    `;
    container.innerHTML += item;
  });
}

export function renderChatMessages(portalRole, threadId) {
  const container = document.getElementById(`${portalRole.toLowerCase()}-inbox-messages-container`);
  const header = document.getElementById(`${portalRole.toLowerCase()}-inbox-chat-header`);
  const inputBar = document.getElementById(`${portalRole.toLowerCase()}-inbox-chat-input-bar`);

  if (!container || !header || !inputBar) return;

  const userId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
  const threads = getChatThreads(portalRole, userId);
  const activeThread = threads.find(t => t.id === threadId);

  if (!activeThread) {
    header.textContent = portalRole === "Admin" ? "Select a conversation to monitor correspondence" : "Select a conversation to start messaging";
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color: var(--text-muted); text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.3;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p style="font-size:13px;">${portalRole === "Admin" ? 'Admin has absolute audit rights to monitor all student, company, and institute conversations.' : 'Select a message thread on the left to read correspondence.'}</p>
      </div>
    `;
    inputBar.style.display = "none";
    return;
  }

  header.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <div class="whatsapp-thread-avatar" style="width:32px; height:32px; font-size:11px; background:var(--accent);">
        ${activeThread.name.charAt(0)}
      </div>
      <div>
        <strong style="font-size:13px; display:block; color:var(--text-main);">${activeThread.name}</strong>
        <span style="font-size:10px; color:var(--text-light); text-transform:uppercase;">${activeThread.role}</span>
      </div>
    </div>
  `;

  container.innerHTML = "";
  activeThread.messages.forEach(msg => {
    let isSent = false;
    if (portalRole === "Admin") {
      isSent = msg.senderRole === "Admin";
    } else {
      isSent = msg.senderId === userId;
    }

    const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bubble = `
      <div class="whatsapp-bubble ${isSent ? 'sent' : 'received'}">
        <div style="font-size: 9px; opacity: 0.7; font-weight: 700; margin-bottom: 4px;">
          ${msg.senderName} (${msg.senderRole})
        </div>
        <div>${msg.message}</div>
        <span class="whatsapp-bubble-time">${timeString} ${isSent ? '✓✓' : ''}</span>
      </div>
    `;
    container.innerHTML += bubble;
  });

  container.scrollTop = container.scrollHeight;
  inputBar.style.display = "flex";
}

export function selectChatThread(portalRole, threadId) {
  activeThreadIds[portalRole] = threadId;
  const userId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));

  db.notifications.forEach(notif => {
    if (portalRole === "Admin") {
      const pairKey = [notif.senderId, notif.receiverId].sort().join("<->");
      if (pairKey === threadId) {
        notif.read = true;
      }
    } else {
      if (notif.receiverId === userId && notif.senderId === threadId) {
        notif.read = true;
      }
    }
  });

  renderChatMessages(portalRole, threadId);
  renderChatThreadsList(portalRole);
  updateUnreadBadges();
};

export function sendInboxMessage(portalRole) {
  const textarea = document.getElementById(`${portalRole.toLowerCase()}-inbox-message-textarea`);
  if (!textarea) return;

  const messageText = textarea.value.trim();
  if (!messageText) return;

  const senderName = db.session.user || (portalRole === "Student" ? "Rahul Verma" : (portalRole === "Institute" ? "Government ITI Pune ERP" : (portalRole === "Company" ? "Tata Motors Recruiter" : "System Admin")));
  const senderId = db.session.id || (portalRole === "Student" ? "SB-2026-081" : (portalRole === "Institute" ? "INST-001" : (portalRole === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
  const senderRole = db.session.role || portalRole;

  const activeThreadId = activeThreadIds[portalRole];
  if (!activeThreadId) return;

  let receiverId = "";
  let receiverName = "";
  let receiverRole = "";

  if (portalRole === "Admin") {
    const lastMsg = db.notifications.filter(notif => {
      const pairKey = [notif.senderId, notif.receiverId].sort().join("<->");
      return pairKey === activeThreadId;
    }).slice(-1)[0];

    if (lastMsg) {
      // reply to the sender of the last message in pair
      receiverId = lastMsg.senderId;
      receiverName = lastMsg.senderName;
      receiverRole = lastMsg.senderRole;
    } else {
      const parts = activeThreadId.split("<->");
      receiverId = parts[0];
      receiverName = "User";
      receiverRole = "User";
    }
  } else {
    // Reply to the participant
    const lastMsg = db.notifications.find(n => 
      (n.senderId === activeThreadId && n.receiverId === senderId) ||
      (n.receiverId === activeThreadId && n.senderId === senderId)
    );

    if (lastMsg) {
      if (lastMsg.senderId === activeThreadId) {
        receiverId = lastMsg.senderId;
        receiverName = lastMsg.senderName;
        receiverRole = lastMsg.senderRole;
      } else {
        receiverId = lastMsg.receiverId;
        receiverName = lastMsg.receiverName;
        receiverRole = lastMsg.receiverRole;
      }
    } else {
      receiverId = activeThreadId;
      if (activeThreadId.startsWith("SB-2026")) {
        const student = db.students.find(s => s.id === activeThreadId);
        receiverName = student ? student.name : "Student";
        receiverRole = "Student";
      } else if (activeThreadId.startsWith("INST")) {
        const inst = db.institutes.find(i => i.id === activeThreadId);
        receiverName = inst ? inst.name : "Institute";
        receiverRole = "Institute";
      } else if (activeThreadId.startsWith("COMP") || activeThreadId.startsWith("SB-COMP")) {
        const comp = db.companies.find(c => c.id === activeThreadId);
        receiverName = comp ? comp.name : "Company";
        receiverRole = "Company";
      } else {
        receiverName = "System Admin";
        receiverRole = "Admin";
      }
    }
  }

  const newNotif = {
    id: `MSG-0${db.notifications.length + 100}`,
    senderId,
    senderName,
    senderRole,
    receiverId,
    receiverName,
    receiverRole,
    message: messageText,
    timestamp: new Date().toISOString(),
    read: false
  };

  db.notifications.push(newNotif);
  textarea.value = "";

  renderChatMessages(portalRole, activeThreadId);
  renderChatThreadsList(portalRole);
  updateUnreadBadges();
};

export function filterChatThreads(portalRole, query) {
  renderChatThreadsList(portalRole);
};

export function updateUnreadBadges() {
  const roles = ["Student", "Institute", "Company", "Admin"];
  
  roles.forEach(role => {
    const roleUserId = db.session.id || (role === "Student" ? "SB-2026-081" : (role === "Institute" ? "INST-001" : (role === "Company" ? "SB-COMP-01" : "SB-ADMIN-01")));
    
    let unreadCount = 0;
    if (role === "Admin") {
      unreadCount = db.notifications.filter(n => !n.read && n.receiverRole === "Admin").length;
    } else {
      unreadCount = db.notifications.filter(n => !n.read && n.receiverId === roleUserId).length;
    }

    const badges = document.querySelectorAll(`#${role.toLowerCase()}-side-link-inbox .inbox-unread-count`);
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    });
  });
}

