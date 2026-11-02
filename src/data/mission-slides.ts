export interface MissionSlideMetric {
  label: string;
  value: string;
}

export interface MissionSlide {
  shortTitle: string;
  badge: string;
  title: string;
  image: string;
  description: string;
  metrics: MissionSlideMetric[];
  logSnippet: string;
}

export function getMissionSlides(assetBaseUrl: string): MissionSlide[] {
  return [
    {
      shortTitle: 'Swarm Init',
      badge: 'Phase 1: Cluster Initialization',
      title: 'Swarm & Cluster Initialization',
      image: `${assetBaseUrl}assets/real_mission/step1_initial_state.png`,
      description: 'The sovereign engine scans active clusters across the 62-node roster. The Strategic Command cluster (cl-command) initializes with active agent nodes online, a $100.00 execution budget, and local workspace mounting.',
      metrics: [
        { label: 'Active Swarm Clusters', value: '4 / 5 Online' },
        { label: 'Registered Swarm Nodes', value: '62 Nodes Online' },
        { label: 'Base Execution Budget', value: '$100.00 USD' }
      ],
      logSnippet: '<span class="text-cyan-400">[INIT]</span> Swarm Cluster Strategic Command mounted. 62 Nodes initialized on port 5173/8000.'
    },
    {
      shortTitle: 'Neural Sync',
      badge: 'Phase 2: GraphRAG Optimization',
      title: 'Neural Graph Optimization Proposal',
      image: `${assetBaseUrl}assets/real_mission/step2_neural_proposal.png`,
      description: 'When initializing a mission objective ("Execute Sovereign Security Audit on server-rs"), the neural engine synchronizes 7,205 symbols and 43,517 dependency edges across embedded LanceDB 768-dim vector embeddings.',
      metrics: [
        { label: 'Embedding Vector Engine', value: 'LanceDB (768-dim IVF-PQ)' },
        { label: 'Symbol Graph Nodes', value: '7,205 Symbols / 43,517 Edges' },
        { label: 'Compliance Mapping', value: 'ISO 9001 / ALCOA+ Invariants' }
      ],
      logSnippet: '<span class="text-amber-400">[PROPOSAL]</span> Neural context sync proposed for directive security_audit.md.'
    },
    {
      shortTitle: 'Mission Launch',
      badge: 'Phase 3: Telemetry Stream',
      title: 'Mission Launch & 10Hz Telemetry',
      image: `${assetBaseUrl}assets/real_mission/step3_execution_started.png`,
      description: 'Authorizing execution dispatches the mission. The local MessagePack 10Hz telemetry pipeline streams sub-millisecond node metrics into the Run Log, Event Log, and top ticker bar.',
      metrics: [
        { label: 'Telemetry Transport', value: 'MessagePack 10Hz WebSocket' },
        { label: 'Dispatch Lead', value: 'Agent of Nine (CEO / L2)' },
        { label: 'Run Log Status', value: 'Streaming Active (0ms Latency)' }
      ],
      logSnippet: '<span class="text-emerald-400">[RUN]</span> Mission cluster Strategic Command started. Agent of Nine dispatched.'
    },
    {
      shortTitle: 'OTel Waterfall',
      badge: 'Phase 4: Neural Trace Stream',
      title: 'OTel Neural Trace Waterfall Stream',
      image: `${assetBaseUrl}assets/real_mission/step4_execution_streaming.png`,
      description: 'The OpenTelemetry (OTel) waterfall trace panel provides granular span observability into subagent tool calls, memory retrieval, token scrubbing, and asynchronous futures concurrency.',
      metrics: [
        { label: 'Trace Granularity', value: 'Observe-Call-Audit Spans' },
        { label: 'Secret Redaction', value: 'OBLITERATUS Filter Active' },
        { label: 'Concurrency Engine', value: 'Tokio FuturesUnordered' }
      ],
      logSnippet: '<span class="text-purple-400">[OTEL]</span> Trace ID 0x8f3a2b1c attached. Subagent execution spans verified.'
    },
    {
      shortTitle: 'Oversight Gate',
      badge: 'Phase 5: Oversight & Zero-Trust Gate',
      title: 'Swarm Intelligence Oversight & Action Ledger',
      image: `${assetBaseUrl}assets/real_mission/step5_oversight_zero_trust_gate.png`,
      description: 'The Sapphire Shield surface provides zero-trust governance. Human operators inspect the Action Ledger for all HITL approvals, verify payload diffs, audit agent decisions, or trigger HALT / KILL ENGINE safeguards.',
      metrics: [
        { label: 'Action Ledger Status', value: 'Certified HITL Approvals' },
        { label: 'Safeguard Controls', value: 'HALT SWARM / KILL ENGINE' },
        { label: 'Governance Intercept', value: 'Sapphire Shield Zero-Trust' }
      ],
      logSnippet: '<span class="text-amber-400">[OVERSIGHT]</span> Zero-Trust Action Ledger active. Critical tool calls intercepted and certified.'
    },
    {
      shortTitle: 'Reconciliation',
      badge: 'Phase 6: Sovereign Audit',
      title: 'Mission Resume & Audit Reconciliation',
      image: `${assetBaseUrl}assets/real_mission/step6_execution_resumed.png`,
      description: 'Resuming operations completes the execution cycle, generating a tamper-evident SHA-256 Merkle-proof certificate and recording the immutable entry in the permanent audit ledger.',
      metrics: [
        { label: 'Execution State', value: 'Completed & Certified' },
        { label: 'Audit Merkle Proof', value: '0x7f83a91b... Sealed' },
        { label: 'Protocol Ledger', value: 'Reconciled & Immutable' }
      ],
      logSnippet: '<span class="text-cyan-400">[AUDIT]</span> Security audit completed. Sovereign Merkle root 0x7f83a91b sealed.'
    }
  ];
}
