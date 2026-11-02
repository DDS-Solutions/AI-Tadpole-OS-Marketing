import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Gallery & Media Asset Integrity', async (t) => {
  const { GALLERY_ITEMS, GALLERY_CATEGORIES } = await import('../src/data/gallery-items.ts');

  await t.test('declares valid gallery categories', () => {
    assert.ok(Array.isArray(GALLERY_CATEGORIES), 'GALLERY_CATEGORIES must be an array');
    assert.ok(GALLERY_CATEGORIES.length >= 5, 'Must provide at least 5 category filters');

    const allCat = GALLERY_CATEGORIES.find((c) => c.id === 'all');
    assert.ok(allCat, 'Must contain "all" category filter');
    assert.equal(allCat.countLabel, String(GALLERY_ITEMS.length), 'All category count must match total items');

    const specificCategories = GALLERY_CATEGORIES.filter((c) => c.id !== 'all');
    const categorySum = specificCategories.reduce((sum, c) => sum + Number(c.countLabel), 0);
    assert.equal(categorySum, GALLERY_ITEMS.length, 'Sum of category item counts must equal total gallery items');
  });

  await t.test('gallery items contain 26 distinct, complete screens', () => {
    assert.equal(GALLERY_ITEMS.length, 26, 'Must provide exactly 26 gallery items');

    const ids = new Set();
    const routes = new Set();
    const validCategoryIds = new Set(GALLERY_CATEGORIES.filter((c) => c.id !== 'all').map((c) => c.id));

    GALLERY_ITEMS.forEach((item, index) => {
      // Uniqueness checks
      assert.ok(item.id, `Item ${index} missing id`);
      assert.equal(ids.has(item.id), false, `Duplicate item id detected: ${item.id}`);
      ids.add(item.id);

      assert.ok(item.route, `Item ${item.id} missing route`);
      assert.equal(routes.has(item.route), false, `Duplicate route detected: ${item.route}`);
      routes.add(item.route);

      // Metadata completeness
      assert.ok(item.title && item.title.trim().length > 3, `Item ${item.id} title too short`);
      assert.ok(item.subtitle && item.subtitle.trim().length > 5, `Item ${item.id} subtitle too short`);
      assert.ok(item.badge && item.badge.trim().length > 2, `Item ${item.id} missing badge`);
      assert.ok(item.description && item.description.trim().length > 20, `Item ${item.id} description too short`);
      assert.ok(item.details && item.details.trim().length > 20, `Item ${item.id} details too short`);

      // Category validity
      assert.ok(validCategoryIds.has(item.category), `Item ${item.id} has invalid category: ${item.category}`);

      // Dimension checks
      assert.equal(item.width, 1662, `Item ${item.id} width must be 1662`);
      assert.equal(item.height, 905, `Item ${item.id} height must be 905`);

      // Features & Tech stack
      assert.ok(Array.isArray(item.keyFeatures), `Item ${item.id} keyFeatures must be an array`);
      assert.ok(item.keyFeatures.length >= 3, `Item ${item.id} must have at least 3 keyFeatures`);
      item.keyFeatures.forEach((feature, fIdx) => {
        assert.ok(feature && feature.trim().length > 5, `Item ${item.id} keyFeature[${fIdx}] too short`);
      });

      assert.ok(Array.isArray(item.techStack), `Item ${item.id} techStack must be an array`);
      assert.ok(item.techStack.length >= 2, `Item ${item.id} must have at least 2 techStack tags`);
      item.techStack.forEach((tech, tIdx) => {
        assert.ok(tech && tech.trim().length >= 2, `Item ${item.id} techStack[${tIdx}] too short`);
      });
    });
  });

  await t.test('every gallery item references an existing high-resolution webp asset on disk', () => {
    GALLERY_ITEMS.forEach((item) => {
      assert.ok(item.image.startsWith('/assets/gallery/'), `Item ${item.id} image path must start with /assets/gallery/`);
      assert.ok(item.image.endsWith('.webp'), `Item ${item.id} image must be a WebP asset`);

      const relativeDiskPath = path.join('public', item.image.replace(/^\//, ''));
      const absoluteDiskPath = path.resolve(relativeDiskPath);
      assert.equal(fs.existsSync(absoluteDiskPath), true, `Missing asset file on disk: ${relativeDiskPath}`);

      const stats = fs.statSync(absoluteDiskPath);
      assert.ok(stats.size > 10 * 1024, `Asset for ${item.id} too small (${(stats.size / 1024).toFixed(1)} KB); must be > 10 KB`);
    });
  });
});

