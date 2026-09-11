## Summary of Changes

This PR delivers a major architectural modernization and component refactor for the **AI-Tadpole-OS Marketing Hub**:

### Key Updates:

1. **Tailwind CSS v4 & CSS `@theme` Tokens Modernization**:
   - Migrated from legacy `@astrojs/tailwind` + `tailwind.config.mjs` to official `@tailwindcss/vite` plugin.
   - Centralized all design tokens into `src/styles/global.css` using standard `@theme` blocks matching `DESIGN_SYNERGY.md` and `design.md`.
   - Introduced fluid typography and spacing tokens using CSS `clamp()` for seamless scaling without breakpoint snapping.

2. **Component Architecture Decomposition (`src/components/`)**:
   - Decomposed monolithic templates into dedicated subdomains:
     - `src/components/layout/`: `Header.astro`, `Footer.astro`, `BackgroundCanvas.astro`.
     - `src/components/ui/`: `GlassCard.astro`, `StatusBadge.astro`, `SectionHeader.astro`, `HitlIntercept.astro`, `LightboxModal.astro`.
     - `src/components/features/`: `Hero.astro`, `ArchitectureLayers.astro`, `ScreenshotGallery.astro`, `TemplateCatalog.astro`, `Roadmap.astro`, `BottomCta.astro`.
   - Refactored `index.astro` from 669 lines into a clean, declarative 24-line composition.
   - Consolidated duplicate inline modal and footer markup in `how-it-works.astro` and `governance.astro`.

3. **Design System & Documentation Synchronization (v2.1.0)**:
   - Synchronized `design.md` and `DESIGN_SYNERGY.md` to v2.1.0 reflecting Tailwind v4 `@theme`, fluid clamp scaling, and the component pattern library.
   - Updated README badge to reflect Tailwind v4.

4. **Zero-Dependency Native Unit Tests (`test:unit`)**:
   - Added `tests/tokens_and_components.test.js` using Node 26's native `node:test` and `node:assert/strict`.
   - Instant regression protection for required theme tokens, fluid clamp syntax, and component directory integrity.
   - Enhanced `npm test` to execute: `test:unit` → `test:static` → `test:browser`.

## Verification Results:
- `npm run check` & `npm run typecheck`: 0 errors, 0 warnings, 0 hints across 27 files.
- `npm run test:unit`: 6 tests passed in ~185ms.
- `npm run test:static`: 100% static route, skip-link, asset, schema, and button contracts verified.
- `npm run test:browser`: 100% Chrome CDP browser automation tests passed.
