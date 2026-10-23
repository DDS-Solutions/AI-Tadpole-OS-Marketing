import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, BASE_PATH } from '../site.config.mjs';

const distDir = path.resolve('dist');
const siteOrigin = SITE_ORIGIN;
const basePath = BASE_PATH;

function getRouteLastModified(route) {
  const pageName = route === '/' ? 'index' : route.slice(1, -1);
  const possiblePaths = [
    path.join('src', 'pages', `${pageName}.astro`),
    path.join('src', 'pages', pageName, 'index.astro'),
    path.join('src', 'layouts', 'BaseLayout.astro'),
    path.join('src', 'components', 'layout', 'Header.astro'),
    path.join('src', 'components', 'layout', 'Footer.astro'),
    path.join('src', 'styles', 'global.css'),
  ];

  const existingPaths = possiblePaths.filter((p) => fs.existsSync(p));
  if (existingPaths.length > 0) {
    try {
      const gitDate = execFileSync(
        'git',
        ['log', '-1', '--format=%cs', '--', ...existingPaths],
        {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        },
      ).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
        return gitDate;
      }
    } catch {
      // Fall through to repository fallback
    }
  }

  try {
    const repoDate = execFileSync(
      'git',
      ['log', '-1', '--format=%cs'],
      {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      },
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(repoDate)) {
      return repoDate;
    }
  } catch {
    // If git history is completely unavailable, omit lastmod
  }

  return null;
}

function findIndexRoutes(directory, relativeDirectory = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findIndexRoutes(absolutePath, relativePath);
    }

    if (entry.name !== 'index.html') return [];
    const routeDirectory = path.dirname(relativePath).replaceAll('\\', '/');
    return [routeDirectory === '.' ? '/' : `/${routeDirectory}/`];
  });
}

const routes = findIndexRoutes(distDir).sort((left, right) => {
  if (left === '/') return -1;
  if (right === '/') return 1;
  return left.localeCompare(right);
});

const urls = routes.map((route) => {
  const location = `${siteOrigin}${basePath}${route}`;
  const isHomepage = route === '/';
  const lastModified = getRouteLastModified(route);
  const lastModTag = lastModified ? `\n    <lastmod>${lastModified}</lastmod>` : '';
  return `  <url>
    <loc>${location}</loc>${lastModTag}
    <changefreq>${isHomepage ? 'weekly' : 'monthly'}</changefreq>
    <priority>${isHomepage ? '1.0' : '0.8'}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${routes.length} routes.`);

const robotsTxt = `# Robots.txt for AI-Tadpole-OS-Marketing
User-agent: *
Allow: /

# Specific AI & LLM User-Agents
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${siteOrigin}${basePath}/sitemap.xml
`;

fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
console.log(`Synchronized robots.txt with sitemap: ${siteOrigin}${basePath}/sitemap.xml`);

const llmsTxt = `# AI-Tadpole-OS

> A local-first, sovereign multi-agent runtime designed for high-performance orchestration, private memory, and human-in-the-loop governance.

AI-Tadpole-OS (Tadpole OS) separates directives, orchestration, and execution into a robust, three-layer architecture to solve the probabilistic reliability issue of LLM applications.

## Primary Documentation Links
- [Core Runtime Github](https://github.com/DDS-Solutions/AI-TadPole-OS)
- [How It Works](${siteOrigin}${basePath}/how-it-works/)
- [Mission & Sovereign Vision](${siteOrigin}${basePath}/mission/)
- [Governance Protocol](${siteOrigin}${basePath}/governance/)

## Key Technical Specifications
- **Core Runtime**: Written in high-performance Rust for deterministic thread/process isolation.
- **Agent Orchestration**: Swarm coordination with a configurable telemetry heartbeat; the reference interface uses a 10Hz stream.
- **Agent Intelligence**: Self-annealing, self-debugging loop designed for runtime stability.
- **Private Memory & RAG**: LanceDB vector database and SQLite indexing mapping the Open Knowledge Foundation (OKF) specification for structured institutional knowledge.
- **Templates Ecosystem**: Visual Swarm Architect tool and 223 specialized agent roles across 25 industry template collections (81 starter templates).
- **Safety & Security**: Sapphire Shield capability gates can require human operator approval, local-first data boundaries, and Merkle-trail audit records when those controls are enabled.

Performance, security, and regulatory outcomes depend on deployment configuration, infrastructure, models, and operating procedures. References to ISO, NIST, HIPAA, SOC 2, ALCOA+, or GxP describe design mappings or intended control support; they are not certifications.

## Marketing Site Sitemap
- **Homepage** (\`${siteOrigin}${basePath}/\`): High-level overview of runtime features, telemetry, templates ecosystem, visual Swarm Architect, and OS characteristics.
- **How It Works** (\`${siteOrigin}${basePath}/how-it-works/\`): Details on the three-layer architecture (Directive, Orchestration, Execution), Knowledge Vault (OKF & LanceDB), BFS pathfinding, and memory integration.
- **Mission** (\`${siteOrigin}${basePath}/mission/\`): Focus on sovereign intelligence, privacy-preserving local swarms, and independence from monopolistic API dependencies.
- **Governance** (\`${siteOrigin}${basePath}/governance/\`): Explanations of safety systems, consensus algorithms, and telemetry constraints.
`;

fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxt, 'utf8');
console.log(`Synchronized llms.txt with site URL: ${siteOrigin}${basePath}/`);
