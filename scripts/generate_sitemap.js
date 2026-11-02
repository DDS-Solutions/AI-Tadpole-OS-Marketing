import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { SITE_ORIGIN, BASE_PATH } from "../site.config.mjs";

const distDir = path.resolve("dist");
const siteOrigin = SITE_ORIGIN;
const basePath = BASE_PATH;

function getRouteLastModified(route) {
  const pageName = route === "/" ? "index" : route.slice(1, -1);
  const possiblePaths = [
    path.join("src", "pages", `${pageName}.astro`),
    path.join("src", "pages", pageName, "index.astro"),
    path.join("src", "layouts", "BaseLayout.astro"),
    path.join("src", "components", "layout", "Header.astro"),
    path.join("src", "components", "layout", "Footer.astro"),
    path.join("src", "styles", "global.css"),
  ];

  if (route === "/gallery/") {
    possiblePaths.push(path.join("src", "data", "gallery-items.ts"));
  }
  if (route === "/mission/") {
    possiblePaths.push(path.join("src", "data", "mission-slides.ts"));
  }
  if (route === "/" || route === "/how-it-works/") {
    possiblePaths.push(path.join("src", "data", "architecture-nodes.ts"));
  }
  if (route === "/") {
    possiblePaths.push(
      path.join("src", "components", "features", "Hero.astro"),
      path.join("src", "components", "features", "ArchitectureLayers.astro"),
      path.join("src", "components", "features", "ScreenshotGallery.astro"),
      path.join("src", "components", "features", "TemplateCatalog.astro"),
      path.join("src", "components", "features", "Roadmap.astro"),
      path.join("src", "components", "features", "BottomCta.astro"),
    );
  }

  const existingPaths = possiblePaths.filter((p) => fs.existsSync(p));
  if (existingPaths.length > 0) {
    try {
      const gitDate = execFileSync(
        "git",
        ["log", "-1", "--format=%cs", "--", ...existingPaths],
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
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
    const repoDate = execFileSync("git", ["log", "-1", "--format=%cs"], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(repoDate)) {
      return repoDate;
    }
  } catch {
    // If git history is completely unavailable, omit lastmod
  }

  return null;
}

function findIndexRoutes(directory, relativeDirectory = "") {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findIndexRoutes(absolutePath, relativePath);
    }

    if (entry.name !== "index.html") return [];
    const routeDirectory = path.dirname(relativePath).replaceAll("\\", "/");
    return [routeDirectory === "." ? "/" : `/${routeDirectory}/`];
  });
}

const routes = findIndexRoutes(distDir).sort((left, right) => {
  if (left === "/") return -1;
  if (right === "/") return 1;
  return left.localeCompare(right);
});

const urls = routes.map((route) => {
  const location = `${siteOrigin}${basePath}${route}`;
  const isHomepage = route === "/";
  const lastModified = getRouteLastModified(route);
  const lastModTag = lastModified
    ? `\n    <lastmod>${lastModified}</lastmod>`
    : "";
  return `  <url>
    <loc>${location}</loc>${lastModTag}
    <changefreq>${isHomepage ? "weekly" : "monthly"}</changefreq>
    <priority>${isHomepage ? "1.0" : "0.8"}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
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

fs.writeFileSync(path.join(distDir, "robots.txt"), robotsTxt, "utf8");
console.log(
  `Synchronized robots.txt with sitemap: ${siteOrigin}${basePath}/sitemap.xml`,
);

const llmsSource = path.resolve("public", "llms.txt");
if (fs.existsSync(llmsSource)) {
  const sourceText = fs.readFileSync(llmsSource, "utf8");
  // Normalize base URLs to current configured origin + base path
  const synchronizedText = sourceText.replace(
    /https:\/\/dds-solutions\.github\.io\/AI-Tadpole-OS-Marketing\//g,
    `${siteOrigin}${basePath}/`,
  );
  fs.writeFileSync(path.join(distDir, "llms.txt"), synchronizedText, "utf8");
  console.log(
    `Synchronized llms.txt from public/llms.txt with site URL: ${siteOrigin}${basePath}/`,
  );
}

const llmsFullSource = path.resolve("public", "llms-full.txt");
if (fs.existsSync(llmsFullSource)) {
  const sourceText = fs.readFileSync(llmsFullSource, "utf8");
  const synchronizedText = sourceText.replace(
    /https:\/\/dds-solutions\.github\.io\/AI-Tadpole-OS-Marketing\//g,
    `${siteOrigin}${basePath}/`,
  );
  fs.writeFileSync(
    path.join(distDir, "llms-full.txt"),
    synchronizedText,
    "utf8",
  );
  console.log(
    `Synchronized llms-full.txt with site URL: ${siteOrigin}${basePath}/`,
  );
}
