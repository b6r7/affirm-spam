# Affirm SPAM — Figma Plugin

**Structured Payments & Messaging** — A Figma plugin for creating, managing, and inserting localized email templates with A/B/C variants directly into your designs.

---

## Introduction

Affirm SPAM is a Figma plugin that streamlines how communication teams design and deploy transactional email templates. Instead of juggling copy across spreadsheets, translation files, and design tools, you can:

- **Create and manage** email templates in multiple locales (en-US, en-GB, es-ES, es-MX, pl-PL, fr-FR)
- **Generate A/B/C variants** with different tones (Supportive, Neutral, Firm, Educational)
- **Get locale-specific compliance guidance** for phrasing (e.g., UK, Spain, Mexico)
- **Insert designs into Figma** as frames, ready for handoff or further iteration
- **Import translations** from JSON (meta + locales format) and export variants for downstream tools

The plugin runs entirely in Figma Desktop — no external services, no network calls. Everything is built locally and works offline.

---

## Why This Plugin?

Transactional emails (payment reminders, pre-due notices, etc.) require:

1. **Consistency** — Same structure across locales, but localized copy
2. **Compliance** — Different markets have different phrasing rules (e.g., “must” vs “please” in UK)
3. **Variants** — A/B/C testing for subject lines, tone, and CTAs
4. **Design handoff** — Designers need to see the real copy in context, not placeholders

Affirm SPAM centralizes this workflow in Figma. You pick a template, choose a locale and tone, generate variants, and insert them as Figma frames. The plugin also supports importing pre-translated JSON (e.g., from a CMS or translation service) so designers work with production-ready copy.

---

## How It Works

### Architecture

The plugin has two parts:

1. **Main thread** (`code.js`) — Runs in Figma’s sandbox. Handles:
   - Figma API (creating frames, text nodes, layout)
   - Plugin data storage (templates, custom content)
   - Message passing to/from the UI

2. **UI** (`ui.html` + `ui.js` + `ui.css`) — Renders in an iframe. A React app that:
   - Lets you select templates, locales, tones, and variants
   - Shows a live preview of the email
   - Sends actions (generate, insert, export, import) to the main thread

The UI and main thread communicate via `postMessage`. No network, no external APIs.

### Key Flows

- **Generate variants** — Computes A/B/C content for the selected template, locale, and tone. Renders a preview; you can then insert to canvas.
- **Insert to canvas** — Creates Figma frames with the email layout (header, title, body, CTA, legal text) using the chosen variants.
- **Import translations** — Accepts JSON with `meta` + `locales`. Creates a new template or appends locales to an existing one. Supports `email.title`, `email.heading`, `email.body.primary`, etc.
- **Export** — Exports selected variants or all variants as JSON (single file or ZIP), suitable for handoff or integration.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **UI** | React 18 + TypeScript | Component-based UI, type safety, familiar ecosystem |
| **Build** | Vite 6 | Fast dev/build, single-bundle output for plugin UI |
| **Styling** | Tailwind CSS 4 | Utility-first CSS, consistent design tokens |
| **Icons** | Lucide React | Lightweight, tree-shakeable icon set |
| **Main thread** | esbuild | Bundles `code.ts` to ES2017 for Figma’s sandbox |
| **ZIP export** | JSZip | Client-side ZIP creation for multi-file export |

### Constraints We Worked Around

- **Figma’s plugin sandbox** — Blocks `new Function()` and `eval()`. We inject a `setImmediate` polyfill before the UI loads and strip `new Function` from the bundle so scheduler/JSZip work correctly.
- **Figma’s import regex** — The sandbox rejects code containing `import (` (including in strings). We avoid that pattern in user-facing copy.
- **No Clipboard API** — Figma disallows `navigator.clipboard.writeText`. We use `document.execCommand('copy')` for copy actions.
- **Single script** — Figma expects one main script. We bundle everything into `code.js` and inline the UI HTML for `showUI()`.

---

## Sharing the Plugin

To share with others:

1. **Build** (from repo root): `npm run build:plugin`
2. **Share** the `figma-plugin/` folder (or a ZIP of it)
3. **Import** in Figma: Plugins → Development → Import plugin from manifest → select `figma-plugin/manifest.json`

The folder must contain: `manifest.json`, `code.js`, `ui.html`, `ui.js`, `ui.css`.

---

## Project Structure (Plugin-Relevant)

```
figma-plugin/
├── manifest.json      # Figma plugin manifest
├── code.js            # Main thread (built from src/plugin/code.ts)
├── ui.html            # UI shell (generated)
├── ui.js              # UI bundle (built from src/plugin/ui.tsx + app)
├── ui.css             # Styles
├── messageTypes.ts    # Shared types (AppState, messages, etc.)
├── storage.ts         # Plugin data persistence
├── emailLayout.ts     # Layout spec (Affirm vs SPI)
├── translations/      # Per-locale system template content
└── ...

src/plugin/
├── code.ts            # Main thread entry
├── ui.tsx             # Plugin UI entry (wraps AppView)
├── emailLayout/
│   ├── spec.ts        # Builds email layout spec (blocks)
│   ├── renderReact.tsx # Renders spec to React (preview)
│   ├── renderFigma.ts  # Renders spec to Figma nodes
│   └── tokens.ts      # Email-safe widths, spacing
└── ...
```

---

## License & Attribution

Internal prototype. See `ATTRIBUTIONS.md` for generated assets, icons, and tool attribution.
