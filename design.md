# 🐸 AI-Tadpole-OS Sovereign Protocol — Design System & UI Specification v2.1

> **System Spec**: High-Performance, Sovereign Dark Theme for Multi-Agent Swarm Orchestration  
> **Version**: 2.1.0 (5/5 World-Class Standard)  
> **Framework Compatibility**: Astro v5+, Tailwind CSS v4 (via `@tailwindcss/vite`), Alpine.js v3, Web Audio API  
> **Canonical Token Entrypoint**: `src/styles/global.css`  

---

## 🌟 1. Design Philosophy

Tadpole OS Design System embodies **Sovereign Intelligence & Technical Precision**:
- **Neural Glass Aesthetics**: Deep zinc surfaces (`bg-zinc-950`), multi-layer backdrop blurs (`backdrop-blur-xl`), and translucent 1px borders (`border-white/10`).
- **High-Signal Telemetry**: Real-time MessagePack 10Hz log streaming with color-coded log levels (`[SYSTEM]`, `[AGENT_99]`, `[TADPOLE]`, `[SAPPHIRE]`, `[LANCE_DB]`, `[OBLITERATUS]`).
- **Zero-Trust Visual Feedback**: Amber/Yellow pulse intercepts for Human-in-the-Loop (HITL) gates and Emerald glow highlights for verified Merkle-proof receipts.
- **Fluid Layout & Container Adaptation**: Fluid typography and spacing scales using mathematical `clamp()` rules that adapt smoothly across all viewport widths without discrete breakpoint snaps.

---

## 🎨 2. Color Palette & Tokens

### Core Neutral Surfaces (`@theme` in `src/styles/global.css`)
```css
--color-zinc-950:    #09090b; /* Base Root Space (--color-background) */
--color-zinc-900:    #18181b; /* Glass Surface Container (--color-surface) */
--color-zinc-800:    #27272a; /* Subtle Border Outline (--color-border) */
--color-zinc-700:    #3f3f46; /* Interactive Hover Borders */
--color-zinc-500:    #8f8f99; /* Secondary Muted Copy */
```

### Sovereign Protocol Accent Colors
| Role / Subsystem | Color Name | Hex Code | Tailwind Token | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Protocol** | Emerald Green | `#10b981` | `text-emerald-400`, `bg-emerald-500` | Sovereign status, verified Merkle proofs, core branding |
| **Telemetry & Nodes** | Cyber Cyan | `#06b6d4` | `text-cyan-400`, `bg-cyan-500` | 10Hz MessagePack stream, LanceDB vector queries |
| **Orchestrator L2** | Neural Purple | `#a855f7` | `text-purple-400`, `bg-purple-500` | Agent 99 routing, ADG-01 static analysis, LLM decomposition |
| **Zero-Trust HITL** | Sapphire Amber | `#f59e0b` | `text-amber-400`, `bg-amber-500` | Sapphire Shield security intercepts, pending HITL signature |
| **Killswitch / Error** | Red Alert | `#ef4444` | `text-red-400`, `bg-red-500` | Emergency air-gap freeze, aborted execution loops |
| **Pulse Highlight** | Cyber Green | `#22c55e` | `text-cyber-green` | Telemetry heartbeat and node active state |

---

## 🔤 3. Typography Hierarchy & Fluid Scaling

All fonts resolve to privacy-preserving local system stacks with zero third-party font requests.

| Role | Font Family | Weight | Size Scale | Tailwind / CSS Utility |
| :--- | :--- | :--- | :--- | :--- |
| **Display Headers** | System Sans Stack | 700 / 800 | `clamp(2.25rem, 5vw + 1rem, 4.5rem)` | `font-outfit text-[var(--text-fluid-display)] font-extrabold tracking-tight` |
| **Section Titles** | System Sans Stack | 600 / 700 | `clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)` | `font-outfit text-[var(--text-fluid-title)] font-bold text-white` |
| **Body Paragraphs** | System Sans Stack | 300 / 400 | `clamp(0.95rem, 0.5vw + 0.85rem, 1.125rem)` | `font-inter text-[var(--text-fluid-body)] font-light text-zinc-300 leading-relaxed` |
| **Telemetry & Code** | System Monospace | 400 / 700 | 11px – 13px | `font-mono text-xs text-zinc-400` |
| **Status Badges** | System Monospace | 700 | 10px – 11px | `font-mono text-[10px] font-bold uppercase tracking-widest` |

---

## ✨ 4. Surface Tokens & FX Classes

```css
/* Glassmorphism Surface Container */
.glass-surface {
  background: color-mix(in srgb, var(--color-zinc-950) 72%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Ambient Neural Grid Overlay */
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

/* Subtle Ambient Scanline Overlay */
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

/* Glowing Text Animation */
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
    color: #a7f3d0; /* emerald-200 */
    text-shadow: 0 0 25px rgba(52, 211, 153, 0.6);
  }
}
```

---

## 🧩 5. Core Component Pattern Library (`src/components/`)

### 1. Signal Node Badge (`StatusBadge.astro`)
```astro
---
import StatusBadge from "../components/ui/StatusBadge.astro";
---
<StatusBadge variant="emerald" pulse={true}>
  Local-First Autonomous Runtime
</StatusBadge>
```
*HTML Rendered Pattern:*
```html
<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono text-xs uppercase tracking-widest backdrop-blur">
  <span class="relative flex h-2 w-2">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
  </span>
  Local-First Autonomous Runtime
</div>
```

### 2. Sapphire Shield Zero-Trust HITL Intercept (`HitlIntercept.astro`)
```astro
---
import HitlIntercept from "../components/ui/HitlIntercept.astro";
---
<HitlIntercept
  title="Sapphire Shield Security Intercept"
  detail="Swarm requested shell:execute capability"
  actionText="✍️ Sign Merkle Proof & Approve"
/>
```
*HTML Rendered Pattern:*
```html
<div class="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-3xl" aria-hidden="true">⚠️</span>
      <div>
        <h4 class="font-bold text-amber-300 text-sm font-outfit uppercase">Sapphire Shield Security Intercept</h4>
        <p class="text-xs text-amber-200/80 font-mono">Swarm requested shell:execute capability</p>
      </div>
    </div>
  </div>
  <button type="button" class="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg text-xs font-mono uppercase cursor-pointer">
    ✍️ Sign Merkle Proof & Approve
  </button>
</div>
```

### 3. Real Screenshot Lightbox Gallery (`ScreenshotGallery.astro` & `LightboxModal.astro`)
- All application screenshots are stored in `public/assets/real_mission/` and `public/assets/`.
- Full-resolution modal viewer traps focus, locks body scroll, inerts background elements, and closes on Escape or backdrop click.

---

## 🔊 6. Mechanical Audio Feedback Standard

Interactive elements use synthesized Web Audio API sound (zero asset dependencies):
- **Keystroke / Log Step**: Sine & triangle wave burst at ~1200Hz, 30ms duration.
- **HITL Approval**: Frequency ramp to 1500Hz, 100ms duration.
- **Mission Completion**: Chime burst at 1600Hz, 200ms duration.

---

## 🛑 7. Do's and Don'ts

### ✅ DO:
- Maintain `font-outfit` for display headers and `font-mono` for log streams; both resolve to privacy-preserving local system font stacks.
- Use `backdrop-blur-xl` and `border-white/10` on all floating glass containers.
- Include live status badges with pulsing node rings (`StatusBadge.astro`).
- Ensure all interactive buttons declare `type="button"`.
- Ensure all images specify `width`, `height`, and an informative `alt` attribute.
- Ensure all interactive tabs and buttons provide immediate visual feedback.

### ❌ DON'T:
- Never use plain red or bright unstyled default browser colors.
- Avoid solid white backgrounds or heavy drop-shadow cards without border definitions.
- Do not make external font calls (`fonts.googleapis.com` or similar CDN links).
- Do not mix unescaped JSX characters (like `**bold**` or unescaped braces) in Astro templates.
