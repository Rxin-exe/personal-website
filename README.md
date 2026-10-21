# personal-website

Ronan Wong's portfolio, built with Next.js (App Router) and plain CSS. No UI or animation libraries.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Editing content

All text lives in `content/site.ts`: profile, about, timeline, projects, breakdowns, contact. Anything in `[BRACKETS]` is a placeholder to fill in.

- **Photo:** put a square image (at least 440×440) in `public/` and set `profile.photo`. Use a JPG or PNG; social previews don't show SVGs.
- **Site URL:** set `site.url` once the site is deployed, so Open Graph links resolve.
- **Project covers:** set `image` on a project to use an image instead of the gradient.

## Structure

- `app/`: layout (SEO metadata, font), page, and global styles
- `components/`: one file per section, plus `Modal`, `Reveal` (scroll fade-in) and `CursorGlow`
