import { copyFile, readFile, writeFile } from 'node:fs/promises';

const source = 'dist/fideo.umd.cjs';
const sourceMap = 'dist/fideo.umd.cjs.map';
const globalBuild = 'dist/fideo.global.js';
const globalMap = 'dist/fideo.global.js.map';
const cssBuild = 'dist/fideo.css';
const legacyCssBuild = 'dist/styles.css';

const code = await readFile(source, 'utf8');
await writeFile(globalBuild, code.replace('//# sourceMappingURL=fideo.umd.cjs.map', '//# sourceMappingURL=fideo.global.js.map'));
await copyFile(sourceMap, globalMap);
await copyFile(cssBuild, legacyCssBuild);
