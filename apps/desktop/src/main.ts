/**
 * XTRIVO desktop — Electron main process (Stage 1 skeleton).
 * Stage 6 implements: download queue UI wiring, @xtrivo/download-engine
 * integration, native messaging host for the extension.
 */
import { app, BrowserWindow } from "electron";
import { join } from "node:path";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true, // never disable: renderer stays sandboxed
      nodeIntegration: false,
    },
  });
  // Stage 1: inline scaffolding page. Real UI lands in Stage 2/6.
  win.loadURL(
    "data:text/html," +
      encodeURIComponent(
        "<h1 style='font-family:system-ui'>XTRIVO Desktop</h1><p>Stage 1 scaffolding — download manager UI arrives in Stage 6.</p>",
      ),
  );
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
