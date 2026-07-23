/* Optional UI features only; the RFID serial, LocalStorage and XLSX logic remains untouched. */
(function () {
  let sessionStartedAt = null;
  const timer = document.getElementById("session-timer"), state = document.getElementById("session-state"), latestRFID = document.getElementById("latest-rfid");
  function updateTimer() { if (!sessionStartedAt) return; const total = Math.floor((Date.now() - sessionStartedAt) / 1000); timer.textContent = `${String(Math.floor(total / 3600)).padStart(2,"0")}:${String(Math.floor(total % 3600 / 60)).padStart(2,"0")}:${String(total % 60).padStart(2,"0")}`; }
  window.focusRegistration = function () { const field = document.getElementById("name"); field.scrollIntoView({ behavior:"smooth", block:"center" }); setTimeout(() => field.focus(), 350); };
  window.focusStudentSearch = function () { const field = document.getElementById("student-search"); field.scrollIntoView({ behavior:"smooth", block:"center" }); setTimeout(() => field.focus(), 350); };
  const start = window.startAttendance, stop = window.stopAttendance, reset = window.resetAttendance;
  window.startAttendance = function () { start(); sessionStartedAt = Date.now(); state.textContent = "Session running"; updateTimer(); };
  window.stopAttendance = function () { stop(); state.textContent = sessionStartedAt ? "Session stopped" : "Not started"; };
  window.resetAttendance = function () { reset(); sessionStartedAt = null; timer.textContent = "00:00:00"; state.textContent = "Not started"; };
  setInterval(() => { updateTimer(); const uid = document.getElementById("uid").textContent.trim(); latestRFID.textContent = uid && uid !== "Waiting..." ? uid : "Waiting for scan"; }, 1000);
  lucide.createIcons();
}());
