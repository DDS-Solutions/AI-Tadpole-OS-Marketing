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
      description: 'The OS scans active swarm clusters. The Strategic Command cluster (cl-command) is initialized with 60 Nodes online and a $100.00 execution budget in workspace /opt/tadpole/workspaces/primary-cluster.',
      metrics: [
        { label: 'Active Swarm Clusters', value: '4 / 5 Online' },
        { label: 'Swarm Node Density', value: '60 Nodes' },
        { label: 'Target Workspace', value: '/opt/tadpole/workspaces/primary-cluster' }
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
      logSnippet: '<span class="text-cyan-400">[AUDIT]</span> Security audit completed. Sovereign Merkle root 0x7f83a91b sealed.'
    }
  ];
}
