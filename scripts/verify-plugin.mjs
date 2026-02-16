#!/usr/bin/env node
/**
 * Verify figma-plugin/code.js contains no ?? or ?. (Figma plugin runtime compatibility).
 * Exits 1 if found, 0 otherwise.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const codePath = path.join(root, 'figma-plugin/code.js');

if (!fs.existsSync(codePath)) {
  console.error('verify:plugin: figma-plugin/code.js not found. Run npm run build:plugin first.');
  process.exit(1);
}

const code = fs.readFileSync(codePath, 'utf8');
const lines = code.split('\n');
let failed = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  if (line.includes('??')) {
    console.error(`figma-plugin/code.js:${lineNum}: contains "??" (nullish coalescing)`);
    failed = true;
  }
  if (line.includes('?.')) {
    console.error(`figma-plugin/code.js:${lineNum}: contains "?." (optional chaining)`);
    failed = true;
  }
}

if (failed) {
  console.error('verify:plugin failed. Plugin code must not use ?? or ?. for Figma Desktop compatibility.');
  process.exit(1);
}
console.log('verify:plugin passed: no ?? or ?. in figma-plugin/code.js');
