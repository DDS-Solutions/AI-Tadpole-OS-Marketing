import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const basePath = '/AI-Tadpole-OS-Marketing';
const siteUrl = 'https://dds-solutions.github.io/AI-Tadpole-OS-Marketing/';
let errors = 0;

function pass(message) {
  console.log(`  ✓ ${message}`);
}

function fail(message) {
  console.error(`  ❌ ${message}`);
  errors += 1;
}

function requireCondition(condition, successMessage, failureMessage = successMessage) {
  if (condition) pass(successMessage);
  else fail(failureMessage);
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function resolveBuiltReference(reference, currentPage) {
  const [pathAndQuery, hash = ''] = reference.split('#');
  const pathname = pathAndQuery.split('?')[0];
  let targetPage = currentPage;

  if (pathname) {
    if (!pathname.startsWith(basePath)) return null;
    const relative = pathname.slice(basePath.length).replace(/^\//, '');
    if (!relative) targetPage = 'index.html';
    else if (relative.endsWith('/')) targetPage = path.join(relative, 'index.html');
    else if (path.extname(relative)) targetPage = relative;
    else targetPage = path.join(relative, 'index.html');
  }

  return { targetPage: targetPage.replaceAll('/', path.sep), hash };
}

console.log('🧪 Starting marketing-site verification...\n');

requireCondition(fs.existsSync(distDir), 'Production build directory exists', 'Missing dist directory; run npm run build first.');
if (!fs.existsSync(distDir)) process.exit(1);

const pages = [
  { name: 'homepage', file: 'index.html' },
  { name: 'how-it-works', file: 'how-it-works/index.html' },
  { name: 'mission', file: 'mission/index.html' },
  { name: 'governance', file: 'governance/index.html' },
  { name: '404', file: '404.html' },
];

const htmlByPage = new Map();
for (const page of pages) {
  const filePath = path.join(distDir, page.file);
  requireCondition(fs.existsSync(filePath), `${page.name} route exists`, `Missing route: dist/${page.file}`);
  if (fs.existsSync(filePath)) htmlByPage.set(page.file, fs.readFileSync(filePath, 'utf8'));
}

for (const page of pages) {
  const html = htmlByPage.get(page.file);
  if (!html) continue;

  requireCondition(html.includes('id="main"'), `${page.name} has a skip-link target`);
  requireCondition((html.match(/<h1\b/g) ?? []).length === 1, `${page.name} has exactly one h1`);
  requireCondition(!html.includes('unpkg.com/alpinejs'), `${page.name} bundles Alpine locally`);
  requireCondition(!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com'), `${page.name} makes no third-party font request`);
  requireCondition(!html.includes('/favicon.svg') && !html.includes('program-logo.png'), `${page.name} uses optimized Tadpole brand assets`);
  requireCondition(/rel="canonical" href="[^"]+\/"/.test(html), `${page.name} canonical URL ends with a slash`);
  requireCondition(html.includes(`"@id":"${siteUrl}#software"`) && html.includes(`"url":"${siteUrl}"`), `${page.name} uses a stable SoftwareApplication identity`);
  requireCondition(html.includes('og:image:width" content="1200"') && html.includes('og:image:height" content="630"'), `${page.name} declares social-card dimensions`);

  const images = html.match(/<img\b[^>]*>/g) ?? [];
  requireCondition(images.every((image) => /(?:\s|:)alt=/.test(image)), `${page.name} images have alternative-text attributes`);
  requireCondition(images.every((image) => /\swidth=/.test(image) && /\sheight=/.test(image)), `${page.name} images reserve layout dimensions`);

  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  requireCondition(buttons.every((button) => /\stype="button"/.test(button)), `${page.name} buttons declare type="button"`);
  requireCondition(!/<[^>]+role="tabpanel"[^>]*x-cloak[^>]*>/.test(html), `${page.name} tab panels remain available without JavaScript`);

  const referencePattern = /(?<!:)\b(?:href|src)="([^"]+)"/g;
  for (const match of html.matchAll(referencePattern)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(reference)) continue;
    if (!reference.startsWith(basePath) && !reference.startsWith('#')) continue;

    const resolved = resolveBuiltReference(reference, page.file);
    if (!resolved) continue;
    const targetPath = path.join(distDir, resolved.targetPage);
    if (!fs.existsSync(targetPath)) {
      fail(`${page.name} has a broken internal reference: ${reference}`);
      continue;
    }

    if (resolved.hash && path.extname(targetPath) === '.html') {
      const targetHtml = fs.readFileSync(targetPath, 'utf8');
      const escapedHash = resolved.hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`id="${escapedHash}"`).test(targetHtml)) {
        fail(`${page.name} links to missing anchor: ${reference}`);
      }
    }
  }
}

requireCondition(htmlByPage.get('404.html')?.includes('name="robots" content="noindex, nofollow"'), '404 route is excluded from indexing');
requireCondition(htmlByPage.get('mission/index.html')?.includes('Swarm &amp; Cluster Initialization'), 'Mission default slide is server-rendered');
requireCondition(htmlByPage.get('how-it-works/index.html')?.includes('Tree-sitter / YAML-rs'), 'Architecture default card is server-rendered');

const allBuiltFiles = walkFiles(distDir);
const textExtensions = new Set(['.html', '.js', '.css', '.txt', '.md', '.xml', '.json']);
const publicText = allBuiltFiles
  .filter((file) => textExtensions.has(path.extname(file).toLowerCase()))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');

requireCondition(!/file:\/\/\/|[A-Za-z]:[\\/]Users[\\/]|Home Office_PC|antigravity[\\/]playground/.test(publicText), 'Published files contain no local workstation paths');
requireCondition(!fs.existsSync(path.join(distDir, 'design.md')) && !fs.existsSync(path.join(distDir, 'DESIGN_SYNERGY.md')), 'Internal design documents are not published');
requireCondition(!/10k\+ Req\/sec|< 5ms Intercept|< 8ms p99|SOC2 \/ HIPAA Ready|50 Specialist Hours \/ Day/.test(publicText), 'Unqualified benchmark and certification claims are absent');

const requiredAssets = [
  'assets/brand/tadpole-mark-48.png',
  'assets/brand/tadpole-mark-96.png',
  'assets/brand/tadpole-mark-192.png',
  'assets/brand/ai-tadpole-os-social-card.jpg',
  'assets/real_os_dashboard.png',
  'assets/real_os_nodes.png',
  'assets/real_os_oversight.png',
  'assets/industry_templates_catalog.png',
  'assets/real_mission/step1_initial_state.png',
  'assets/real_mission/step2_neural_proposal.png',
  'assets/real_mission/step3_execution_started.png',
  'assets/real_mission/step4_execution_streaming.png',
  'assets/real_mission/step5_oversight_zero_trust_gate.png',
  'assets/real_mission/step6_execution_resumed.png',
];
for (const asset of requiredAssets) {
  requireCondition(fs.existsSync(path.join(distDir, asset)), `Asset exists: ${asset}`);
}

const headerMarkBytes = fs.statSync(path.join(distDir, 'assets/brand/tadpole-mark-96.png')).size;
const socialCardBytes = fs.statSync(path.join(distDir, 'assets/brand/ai-tadpole-os-social-card.jpg')).size;
const totalBuildBytes = allBuiltFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
requireCondition(headerMarkBytes < 50 * 1024, `Header mark is within 50 KiB (${(headerMarkBytes / 1024).toFixed(1)} KiB)`);
requireCondition(socialCardBytes < 300 * 1024, `Social card is within 300 KiB (${(socialCardBytes / 1024).toFixed(1)} KiB)`);
requireCondition(totalBuildBytes < 8 * 1024 * 1024, `Deployment artifact is within 8 MiB (${(totalBuildBytes / 1024 / 1024).toFixed(2)} MiB)`);

const sitemapPath = path.join(distDir, 'sitemap.xml');
requireCondition(fs.existsSync(sitemapPath), 'Generated sitemap exists');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const route of ['', 'how-it-works/', 'mission/', 'governance/']) {
    requireCondition(sitemap.includes(`<loc>${siteUrl}${route}</loc>`), `Sitemap includes ${route || 'homepage'}`);
  }
  requireCondition(!sitemap.includes('/404'), 'Sitemap excludes the 404 route');
  requireCondition(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap), 'Sitemap contains generated modification dates');
}

requireCondition(publicText.includes('Performance, security, and regulatory outcomes depend on deployment configuration'), 'Agent-facing documentation qualifies performance and compliance claims');

console.log('\n--- VERIFICATION RESULT ---');
if (errors === 0) {
  console.log('✅ MARKETING SITE VERIFICATION PASSED');
  process.exit(0);
}

console.error(`❌ ${errors} verification failure${errors === 1 ? '' : 's'} detected`);
process.exit(1);
