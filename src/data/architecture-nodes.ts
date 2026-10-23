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
};
