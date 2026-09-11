import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('CSS Tokens & Theme Architecture in global.css', async (t) => {
  const globalCssPath = path.resolve('src/styles/global.css');
  assert.equal(fs.existsSync(globalCssPath), true, 'src/styles/global.css must exist');

  const css = fs.readFileSync(globalCssPath, 'utf8');

  await t.test('declares required @theme surface and accent colors', () => {
    const requiredColors = [
      '--color-zinc-950',
      '--color-zinc-900',
      '--color-zinc-800',
      '--color-emerald-400',
      '--color-cyan-400',
      '--color-purple-400',
      '--color-amber-400',
      '--color-red-400',
      '--color-cyber-green',
      '--color-neural-pulse',
    ];

    for (const color of requiredColors) {
      assert.match(
        css,
        new RegExp(`${color}:\\s*#[0-9a-fA-F]{6}`),
        `Missing or invalid color token: ${color}`,
      );
    }
  });

  await t.test('declares fluid typography and spacing tokens using clamp()', () => {
    const fluidTokens = [
      '--text-fluid-display',
      '--text-fluid-title',
      '--text-fluid-body',
      '--space-fluid-section',
      '--space-fluid-gap',
    ];

    for (const token of fluidTokens) {
      assert.match(
        css,
        new RegExp(`${token}:\\s*clamp\\([^)]+\\)`),
        `Missing or invalid fluid token: ${token}`,
      );
    }
  });

  await t.test('declares essential design system utilities and FX classes', () => {
    assert.match(css, /\.glass-surface\s*\{/, 'Missing .glass-surface class');
    assert.match(css, /\.neural-grid\s*\{/, 'Missing .neural-grid class');
    assert.match(css, /\.scanline-bg\s*\{/, 'Missing .scanline-bg class');
    assert.match(css, /\.slow-pulse-text\s*\{/, 'Missing .slow-pulse-text class');
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'Missing reduced-motion accessibility rule');
  });
});

test('Component Structure Integrity', (t) => {
  const componentDirs = [
    'src/components/layout',
    'src/components/ui',
    'src/components/features',
  ];

  for (const dir of componentDirs) {
    const dirPath = path.resolve(dir);
    assert.equal(fs.existsSync(dirPath), true, `Directory must exist: ${dir}`);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.astro'));
    assert.ok(files.length > 0, `Directory ${dir} must contain Astro components`);
  }
});

test('UI Component Exports & Attributes', () => {
  const uiComponents = [
    'src/components/ui/GlassCard.astro',
    'src/components/ui/StatusBadge.astro',
    'src/components/ui/SectionHeader.astro',
    'src/components/ui/HitlIntercept.astro',
    'src/components/ui/LightboxModal.astro',
  ];

  for (const file of uiComponents) {
    const fullPath = path.resolve(file);
    assert.equal(fs.existsSync(fullPath), true, `${file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 50, `${file} must not be empty`);
  }
});

