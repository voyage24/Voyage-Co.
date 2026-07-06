# Voyages & Co. — Project Guide

Luxury travel website + admin panel. This file is read automatically by Claude
Code at the start of every session — it's the map for making changes. It holds
**no secrets** (those live only in Vercel and local `.env.local`).

---

## What this is
- **Live site:** https://voyagesco.com — public travel site (hotels, flights, trains, experiences, packages, cruises, blog, membership).
- **Admin panel:** https://voyagesco.com/admin/login — content + operations console for the owner.
- **Members:** customers sign up / log in at `/login`, with optional passkey (Face ID / Touch ID) sign-in.

## Tech stack
- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** ORM → **Neon Postgres** (via Vercel)
- **Vercel** hosting — every push to GitHub auto-builds & deploys
- Image uploads → Vercel Blob. Email → SMTP (GoDaddy). Push → Web Push (VAPID). Bot protection → Cloudflare Turnstile.

## The golden workflow rule
**Commit and push every change to GitHub** — Vercel then auto-deploys to
voyagesco.com. Never leave a change local-only. There is no separate "publish"
button. If something isn't live, check Vercel → Deployments for build errors.

---

## Project layout
```
app/                     Next.js routes
  (public routes)        hotels, flights, trains, experiences, packages, cruises,
                         blog, account, login, signup, membership, book, ...
  admin/(dashboard)/     the admin panel — one folder per section (see below)
  api/                   backend routes (admin CRUD, account, booking, push, ...)
components/
  admin/                 admin UI (DataTable, forms, sidebar, topbar, ...)
  account/               member account UI (PasskeyManager, SavedList, ...)
  home/ search/ ui/      public site UI
lib/                     server + client helpers (see key files below)
prisma/
  schema.prisma          database models
  migrations/            committed SQL migrations (applied on deploy)
```

## Admin panel sections (`app/admin/(dashboard)/`)
Content: hotels, flights, trains, experiences, packages, cruises, blog,
destinations, offers, giftcards, moments, collections, testimonials, press,
reviews. Ops: bookings, enquiries, quotes, customers, newsletter, team.
Site: storefront, appearance, pages, lists, nav, media, settings, emails,
analytics, activity (audit log), notifications.

---

## Key concepts (read before editing)

### Content-override CMS
Static defaults live in code; admin edits are stored as *overrides* in the
`PageContent` table. The override wins; the (translated) default is the fallback.
- `lib/page-content.ts` — page copy. `getPageContent()` (server) / `useContent()` (client).
- `lib/page-lists.ts` — editable lists. `getPageList()` / `useContentList()`.
- `lib/collections.ts` — curated collections.
- `lib/email/email-templates.ts` — editable email templates (verify/welcome/reset/booking).

### Site settings
`lib/site-settings.ts` — `SETTING_DEFAULTS` + `getSiteSettings()`; edited via
Appearance. Save routes filter by the known setting keys.

### Database changes (Prisma)
1. Edit `prisma/schema.prisma`.
2. Create a migration SQL file under `prisma/migrations/<timestamp>_name/migration.sql`.
3. `npx --no-install prisma generate` to update the client locally.
4. Commit + push → Vercel build runs `prisma migrate deploy` and applies it to production.
Never run `migrate dev` against production. Models are listed in schema.prisma.

### Other notable helpers
`lib/prisma.ts` (client singleton), `lib/push.ts` (web push), `lib/webauthn.ts`
+ `lib/passkey-client.ts` (passkeys), `lib/admin/audit.ts` (audit log),
`lib/admin/notifications.ts` (admin bell), `lib/currency.ts`, `lib/amadeus.ts`
(live flight search).

---

## How to make common changes
- **Edit page text / images shown on the site** → do it in the admin panel (Pages / Appearance / Lists) — no code needed.
- **Add a new hotel/package/etc.** → admin panel → that section → "Add new".
- **Add a new admin section or field** → follow an existing section as a template: a route folder under `app/admin/(dashboard)/`, a form in `components/admin/`, an API route under `app/api/admin/`, and (if new data) a Prisma model + migration.
- **Change site-wide copy that isn't editable yet** → edit the default in the relevant `lib/*.ts` registry, then push.

## Verify before pushing
Run from the project root (`C:\Users\goget\holidaywise`):
```
npx --no-install tsc --noEmit          # type check
npx --no-install next lint             # lint
npx --no-install next build            # full build (catches everything)
```
Prefix npm/npx with the project path if the shell's cwd has drifted.

## Conventions
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Secrets go ONLY in Vercel env vars + local `.env.local` (git-ignored). Documented (blank) in `.env.example`. Never commit real keys.
- Match the style of surrounding code (naming, Tailwind classes, comment density).

## Environment variables
Full list with descriptions is in `.env.example`. Categories: Amadeus (flights),
SMTP (email), Postgres (`DATABASE_URL*`), admin seed + `SESSION_COOKIE_SECRET`,
Vercel Blob, Turnstile, VAPID (push), WebAuthn (passkeys). Real values live in
Vercel + `.env.local` only.

## Deferred / not built yet
- **Payments / deposits** — intentionally not built (no payment account yet).
- **Translations editor** — 36-language dictionaries are still edited in code.

---
_Personal notes, passwords, and keys are kept OUTSIDE this repo at
`C:\Users\goget\Documents\VoyagesCo-Reference.md` so they never reach GitHub._
