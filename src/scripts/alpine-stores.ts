// 1. Define a type for Alpine components to improve TypeScript type-safety
interface AlpineComponent {
  $nextTick: (callback: () => void) => void;
  $refs: Record<string, HTMLElement | undefined>;
}

// 2. Extract shared lightbox logic into a reusable mixin
const lightboxMixin = () => ({
  lightboxOpen: false,
  lightboxImg: '',
  lastFocusedElement: null as HTMLElement | null,

  openLightbox(imgUrl: string) {
    this.lastFocusedElement = document.activeElement as HTMLElement | null;
    this.lightboxImg = imgUrl;
    this.lightboxOpen = true;
    (this as unknown as AlpineComponent).$nextTick(() => {
      (this as unknown as AlpineComponent).$refs.closeButton?.focus();
    });
  },

  closeLightbox() {
    this.lightboxOpen = false;
    (this as unknown as AlpineComponent).$nextTick(() => {
      this.lastFocusedElement?.focus();
    });
  },
});

export function registerAlpineComponents(Alpine: any) {
  Alpine.data('homepage', () => ({
    ...lightboxMixin(),
  }));

  Alpine.data('missionPage', () => {
    // Configuration constants for easily adjustable timing
    const AUTO_PLAY_DURATION = 4500;
    const TIMER_INTERVAL = 50;

    return {
      ...lightboxMixin(),
      currentSlide: 0,
      autoPlay: true,
      autoPlayProgress: 0,
      progressTimer: null as ReturnType<typeof setInterval> | null,
      keyHandler: null as ((e: KeyboardEvent) => void) | null,
      basePath: '/AI-Tadpole-OS-Marketing',

      slides: [
        {
          shortTitle: 'Swarm Init',
          badge: 'Phase 1: Cluster Initialization',
          title: 'Swarm & Cluster Initialization',
          image: '/AI-Tadpole-OS-Marketing/assets/real_mission/step1_initial_state.png',
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
          image: '/AI-Tadpole-OS-Marketing/assets/real_mission/step2_neural_proposal.png',
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
          image: '/AI-Tadpole-OS-Marketing/assets/real_mission/step3_execution_started.png',
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
          image: '/AI-Tadpole-OS-Marketing/assets/real_mission/step4_execution_streaming.png',
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
          image: '/AI-Tadpole-OS-Marketing/assets/real_mission/step5_oversight_zero_trust_gate.png',
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
          image: '/AI-Tadpole-OS-Marketing/assets/real_mission/step6_execution_resumed.png',
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
        this.startAutoPlayTimer();
        this.keyHandler = (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft') this.prevSlide();
          if (e.key === 'ArrowRight') this.nextSlide();
        };
        window.addEventListener('keydown', this.keyHandler);
        document.addEventListener('astro:before-preparation', () => this.destroy(), { once: true });
      },

      destroy() {
        this.clearAutoPlayTimers();
        if (this.keyHandler) {
          window.removeEventListener('keydown', this.keyHandler);
          this.keyHandler = null;
        }
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

    selectNode(key: string) {
      this.selectedNode = key;
    },

    selectPerspective(key: string) {
      this.activePerspective = key;
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
        icon: '📄',
        title: 'Layer 1: Directive SOP Engine',
        subTitle: 'Human Intent & SOP Source of Truth',
        badge: 'Layer 1',
        description:
          'Directives are versioned Markdown SOP documents living in directives/. They define clear goals, parameters, tool bindings, and edge cases. Directives represent human intent—keeping AI agents grounded without probabilistic drift.',
        specs: [
          { label: 'File Storage Location', val: 'directives/*.md' },
          { label: 'Metadata Schema', val: 'YAML Frontmatter' },
          { label: 'Validation Protocol', val: 'ADG-01 Static Analysis' },
        ],
        code: `---
name: "Security Audit Directive"
version: "1.2.0"
capabilities_required: ["shell:execute", "read_file"]
---
# Objective: Audit Rust FFI bindings for memory safety.`,
      },
      orchestration: {
        icon: '🧠',
        title: 'Layer 2: Agent 99 Orchestrator',
        subTitle: 'Swarm Commander & Tri-Slot Router',
        badge: 'Layer 2',
        description:
          'Agent 99 acts as the master swarm orchestrator. It decomposes high-level SOP goals into subagent tasks, manages model routing across primary (Ollama), secondary (Groq), and tertiary (Gemini) slots, and writes to long-term memory via Self-Annealing loops.',
        specs: [
          { label: 'Swarm Commander', val: 'Agent 99 (ID 1)' },
          {
            label: 'Model Fallback Routing',
            val: 'Tri-Slot Auto Failover',
          },
          { label: 'Memory Retention', val: 'LONG_TERM_MEMORY.md' },
        ],
        code: `async fn route_task(prompt: &str) -> TaskPlan {
    let model = router.select_primary().unwrap_or(router.fallback());
    model.decompose_and_plan(prompt).await
}`,
      },
      execution: {
        icon: '⚡',
        title: 'Layer 3: Rust Core Engine',
        subTitle: 'Axum, Tokio Async & FuturesUnordered',
        badge: 'Layer 3',
        description:
          'The execution layer is built in high-performance Rust (server-rs). Tokio task loops run subagent tool execution in parallel using FuturesUnordered for concurrent, low-latency execution.',
        specs: [
          { label: 'Web Server Framework', val: 'Axum (Async Tokio)' },
          { label: 'Parallel Task Driver', val: 'FuturesUnordered' },
          {
            label: 'Tool Interface Standard',
            val: 'Model Context Protocol (MCP)',
          },
        ],
        code: `let mut tasks = FuturesUnordered::new();
for tool_call in tool_calls {
    tasks.push(tokio::spawn(execute_mcp_tool(tool_call)));
}`,
      },
      governance: {
        icon: '🛡️',
        title: 'Sapphire Shield Zero-Trust Gate',
        subTitle: 'Human-in-the-Loop & Merkle Proofs',
        badge: 'Governance',
        description:
          'Zero-trust governance boundary protecting sensitive systems. Whenever an agent requests high-risk tool calls (such as shell execution or budget spending), execution is frozen until an Overlord signs a cryptographic Merkle-proof authorization.',
        specs: [
          { label: 'Gate Intercept Standard', val: 'WebSocket HITL' },
          { label: 'Audit Proof Ledger', val: 'Merkle Hash (OBLITERATUS)' },
          { label: 'Privacy Boundary', val: 'Hard Privacy Air-Gap' },
        ],
        code: `if tool.requires_approval() {
    sapphire_shield.freeze_and_prompt(tool_name).await?;
    let merkele_proof = overlord_signature.verify()?;
}`,
      },
      memory: {
        icon: '🧠',
        title: 'LanceDB GraphRAG Memory Store',
        subTitle: 'Institutional Knowledge Store (IKS)',
        badge: 'Memory Store',
        description:
          'Multi-modal vector database and entity-relationship graph. SOP playbooks, code symbols, and run histories are vectorized into local 768-dimensional embeddings for instantaneous, cloud-free GraphRAG context retrieval.',
        specs: [
          { label: 'Vector Database Engine', val: 'LanceDB Local' },
          { label: 'Embedding Model', val: 'text-embedding-004' },
          { label: 'Telemetry Privacy', val: 'Secret Scrubbing Active' },
        ],
        code: `let vector_store = LanceDb::connect("./.tmp/iks.db").await?;
let context = vector_store.query_graph_rag(prompt_embedding).await?;`,
      },
    },
  }));

  Alpine.data('governancePage', () => ({
    activeTab: 'overlord',
  }));
}
