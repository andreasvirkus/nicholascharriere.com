# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Type-check with `astro check` then build to `./dist/`
- `npm run preview` - Preview production build locally

## Architecture

This is a personal website for Nicholas Charriere, CEO of Mocha (built by him)(built with Astro 4, using Tailwind CSS for styling and MDX for blog content.

### Key Structure

- **Layouts**: `src/layouts/Layout.astro` is the base layout with header/footer. `Post.astro` and `Blog.astro` wrap content in the `Prose` component for typography.
- **Content Collections**: Blog posts live in `src/content/blog/` as MDX files. Schema defined in `src/content/config.ts` requires `title`, `tags`, and `published` date.
- **Pages**: Static pages in `src/pages/` (index, quotes, projects). Blog uses dynamic routing via `[...slug].astro`.

### LLM discoverability (llms.txt + Markdown endpoints)

The site is built to be readable by AI agents/crawlers. Two dynamic endpoints power this — keep them working when changing content structure:

- **`src/pages/llms.txt.ts`** → serves `/llms.txt`: a site summary plus links to every published post (pointing at its `.md` version) and the key pages. It reads the `blog` collection at build time, so **new posts appear automatically** — no manual edits.
- **`src/pages/blog/[slug].md.ts`** → serves `/blog/<slug>.md`: a clean Markdown version of each post. It strips MDX `import`/`export` lines and `<Image />` components, and prepends a title + date/tags/source header (skips a duplicate H1 if the body already opens with one).

Why: `@astrojs/sitemap` (see `astro.config.mjs`) already emits `sitemap-index.xml` (referenced in `public/robots.txt`, with `/family/*` excluded). llms.txt + per-post Markdown are the additions that let LLMs read content without parsing HTML. Content-negotiation headers (`Accept: text/markdown`) were intentionally skipped — low ROI since the `.md` URLs are already discoverable via llms.txt.

If you add a new content collection or new top-level pages, update `src/pages/llms.txt.ts` so they show up in the index.

### Styling

Custom Tailwind theme in `tailwind.config.mjs`:
- Colors: `bg` (cream background), `text-*` (gray scale), `froly-*` (coral accent for hover states)
- Fonts: Roboto (sans), Source Code Pro (mono)

### Adding Content

- **New quote**: Add object to the `quotes` array in `src/pages/quotes.astro`
- **New blog post**: Create MDX file in `src/content/blog/` with frontmatter: `title`, `tags`, `published` (date)
- **New font**: Install via fontsource (`npm install @fontsource/font-name`), import in Layout.astro

## Deployment

The site is a static build hosted on **Cloudflare Pages** (the old DigitalOcean droplet + nginx flow is dead — do not `ssh do`).

- Pages project: `nicholascharriere-com`, connected to GitHub repo `nichochar/nicholascharriere.com`.
- Build command: `npm run build` · output directory: `dist` · production branch: `main`.
- **To deploy: just push to `main`.** Cloudflare Pages auto-builds and deploys. No SSH, no manual build step, no server.
- Custom domains: apex `nicholascharriere.com` + `www`.
