# Website review and refinement

Reviewed: October 15, 2026. Scope: the Astro marketing website, its five built routes, shared components, and client interactions. The Rust/React product and industry catalog are separate projects.

## Findings addressed

| Finding | Effect | Change |
| --- | --- | --- |
| Dense jargon and three competing hero actions | Visitors had to understand implementation details before understanding the product | Clear value proposition, a primary mission walkthrough link, secondary source link, and real desktop preview |
| Seven desktop navigation links starting at tablet widths | Header crowding and potential control overlap | Four desktop destinations, a tablet/mobile menu, and clear mission access |
| Mobile menu lacked dismissal behavior | Menu could remain open after following an anchor or pressing Escape | Link, outside-click, focus-out, Escape, and navigation dismissal |
| Mission arrow handlers fired on both child and parent | A keypress could advance two slides | One carousel-level handler |
| Slideshow autoplay continued during exploration | Content changed while a visitor was reading or enlarging a screenshot | Pause on keyboard focus, hover, modal display, or a hidden browser tab |
| Approval demonstration had an inactive button | An apparently functional control produced no feedback | Explicit preview-only interaction with acknowledgement, reset, and accessible status |
| Cleanup ran before a destination finished loading | Canceled navigation could stop the current page's interactions | Cleanup runs immediately before page replacement |
| Lightbox scroll restoration could run while already closed | Escape could overwrite the previous page scroll state | Guard closed dialogs; make the shared footer inert while a dialog is open |
| Full-screen preview controls crowded small screens | Modal heading and close action competed for space | Shorter controls and responsive help text |
| Release badges included unsupported completion claims | Roadmap conveyed more certainty than the available implementation evidence supported | Engineering focus areas, clear qualification, and a source release link |
| Homepage lacked a consistent resource footer | Important destinations were harder to rediscover | Shared product/resource navigation on every page |

## Visual direction

Preserved the Tadpole identity and local font stacks. Introduced restrained emerald and cyan accents, CSS-only ambient lighting, a responsive command-center hero, readable display typography, consistent buttons, sequential architecture, a larger real interface gallery, and a cohesive footer. Removed the continuous background rendering loop. The hero workflow is explicitly labelled illustrative; screenshots are presented as product previews.

## Remaining product and content gaps

- Add a concise, versioned installation and requirements guide for first-time users. The current next step is the source repository.
- Verify catalog totals and example collection sizes when the separate industry catalog changes; the marketing site currently repeats those values manually.
- Keep detailed governance and security language tied to the actual configuration and release. A marketing preview does not demonstrate enforcement by the runtime.
- Consider a short narrated product walkthrough with captions and a transcript. Current mission content consists of six real screenshots.
- Measure conversion and performance on the deployed site before expanding visual effects. No customer testimonials or performance benchmarks were invented for this update.

## Verification

Passed on October 15, 2026:

- `npm run check`: 31 Astro files checked; zero errors, warnings, or hints.
- `npm run typecheck`: TypeScript passed.
- `npm run build`: five static routes built; sitemap and robots.txt generated.
- `npm test`: six unit checks, built-site verification, and isolated Chrome browser verification passed. The deployment artifact is 3.60 MiB, within the 8 MiB budget.

Browser coverage includes all five routes at 320, 375, 768, 1024, and 1440 pixels, with no horizontal overflow or overlapping navigation. The hero text also stays inside its content area at every tested width, including 320 pixels. Interaction checks cover accessible control names, keyboard tabs, approval-preview feedback and reset, modal focus and background isolation, mobile menu dismissal, repeated client navigation, reduced motion, and mission playback pause/resume behavior. Full playback timing passed before a final layout-only recheck.

Desktop and mobile viewport screenshots and full-page captures were visually inspected. The automated checks do not replace an assistive-technology audit or testing on physical mobile devices.

Changes are local to this checkout; publication is separate.

---

## Update: November 2, 2026 (AI-Tadpole-OS v1.1.464 Synchronization)

Synchronized the marketing hub with the live running engine on ports 5173 and 8000, aligning all technical content, links, and assets with [`https://github.com/DDS-Solutions/AI-TadPole-OS`](https://github.com/DDS-Solutions/AI-TadPole-OS):

1. **Live Desktop Captures**:
   - Captured and updated high-resolution (1662x905) screenshots directly from localhost:5173:
     - `real_os_dashboard.png`: Operations Command Center (10Hz telemetry, 62 nodes online, 14 active agents, model slots).
     - `real_os_nodes.png`: Neural Map & AST Symbols Graph (7,205 symbols, 43,517 edges, BFS Dependency Pathfinder).
     - `real_os_oversight.png`: Sapphire Shield Action Ledger & Zero-Trust HITL gate.
     - `industry_templates_catalog.png`: Industry Template Store (25 collections, 81 starter templates).
     - `real_os_missions.png`: Missions Board & Swarm Telemetry Kanban.
     - `real_os_security.png`: Zero-Trust Security Perimeter & Privacy Shield.
     - `real_os_hierarchy.png`: Swarm Hierarchy Org Chart.
     - `engine_health_api.png`: Axum Tokio Rust Kernel (`http://localhost:8000/v1/engine/health`).
2. **Component & Gallery Expansion**:
   - Expanded `ScreenshotGallery.astro` into a 6-surface command-center gallery with individual modal lightbox zoom and responsive layout.
   - Enhanced `Hero.astro` with download links to release assets (`v1.1.464`), dual-plane GA status, and updated foundation pillars.
   - Refined `Roadmap.astro` to reflect Plane 1 GA, Plane 2 SMB Digital Twin preview, A2A Economic Zone, and Sovereign Compliance.
   - Updated `ArchitectureLayers.astro` and `architecture-nodes.ts` with exact Tree-sitter, Axum 0.7, LanceDB IVF-PQ, and Sapphire Shield specifications.
3. **Specification & GEO Compliance**:
   - Synchronized `BaseLayout.astro` softwareVersion (`1.1.464`) and release download metadata.
   - Updated `public/llms.txt` and `public/llms-full.txt` to serve comprehensive technical architectures to AI agents and web crawlers.
4. **Verification**:
   - `npm run check`: 35 files checked; 0 errors, 0 warnings, 0 hints.
   - `npm run typecheck`: TypeScript passed (`tsc --noEmit`).
   - `npm run build`: Static build (6 routes) and sitemap generation succeeded.
   - `npm run test:built`: Unit, static verification, and full browser test suite passed across all 6 routes and 5 viewport sizes.

---

## Update: November 2, 2026 (Comprehensive 26-Screen Codebase Gallery)

Built and launched the complete Codebase Screen Gallery (`src/pages/gallery.astro`) capturing every operational view, tab header, and kernel probe in the running Tadpole OS v1.1.464:

1. **Complete Screen Inventory (26 High-Resolution Captures)**:
   - **Core Operations**: Operations Command Center (`/dashboard`), Swarm Hierarchy (`/org-chart`), Missions Board (`/missions`), Missions Flight Recorder (`/missions?view=history`), SMB Practice Digital Twin (`/smb-practice`), Scheduled Jobs (`/scheduled-jobs`).
   - **Governance & Security**: Sapphire Shield Oversight & Action Ledger (`/oversight`), Zero-Trust Security & Privacy Shield (`/security`).
   - **Intelligence & Store**: Model Providers & Vault (`/models`), Intelligence Model Store (`/infra/model-store`), Industry Templates Store (`/store`), MCP Connectors Registry (`/mcp-store`), Customer Catalog & A2A Gateway (`/customer-catalog`), Neural AST Map (`/intelligence/map`), Swarm Agents Directory (`/agents`), Skills & Tools Matrix (`/skills`).
   - **Comms & Workspaces**: Voice Interface & Standups Hub (`/standups`), Workspaces & File System (`/workspaces`).
   - **Engine & System**: Sovereign Axum Engine Telemetry (`/engine`), Performance Benchmarks (`/benchmarks`), Dual-Trace Analytics (`/analytics`), System Docs (`/docs`), OS Settings (`/settings`), Detached Swarm Pulse (`/detached/swarm-pulse`), Detached Sovereign Chat (`/detached/chat`), Axum Rust Kernel `/v1/engine/health` API probe.
2. **Interactive UI/UX Controls & Inspection**:
   - **Search Filter**: Real-time keyword filter across titles, descriptions, routes, key features, and tech stack tags.
   - **Category Filters**: Pills with live count indicators for All (26), Core Operations (6), Governance & Security (2), Intelligence & Store (8), Comms & Workspaces (2), and Engine & System (8).
   - **Layout Mode Toggle**: Responsive 2-column Grid View vs Detailed Focus View (with full capabilities checklist and tech stack tags).
   - **Zoom Lightbox Modal**: High-resolution image viewer with keyboard navigation (Escape, Left/Right arrows), deep anchor linking (`#dashboard`, `#oversight`, etc.), focus trapping, and context drawer.
3. **Global Navigation & Linking**:
   - Added `Gallery` to the desktop header menu, mobile drawer menu, homepage hero CTA, and screenshot section CTA.
4. **Verification**:
   - `npm run check`: 35 Astro files checked; 0 errors, 0 warnings, 0 hints.
   - `npm run typecheck`: TypeScript passed (`tsc --noEmit`).
   - `npm run build`: 6 static routes generated; sitemap.xml generated with 5 indexed routes.
   - `npm run test:built`: All unit tests, static checks, and browser CDP tests passed with 0 runtime errors. Total deployment size is 6.03 MiB, safely within the 8 MiB budget.

