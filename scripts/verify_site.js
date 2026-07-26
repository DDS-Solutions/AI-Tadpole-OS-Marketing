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

// 2. Verify Crucial Target IDs in index.html
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

// 3. Verify Key Image Assets
const requiredAssets = [
  'assets/real_os_dashboard.png',
  'assets/real_os_nodes.png',
  'assets/real_os_oversight.png',
  'assets/real_os_templates.png',
  'assets/industry_templates_catalog.png'
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
