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

- `npm run check`: 29 Astro files checked; zero errors, warnings, or hints.
- `npm run typecheck`: TypeScript passed.
- `npm run build`: five static routes built; sitemap and robots.txt generated.
- `npm test`: six unit checks, built-site verification, and isolated Chrome browser verification passed. The deployment artifact is 3.60 MiB, within the 8 MiB budget.

Browser coverage includes all five routes at 320, 375, 768, 1024, and 1440 pixels, with no horizontal overflow or overlapping navigation. The hero text also stays inside its content area at every tested width, including 320 pixels. Interaction checks cover accessible control names, keyboard tabs, approval-preview feedback and reset, modal focus and background isolation, mobile menu dismissal, repeated client navigation, reduced motion, and mission playback pause/resume behavior. Full playback timing passed before a final layout-only recheck.

Desktop and mobile viewport screenshots and full-page captures were visually inspected. The automated checks do not replace an assistive-technology audit or testing on physical mobile devices.

Changes are local to this checkout; publication is separate.
