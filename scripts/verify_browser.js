import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const projectRoot = path.resolve('.');
const baseUrl = 'http://127.0.0.1:4321/AI-Tadpole-OS-Marketing';
const browserCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!browserPath) {
  throw new Error('Chrome or Edge was not found. Set CHROME_PATH to run browser verification.');
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch {
      // The preview server and DevTools endpoint may not be ready yet.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
    this.events = [];
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
        return;
      }

      if (message.method) {
        this.events.push(message);
        const waiters = this.waiters.get(message.method) ?? [];
        this.waiters.delete(message.method);
        waiters.forEach((resolve) => resolve(message.params));
      }
    });

    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs = 10_000) {
    return new Promise((resolve, reject) => {
      const waiters = this.waiters.get(method) ?? [];
      waiters.push(resolve);
      this.waiters.set(method, waiters);
      const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}.`)), timeoutMs);
      waiters[waiters.length - 1] = (value) => {
        clearTimeout(timeout);
        resolve(value);
      };
    });
  }

  close() {
    this.socket?.close();
  }
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text ?? 'Browser evaluation failed.');
  }
  return response.result.value;
}

async function navigate(client, url) {
  const loaded = client.waitForEvent('Page.loadEventFired');
  await client.send('Page.navigate', { url });
  await loaded;
  await delay(150);
}

async function pressKey(client, key, code = key) {
  const virtualKeyCodes = {
    ArrowLeft: 37,
    ArrowRight: 39,
    End: 35,
    Escape: 27,
    Home: 36,
    Tab: 9,
  };
  const windowsVirtualKeyCode = virtualKeyCodes[key] ?? 0;
  const keyEvent = {
    key,
    code,
    windowsVirtualKeyCode,
    nativeVirtualKeyCode: windowsVirtualKeyCode,
  };
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...keyEvent });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyEvent });
  await delay(50);
}

const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tadpole-browser-'));
const astroCli = path.join(projectRoot, 'node_modules', 'astro', 'astro.js');
const previewProcess = spawn(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1'], {
  cwd: projectRoot,
  stdio: 'ignore',
  windowsHide: true,
});

let browserProcess;
let client;

try {
  await waitFor(async () => (await fetch(`${baseUrl}/`)).ok, 20_000, 'Astro preview');

  const browserArgs = [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDirectory}`,
  ];
  if (process.platform !== 'win32') browserArgs.push('--no-sandbox');
  browserArgs.push(`${baseUrl}/`);

  browserProcess = spawn(browserPath, browserArgs, {
    stdio: 'ignore',
    windowsHide: true,
  });

  const devToolsFile = path.join(profileDirectory, 'DevToolsActivePort');
  const port = await waitFor(() => {
    if (!fs.existsSync(devToolsFile)) return null;
    return Number(fs.readFileSync(devToolsFile, 'utf8').split(/\r?\n/)[0]);
  }, 15_000, 'Chrome DevTools');

  const pageTarget = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    return targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
  }, 10_000, 'browser page target');

  client = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Accessibility.enable');
  await client.send('DOM.enable');
  await client.send('CSS.enable');

  const routes = [
    ['homepage', `${baseUrl}/`],
    ['how-it-works', `${baseUrl}/how-it-works/`],
    ['mission', `${baseUrl}/mission/`],
    ['governance', `${baseUrl}/governance/`],
    ['404', `${baseUrl}/404.html`],
  ];

  for (const [name, url] of routes) {
    const eventStart = client.events.length;
    await navigate(client, url);
    const pageState = await evaluate(client, `(() => ({
      h1Count: document.querySelectorAll('h1').length,
      visibleH1: [...document.querySelectorAll('h1')].every((heading) => heading.getBoundingClientRect().height > 0),
      missingImageDimensions: [...document.querySelectorAll('img[src]')].filter((image) => !image.hasAttribute('width') || !image.hasAttribute('height')).length,
      unnamedButtons: [...document.querySelectorAll('button')].filter((button) => !button.textContent.trim() && !button.getAttribute('aria-label')).length,
      missingButtonTypes: document.querySelectorAll('button:not([type])').length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }))()`);

    assert.equal(pageState.h1Count, 1, `${name} must contain one h1.`);
    assert.equal(pageState.visibleH1, true, `${name} h1 must be visible.`);
    assert.equal(pageState.missingImageDimensions, 0, `${name} has images without dimensions.`);
    assert.equal(pageState.unnamedButtons, 0, `${name} has unnamed buttons.`);
    assert.equal(pageState.missingButtonTypes, 0, `${name} has buttons without an explicit type.`);
    assert.equal(pageState.horizontalOverflow, false, `${name} has horizontal viewport overflow.`);

    const accessibilityTree = await client.send('Accessibility.getFullAXTree');
    const unnamedInteractiveNodes = accessibilityTree.nodes.filter((node) => {
      const role = node.role?.value;
      return (role === 'button' || role === 'link') && !node.name?.value;
    });
    assert.equal(unnamedInteractiveNodes.length, 0, `${name} has unnamed interactive accessibility nodes.`);

    const runtimeErrors = client.events.slice(eventStart).filter((event) => event.method === 'Runtime.exceptionThrown');
    assert.equal(runtimeErrors.length, 0, `${name} emitted a runtime exception.`);
    console.log(`  ✓ ${name}: rendered, named controls, image dimensions, and accessibility tree`);
  }

  await client.send('Emulation.setScriptExecutionDisabled', { value: true });
  for (const [name, url, expectedPanelCount] of [
    ['governance', `${baseUrl}/governance/`, 4],
    ['how-it-works', `${baseUrl}/how-it-works/`, 5],
  ]) {
    await navigate(client, url);
    const documentNode = await client.send('DOM.getDocument', { depth: -1 });
    const panelNodes = await client.send('DOM.querySelectorAll', {
      nodeId: documentNode.root.nodeId,
      selector: '[role="tabpanel"]',
    });
    assert.equal(panelNodes.nodeIds.length, expectedPanelCount, `${name} no-JavaScript panel count changed.`);
    for (const nodeId of panelNodes.nodeIds) {
      const styles = await client.send('CSS.getComputedStyleForNode', { nodeId });
      const display = styles.computedStyle.find((style) => style.name === 'display')?.value;
      assert.notEqual(display, 'none', `${name} hides a substantive panel without JavaScript.`);
    }
  }
  await client.send('Emulation.setScriptExecutionDisabled', { value: false });
  console.log('  ✓ Governance and architecture content remains visible without JavaScript');

  await navigate(client, `${baseUrl}/governance/`);
  await evaluate(client, `document.getElementById('tab-overlord').focus()`);
  await pressKey(client, 'ArrowRight');
  const governanceTabState = await waitFor(async () => {
    const state = await evaluate(client, `({
      focused: document.activeElement.id,
      selected: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
    })`);
    if (state.focused === 'tab-sovereignty' && state.selected === 'tab-sovereignty') return state;
    return null;
  }, 3000, 'governance tab focus change');
  assert.deepEqual(governanceTabState, {
    focused: 'tab-sovereignty',
    selected: 'tab-sovereignty',
  });
  console.log('  ✓ Governance tabs support roving keyboard focus');

  await navigate(client, `${baseUrl}/how-it-works/`);
  await evaluate(client, `document.getElementById('arch-tab-directive').focus()`);
  await pressKey(client, 'End');
  const architectureTabState = await waitFor(async () => {
    const state = await evaluate(client, `({
      focused: document.activeElement.id,
      selected: document.querySelector('[aria-label="Architecture pipeline layers"] [role="tab"][aria-selected="true"]')?.id,
    })`);
    if (state.focused === 'arch-tab-memory' && state.selected === 'arch-tab-memory') return state;
    return null;
  }, 3000, 'architecture tab focus change');
  assert.deepEqual(architectureTabState, {
    focused: 'arch-tab-memory',
    selected: 'arch-tab-memory',
  });
  console.log('  ✓ Architecture tabs support Home/End keyboard focus');

  await navigate(client, `${baseUrl}/`);
  await evaluate(client, `([...document.querySelectorAll('button')].find((button) => button.textContent.includes('Zoom Full Resolution'))).click()`);
  await delay(100);
  const openDialogState = await evaluate(client, `(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return {
      visible: getComputedStyle(dialog).display !== 'none',
      focusInside: dialog.contains(document.activeElement),
      headerInert: document.querySelector('header').hasAttribute('inert'),
      bodyLocked: document.body.style.overflow === 'hidden',
    };
  })()`);
  assert.deepEqual(openDialogState, {
    visible: true,
    focusInside: true,
    headerInert: true,
    bodyLocked: true,
  });
  await pressKey(client, 'Tab');
  assert.equal(await evaluate(client, `document.querySelector('[role="dialog"]').contains(document.activeElement)`), true);
  await pressKey(client, 'Escape');
  await delay(300);
  assert.equal(await evaluate(client, `getComputedStyle(document.querySelector('[role="dialog"]')).display`), 'none');
  console.log('  ✓ Lightbox traps focus, inerts the background, and closes with Escape');

  await client.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await navigate(client, `${baseUrl}/mission/`);
  const reducedMotionState = await evaluate(client, `(() => {
    const toggle = document.querySelector('button[aria-pressed]');
    return {
      label: toggle.textContent.trim(),
      pressed: toggle.getAttribute('aria-pressed'),
    };
  })()`);
  assert.match(reducedMotionState.label, /Auto-Play Slideshow/);
  assert.equal(reducedMotionState.pressed, 'true');
  console.log('  ✓ Reduced-motion preference disables carousel autoplay');

  await client.send('Emulation.setEmulatedMedia', { features: [] });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await navigate(client, `${baseUrl}/`);
  const mobileNavigationState = await evaluate(client, `({
    menuVisible: getComputedStyle(document.querySelector('header details')).display !== 'none',
    desktopNavHidden: getComputedStyle(document.querySelector('header nav[aria-label="Primary navigation"]')).display === 'none',
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  })`);
  assert.deepEqual(mobileNavigationState, { menuVisible: true, desktopNavHidden: true, horizontalOverflow: false });
  console.log('  ✓ Mobile navigation switches at a 375px viewport');

  console.log('\n✅ BROWSER VERIFICATION PASSED');
} finally {
  try {
    client?.close();
  } catch {}
  try {
    browserProcess?.kill();
  } catch {}
  try {
    previewProcess?.kill();
  } catch {}
  await delay(300);
  try {
    fs.rmSync(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    // Ignore profile directory deletion errors if the browser holds temporary locks
  }
}
