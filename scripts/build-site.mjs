import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SITE = 'site';
const EXAMPLES = 'examples';
const DIST = 'dist';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const versionTag = `v${pkg.version}`;
const versionScript = `<script>window.__FIDEO_VERSION=${JSON.stringify(pkg.version)};</script>`;

await rm(SITE, { recursive: true, force: true });
await mkdir(SITE, { recursive: true });

await cp(DIST, join(SITE, 'dist'), { recursive: true });
await cp('assets', join(SITE, 'assets'), { recursive: true });

// examples/posters/ sits at the site root; every other directory keeps its name.
const DIRECTORY_TARGETS = { posters: 'posters' };

async function copyTree(sourceDir, destDir, depth) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const src = join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      const target = depth === 0 ? (DIRECTORY_TARGETS[entry.name] ?? entry.name) : entry.name;
      await copyTree(src, join(destDir, target), depth + 1);
      continue;
    }

    const dest = join(destDir, entry.name);
    if (!entry.name.endsWith('.html')) {
      // Favicons, manifest, verification files, pinned benchmark builds, etc.
      await cp(src, dest);
      continue;
    }

    // In examples/ the built assets live one level above the repo-root page;
    // in site/ they are siblings, so each nesting level drops one `../`.
    const html = await readFile(src, 'utf8');
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    await writeFile(
      dest,
      html
        .replaceAll('../'.repeat(depth + 1) + 'dist/', `${prefix}dist/`)
        .replaceAll('../'.repeat(depth + 1) + 'assets/', `${prefix}assets/`)
        .replaceAll('v__FIDEO_VERSION__', versionTag)
        .replace('</head>', `  ${versionScript}\n  </head>`),
    );
  }
}

await copyTree(EXAMPLES, SITE, 0);

console.log(`Built ${SITE}/ for static deploy (v${pkg.version}).`);
