import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const siteOrigin = process.env.SITE_ORIGIN ?? 'https://dds-solutions.github.io';
const basePath = process.env.BASE_PATH ?? '/AI-Tadpole-OS-Marketing';
const lastModified = new Date().toISOString().slice(0, 10);

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
