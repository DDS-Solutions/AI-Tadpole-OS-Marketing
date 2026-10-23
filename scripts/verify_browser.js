import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { BASE_PATH } from '../site.config.mjs';

const projectRoot = path.resolve('.');
const baseUrl = `http://127.0.0.1:4321${BASE_PATH}`;
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
  if (process.env.ALLOW_BROWSER_SKIP === '1') {
    console.log('⚠️ Chrome or Edge was not found. Skipping browser verification per ALLOW_BROWSER_SKIP=1.');
    process.exit(0);
  }
  throw new Error(
    process.env.CI
      ? 'Chrome or Edge was not found in CI. Set CHROME_PATH to run browser verification.'
      : 'Chrome or Edge was not found. Set CHROME_PATH or set ALLOW_BROWSER_SKIP=1 to bypass browser verification.',
  );
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitFor(check, timeoutMs, label) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      if (error && error.fatal) throw error;
      lastError = error;
    }
    await delay(100);
  }
  const reason = lastError ? ` Last error: ${lastError.message ?? lastError}` : '';
  throw new Error(`Timed out waiting for ${label}.${reason}`);
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

    this.socket.addEventListener('close', () => {
      const err = new Error('CDP WebSocket connection closed.');
      for (const pending of this.pending.values()) {
        pending.reject(err);
      }
      this.pending.clear();
    });

    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  send(method, params = {}, timeoutMs = 15_000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP command timed out after ${timeoutMs}ms: ${method}`));
        }
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
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

async function setViewport(client, width, height = 1000) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
}

async function saveScreenshot(client, filename, fullPage = false) {
  if (!process.env.SCREENSHOT_DIR) return;
  const directory = path.resolve(process.env.SCREENSHOT_DIR);
  fs.mkdirSync(directory, { recursive: true });
  if (fullPage) await evaluate(client, `[...document.images].forEach((image) => { image.loading = 'eager'; })`);
  await evaluate(client, `Promise.all([
    document.fonts.ready,
    ...[...document.images].filter((image) => image.loading !== 'lazy' || image.complete).map((image) => image.decode().catch(() => {})),
  ])`);
  const screenshotOptions = {
    format: 'png',
    captureBeyondViewport: fullPage,
  };
  if (fullPage) {
    const layout = await client.send('Page.getLayoutMetrics');
    const size = layout.cssContentSize ?? layout.contentSize;
    screenshotOptions.clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
  }
  const screenshot = await client.send('Page.captureScreenshot', screenshotOptions);
  fs.writeFileSync(path.join(directory, filename), Buffer.from(screenshot.data, 'base64'));
}

async function clickInternalLink(client, pathname) {
  await evaluate(client, `(() => {
    const link = [...document.querySelectorAll('a[href]')].find((candidate) => {
      const url = new URL(candidate.href);
      return url.origin === location.origin && url.pathname.replace(/\\/$/, '') === ${JSON.stringify(pathname.replace(/\/$/, ''))} && !url.hash;
    });
    if (!link) throw new Error('Missing internal navigation link.');
    link.click();
  })()`);
  await waitFor(() => evaluate(client, `location.pathname.replace(/\\/$/, '') === ${JSON.stringify(pathname.replace(/\/$/, ''))}`), 5000, 'client navigation');
  await delay(200);
}

const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tadpole-browser-'));
const astroPkgPath = path.join(projectRoot, 'node_modules', 'astro', 'package.json');
const astroPkg = JSON.parse(fs.readFileSync(astroPkgPath, 'utf8'));
const binRelative = typeof astroPkg.bin === 'string' ? astroPkg.bin : (astroPkg.bin?.astro || 'bin/astro.mjs');
const astroCli = path.join(projectRoot, 'node_modules', 'astro', binRelative);
let previewStderr = '';
const previewProcess = spawn(process.execPath, [astroCli, 'preview', '--host', '127.0.0.1'], {
  cwd: projectRoot,
  stdio: ['ignore', 'ignore', 'pipe'],
  windowsHide: true,
});
previewProcess.stderr?.on('data', (chunk) => {
  previewStderr += chunk.toString();
});

let browserProcess;
let client;

try {
  await waitFor(async () => {
    if (previewProcess.exitCode !== null) {
      const err = new Error(`Astro preview process exited prematurely with code ${previewProcess.exitCode}. Stderr: ${previewStderr.trim()}`);
      err.fatal = true;
      throw err;
    }
    return (await fetch(`${baseUrl}/`).catch(() => ({})))?.ok;
  }, 20_000, 'Astro preview');

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
  await setViewport(client, 1440);

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

  // Verify full content visibility for how-it-works architecture nodes without JavaScript
  await navigate(client, `${baseUrl}/how-it-works/`);
  const howItWorksHtml = await evaluate(client, 'document.body.innerText');
  for (const expectedTitle of ['Directives SOP', 'Agent 99 Router', 'Rust Core Engine', 'Sapphire Shield', 'LanceDB GraphRAG']) {
    assert.ok(howItWorksHtml.includes(expectedTitle), `how-it-works must include ${expectedTitle} without JavaScript.`);
  }

  // Verify full content visibility for all 6 mission steps without JavaScript
  await navigate(client, `${baseUrl}/mission/`);
  const missionHtml = await evaluate(client, 'document.body.innerText');
  for (const expectedStep of [
    'Swarm Init',
    'Neural Sync',
    'Mission Launch',
    'OTel Waterfall',
    'Oversight Gate',
    'Reconciliation',
  ]) {
    assert.ok(missionHtml.includes(expectedStep), `mission must include ${expectedStep} without JavaScript.`);
  }

  await client.send('Emulation.setScriptExecutionDisabled', { value: false });
  console.log('  ✓ Governance, architecture nodes, and all 6 mission steps remain visible with meaningful content without JavaScript');

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

  await evaluate(client, `document.getElementById('tab-sapphire').click()`);
  const approvalPreviewState = () => evaluate(client, `(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.textContent.includes('Preview approval'));
    return {
      disabled: button.disabled,
      pressed: button.getAttribute('aria-pressed'),
      status: button.parentElement.querySelector('[role="status"]').textContent,
    };
  })()`);
  assert.equal((await approvalPreviewState()).disabled, false, 'The approval preview must become interactive.');
  await evaluate(client, `([...document.querySelectorAll('button')].find((button) => button.textContent.includes('Preview approval'))).click()`);
  await delay(50);
  assert.equal((await approvalPreviewState()).pressed, 'true');
  assert.match((await approvalPreviewState()).status, /Preview approved/);
  await evaluate(client, `([...document.querySelectorAll('button')].find((button) => button.textContent.includes('Preview approval'))).click()`);
  await delay(50);
  assert.equal((await approvalPreviewState()).pressed, 'false');
  assert.equal((await approvalPreviewState()).status, '');
  console.log('  ✓ Governance approval preview provides feedback and resets');

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
      footerInert: document.querySelector('body > footer').hasAttribute('inert'),
      skipLinkInert: document.querySelector('body > a').hasAttribute('inert'),
      bodyLocked: document.body.style.overflow === 'hidden',
    };
  })()`);
  assert.deepEqual(openDialogState, {
    visible: true,
    focusInside: true,
    headerInert: true,
    footerInert: true,
    skipLinkInert: true,
    bodyLocked: true,
  });
  await pressKey(client, 'Tab');
  assert.equal(await evaluate(client, `document.querySelector('[role="dialog"]').contains(document.activeElement)`), true);
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
  await delay(50);
  assert.equal(await evaluate(client, `document.querySelector('[role="dialog"]').contains(document.activeElement)`), true);
  await pressKey(client, 'Escape');
  await delay(300);
  assert.equal(await evaluate(client, `getComputedStyle(document.querySelector('[role="dialog"]')).display`), 'none');
  console.log('  ✓ Lightbox traps focus (Tab/Shift+Tab), inerts header/footer/skip-link, and closes with Escape');

  if (process.env.SKIP_PLAYBACK_TIMING !== '1') {
    await navigate(client, `${baseUrl}/mission/`);
    await evaluate(client, `(() => {
      const toggle = document.querySelector('button[aria-pressed]');
      if (toggle.getAttribute('aria-pressed') === 'true') toggle.click();
      document.querySelector('[aria-label^="Active mission walkthrough slide"]').focus();
    })()`);
    const currentStep = () => evaluate(client, `Number(document.querySelector('[aria-roledescription="carousel"] [aria-current="step"]').getAttribute('aria-label').match(/Show step (\\d+)/)[1])`);
    const initialStep = await currentStep();
    await pressKey(client, 'ArrowRight');
    assert.equal(await currentStep(), initialStep % 6 + 1, 'One arrow press must advance exactly one mission step.');
    await pressKey(client, 'ArrowLeft');
    assert.equal(await currentStep(), initialStep, 'One left arrow must return to the previous mission step.');
    assert.equal(await evaluate(client, `document.querySelector('button[aria-pressed]').getAttribute('aria-pressed')`), 'false');

    await evaluate(client, `document.querySelector('button[aria-pressed]').click()`);
    await delay(4700);
    assert.equal(await currentStep(), initialStep, 'Keyboard focus must pause mission autoplay for the complete slide interval.');
    await evaluate(client, `document.activeElement.blur()`);
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 4, y: 4 });
    await waitFor(async () => (await currentStep()) !== initialStep, 5500, 'mission autoplay to resume after focus leaves');

    const hoverPoint = await evaluate(client, `(() => {
      const carousel = document.querySelector('[aria-roledescription="carousel"]');
      carousel.scrollIntoView({ behavior: 'instant', block: 'start' });
      const rect = carousel.getBoundingClientRect();
      return { x: Math.round(rect.left + 20), y: Math.round(Math.max(rect.top + 100, 100)) };
    })()`);
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...hoverPoint });
    const hoveredStep = await currentStep();
    await delay(4700);
    assert.equal(await currentStep(), hoveredStep, 'Pointer hover must pause mission autoplay.');
    await evaluate(client, `([...document.querySelectorAll('[aria-roledescription="carousel"] button')].find((button) => button.textContent.includes('Zoom'))).click()`);
    await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 4, y: 4 });
    await delay(4700);
    assert.equal(await currentStep(), hoveredStep, 'An open screenshot must pause mission autoplay.');
    await pressKey(client, 'Escape');
    console.log('  ✓ Mission arrows advance once and autoplay pauses for keyboard focus, hover, and screenshots');
  } else {
    console.log('  ↷ Mission playback timing skipped for the layout review');
  }

  const transitionEventStart = client.events.length;
  await navigate(client, `${baseUrl}/`);
  for (let cycle = 0; cycle < 2; cycle += 1) {
    await clickInternalLink(client, `${BASE_PATH}/governance`);
    await evaluate(client, `document.getElementById('tab-overlord').focus()`);
    await pressKey(client, 'ArrowRight');
    assert.equal(await evaluate(client, `document.querySelector('[role="tab"][aria-selected="true"]')?.id`), 'tab-sovereignty');
    await clickInternalLink(client, `${BASE_PATH}/`);
    await evaluate(client, `([...document.querySelectorAll('button')].find((button) => button.textContent.includes('Zoom Full Resolution'))).click()`);
    await delay(100);
    assert.equal(await evaluate(client, `document.querySelector('[role="dialog"]').contains(document.activeElement)`), true);
    await pressKey(client, 'Escape');
    await delay(300);
  }
  assert.equal(client.events.slice(transitionEventStart).filter((event) => event.method === 'Runtime.exceptionThrown').length, 0, 'Repeated client navigation must not emit runtime exceptions.');
  console.log('  ✓ Repeated client navigation retains tab and screenshot behavior');
  await saveScreenshot(client, 'homepage-desktop.png');
  await saveScreenshot(client, 'homepage-desktop-full.png', true);

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
  assert.equal(reducedMotionState.pressed, 'false');
  console.log('  ✓ Reduced-motion preference disables carousel autoplay');

  await client.send('Emulation.setEmulatedMedia', { features: [] });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await setViewport(client, width);
    for (const [name, url] of routes) {
      await navigate(client, url);
      const responsiveState = await evaluate(client, `(() => {
        const header = document.querySelector('body > header');
        const desktopNav = header.querySelector('nav[aria-label="Primary navigation"]');
        const mobileMenu = header.querySelector('details');
        const desktopVisible = getComputedStyle(desktopNav).display !== 'none';
        const menuVisible = getComputedStyle(mobileMenu).display !== 'none';
        const links = [...header.querySelectorAll('a')].filter((link) => link.getBoundingClientRect().width && !link.closest('details'));
        const rectangles = links.map((link) => link.getBoundingClientRect());
        const heroCopy = document.querySelector('.hero-copy');
        const headingRange = document.createRange();
        if (heroCopy) headingRange.selectNodeContents(heroCopy.querySelector('h1'));
        const copyBounds = heroCopy?.getBoundingClientRect();
        return {
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          oneNavigationVisible: desktopVisible !== menuVisible,
          overlappingHeaderLinks: rectangles.some((rect, index) => rectangles.slice(index + 1).some((other) => rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top)),
          headingFitsContent: !heroCopy || [...headingRange.getClientRects()].every((rect) => rect.left >= copyBounds.left - 1 && rect.right <= copyBounds.right + 1),
        };
      })()`);
      assert.deepEqual(responsiveState, { horizontalOverflow: false, oneNavigationVisible: true, overlappingHeaderLinks: false, headingFitsContent: true }, `${name} must fit the ${width}px viewport with usable navigation and unclipped hero text.`);
      if (width === 320 && name === 'homepage') await saveScreenshot(client, 'homepage-mobile-320.png');
    }
  }
  console.log('  ✓ Every route fits 320px, 375px, 768px, 1024px, and 1440px viewports without overlapping navigation');

  await setViewport(client, 375, 812);
  await navigate(client, `${baseUrl}/`);
  const mobileNavigationState = await evaluate(client, `({
    menuVisible: getComputedStyle(document.querySelector('header details')).display !== 'none',
    desktopNavHidden: getComputedStyle(document.querySelector('header nav[aria-label="Primary navigation"]')).display === 'none',
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  })`);
  assert.deepEqual(mobileNavigationState, { menuVisible: true, desktopNavHidden: true, horizontalOverflow: false });
  await saveScreenshot(client, 'homepage-mobile.png');
  await saveScreenshot(client, 'homepage-mobile-full.png', true);
  const openMobileMenu = async () => {
    await evaluate(client, `document.querySelector('header details summary').click()`);
    await waitFor(() => evaluate(client, `document.querySelector('header details').open`), 1000, 'mobile menu to open');
  };
  const menuIsClosed = () => evaluate(client, `!document.querySelector('header details').open`);
  await openMobileMenu();
  await pressKey(client, 'Escape');
  assert.equal(await menuIsClosed(), true, 'Escape must dismiss the mobile menu.');
  await openMobileMenu();
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 10, y: 400, button: 'left', clickCount: 1 });
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 10, y: 400, button: 'left', clickCount: 1 });
  assert.equal(await menuIsClosed(), true, 'Clicking outside must dismiss the mobile menu.');
  await openMobileMenu();
  await evaluate(client, `document.querySelector('nav[aria-label="Mobile navigation"] a').click()`);
  await waitFor(menuIsClosed, 2000, 'mobile menu to close after navigation');
  console.log('  ✓ Mobile navigation opens and dismisses with Escape, outside clicks, and link selection');

  await evaluate(client, `([...document.querySelectorAll('button')].find((button) => button.textContent.includes('Zoom Full Resolution'))).click()`);
  await delay(100);
  assert.equal(await evaluate(client, `(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog.scrollWidth <= dialog.clientWidth + 1 && document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
  })()`), true, 'The screenshot dialog must fit the mobile viewport.');
  await pressKey(client, 'Escape');
  console.log('  ✓ Screenshot dialog fits the 375px mobile viewport');

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
