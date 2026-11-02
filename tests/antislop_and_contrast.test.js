import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// WCAG 2.x Relative Luminance and Contrast Formula implementation
function srgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function calculateContrast(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test('Mathematical WCAG 2.x Contrast Verification', async (t) => {
  await t.test('conforms to standard W3C contrast test vectors', () => {
    // Pure black on pure white (maximum contrast)
    const maxContrast = calculateContrast('#000000', '#ffffff');
    assert.ok(Math.abs(maxContrast - 21.0) < 0.01, `Pure black/white contrast should be 21:1, got ${maxContrast}`);

    // Identical colors have contrast 1:1
    const minContrast = calculateContrast('#123456', '#123456');
    assert.equal(minContrast, 1.0, 'Identical colors must have 1:1 contrast');

    // Standard low-contrast failure case: #555555 on #000000 is ~2.82:1 (fails both normal and large text)
    const failPair = calculateContrast('#555555', '#000000');
    assert.ok(failPair < 3.0, `#555555 on black should fail 3.0:1, got ${failPair.toFixed(2)}`);

    // Standard near-threshold failure case: #777777 on #ffffff is ~4.48:1 (fails normal text 4.5:1)
    const thresholdPair = calculateContrast('#777777', '#ffffff');
    assert.ok(thresholdPair < 4.5, `#777777 on white should fail normal text 4.5:1, got ${thresholdPair.toFixed(2)}`);
  });

  await t.test('design system tokens satisfy WCAG AA contrast standards', () => {
    const globalCssPath = path.resolve('src/styles/global.css');
    const css = fs.readFileSync(globalCssPath, 'utf8');

    // Verify intentional zinc-500 override for accessibility
    assert.match(css, /--color-zinc-500:\s*#8f8f99;/, 'Must override zinc-500 to #8f8f99 to achieve >4.5:1 contrast on black');

    const pairs = [
      { name: 'Display & Heading on Canvas', fg: '#f4f4f5', bg: '#09090b', min: 4.5 },
      { name: 'Primary Body on Canvas', fg: '#d4d4d8', bg: '#09090b', min: 4.5 },
      { name: 'Muted Zinc-500 on Canvas', fg: '#8f8f99', bg: '#09090b', min: 4.5 },
      { name: 'Card Surface Copy on Container', fg: '#a1ada8', bg: '#18181b', min: 4.5 },
      { name: 'Primary Button Text on Emerald', fg: '#062018', bg: '#6ee7b7', min: 4.5 },
      { name: 'Focus Ring Outline on Canvas', fg: '#10b981', bg: '#09090b', min: 3.0 },
      { name: 'Subsystem Cyan Accent on Canvas', fg: '#06b6d4', bg: '#09090b', min: 3.0 },
    ];

    for (const pair of pairs) {
      const ratio = calculateContrast(pair.fg, pair.bg);
      assert.ok(
        ratio >= pair.min,
        `${pair.name} (${pair.fg} on ${pair.bg}) failed WCAG standard: got ${ratio.toFixed(2)}:1, expected >= ${pair.min}:1`,
      );
    }
  });
});

test('Anti-Slop Hard Gate Invariants & Copy Hygiene', async (t) => {
  const dataDir = path.resolve('src/data');
  const dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.ts'));

  await t.test('Rule R-02: zero forbidden em dashes (—) in shared datasets', () => {
    for (const file of dataFiles) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      assert.equal(
        content.includes('—'),
        false,
        `Forbidden em dash (—) detected in src/data/${file}. Use commas, colons, or parentheses per R-02.`,
      );
    }
  });

  await t.test('Rule R-16: zero empty marketing buzzwords in shared datasets', () => {
    const buzzwordRegex = /\b(seamless|cutting-edge|revolutionary|elevate|game-changer|next-level)\b/i;
    for (const file of dataFiles) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      const match = content.match(buzzwordRegex);
      assert.equal(
        match,
        null,
        `Forbidden AI marketing buzzword "${match?.[0]}" detected in src/data/${file} per R-16.`,
      );
    }
  });

  await t.test('Rule R-37: design direction specification exists with declared dials', () => {
    const designMdPath = path.resolve('design.md');
    assert.equal(fs.existsSync(designMdPath), true, 'design.md must exist in the project root per R-37');

    const content = fs.readFileSync(designMdPath, 'utf8');
    assert.match(content, /ENERGY/i, 'design.md must declare ENERGY dial');
    assert.match(content, /RHYTHM/i, 'design.md must declare RHYTHM dial');
    assert.match(content, /MOTION/i, 'design.md must declare MOTION dial');
  });
});
