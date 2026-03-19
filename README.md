# Daily AI + VC Digest Agent

This repo contains a small "news agent" that fetches public RSS feeds daily, ranks items for **AI/ML progress** and **startup/VC investing** news, generates a **<= 10 minute** on-site digest, and renders it in a clean, organized UI.

## What it does

- Fetches configured RSS/Atom feeds (polite timeouts + lightweight parsing)
- Classifies items into `ai` vs `vc` using keyword signals
- De-duplicates and ranks by relevance + recency + source weight
- Produces one daily digest per category in `data/digests/<categorySlug>/` (and `.../latest.json`)
- Renders category digests in the Next.js app (`/` and `/category/<slug>`)

## Setup

```bash
npm install
npm run digest   # generate today's digests (one per category)
npm run smoke    # validate latest digest JSON parses correctly
npm run dev      # view UI
```

## Postgres (recommended for Vercel)

If `DATABASE_URL` is set, digests are written to Postgres instead of `data/digests/`.

```bash
# 1) set DATABASE_URL in .env.local
npm run db:push
npm run db:seed
npm run digest
```

## Sources

Edit `lib/agent/sources.ts` to add/remove feeds. Prefer RSS/Atom endpoints from public sites rather than scraping article HTML; it's more stable and less likely to violate site policies.

## Daily automation (server)

Option A (simplest): run the script via cron on your server:

```bash
0 7 * * * cd /path/to/repo && npm run digest
```

Option B: call the built-in API route from your scheduler:

- `POST /api/cron/digest` with `Authorization: Bearer $CRON_SECRET`
- Set `CRON_SECRET` in your environment
  - Copy `.env.example` to `.env.local` for local dev

Send emails (requires Postgres + Resend):

- `POST /api/cron/send-digests` with `Authorization: Bearer $CRON_SECRET`
- Set `RESEND_API_KEY`, `EMAIL_FROM`, and `SITE_URL`

Note: writing to the filesystem works great on a traditional server. On serverless platforms with ephemeral disks, store digests in a DB/object store instead of `data/`.

## Optional: better ranking/summaries via OpenAI

If `OPENAI_API_KEY` is set, the agent will ask a model to refine the final top items and produce tighter bullet summaries (still capped to the 10-minute daily read budget).
