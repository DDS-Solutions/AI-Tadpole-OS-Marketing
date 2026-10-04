import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, BASE_PATH } from '../site.config.mjs';

const distDir = path.resolve('dist');
const siteOrigin = SITE_ORIGIN;
const basePath = BASE_PATH;

function getRouteLastModified(route) {
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const pageName = route === '/' ? 'index' : route.slice(1, -1);
  const possiblePaths = [
    path.join('src', 'pages', `${pageName}.astro`),
    path.join('src', 'pages', pageName, 'index.astro'),
  ];

  for (const sourcePath of possiblePaths) {
    if (fs.existsSync(sourcePath)) {
      try {
        const gitDate = execSync(`git log -1 --format=%cs -- "${sourcePath}"`, {
          stdio: ['pipe', 'pipe', 'ignore'],
        })
          .toString()
          .trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
          return gitDate;
        }
      } catch {
        // Fall back to current date if git log fails
      }
    }
  }

  return fallbackDate;
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
  return `  <url>
    <loc>${location}</loc>
    <lastmod>${lastModified}</lastmod>
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
