# 🐸 AI-Tadpole-OS Sovereign Protocol — Design System & UI Specification v2.0

> **System Spec**: High-Performance, Sovereign Dark Theme for Multi-Agent Swarm Orchestration  
> **Version**: 2.0.0 (5/5 World-Class Standard)  
> **Framework Compatibility**: Astro v5+, Tailwind CSS v3/v4, Alpine.js v3, Web Audio API  

---

## 🌟 1. Design Philosophy

Tadpole OS Design System embodies **Sovereign Intelligence & Technical Precision**:
- **Neural Glass Aesthetics**: Deep zinc surfaces (`bg-zinc-950`), multi-layer backdrop blurs (`backdrop-blur-xl`), and translucent 1px borders (`border-white/10`).
- **High-Signal Telemetry**: Real-time MessagePack 10Hz log streaming with color-coded log levels (`[SYSTEM]`, `[AGENT_99]`, `[TADPOLE]`, `[SAPPHIRE]`, `[LANCE_DB]`, `[OBLITERATUS]`).
- **Zero-Trust Visual Feedback**: Amber/Yellow pulse intercepts for Human-in-the-Loop (HITL) gates and Emerald glow highlights for verified Merkle-proof receipts.

---

## 🎨 2. Color Palette & Tokens

### Core Neutral Surfaces
```css
--bg-root:       #09090b; /* zinc-950 (Deepest dark space) */
--bg-surface:    #18181b; /* zinc-900 (Container background) */
--bg-glass:      rgba(24, 24, 27, 0.6); /* Translucent glass surface */
--border-subtle: rgba(255, 255, 255, 0.1); /* 1px crisp container outline */
```

### Sovereign Protocol Accent Colors
| Role / Subsystem | Color Name | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Protocol** | Emerald Green | `#10b981` | `text-emerald-400`, `bg-emerald-500` | Sovereign status, verified Merkle proofs, core branding |
| **Telemetry & Nodes** | Cyber Cyan | `#06b6d4` | `text-cyan-400`, `bg-cyan-500` | 10Hz MessagePack stream, LanceDB vector queries |
| **Orchestrator L2** | Neural Purple | `#a855f7` | `text-purple-400`, `bg-purple-500` | Agent 99 routing, ADG-01 static analysis, LLM decomposition |
| **Zero-Trust HITL** | Sapphire Amber | `#f59e0b` | `text-amber-400`, `bg-amber-500` | Sapphire Shield security intercepts, pending HITL signature |
| **Killswitch / Error** | Red Alert | `#ef4444` | `text-red-400`, `bg-red-500` | Emergency air-gap freeze, aborted execution loops |

---

## 🔤 3. Typography Hierarchy

| Role | Font Family | Weight | Size Range | Tailwind Classes |
| :--- | :--- | :--- | :--- | :--- |
| **Display Headers** | System UI | 700 / 800 | 48px – 96px | `font-outfit font-extrabold tracking-tight` |
| **Section Titles** | System UI | 600 / 700 | 24px – 36px | `font-outfit font-bold text-white` |
| **Body Paragraphs** | System UI | 300 / 400 | 14px – 18px | `font-inter font-light text-zinc-300 leading-relaxed` |
| **Telemetry & Code** | System Monospace | 400 / 700 | 10px – 13px | `font-mono text-xs text-zinc-400` |
| **Status Badges** | System Monospace | 700 | 10px – 11px | `font-mono text-[10px] font-bold uppercase tracking-widest` |

---

## ✨ 4. Surface Tokens & FX Classes

```css
/* Glassmorphism Surface Container */
.glass-surface {
  background: rgba(24, 24, 27, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Subtle Ambient Scanline Overlay */
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

## 🧩 5. Core Component Pattern Library

### 1. Signal Node Badge
```html
<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono text-xs uppercase tracking-widest backdrop-blur">
  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
  Local-First Autonomous Runtime
</div>
```

### 2. Sapphire Shield Zero-Trust HITL Intercept
```html
<div class="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span class="text-3xl">⚠️</span>
      <div>
        <h4 class="font-bold text-amber-300 text-sm font-outfit uppercase">Sapphire Shield Security Intercept</h4>
        <p class="text-xs text-amber-200/80 font-mono">Swarm requested shell:execute capability</p>
      </div>
    </div>
  </div>
  <button class="px-6 py-2.5 bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs font-mono uppercase">
    ✍️ Sign Merkle Proof & Approve
  </button>
</div>
```

### 3. Real Screenshot Lightbox Gallery
- All application screenshots are stored in `public/assets/real_mission/` and `public/assets/`.
- Interactive slideshows include auto-play progress indicators (4.5s step time) and a full-resolution modal lightbox viewer.

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
- Include live status badges with pulsing node rings (`animate-ping`).
- Ensure all interactive tabs and buttons provide immediate visual feedback.

### ❌ DON'T:
- Never use plain red or bright unstyled default browser colors.
- Avoid solid white backgrounds or heavy drop-shadow cards without border definitions.
- Do not mix unescaped JSX characters (like `**bold**` or unescaped braces) in Astro templates.
