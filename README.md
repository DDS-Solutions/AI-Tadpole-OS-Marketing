<div align="center">
  <img src=".github/assets/Github Social Preview Tadpole OS_V3_00003_.png" width="1280" alt="AI-Tadpole-OS - Sovereign Intelligence" />

  # 🐸 AI-Tadpole-OS Marketing Hub
  **The high-performance, Astro-powered gateway to the Sovereign Protocol.**

  **Live Website**: [https://dds-solutions.github.io/AI-Tadpole-OS-Marketing/](https://dds-solutions.github.io/AI-Tadpole-OS-Marketing/)

  [![Astro](https://img.shields.io/badge/Astro-7.4-zinc?style=for-the-badge&logo=astro&logoColor=FF5D01)](https://astro.build/)
  [![Tailwind](https://img.shields.io/badge/Tailwind-v4-zinc?style=for-the-badge&logo=tailwindcss&logoColor=38B2AC)](https://tailwindcss.com/)
  [![GEO-Ready](https://img.shields.io/badge/GEO-Optimized-emerald?style=for-the-badge&logo=google-cloud&logoColor=white)](#geo-strategy)
  
  ---
</div>

This repository contains the source code for the official **AI-Tadpole-OS** marketing website, built with **Astro** for static-first delivery and search engine discoverability.

## 🌟 Key Features

- **Progressively Enhanced**: Static HTML provides the core content, while Alpine.js and view transitions enhance the interactive experience.
- **Privacy-Preserving Typography**: Local system font stacks avoid third-party font requests.
- **Sovereign Dark Theme**: A responsive command-center design with CSS ambient lighting, real product previews, and clear paths through the runtime.
- **GEO Optimized**: SoftwareApplication JSON-LD and agent-friendly meta tags.
- **Governance Whitepaper**: Integrated Sovereign Protocol documentation.

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [GitHub Pages](https://pages.github.com/) (Recommended)

## 🧞 Development Commands

All commands are run from the root of the project:

Node.js 22 or newer is required. TypeScript 6 is pinned for template validation compatibility with `@astrojs/check`. The browser verification uses an installed Chrome or Edge browser; set `CHROME_PATH` when it is installed in a non-standard location.

| Command | Action |
| :--- | :--- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts local dev server at `localhost:4321` |
| `npm run build` | Build your production site to `./dist/` and generate sitemap/robots |
| `npm run check` | Type-check Astro templates and client code |
| `npm run typecheck` | Type-check TypeScript modules without emitting files |
| `npm run format:check` | Check code formatting consistency with Prettier |
| `npm test` | Runs production build followed by static and browser test suites |
| `npm run test:built` | Run unit, static, and browser tests against existing `./dist/` |
| `npm run preview` | Preview your build locally |

### Environment Variables for Testing & Configuration

- `CHROME_PATH`: Explicit path to Chrome or Edge executable when installed in non-standard locations.
- `ALLOW_BROWSER_SKIP=1`: Allows bypassing browser verification outside CI if Chrome/Edge is not installed.
- `SCREENSHOT_DIR`: Directory path to save desktop and mobile verification screenshots.
- `SKIP_PLAYBACK_TIMING=1`: Skips full playback timing intervals during fast layout test iterations.
- `SITE_ORIGIN`: Base URL origin (defaults to `https://dds-solutions.github.io`).
- `BASE_PATH`: Base URL path prefix (defaults to `/AI-Tadpole-OS-Marketing`).

## 📐 GEO Strategy

Tadpole OS Marketing is built with **Generative Engine Optimization** in mind. We prioritize:
1. **Semantic HTML**: Clear heading hierarchies for LLM decomposition.
2. **Structured Data**: Schema.org JSON-LD for the SoftwareApplication.
3. **Flat Navigation**: Minimizing crawl depth for easier indexing.

---

[Return to Core Engine](https://github.com/DDS-Solutions/AI-TadPole-OS)
