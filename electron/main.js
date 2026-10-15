const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const pm = require("./processManager");

let win;
const stateFile = () => path.join(app.getPath("userData"), "workspaces.json");

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 600,
    backgroundColor: "#1B262B",
    autoHideMenuBar: true,
    title: "Iniciar meus projetos Angular",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'src', 'assets', 'icon.ico'),
  });
  if (app.isPackaged)
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  else win.loadURL("http://localhost:5173");
}

pm.setEmitter((channel, payload) => {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
});

ipcMain.handle("state:load", () => {
  try {
    return JSON.parse(fs.readFileSync(stateFile(), "utf8"));
  } catch {
    return [];
  }
});
ipcMain.handle("state:save", (_e, data) =>
  fs.writeFileSync(stateFile(), JSON.stringify(data, null, 2)),
);
ipcMain.handle("dialog:folder", async () => {
  const r = await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle("project:inspect", (_e, dir) => pm.inspectProject(dir));
ipcMain.handle("fnm:list", () => pm.listNodeVersions());
ipcMain.handle("proc:start", (_e, id, args) => pm.start(id, args));
ipcMain.handle("proc:stop", (_e, id) => pm.stop(id));
ipcMain.handle("proc:log", (_e, id) => pm.getLog(id));
ipcMain.handle("proc:clear", (_e, id) => pm.clearLog(id));

if (!app.requestSingleInstanceLock()) app.quit();
app.whenReady().then(createWindow);
app.on("before-quit", () => pm.killAllSync());
app.on("window-all-closed", () => app.quit());
