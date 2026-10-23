import { getMissionSlides } from '../data/mission-slides';
import { architectureNodes } from '../data/architecture-nodes';
import type { AlpineInstance } from 'alpinejs';

// 1. Define a type for Alpine components to improve TypeScript type-safety
interface AlpineComponent {
  $nextTick: (callback: () => void) => void;
  $refs: Record<string, HTMLElement | undefined>;
}

const assetBaseUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;

// 2. Extract shared lightbox logic into a reusable mixin
const lightboxMixin = () => ({
  lightboxOpen: false,
  lightboxImg: '',
  lightboxAlt: 'Full-resolution screenshot',
  lastFocusedElement: null as HTMLElement | null,
  inertedElements: [] as HTMLElement[],
  previousBodyOverflow: '',
  boundFocusGuard: null as ((event: FocusEvent) => void) | null,

  openLightbox(imgUrl: string, altText = 'Full-resolution screenshot') {
    if (this.lightboxOpen) return;
    this.lastFocusedElement = document.activeElement as HTMLElement | null;
    this.lightboxImg = imgUrl;
    this.lightboxAlt = altText;
    this.lightboxOpen = true;
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const backgroundElements = document.querySelectorAll<HTMLElement>(
      'body > a, body > header, body > footer, main > :not([role="dialog"])',
    );
    this.inertedElements = Array.from(backgroundElements).filter(
      (element) => !element.hasAttribute('inert'),
    );
    this.inertedElements.forEach((element) => element.setAttribute('inert', ''));
    this.onLightboxStateChange();

    this.boundFocusGuard = (event: FocusEvent) => {
      const dialog = (this as unknown as AlpineComponent).$refs.dialog;
      if (this.lightboxOpen && dialog && !dialog.contains(event.target as Node)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        (this as unknown as AlpineComponent).$refs.closeButton?.focus();
      }
    };
    document.addEventListener('focusin', this.boundFocusGuard, true);

    (this as unknown as AlpineComponent).$nextTick(() => {
      (this as unknown as AlpineComponent).$refs.closeButton?.focus();
    });
  },

  closeLightbox() {
    if (!this.lightboxOpen) return;
    const focusTarget = this.lastFocusedElement;
    this.lightboxOpen = false;
    this.lightboxImg = '';
    this.lightboxAlt = 'Full-resolution screenshot';
    this.lastFocusedElement = null;
    document.body.style.overflow = this.previousBodyOverflow;
    this.inertedElements.forEach((element) => element.removeAttribute('inert'));
    this.inertedElements = [];

    if (this.boundFocusGuard) {
      document.removeEventListener('focusin', this.boundFocusGuard, true);
      this.boundFocusGuard = null;
    }

    this.onLightboxStateChange();
    (this as unknown as AlpineComponent).$nextTick(() => {
      focusTarget?.focus();
    });
  },

  onLightboxStateChange() {},

  trapLightboxFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const dialog = (this as unknown as AlpineComponent).$refs.dialog;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.offsetParent !== null);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first || !dialog.contains(document.activeElement)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
  },

  bindLightboxCleanup() {
    document.addEventListener(
      'astro:before-swap',
      () => this.closeLightbox(),
      { once: true },
    );
  },
});

export function registerAlpineComponents(Alpine: AlpineInstance) {
  Alpine.data('homepage', () => ({
    ...lightboxMixin(),
    init() {
      this.bindLightboxCleanup();
    },
  }));

  Alpine.data('missionPage', () => {
    // Configuration constants for easily adjustable timing
    const AUTO_PLAY_DURATION = 4500;
    const TIMER_INTERVAL = 50;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    return {
      ...lightboxMixin(),
      currentSlide: 0,
      autoPlay: !prefersReducedMotion,
      autoPlayProgress: 0,
      progressTimer: null as ReturnType<typeof setInterval> | null,
      pointerWithinCarousel: false,
      focusWithinCarousel: false,
      pageHidden: document.hidden,
      destroyed: false,
      visibilityListener: null as (() => void) | null,

      get slideshowPaused(): boolean {
        return this.pointerWithinCarousel || this.focusWithinCarousel || this.lightboxOpen || this.pageHidden;
      },
      slides: getMissionSlides(assetBaseUrl),

      init() {
        this.visibilityListener = () => {
          this.pageHidden = document.hidden;
          this.startAutoPlayTimer();
        };
        document.addEventListener('visibilitychange', this.visibilityListener);
        this.startAutoPlayTimer();
        document.addEventListener('astro:before-swap', () => this.destroy(), { once: true });
      },

      destroy() {
        this.destroyed = true;
        this.clearAutoPlayTimers();
        if (this.visibilityListener) {
          document.removeEventListener('visibilitychange', this.visibilityListener);
          this.visibilityListener = null;
        }
        this.closeLightbox();
      },

      setPointerPaused(paused: boolean) {
        this.pointerWithinCarousel = paused;
        this.startAutoPlayTimer();
      },

      setFocusPaused(paused: boolean) {
        this.focusWithinCarousel = paused;
        this.startAutoPlayTimer();
      },

      onLightboxStateChange() {
        this.startAutoPlayTimer();
      },

      setSlide(idx: number) {
        this.currentSlide = idx;
        this.resetAutoPlayProgress();
      },

      nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.resetAutoPlayProgress();
      },

      prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.resetAutoPlayProgress();
      },

      toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        this.autoPlay ? this.startAutoPlayTimer() : this.clearAutoPlayTimers();
      },

      startAutoPlayTimer() {
        this.clearAutoPlayTimers();
        if (!this.autoPlay || this.slideshowPaused || this.destroyed) return;

        this.autoPlayProgress = 0;
        const increment = (TIMER_INTERVAL / AUTO_PLAY_DURATION) * 100;

        this.progressTimer = setInterval(() => {
          this.autoPlayProgress += increment;
          if (this.autoPlayProgress >= 100) {
            this.nextSlide();
          }
        }, TIMER_INTERVAL);
      },

      resetAutoPlayProgress() {
        this.autoPlayProgress = 0;
        if (this.autoPlay) this.startAutoPlayTimer();
      },

      clearAutoPlayTimers() {
        if (this.progressTimer) clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    };
  });

  Alpine.data('howItWorksPage', () => ({
    ...lightboxMixin(),
    selectedNode: 'directive',
    activePerspective: 'it',
    nodeOrder: ['directive', 'orchestration', 'execution', 'governance', 'memory'],
    perspectiveOrder: ['it', 'manager', 'exec', 'operator'],

    init() {
      this.bindLightboxCleanup();
    },

    selectNode(key: string) {
      this.selectedNode = key;
    },

    selectPerspective(key: string) {
      this.activePerspective = key;
    },

    focusNodeTab(key: string) {
      this.selectNode(key);
      (this as unknown as AlpineComponent).$nextTick?.(() => {
        document.getElementById(`arch-tab-${key}`)?.focus();
      });
    },

    moveNodeFocus(offset: number) {
      const index = this.nodeOrder.indexOf(this.selectedNode);
      const nextIndex = (index + offset + this.nodeOrder.length) % this.nodeOrder.length;
      this.focusNodeTab(this.nodeOrder[nextIndex]);
    },

    focusNodeBoundary(position: 'first' | 'last') {
      this.focusNodeTab(position === 'first' ? this.nodeOrder[0] : this.nodeOrder[this.nodeOrder.length - 1]);
    },

    focusPerspectiveTab(key: string) {
      this.selectPerspective(key);
      (this as unknown as AlpineComponent).$nextTick?.(() => {
        document.getElementById(`persp-tab-${key}`)?.focus();
      });
    },

    movePerspectiveFocus(offset: number) {
      const index = this.perspectiveOrder.indexOf(this.activePerspective);
      const nextIndex = (index + offset + this.perspectiveOrder.length) % this.perspectiveOrder.length;
      this.focusPerspectiveTab(this.perspectiveOrder[nextIndex]);
    },

    focusPerspectiveBoundary(position: 'first' | 'last') {
      this.focusPerspectiveTab(
        position === 'first'
          ? this.perspectiveOrder[0]
          : this.perspectiveOrder[this.perspectiveOrder.length - 1],
      );
    },

    getNodeClass(key: string) {
      return this.selectedNode === key
        ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-lg'
        : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20';
    },

    getPerspectiveClass(key: string) {
      return this.activePerspective === key
        ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 shadow-lg'
        : 'bg-black/40 text-zinc-400 border-white/10 hover:border-white/20';
    },

    nodes: architectureNodes,
  }));

  Alpine.data('governancePage', () => ({
    activeTab: 'overlord',
    tabOrder: ['overlord', 'sovereignty', 'sapphire', 'scaling'],

    selectTab(key: string) {
      this.activeTab = key;
    },

    focusTab(key: string) {
      this.selectTab(key);
      (this as unknown as AlpineComponent).$nextTick?.(() => {
        document.getElementById(`tab-${key}`)?.focus();
      });
    },

    moveTabFocus(offset: number) {
      const index = this.tabOrder.indexOf(this.activeTab);
      const nextIndex = (index + offset + this.tabOrder.length) % this.tabOrder.length;
      this.focusTab(this.tabOrder[nextIndex]);
    },

    focusTabBoundary(position: 'first' | 'last') {
      this.focusTab(
        position === 'first'
          ? this.tabOrder[0]
          : this.tabOrder[this.tabOrder.length - 1],
      );
    },
  }));
}
