import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { resolveBrowserPath } from './resolve_browser.js';

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
    this.socket.addEventListener('message', (event) => {
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
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}, timeoutMs = 30000) {
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

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tadpole-agent-capture-'));
  const browserArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${tempDir}`,
    'about:blank',
  ];

  console.log('🚀 Launching headless Chrome to retake agents screen...');
  const browser = spawn(browserPath, browserArgs, { stdio: 'ignore', windowsHide: true });

  try {
    const devToolsFile = path.join(tempDir, 'DevToolsActivePort');
    let port = null;
    const start = Date.now();
    while (Date.now() - start < 15000) {
      if (fs.existsSync(devToolsFile)) {
        port = Number(fs.readFileSync(devToolsFile, 'utf8').split(/\r?\n/)[0]);
        break;
      }
      await delay(100);
    }
    if (!port) throw new Error('Could not find DevToolsActivePort');

    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const pageTarget = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (!pageTarget) throw new Error('No page target found');

    const client = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('DOM.enable');

    const width = 1662;
    const height = 905;

    await client.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('📡 Navigating to http://localhost:5173/agents...');
    await client.send('Page.navigate', { url: 'http://localhost:5173/agents' });

    // Poll until LOADING MODULE is gone and content is populated
    console.log('⏳ Waiting for Agent Swarm Manager sector to hydrate...');
    let loaded = false;
    for (let attempt = 0; attempt < 25; attempt++) {
      await delay(800);
      const status = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const text = document.body.innerText || '';
          const isLoading = text.includes('LOADING MODULE') || text.includes('Initializing Sector');
          const hasAgents = text.includes('Agent of Nine') || text.includes('Tadpole Alpha') || text.includes('AI SWARM');
          return { isLoading, hasAgents, textLength: text.length };
        })()`,
        returnByValue: true,
      });

      const { isLoading, hasAgents, textLength } = status.result.value;
      console.log(`   [Attempt ${attempt + 1}] isLoading=${isLoading}, hasAgents=${hasAgents}, textLength=${textLength}`);
      if (!isLoading && hasAgents) {
        loaded = true;
        break;
      }
    }

    if (!loaded) {
      throw new Error('Timed out waiting for agents page to load fully');
    }

    // Wait for fonts & images to render
    await client.send('Runtime.evaluate', {
      expression: `Promise.all([
        document.fonts.ready,
        ...[...document.images].map(img => img.decode ? img.decode().catch(() => {}) : Promise.resolve())
      ])`,
      awaitPromise: true,
    }).catch(() => {});
    await delay(1000);

    console.log('📸 Capturing screenshot at 1662x905 (webp quality 92)...');
    const screenshot = await client.send('Page.captureScreenshot', {
      format: 'webp',
      quality: 92,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });

    const targetPath = path.resolve('public/assets/gallery/gallery_agents.webp');
    const buffer = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync(targetPath, buffer);

    console.log(`✅ Successfully saved: ${targetPath} (${Math.round(buffer.length / 1024)} KB)`);

    // Also copy to dist if dist exists so preview/tests match immediately
    const distPath = path.resolve('dist/assets/gallery/gallery_agents.webp');
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, buffer);
      console.log(`✅ Mirrored to: ${distPath}`);
    }

    client.close();
  } finally {
    browser.kill();
    await delay(300);
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('❌ Error during capture:', err);
  process.exit(1);
});

