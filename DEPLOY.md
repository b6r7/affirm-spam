# Deploying the Web App

The **web app** (Vite build) is password-protected. After entering the correct password once per browser session, users can use the app. The password is not stored in source code (only a hash is used).

---

## Vercel

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Vercel will use the included `vercel.json`:
   - **Build:** `npm run build`
   - **Output:** `dist`
3. Deploy. The site will be available at your Vercel URL.

No extra config needed.

---

## GitHub Pages

### Option A: User/org site (`username.github.io`)

1. Build: `npm run build`
2. In the repo **Settings → Pages**, choose **GitHub Actions** as the source.
3. Add a workflow under `.github/workflows/deploy.yml` (see below) that builds and deploys the `dist` folder.

No `base` change needed (site is at root).

### Option B: Project site (`username.github.io/repo-name`)

1. In `vite.config.ts`, set `base: '/your-repo-name/'` (e.g. `base: '/affirm-spam/'`).
2. Build: `npm run build`
3. Use the same GitHub Actions workflow; set the workflow to publish to the `gh-pages` branch (or use `peaceiris/actions-gh-pages` with `github_token` and the correct `publish_dir`).

### Example GitHub Actions workflow (Pages)

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency: group=pages

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/upload-pages-artifact@3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@4
```

If you use **npm** instead of pnpm, replace the pnpm steps with:

```yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

---

## Password

The app uses a **session-based** gate: after entering the correct password, access is stored in `sessionStorage` for that tab. Closing the tab or browser will require the password again. The password itself is never stored in the codebase (only a hash is used for verification).
