/* Additive activity feed: wraps the notification function without modifying existing scripts. */
(function () {
  const originalShowMessage = window.showMessage;
  const log = document.getElementById("activity-log");
  function typeFor(message) { const text = message.toLowerCase(); if (/failed|error|not registered|connect arduino/.test(text)) return "error"; if (/scan|enter|reset/.test(text)) return "warning"; if (/connected|saved|marked|started|stopped|exported|updated|deleted|enabled|disabled/.test(text)) return "success"; return "info"; }
  function addActivity(message) { const text = String(message).replace(/<[^>]*>/g, "").trim(); if (!text) return; const empty = document.getElementById("activity-empty"); if (empty) empty.remove(); const type = typeFor(text); const icons = { success: "circle-check", warning: "triangle-alert", error: "circle-x", info: "info" }; const item = document.createElement("div"); item.className = `activity-item ${type}`; item.innerHTML = `<span class="activity-icon"><i data-lucide="${icons[type]}"></i></span><span class="activity-message"></span><time class="activity-time"></time>`; item.querySelector(".activity-message").textContent = text; item.querySelector("time").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); log.appendChild(item); log.scrollTop = log.scrollHeight; lucide.createIcons(); }
  window.showMessage = function (message) { originalShowMessage(message); addActivity(message); };
  window.clearActivityLog = function () { log.innerHTML = '<p class="activity-empty" id="activity-empty">Activity history cleared.</p>'; };
  addActivity("Dashboard ready. Waiting for RFID activity.");
}());
