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

const SCREENS = [
  {
    id: "dashboard",
    url: "http://localhost:5173/dashboard",
    output: "public/assets/gallery/gallery_dashboard.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Operations Command Center",
    category: "core-ops",
  },
  {
    id: "org-chart",
    url: "http://localhost:5173/org-chart",
    output: "public/assets/gallery/gallery_org_chart.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Swarm Agent Hierarchy Org Chart",
    category: "core-ops",
  },
  {
    id: "missions-live",
    url: "http://localhost:5173/missions",
    output: "public/assets/gallery/gallery_missions_live.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Missions Live Operations Board",
    category: "core-ops",
  },
  {
    id: "missions-history",
    url: "http://localhost:5173/missions?view=history",
    output: "public/assets/gallery/gallery_missions_history.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Missions Flight Recorder & Run History",
    category: "core-ops",
  },
  {
    id: "smb-practice",
    url: "http://localhost:5173/smb-practice",
    output: "public/assets/gallery/gallery_smb_practice.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "SMB Practice Digital Twin Sandbox",
    category: "core-ops",
  },
  {
    id: "scheduled-jobs",
    url: "http://localhost:5173/scheduled-jobs",
    output: "public/assets/gallery/gallery_scheduled_jobs.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Scheduled Jobs Cron Automation",
    category: "core-ops",
  },
  {
    id: "oversight",
    url: "http://localhost:5173/oversight",
    output: "public/assets/gallery/gallery_oversight.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Sapphire Shield Oversight & Action Ledger",
    category: "governance",
  },
  {
    id: "security",
    url: "http://localhost:5173/security",
    output: "public/assets/gallery/gallery_security.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Security & Privacy Shield Dashboard",
    category: "governance",
  },
  {
    id: "standups",
    url: "http://localhost:5173/standups",
    output: "public/assets/gallery/gallery_standups.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Voice Interface & Agent Standups Hub",
    category: "comms-workspace",
  },
  {
    id: "workspaces",
    url: "http://localhost:5173/workspaces",
    output: "public/assets/gallery/gallery_workspaces.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Workspaces & Cluster File System",
    category: "comms-workspace",
  },
  {
    id: "models",
    url: "http://localhost:5173/models",
    output: "public/assets/gallery/gallery_models.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Model Providers & Vault Manager",
    category: "intelligence",
  },
  {
    id: "model-store",
    url: "http://localhost:5173/infra/model-store",
    output: "public/assets/gallery/gallery_model_store.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Intelligence Model Store Weights",
    category: "intelligence",
  },
  {
    id: "store",
    url: "http://localhost:5173/store",
    output: "public/assets/gallery/gallery_store.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Industry Templates Marketplace",
    category: "intelligence",
  },
  {
    id: "mcp-store",
    url: "http://localhost:5173/mcp-store",
    output: "public/assets/gallery/gallery_mcp_store.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "MCP Connectors Registry Hub",
    category: "intelligence",
  },
  {
    id: "customer-catalog",
    url: "http://localhost:5173/customer-catalog",
    output: "public/assets/gallery/gallery_customer_catalog.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Customer Catalog & Outward A2A Gateway",
    category: "intelligence",
  },
  {
    id: "neural-map",
    url: "http://localhost:5173/intelligence/map",
    output: "public/assets/gallery/gallery_neural_map.webp",
    width: 1662,
    height: 905,
    waitMs: 3500,
    title: "Neural Knowledge Map & Symbol Graph",
    category: "intelligence",
  },
  {
    id: "agents",
    url: "http://localhost:5173/agents",
    output: "public/assets/gallery/gallery_agents.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Swarm Agent Directory & Roster",
    category: "intelligence",
  },
  {
    id: "skills",
    url: "http://localhost:5173/skills",
    output: "public/assets/gallery/gallery_skills.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Swarm Skills & Tools Matrix",
    category: "intelligence",
  },
  {
    id: "engine",
    url: "http://localhost:5173/engine",
    output: "public/assets/gallery/gallery_engine.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Sovereign Axum Engine Telemetry",
    category: "engine-system",
  },
  {
    id: "benchmarks",
    url: "http://localhost:5173/benchmarks",
    output: "public/assets/gallery/gallery_benchmarks.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Performance & Token Benchmarks",
    category: "engine-system",
  },
  {
    id: "analytics",
    url: "http://localhost:5173/analytics",
    output: "public/assets/gallery/gallery_analytics.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Swarm Dual-Trace Playback & Analytics",
    category: "engine-system",
  },
  {
    id: "docs",
    url: "http://localhost:5173/docs",
    output: "public/assets/gallery/gallery_docs.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "System Documentation & Field Manual",
    category: "engine-system",
  },
  {
    id: "settings",
    url: "http://localhost:5173/settings",
    output: "public/assets/gallery/gallery_settings.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "OS Settings & Environmental Variables",
    category: "engine-system",
  },
  {
    id: "swarm-pulse",
    url: "http://localhost:5173/detached/swarm-pulse",
    output: "public/assets/gallery/gallery_swarm_pulse.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Detached Swarm Pulse Real-Time Stream",
    category: "engine-system",
  },
  {
    id: "detached-chat",
    url: "http://localhost:5173/detached/chat",
    output: "public/assets/gallery/gallery_detached_chat.webp",
    width: 1662,
    height: 905,
    waitMs: 3000,
    title: "Detached Sovereign Chat Dialog Terminal",
    category: "engine-system",
  },
  {
    id: "engine-health",
    url: "http://localhost:8000/v1/engine/health",
    output: "public/assets/gallery/gallery_engine_health.webp",
    width: 1662,
    height: 905,
    waitMs: 1500,
    title: "Axum Rust Kernel Health API Endpoint",
    category: "engine-system",
  },
];

async function main() {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "tadpole-gallery-capture-"),
  );
  const browserArgs = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${tempDir}`,
    "about:blank",
  ];

  console.log("🚀 Launching headless Chrome for full gallery capture...");
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

    const galleryDir = path.resolve("public/assets/gallery");
    fs.mkdirSync(galleryDir, { recursive: true });

    let count = 0;
    for (const item of SCREENS) {
      count++;
      console.log(
        `📸 [${count}/${SCREENS.length}] Capturing ${item.title} (${item.url})...`,
      );
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: item.width,
        height: item.height,
        deviceScaleFactor: 1,
        mobile: false,
      });

      await client.send("Page.navigate", { url: item.url });
      await delay(item.waitMs);

      // Wait for dynamic lazy-loaded modules and fonts & images if web page
      if (item.url.includes("localhost:5173")) {
        for (let waitAttempt = 0; waitAttempt < 15; waitAttempt++) {
          const loadingCheck = await client
            .send("Runtime.evaluate", {
              expression: `Boolean(document.body && (document.body.innerText.includes('LOADING MODULE') || document.body.innerText.includes('Initializing Sector...')))`,
            })
            .catch(() => ({ result: { value: false } }));
          if (!loadingCheck?.result?.value) break;
          await delay(800);
        }

        await client
          .send("Runtime.evaluate", {
            expression: `Promise.all([
            document.fonts.ready,
            ...[...document.images].map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve())
          ])`,
            awaitPromise: true,
          })
          .catch(() => {});
        await delay(500);
      }

      const screenshot = await client.send("Page.captureScreenshot", {
        format: "webp",
        quality: 92,
        clip: { x: 0, y: 0, width: item.width, height: item.height, scale: 1 },
      });

      const outPath = path.resolve(item.output);
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, "base64"));
      const fileSizeKb = Math.round((screenshot.data.length * 0.75) / 1024);
      console.log(`  ✅ Saved: ${item.output} (~${fileSizeKb} KB)`);
    }

    client.close();
    console.log(
      `\n🎉 All ${SCREENS.length} gallery screenshots captured successfully!`,
    );
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
