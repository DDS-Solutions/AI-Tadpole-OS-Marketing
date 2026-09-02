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

  openLightbox(imgUrl: string, altText = 'Full-resolution screenshot') {
    this.lastFocusedElement = document.activeElement as HTMLElement | null;
    this.lightboxImg = imgUrl;
    this.lightboxAlt = altText;
    this.lightboxOpen = true;
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const backgroundElements = document.querySelectorAll<HTMLElement>(
      'body > header, main > :not([role="dialog"])',
    );
    this.inertedElements = Array.from(backgroundElements).filter(
      (element) => !element.hasAttribute('inert'),
    );
    this.inertedElements.forEach((element) => element.setAttribute('inert', ''));

    (this as unknown as AlpineComponent).$nextTick(() => {
      (this as unknown as AlpineComponent).$refs.closeButton?.focus();
    });
  },

  closeLightbox() {
    const shouldRestoreFocus = this.lightboxOpen;
    const focusTarget = this.lastFocusedElement;
    this.lightboxOpen = false;
    this.lightboxImg = '';
    this.lightboxAlt = 'Full-resolution screenshot';
    this.lastFocusedElement = null;
    document.body.style.overflow = this.previousBodyOverflow;
    this.inertedElements.forEach((element) => element.removeAttribute('inert'));
    this.inertedElements = [];
    if (shouldRestoreFocus) {
      (this as unknown as AlpineComponent).$nextTick(() => {
        focusTarget?.focus();
      });
    }
  },

  trapLightboxFocus(event: KeyboardEvent) {
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
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },

  bindLightboxCleanup() {
    document.addEventListener(
      'astro:before-preparation',
      () => this.closeLightbox(),
      { once: true },
    );
  },
});

export function registerAlpineComponents(Alpine: any) {
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
      slides: [
        {
          shortTitle: 'Swarm Init',
          badge: 'Phase 1: Cluster Initialization',
          title: 'Swarm & Cluster Initialization',
          image: `${assetBaseUrl}assets/real_mission/step1_initial_state.png`,
          description: 'The OS scans active swarm clusters. The Strategic Command cluster (cl-command) is initialized with 60 Nodes online and a $100.00 execution budget in workspace /workspaces/strategic-command.',
          metrics: [
            { label: 'Active Swarm Clusters', value: '4 / 5 Online' },
            { label: 'Swarm Node Density', value: '60 Nodes' },
            { label: 'Target Workspace', value: '/workspaces/strategic-command' }
          ],
          logSnippet: '<span class="text-cyan-400">[INIT]</span> Swarm Cluster Strategic Command mounted. 60 Nodes initialized.'
        },
        {
          shortTitle: 'Neural Sync',
          badge: 'Phase 2: GraphRAG Optimization',
          title: 'Neural Graph Optimization Proposal',
          image: `${assetBaseUrl}assets/real_mission/step2_neural_proposal.png`,
          description: 'When entering a mission objective ("Execute Sovereign Security Audit on server-rs"), the AI-Tadpole-OS neural engine automatically proposes GraphRAG context synchronization across local LanceDB vectors.',
          metrics: [
            { label: 'Embedding Vector Engine', value: 'LanceDB (768-dim)' },
            { label: 'Authorization Status', value: 'Awaiting User Sync' },
            { label: 'Graph Triples', value: 'ISO 9001 / ALCOA+' }
          ],
          logSnippet: '<span class="text-amber-400">[PROPOSAL]</span> Neural context sync proposed for directive security_audit.md.'
        },
        {
          shortTitle: 'Mission Launch',
          badge: 'Phase 3: Telemetry Stream',
          title: 'Mission Launch & 10Hz Telemetry',
          image: `${assetBaseUrl}assets/real_mission/step3_execution_started.png`,
          description: 'Authorizing sync triggers the RUN MISSION command. The MessagePack 10Hz telemetry pipeline opens, streaming real-time status into the Run Log and Event Log.',
          metrics: [
            { label: 'Telemetry Transport', value: 'MessagePack 10Hz' },
            { label: 'Assigned Agent', value: 'Agent of Nine (L2)' },
            { label: 'Run Log Status', value: 'Streaming Active' }
          ],
          logSnippet: '<span class="text-emerald-400">[RUN]</span> Mission cluster Strategic Command started. Agent of Nine dispatched.'
        },
        {
          shortTitle: 'OTel Waterfall',
          badge: 'Phase 4: Neural Trace Stream',
          title: 'OTel Neural Trace Waterfall Stream',
          image: `${assetBaseUrl}assets/real_mission/step4_execution_streaming.png`,
          description: 'The OpenTelemetry (OTel) waterfall trace panel provides detailed visibility into subagent tool calls, memory indexing, and token scrubbing during execution.',
          metrics: [
            { label: 'Trace Granularity', value: 'Observe-Call-Audit' },
            { label: 'Token Scrubbing', value: 'Real-Time' },
            { label: 'Subagent Concurrency', value: 'Parallel Futures' }
          ],
          logSnippet: '<span class="text-purple-400">[OTEL]</span> Trace ID 0x8f3a2b1c attached. Subagent execution trace available.'
        },
        {
          shortTitle: 'Oversight Gate',
          badge: 'Phase 5: Oversight & Zero-Trust Gate',
          title: 'Swarm Intelligence Oversight & Action Ledger',
          image: `${assetBaseUrl}assets/real_mission/step5_oversight_zero_trust_gate.png`,
          description: 'The Oversight surface provides real-time Zero-Trust governance. The Overlord inspects the Action Ledger for all HITL approvals, verifies parameter payloads, monitors agent decisions, or executes HALT AGENTS and KILL ENGINE safeguards.',
          metrics: [
            { label: 'Action Ledger Status', value: '6 Approvals Certified' },
            { label: 'Safeguard Controls', value: 'HALT / KILL ENGINE' },
            { label: 'Governance Intercept', value: 'HITL Zero-Trust Gate' }
          ],
          logSnippet: '<span class="text-amber-400">[OVERSIGHT]</span> Zero-Trust Action Ledger active. 6 actions verified & certified.'
        },
        {
          shortTitle: 'Reconciliation',
          badge: 'Phase 6: Sovereign Audit',
          title: 'Mission Resume & Audit Reconciliation',
          image: `${assetBaseUrl}assets/real_mission/step6_execution_resumed.png`,
          description: 'Resuming operations completes the security audit, generating a signed Merkle-proof certificate and updating the permanent audit ledger.',
          metrics: [
            { label: 'Execution State', value: 'Resumed & Completed' },
            { label: 'Audit Merkle Proof', value: '0x7f83a91b... Signed' },
            { label: 'Protocol Ledger', value: 'Reconciled' }
          ],
          logSnippet: '<span class="text-emerald-400">[RESUME]</span> ▶️ Strategic Command operations resumed. Audit certified.'
        }
      ],

      init() {
        this.bindLightboxCleanup();
        this.startAutoPlayTimer();
        document.addEventListener('astro:before-preparation', () => this.destroy(), { once: true });
      },

      destroy() {
        this.clearAutoPlayTimers();
        this.closeLightbox();
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
        if (!this.autoPlay) return;

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
      document.getElementById(`arch-tab-${key}`)?.focus();
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
      document.getElementById(`persp-tab-${key}`)?.focus();
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

    nodes: {
      directive: {
        icon: "📜",
        title: "Directives SOP",
        subTitle: "Layer 1: Instruction Set",
        badge: "INPUT_LAYER",
        description:
          "The entry point of the sovereign engine. Directives are authored in Markdown and YAML, ensuring that business logic is human-readable but machine-executable. The engine parses these into a directed acyclic graph (DAG) of tasks.",
        specs: [
          { label: "Parsing Engine", val: "Tree-sitter / YAML-rs" },
          { label: "Validation", val: "Schema-Strict" },
          { label: "Hot-Reload", val: "Instant (FS-Watch)" },
          { label: "Control Mapping", val: "Deployment-Dependent" },
        ],
        code: `struct Directive {
  id: Uuid,
  sop_version: String,
  parameters: HashMap<String, Value>,
  constraints: Vec<Constraint>,
}`,
      },
      orchestration: {
        icon: "🧠",
        title: "Agent 99 Router",
        subTitle: "Layer 2: Intelligence Orchestration",
        badge: "LOGIC_LAYER",
        description:
          "The brain of the operation. Agent 99 evaluates the Directive and routes the request to the optimal model slot. It manages the Swarm Hierarchy, deciding when to spawn sub-agents or call for human intervention.",
        specs: [
          { label: "Routing Logic", val: "Semantic Intent Mapping" },
          { label: "Fallback Chain", val: "Tri-Slot Redundancy" },
          { label: "Concurrency", val: "Tokio Multi-threaded" },
          { label: "State Mgmt", val: "Redis / In-Memory" },
        ],
        code: `enum RoutingStrategy {
  LowLatency(Slot1),
  HighReasoning(Slot2),
  MassiveContext(Slot3),
  HumanInLoop(SapphireShield),
}`,
      },
      execution: {
        icon: "⚙️",
        title: "Rust Core Engine",
        subTitle: "Layer 3: High-Performance Runtime",
        badge: "EXECUTION_LAYER",
        description:
          "Built with Axum and Tokio, the execution engine handles asynchronous task processing using Rust's memory-safety model. Throughput depends on hardware, workload, model latency, and tool configuration.",
        specs: [
          { label: "Runtime", val: "Tokio Async" },
          { label: "Web Framework", val: "Axum 0.7" },
          { label: "Throughput", val: "Benchmark per Deployment" },
          { label: "Memory", val: "Zero-Copy Deserialization" },
        ],
        code: `async fn execute_task(task: Task) -> Result<Output, Error> {
  let handle = tokio::spawn(async move {
    engine.process(task).await
  });
  handle.await
}`,
      },
      governance: {
        icon: "🛡️",
        title: "Sapphire Shield",
        subTitle: "Governance & Security",
        badge: "TRUST_LAYER",
        description:
          "The zero-trust gatekeeper. Sapphire Shield intercepts any high-risk tool calls (e.g., file deletion, fund transfer) and triggers a WebSocket event to the Human-In-The-Loop (HITL) dashboard for cryptographically signed approval.",
        specs: [
          { label: "Auth Protocol", val: "Merkle-Proof Signed" },
          { label: "Gate Type", val: "Hard Privacy Gate" },
          { label: "Audit Log", val: "OBLITERATUS Ledger" },
          { label: "Latency", val: "Environment-Dependent" },
        ],
        code: `fn verify_governance(proof: MerkleProof) -> bool {
  let root = state.get_root();
  proof.verify(root, current_transaction)
}`,
      },
      memory: {
        icon: "💾",
        title: "LanceDB GraphRAG",
        subTitle: "Long-Term Sovereign Memory",
        badge: "DATA_LAYER",
        description:
          "A serverless vector database that combines Graph structures with RAG. It allows the swarm to remember preferences, historical outcomes, and complex entity relationships across millions of documents.",
        specs: [
          { label: "Indexing", val: "IVF-PQ" },
          { label: "Embeddings", val: "768-dim (text-004)" },
          { label: "Query Speed", val: "Benchmark per Index" },
          { label: "Storage", val: "Disk-native / S3" },
        ],
        code: `let table = lancedb.open_table("sovereign_mem")
  .search(query_vector)
  .limit(10)
  .execute()
  .await?;`,
      },
    },
  }));

  Alpine.data('governancePage', () => ({
    activeTab: 'overlord',
    tabOrder: ['overlord', 'sovereignty', 'sapphire', 'scaling'],

    selectTab(key: string) {
      this.activeTab = key;
    },

    focusTab(key: string) {
      this.selectTab(key);
      document.getElementById(`tab-${key}`)?.focus();
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
