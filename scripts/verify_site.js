import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

console.log('🧪 Starting Automated Site Parity & Verification Audit...\n');

let errors = 0;

// 1. Verify Pages Built
const pages = [
  'index.html',
  'how-it-works/index.html',
  'mission/index.html',
  'governance/index.html'
];

pages.forEach(page => {
  const filePath = path.join(distDir, page);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    console.log(`  ✓ Page Route Exists: dist/${page} (${(stat.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`  ❌ MISSING PAGE: dist/${page}`);
    errors++;
  }
});

// 2. Verify crucial target IDs in index.html
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  const requiredIds = ['runtime', 'interface', 'templates', 'roadmap'];
  requiredIds.forEach(id => {
    if (indexHtml.includes(`id="${id}"`)) {
      console.log(`  ✓ Anchor ID Exists: #${id} in index.html`);
    } else {
      console.error(`  ❌ MISSING ANCHOR ID: #${id} in index.html`);
      errors++;
    }
  });
}

// 3. Verify every page has an accessible main-content target and contains no
// unrendered Markdown or dependency on the previous remote Alpine CDN.
pages.forEach(page => {
  const filePath = path.join(distDir, page);
  if (!fs.existsSync(filePath)) return;

  const html = fs.readFileSync(filePath, 'utf-8');
  if (!html.includes('id="main"')) {
    console.error(`  ❌ MISSING MAIN TARGET: dist/${page}`);
    errors++;
  } else {
    console.log(`  ✓ Main Content Target Exists: dist/${page}`);
  }

  if (html.includes('**')) {
    console.error(`  ❌ UNRENDERED MARKDOWN: dist/${page}`);
    errors++;
  } else {
    console.log(`  ✓ No Unrendered Markdown: dist/${page}`);
  }

  if (html.includes('unpkg.com/alpinejs')) {
    console.error(`  ❌ REMOTE ALPINE CDN FOUND: dist/${page}`);
    errors++;
  } else {
    console.log(`  ✓ Alpine Bundled Locally: dist/${page}`);
  }
});

const llmsPath = path.join(distDir, 'llms.txt');
if (fs.existsSync(llmsPath)) {
  const llms = fs.readFileSync(llmsPath, 'utf-8');
  if (llms.includes('223 specialized agent roles across 25 industry template collections')) {
    console.log('  ✓ Template Catalog Claim Is Aligned: dist/llms.txt');
  } else {
    console.error('  ❌ OUTDATED TEMPLATE CATALOG CLAIM: dist/llms.txt');
    errors++;
  }
}

// 4. Verify key image assets
const requiredAssets = [
  'assets/real_os_dashboard.png',
  'assets/real_os_nodes.png',
  'assets/real_os_oversight.png',
  'assets/real_os_templates.png',
  'assets/industry_templates_catalog.png',
  'assets/moat-visual.png',
  'assets/program-logo.png',
  'assets/real_mission/step1_initial_state.png',
  'assets/real_mission/step2_neural_proposal.png',
  'assets/real_mission/step3_execution_started.png',
  'assets/real_mission/step4_execution_streaming.png',
  'assets/real_mission/step5_oversight_zero_trust_gate.png',
  'assets/real_mission/step5_execution_paused.png',
  'assets/real_mission/step6_execution_resumed.png'
];

requiredAssets.forEach(asset => {
  const assetPath = path.join(distDir, asset);
  if (fs.existsSync(assetPath)) {
    const stat = fs.statSync(assetPath);
    console.log(`  ✓ Image Asset Verified: dist/${asset} (${(stat.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`  ❌ MISSING ASSET: dist/${asset}`);
    errors++;
  }
});

console.log('\n--- VERIFICATION RESULT ---');
if (errors === 0) {
  console.log('✅ ALL VERIFICATION TESTS PASSED (100% Site Parity Verified)');
  process.exit(0);
} else {
  console.error(`❌ ${errors} VERIFICATION FAILS DETECTED`);
  process.exit(1);
}
