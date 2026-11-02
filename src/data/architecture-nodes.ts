export interface ArchitectureSpec {
  label: string;
  val: string;
}

export interface ArchitectureNode {
  icon: string;
  title: string;
  subTitle: string;
  badge: string;
  description: string;
  specs: ArchitectureSpec[];
  code: string;
}

export const architectureNodes: Record<string, ArchitectureNode> = {
  directive: {
    icon: "📜",
    title: "Directives SOP",
    subTitle: "Layer 1: Deterministic Intent",
    badge: "INPUT_LAYER",
    description:
      "The entry point of the sovereign engine. Directives are authored in Markdown and YAML, ensuring that business logic is human-readable and machine-executable. The engine parses these into topologically sorted directed acyclic graphs (DAGs) of tasks.",
    specs: [
      { label: "Parsing Engine", val: "Tree-sitter / YAML-rs" },
      { label: "Validation", val: "Strict Schema Invariants" },
      { label: "Hot-Reload", val: "Instant (ReadDirectoryChangesW / inotify)" },
      { label: "Dual-Plane Mapping", val: "Plane 1 Engine / Plane 2 SMB" },
    ],
    code: `struct Directive {
  id: Uuid,
  sop_version: String,
  plane: ExecutionPlane,
  parameters: HashMap<String, Value>,
  invariants: Vec<SecurityInvariant>,
}`,
  },
  orchestration: {
    icon: "🧠",
    title: "Agent 99 Router",
    subTitle: "Layer 2: Intelligence Orchestration",
    badge: "LOGIC_LAYER",
    description:
      "The sovereign brain. Agent 99 evaluates directives, coordinates the 62-node agent roster, routes tasks across primary/secondary/tertiary model slots, and executes autonomous self-annealing to extract architectural wisdom into institutional memory.",
    specs: [
      { label: "Routing Logic", val: "Semantic Intent & DAG Sorting" },
      { label: "Model Fallback", val: "Tri-Slot Redundancy (BYOK / Ollama)" },
      { label: "A2A Settlement", val: "Two-Phase Commit (2PC) Ledger" },
      { label: "Self-Annealing", val: "Institutional Memory Extraction" },
    ],
    code: `enum RoutingStrategy {
  LowLatency(Slot1),
  HighReasoning(Slot2),
  MassiveContext(Slot3),
  HumanInLoop(SapphireShield),
  EconomicZone(A2ELedger),
}`,
  },
  execution: {
    icon: "⚙️",
    title: "Axum Rust Core",
    subTitle: "Layer 3: High-Performance Runtime",
    badge: "EXECUTION_LAYER",
    description:
      "Built with Axum 0.7 and Tokio, the execution engine handles asynchronous swarm concurrency with sub-millisecond telemetry. It runs deterministic Python/Rust tools with strict process sandboxing and fast-fail state validation.",
    specs: [
      { label: "Async Runtime", val: "Tokio Multi-Threaded" },
      { label: "Web Framework", val: "Axum 0.7 Engine" },
      { label: "Telemetry Pipeline", val: "10Hz MessagePack Stream" },
      { label: "Persistence", val: "Transactional SQLite Atomicity" },
    ],
    code: `async fn execute_task(task: Task) -> Result<Output, AppError> {
  let handle = tokio::spawn(async move {
    engine.process_sandboxed(task).await
  });
  handle.await?
}`,
  },
  governance: {
    icon: "🛡️",
    title: "Sapphire Shield",
    subTitle: "Zero-Trust Governance & ADG v2",
    badge: "TRUST_LAYER",
    description:
      "The zero-trust gatekeeper. Sapphire Shield intercepts high-consequence capability requests (filesystem mutation, budget spend, shell execution) and routes them to the human operator for cryptographically verified approval with SHA-256 Merkle audit chains.",
    specs: [
      { label: "Auth Protocol", val: "Merkle-Proof Signed Receipts" },
      { label: "Gate Type", val: "Zero-Trust Capability Intercept" },
      { label: "Integrity Engine", val: "Active Doc Guard (ADG v2)" },
      { label: "Fail-Closed Gate", val: "FR-11 Multi-Tenant Isolation" },
    ],
    code: `fn verify_governance(proof: &MerkleProof, tx: &Transaction) -> bool {
  let root = state.get_audit_root();
  proof.verify(root, tx.digest())
}`,
  },
  memory: {
    icon: "💾",
    title: "LanceDB & OKF Vault",
    subTitle: "Long-Term Sovereign Memory",
    badge: "DATA_LAYER",
    description:
      "Embedded vector database paired with relational metadata indexing the Open Knowledge Format (OKF) specification. Combines 768-dimensional IVF-PQ embeddings with Tree-sitter AST symbol graphs and $O(N)$ linear context compaction.",
    specs: [
      { label: "Vector Store", val: "LanceDB (768-dim, IVF-PQ)" },
      { label: "Code Graph", val: "Tree-sitter AST (7k+ symbols)" },
      { label: "Compactor", val: "O(N) Linear Context Filter" },
      { label: "Dual-Write", val: "Atomic SQLite + LanceDB" },
    ],
    code: `let table = lancedb.open_table("sovereign_mem")
  .search(query_vector)
  .limit(10)
  .execute()
  .await?;`,
  },
};
