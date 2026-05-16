import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'site';
const EXAMPLES = 'examples';
const DIST = 'dist';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const versionScript = `<script>window.__FIDEO_VERSION=${JSON.stringify(pkg.version)};</script>`;

await rm(SITE, { recursive: true, force: true });
await mkdir(SITE, { recursive: true });

await cp(DIST, join(SITE, 'dist'), { recursive: true });
await cp('assets', join(SITE, 'assets'), { recursive: true });
await cp(join(EXAMPLES, 'posters'), join(SITE, 'posters'), { recursive: true });

const entries = await readdir(EXAMPLES, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const src = join(EXAMPLES, entry.name);
  const dest = join(SITE, entry.name);
  const html = await readFile(src, 'utf8');
  await writeFile(dest, html
    .replaceAll('../dist/', './dist/')
    .replaceAll('../assets/', './assets/')
    .replace('</head>', `  ${versionScript}\n  </head>`));
}

console.log(`Built ${SITE}/ for static deploy (v${pkg.version}).`);
