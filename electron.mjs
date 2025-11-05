import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  console.log("🟢 Creating window...");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "public", "icon.ico"),
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, "dist", "index.html")}`;

  console.log("📂 Loading URL:", startUrl);
  win.loadURL(startUrl);

  win.webContents.on("did-finish-load", () => {
    console.log("✅ Page finished loading");
  });

  win.webContents.on("did-fail-load", (event, errorCode, errorDesc, url) => {
    console.error("❌ Failed to load:", url, errorDesc);
  });
}

// Electron lifecycle
app.whenReady().then(() => {
  console.log("⚡ App ready");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
