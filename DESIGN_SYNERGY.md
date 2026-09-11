> [!IMPORTANT]
> **AI Assist Note (Sovereign Authority)**:
> This document is **SUPPLEMENTARY**. 
> The **Primary Source of Truth** for all design tokens, colors, component patterns, and typography specs is the **[design.md](design.md)** file in the project root.
> 
> - **Primary Spec**: `design.md` (Root Spec v2.0)
> - **Heritage Role**: Provides architectural rationale for "Neural Glass" effects, 10Hz telemetry visualization, and Astro + Tailwind design tokens.

# 🎨 Tadpole OS: Design Synergy Package

> **Intelligence Level**: High-Fidelity (ECC-ARA)  
> **Status**: Verified Production-Ready (5/5 Standard)  
> **Version**: 2.1.0  
> **Last Hardened**: 2026-09-11  
> **Classification**: Sovereign  

---

## 🛠️ Modern Tech Stack (2026 Core)

Tadpole OS Marketing & Application Engine utilizes the following high-performance stack:
- **Framework**: Astro v5.18.2 (Static zero-JS output + Client Router view transitions)
- **Core App**: React 19 (Desktop Tauri + Rust Axum `server-rs` backend)
- **Styling Engine**: Tailwind CSS v4 (`@tailwindcss/vite` integration) + CSS `@theme` tokens in `src/styles/global.css`
- **Interactivity**: Alpine.js v3 + Web Audio API (Zero-asset mechanical keypress audio)
- **Visuals**: WebGL2 Aurora fluid background shader (`BackgroundCanvas.astro`) + ambient SVG scanlines

---

## 🏗️ Core Theme Tokens (`src/styles/global.css`)

```css
@import "tailwindcss";

@theme {
  /* Surface Palette */
  --color-zinc-950: #09090b; /* Base Root */
  --color-zinc-900: #18181b; /* Glass Surface */
  --color-zinc-800: #27272a; /* Border Subtle */
  --color-zinc-700: #3f3f46;
  --color-zinc-500: #8f8f99;

  --color-background: #09090b;
  --color-surface:    #18181b;
  --color-border:     #27272a;

  /* Subsystem Accent Tokens */
  --color-emerald-400: #10b981; /* Sovereign / Verified Merkle Proof */
  --color-cyan-400:    #06b6d4; /* 10Hz Telemetry & LanceDB Vector */
  --color-purple-400:  #a855f7; /* Agent 99 Router & ADG-01 Guard */
  --color-amber-400:   #f59e0b; /* Sapphire Shield Zero-Trust Intercept */
  --color-red-400:     #ef4444; /* Emergency Air-Gap Killswitch */
  --color-cyber-green: #22c55e;
  --color-neural-pulse: #e4e4e7;

  /* Typography */
  --font-sans:    system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-inter:   system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-outfit:  system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono:    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Glassmorphism Tokens */
  --blur-neural: 16px;

  /* Fluid Typography & Spacing System (clamp) */
  --text-fluid-display: clamp(2.25rem, 5vw + 1rem, 4.5rem);
  --text-fluid-title:   clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem);
  --text-fluid-body:    clamp(0.95rem, 0.5vw + 0.85rem, 1.125rem);
  --space-fluid-section: clamp(3.5rem, 5vw + 1rem, 6.5rem);
  --space-fluid-gap:    clamp(1rem, 1.5vw + 0.5rem, 2rem);
}
```

---

## 💎 Neural Glass & Telemetry Component Tokens

### 1. Glass Surface Container (`.glass-surface`)
```css
.glass-surface {
  background: color-mix(in srgb, var(--color-zinc-950) 72%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### 2. Slow Pulse Highlight (`.slow-pulse-text`)
```css
.slow-pulse-text {
  color: #ffffff;
  animation: slowPulse 4s ease-in-out infinite;
}
@keyframes slowPulse {
  0%, 100% {
    color: #ffffff;
    text-shadow: 0 0 10px rgba(52, 211, 153, 0);
  }
  50% {
    color: #a7f3d0;
    text-shadow: 0 0 25px rgba(52, 211, 153, 0.6);
  }
}
```

### 3. Scanline Background (`.scanline-bg`, `.scanline`)
```css
.scanline-bg,
.scanline {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0) 50%,
    rgba(16, 185, 129, 0.02) 50%,
    rgba(16, 185, 129, 0.02)
  );
  background-size: 100% 4px;
}
```

### 4. Ambient Neural Grid (`.neural-grid`)
```css
.neural-grid {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.032) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.032) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black, transparent 88%);
  -webkit-mask-image: linear-gradient(to bottom, black, transparent 88%);
}
```

---

## 🧩 Component Architecture Directory (`src/components/`)

The component layer decomposes the interface into 3 dedicated subdomains:
- **`layout/`**: Structural containers, global controls, and canvas pipelines (`Header.astro`, `Footer.astro`, `BackgroundCanvas.astro`).
- **`ui/`**: Reusable design primitives (`GlassCard.astro`, `StatusBadge.astro`, `SectionHeader.astro`, `HitlIntercept.astro`, `LightboxModal.astro`).
- **`features/`**: High-level page sections and interactive widgets (`Hero.astro`, `ArchitectureLayers.astro`, `ScreenshotGallery.astro`, `TemplateCatalog.astro`, `Roadmap.astro`, `BottomCta.astro`).

---

## 📏 Operational Governance & Do's / Don'ts

1. **Maintain Type Parity**: Use the local system sans stack for headings/body copy and the local system monospace stack for log streams and badges. Never fetch external web fonts.
2. **Button Type Contract**: All interactive `<button>` elements must explicitly declare `type="button"` for browser/accessibility verification.
3. **Zero Unstyled Fallbacks**: Never output raw red/blue unstyled default browser components.
4. **Cross-Reference Primary Spec**: Refer to [`design.md`](design.md) for full component specs.

[//]: # (Metadata: [DESIGN_SYNERGY])
