#!/usr/bin/env node
/**
 * Build Figma plugin main thread: src/plugin/code.ts -> figma-plugin/code.js.
 * Write full UI HTML (inlined ui.css + ui.js) to figma-plugin/ui.html.
 * Figma loads ui.html from manifest and sets the global __html__ — we do NOT inject
 * __html__ into code.js, so there is no "invalid redefinition of lexical identifier".
 * Run after build:plugin:ui so ui.js and ui.css exist.
 */
import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pluginDir = path.join(root, 'figma-plugin');
const watch = process.argv.includes('--watch');

const INJECTED_PREFIX = 'var __html__ = ';

/** Strip any previously injected first line from code.js (idempotent when switching back from old build). */
function stripInjectedHeader(codeJs) {
  if (!codeJs.startsWith(INJECTED_PREFIX)) return codeJs;
  const firstNewline = codeJs.indexOf('\n');
  if (firstNewline === -1) return codeJs;
  return codeJs.slice(firstNewline + 1);
}

function writeUiHtml() {
  const uiHtmlPath = path.join(pluginDir, 'ui.html');
  const jsPath = path.join(pluginDir, 'ui.js');
  const cssPath = path.join(pluginDir, 'ui.css');

  if (!fs.existsSync(jsPath) || !fs.existsSync(cssPath)) {
    console.warn('build-plugin-code: ui.js or ui.css missing. Run npm run build:plugin:ui first.');
    return;
  }

  const css = fs.readFileSync(cssPath, 'utf8');
  let js = fs.readFileSync(jsPath, 'utf8');
  js = js.replace(/<\/script>/gi, '<\\/script>');

  // Figma's sandbox rejects new Function() (used by setImmediate polyfill in our bundle).
  // Inject a setTimeout-based polyfill before our UI loads so React/JSZip never use the broken one.
  const setImmediatePolyfill =
    '<script>(function(){var g=typeof globalThis!="undefined"?globalThis:window;if(typeof g.setImmediate==="undefined"){g.setImmediate=function(f){return setTimeout(f,0)};g.clearImmediate=clearTimeout}})();</script>';

  const body =
    '<style>' + css + '</style>\n' +
    '<div id="root"></div>\n' +
    setImmediatePolyfill + '\n' +
    '<script>' + js + '</script>';

  const html =
    '<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><title>Affirm SPAM</title></head>\n<body>\n' + body + '\n</body>\n</html>\n';

  fs.writeFileSync(uiHtmlPath, html, 'utf8');
  console.log('Wrote figma-plugin/ui.html (full inlined UI; Figma sets __html__ from this file)');
}

function ensureCodeJsNoInjectedHtml() {
  const codePath = path.join(pluginDir, 'code.js');
  let codeJs = fs.readFileSync(codePath, 'utf8');
  if (!codeJs.startsWith(INJECTED_PREFIX)) return;
  codeJs = stripInjectedHeader(codeJs);
  fs.writeFileSync(codePath, codeJs, 'utf8');
  console.log('Removed legacy __html__ injection from figma-plugin/code.js');
}

const opts = {
  entryPoints: [path.join(root, 'src/plugin/code.ts')],
  bundle: true,
  platform: 'node',
  target: 'es2017',
  outfile: path.join(pluginDir, 'code.js'),
  plugins: [
    {
      name: 'ui-html-and-clean',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length === 0) {
            writeUiHtml();
            ensureCodeJsNoInjectedHtml();
          }
        });
      },
    },
  ],
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await ctx.watch();
  console.log('Watching src/plugin/code.ts');
} else {
  await esbuild.build(opts);
}
