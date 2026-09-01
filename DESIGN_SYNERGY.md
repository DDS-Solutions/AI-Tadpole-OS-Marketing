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
> **Version**: 2.0.0  
> **Last Hardened**: 2026-07-26  
> **Classification**: Sovereign  

---

## 🛠️ Modern Tech Stack (2026 Core)

Tadpole OS Marketing & Application Engine utilizes the following high-performance stack:
- **Framework**: Astro v5.18.2 (Static zero-JS output + Client Router view transitions)
- **Core App**: React 19 (Desktop Tauri + Rust Axum `server-rs` backend)
- **Styling**: Tailwind CSS v3/v4 (Neural Glass design system tokens)
- **Interactivity**: Alpine.js v3 + Web Audio API (Zero-asset mechanical keypress audio)

---

## 🏗️ Core Theme Tokens

```css
@import "tailwindcss";

@theme {
  /* Surface Palette */
  --color-zinc-950: #09090b; /* Base Root */
  --color-zinc-900: #18181b; /* Glass Surface */
  --color-zinc-800: #27272a; /* Border Subtle */
  
  /* Subsystem Accent Tokens */
  --color-emerald-400: #10b981; /* Sovereign / Verified Merkle Proof */
  --color-cyan-400:    #06b6d4; /* 10Hz Telemetry & LanceDB Vector */
  --color-purple-400:  #a855f7; /* Agent 99 Router & ADG-01 Guard */
  --color-amber-400:   #f59e0b; /* Sapphire Shield Zero-Trust Intercept */
  --color-red-400:     #ef4444; /* Emergency Air-Gap Killswitch */
  
  /* Typography */
  --font-display: system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-sans:    system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Glassmorphism Tokens */
  --blur-neural: 16px;
}
```

---

## 💎 Neural Glass & Telemetry Component Tokens

### 1. Glass Surface Container (`.glass-surface`)
```css
.glass-surface {
  background: rgba(24, 24, 27, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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

### 3. Scanline Background (`.scanline-bg`)
```css
.scanline-bg {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    rgba(255,255,255,0) 50%,
    rgba(16, 185, 129, 0.02) 50%,
    rgba(16, 185, 129, 0.02)
  );
  background-size: 100% 4px;
}
```

---

## 📏 Operational Governance & Do's / Don'ts

1. **Maintain Type Parity**: Use the local system sans stack for headings/body copy and the local system monospace stack for log streams and badges.
2. **Zero Unstyled Fallbacks**: Never output raw red/blue unstyled default browser components.
3. **Cross-Reference Primary Spec**: Refer to [`design.md`](design.md) for full component specs.

[//]: # (Metadata: [DESIGN_SYNERGY])
