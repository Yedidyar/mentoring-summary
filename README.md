# Mentoring knowledge hub

A static resource site (React + TypeScript + Vite) that turns links and tools from the mentoring group WhatsApp chat into a searchable, categorized library.

## Local development

```bash
pnpm install
pnpm run dev
```

## How to contribute

Contributions are welcome. Most updates fall into one of two paths.

### Refresh the resource data (most common)

The site reads generated JSON under `src/data/`. **Do not edit those files by hand** — regenerate them from a fresh WhatsApp export.

1. Export the group chat from WhatsApp as a `.txt` file (or extract it from a ZIP export).
2. Run the processor (optional path argument; default is `~/Downloads/mentoring.txt`):

```bash
pnpm run process-chat -- /path/to/chat.txt
```

3. Review the diff in `src/data/resources.json` and `src/data/meta.json`.
4. Confirm the site still works:

```bash
pnpm run lint
pnpm run build
```

5. Open a pull request with the updated JSON (and any related app changes if needed).

**Privacy:** Only commit the processed JSON. Do not commit raw chat exports or files that contain full message history outside what the script already extracts.

### Change the app (UI, filters, categorization logic)

1. Create a branch from the default branch.
2. Make your changes under `src/` or `scripts/`.
3. If you change `scripts/process-chat.ts`, re-run `pnpm run process-chat` on a sample export so behavior is easy to review.
4. Before opening a PR:

```bash
pnpm run lint
pnpm run build
```

5. Describe what you changed and, for data-processing changes, how you verified the output.

### Pull requests

- Keep PRs focused (one logical change per PR when possible).
- For data-only updates, a short note on the export date or what changed in the group is helpful.
- Netlify preview deploys run on PRs when the repo is connected to Netlify.

## Production build

```bash
pnpm run build
```

This runs TypeScript (`tsc -b`) then `vite build`. Output goes to `dist/`.

## Deploy on Netlify

- **Build command:** `pnpm run build`
- **Publish directory:** `dist`
- `netlify.toml` is already configured in the repo.

You can also connect the repository to Netlify for automatic deploys on push.

## Project layout

- `src/` — React + TypeScript app
- `scripts/process-chat.ts` — WhatsApp export processor (run via `tsx`)
- `src/data/*.json` — generated data (regenerate with `pnpm run process-chat`)
