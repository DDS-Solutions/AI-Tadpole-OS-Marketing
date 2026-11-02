import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { resolveBrowserPath } from "./resolve_browser.js";

const browserPath = resolveBrowserPath();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      }
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}, timeoutMs = 25000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timed out: ${method}`));
        }
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket?.close();
  }
}

async function waitFor(fn, timeoutMs = 15000, label = "condition") {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fn();
      if (res) return res;
    } catch {}
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tadpole-capture-"));
  const browserArgs = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${tempDir}`,
    "about:blank",
  ];

  console.log("🚀 Launching headless Chrome...");
  const browser = spawn(browserPath, browserArgs, {
    stdio: "ignore",
    windowsHide: true,
  });

  try {
    const devToolsFile = path.join(tempDir, "DevToolsActivePort");
    const port = await waitFor(
      () => {
        if (!fs.existsSync(devToolsFile)) return null;
        return Number(fs.readFileSync(devToolsFile, "utf8").split(/\r?\n/)[0]);
      },
      15000,
      "DevTools port",
    );

    console.log(`📡 Connected to Chrome CDP on port ${port}`);
    const targets = await (
      await fetch(`http://127.0.0.1:${port}/json/list`)
    ).json();
    const pageTarget = targets.find(
      (t) => t.type === "page" && t.webSocketDebuggerUrl,
    );
    if (!pageTarget) throw new Error("No page target found");

    const client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("DOM.enable");

    const captures = [
      {
        url: "http://localhost:5173/dashboard",
        output: "public/assets/real_os_dashboard.png",
        width: 1662,
        height: 905,
        waitMs: 3000,
        title: "Operations Dashboard",
      },
      {
        url: "http://localhost:5173/intelligence/map",
        output: "public/assets/real_os_nodes.png",
        width: 1662,
        height: 905,
        waitMs: 3500,
        title: "Neural Map / Knowledge Nodes",
      },
      {
        url: "http://localhost:5173/oversight",
        output: "public/assets/real_os_oversight.png",
        width: 1662,
        height: 905,
        waitMs: 3000,
        title: "Sapphire Shield Oversight",
      },
      {
        url: "http://localhost:5173/store",
        output: "public/assets/industry_templates_catalog.png",
        width: 1680,
        height: 1050,
        waitMs: 3000,
        title: "Industry Templates Catalog",
      },
      {
        url: "http://localhost:5173/missions",
        output: "public/assets/real_os_missions.png",
        width: 1662,
        height: 905,
        waitMs: 3000,
        title: "Missions Flight Recorder & Swarm Telemetry",
      },
      {
        url: "http://localhost:5173/security",
        output: "public/assets/real_os_security.png",
        width: 1662,
        height: 905,
        waitMs: 3000,
        title: "Security & Privacy Shield Dashboard",
      },
      {
        url: "http://localhost:5173/org-chart",
        output: "public/assets/real_os_hierarchy.png",
        width: 1662,
        height: 905,
        waitMs: 3000,
        title: "Swarm Agent Hierarchy Org Chart",
      },
    ];

    for (const item of captures) {
      console.log(`📸 Capturing ${item.title} (${item.url})...`);
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: item.width,
        height: item.height,
        deviceScaleFactor: 1,
        mobile: false,
      });

      await client.send("Page.navigate", { url: item.url });
      await delay(item.waitMs);

      // Wait for fonts & images
      await client.send("Runtime.evaluate", {
        expression: `Promise.all([
          document.fonts.ready,
          ...[...document.images].map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve())
        ])`,
        awaitPromise: true,
      });
      await delay(500);

      const screenshot = await client.send("Page.captureScreenshot", {
        format: "png",
        clip: { x: 0, y: 0, width: item.width, height: item.height, scale: 1 },
      });

      const outPath = path.resolve(item.output);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, "base64"));
      console.log(`  ✅ Saved: ${item.output} (${item.width}x${item.height})`);
    }

    client.close();
    console.log("🎉 All high-resolution screenshots captured successfully!");
  } finally {
    browser.kill();
    await delay(300);
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error("❌ Error during capture:", err);
  process.exit(1);
});
