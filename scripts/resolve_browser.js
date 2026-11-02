import fs from "node:fs";
import path from "node:path";

export function getBrowserCandidates() {
  const localAppData = process.env.LOCALAPPDATA;
  const programFiles = process.env["ProgramFiles"];
  const programFilesX86 = process.env["ProgramFiles(x86)"];

  return [
    process.env.CHROME_PATH,
    process.env.BROWSER_PATH,
    // Windows 64-bit and 32-bit Chrome
    programFiles
      ? path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe")
      : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    programFilesX86
      ? path.join(
          programFilesX86,
          "Google",
          "Chrome",
          "Application",
          "chrome.exe",
        )
      : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    localAppData
      ? path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe")
      : null,
    // Windows Edge
    programFiles
      ? path.join(
          programFiles,
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe",
        )
      : "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    programFilesX86
      ? path.join(
          programFilesX86,
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe",
        )
      : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    localAppData
      ? path.join(
          localAppData,
          "Microsoft",
          "Edge",
          "Application",
          "msedge.exe",
        )
      : null,
    // Linux Chrome & Chromium
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    // macOS Chrome, Edge, and Chromium
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].filter(Boolean);
}

export function resolveBrowserPath({ allowSkip = false } = {}) {
  const candidates = getBrowserCandidates();
  const found = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });

  if (found) {
    return found;
  }

  if (allowSkip) {
    return null;
  }

  throw new Error(
    "Chrome, Chromium, or Microsoft Edge executable was not found on this system.\n" +
      "Please install Google Chrome or Edge, or specify the browser executable path by setting the CHROME_PATH or BROWSER_PATH environment variable.",
  );
}
