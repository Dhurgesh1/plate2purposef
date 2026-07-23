/* RFID dashboard UI helpers. Arduino serial, storage and XLSX functions stay in arduino.js. */
let searchTerm = "";
let notificationTimer;

function refreshIcons() { lucide.createIcons(); }

function updateClock() {
  document.getElementById("current-datetime").textContent = new Date().toLocaleString([], { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

/* Floating notification with automatic type detection. arduino.js calls this function unchanged. */
function showMessage(message) {
  const notification = document.getElementById("notification");
  const text = String(message).replace(/<[^>]*>/g, "");
  const lower = text.toLowerCase();
  const type = /failed|error|not registered|connect arduino/.test(lower) ? "error" : /scan|enter|reset/.test(lower) ? "warning" : /connected|saved|marked|started|stopped|exported|updated|deleted/.test(lower) ? "success" : "info";
  const colors = { success: "#278b61", warning: "#c98b2f", error: "#c65757", info: "#A94442" };
  clearTimeout(notificationTimer);
  notification.innerHTML = message;
  notification.style.background = colors[type];
  notification.style.display = "block";
  notificationTimer = setTimeout(() => { notification.style.display = "none"; }, 3200);
}

/* LCD protocol requested by the Arduino sketch. */
function setLCD(enabled) {
  sendCommand(enabled ? "LCD_ON" : "LCD_OFF");
  showMessage(`LCD backlight ${enabled ? "enabled" : "disabled"}`);
}

function setMode(mode) {
  document.getElementById("nav-mode").innerHTML = `<i data-lucide="radio"></i>${mode}`;
  document.getElementById("scan-display").classList.toggle("scanning", mode === "Register");
  document.getElementById("registration-hint").textContent = mode === "Register" ? "Waiting for RFID card..." : "Ready to register a card";
  refreshIcons();
}

/* Required live statistics updater. The LocalStorage student object is unchanged. */
function updateStats() {
  const total = students.length;
  const present = students.filter(student => student.present || student.status === "Present").length;
  const absent = total - present;
  const percent = total ? Math.round((present / total) * 100) : 0;
  document.getElementById("total-students").textContent = total;
  document.getElementById("present-students").textContent = present;
  document.getElementById("absent-students").textContent = absent;
  document.getElementById("attendance-percent").textContent = `${percent}%`;
  document.getElementById("progress-copy").textContent = `${present} / ${total} present`;
  document.getElementById("attendance-progress").style.width = `${percent}%`;
}

/* Replaces only the table rendering layer; editStudent and deleteStudent remain in arduino.js. */
function renderAttendance() {
  const table = document.getElementById("list");
  const matchingStudents = students.map((student, index) => ({ student, index })).filter(({ student }) => `${student.name} ${student.rfid}`.toLowerCase().includes(searchTerm));
  table.innerHTML = matchingStudents.map(({ student, index }) => {
    const status = student.status || "Absent";
    return `<tr><td>${student.name}</td><td><span class="badge">${student.rfid}</span></td><td><span class="badge status-badge ${status.toLowerCase()}">${status}</span></td><td><div class="table-actions"><button class="icon-button" aria-label="Edit ${student.name}" onclick="editStudent(${index})"><i data-lucide="pencil"></i></button><button class="icon-button delete" aria-label="Delete ${student.name}" onclick="deleteStudent(${index})"><i data-lucide="trash-2"></i></button></div></td></tr>`;
  }).join("") || '<tr><td colspan="4" style="text-align:center;color:#856b6c;padding:28px">No students found.</td></tr>';
  updateStats();
  refreshIcons();
}

/* UI wrappers preserve the public function names used by existing button handlers. */
const originalConnectArduino = connectArduino;
const originalScanRFID = scanRFID;
const originalSaveStudent = saveStudent;
const originalStartAttendance = startAttendance;
const originalStopAttendance = stopAttendance;
const originalResetAttendance = resetAttendance;
const originalEditStudent = editStudent;
const originalDeleteStudent = deleteStudent;
const originalProcessRFID = processRFID;

connectArduino = async function () {
  await originalConnectArduino();
  const connected = /connected/i.test(document.getElementById("connection").textContent);
  if (connected) {
    document.getElementById("nav-connection").classList.add("online");
    document.getElementById("nav-connection").innerHTML = '<i data-lucide="circle-check"></i>Connected';
    document.getElementById("connected-time").textContent = `Connected ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    document.getElementById("com-port").textContent = "Selected port";
    refreshIcons();
  }
};
scanRFID = function () { setMode("Register"); originalScanRFID(); };
saveStudent = function () { originalSaveStudent(); if (!currentUID) setMode("Idle"); renderAttendance(); };
startAttendance = function () { setMode("Attendance"); document.getElementById("attendance-state").textContent = "Attendance session active"; originalStartAttendance(); renderAttendance(); };
stopAttendance = function () { setMode("Idle"); document.getElementById("attendance-state").textContent = "Attendance session stopped"; originalStopAttendance(); renderAttendance(); };
resetAttendance = function () { originalResetAttendance(); renderAttendance(); };
editStudent = function (index) { originalEditStudent(index); renderAttendance(); };
deleteStudent = function (index) { originalDeleteStudent(index); renderAttendance(); };
processRFID = function (data) { originalProcessRFID(data); renderAttendance(); };

document.getElementById("student-search").addEventListener("input", event => { searchTerm = event.target.value.trim().toLowerCase(); renderAttendance(); });
updateClock();
setInterval(updateClock, 30000);
setInterval(updateStats, 1000);
renderAttendance();
refreshIcons();
