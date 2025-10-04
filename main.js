const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Plate2Purpose",
    icon: path.join(__dirname, "icon.ico"), // ✅ set app icon
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // load your login page first
  win.loadFile(path.join(__dirname, "index.html"));

  // ✅ remove default menu bar
  Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
