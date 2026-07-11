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

### Role-based access (RBAC)
AdminUser.role: owner > manager > staff > trainee (lib/admin/roles.ts). The
access map lives in lib/admin/permissions.ts — pages enforced in the dashboard
+ mail layouts (middleware forwards the path as x-admin-path), nav filtered per
role, and EVERY /api/admin route enforced centrally inside requireAdmin
(canAccessApi). Team-management APIs use requireOwner (with an owner-bootstrap
waiver). The last owner can never be demoted/removed.

### Voyages Mail (`app/admin/mail/`)
A self-contained mail app (own layout/nav, installable PWA via
public/mail.webmanifest, scope /admin/mail) — deliberately no access to the
rest of the admin. Tabs: Inbox · Compose · Sent · Archive · Templates ·
Newsletter (tabs + pages trimmed by role).
- **Inbox**: IMAP pull (lib/email/imap.ts, GoDaddy imap.secureserver.net,
  IMAP_* env) into InboundEmail, deduped by Message-ID. Server-rendered
  snapshot (lib/admin/inbox.ts getInboxList) for instant open. Bulk select-all
  → mark read / archive / delete. Unread count = admin bell + app-icon badge.
- **Reply routing** (computed in getInboxList): self-copies (from our domain,
  e.g. site booking alerts) reply to the customer found in the BODY
  ("Email:" line) with their name ("Name:" line); external mail replies to
  Reply-To header, else sender — never our own mailbox. To is editable.
  Replies send FROM the alias that received the mail (own-domain guard).
- **AI drafts**: /api/admin/email/draft via lib/ai.ts (Anthropic→Gemini→Groq,
  first configured key wins; the same lib powers the concierge chat). Rules:
  never invent promises/prices, use full property names (item codes stripped),
  booking alerts draft as acknowledgements. Steer-notes + Regenerate in UI.
- **Sent**: every site-sent email recorded in SentEmail (SMTP doesn't populate
  the mailbox's Sent folder).
- **New-mail alerts**: fetchInbox pushes to admin devices
  (PushSubscription.adminEmail, sendPushToAdmins) with unread badge — enabled
  per device from the inbox. Polling: daily Vercel cron + /api/cron/mail
  pinged every 5 min by cron-job.org (auth CRON_SECRET as Bearer or ?key=).

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

### Property coordinates (the Location / companion section)
Every property page shows a Location section: map, directions, live weather,
nearest airport, local time, emergency numbers, concierge, SOS, packing list,
phrases, best-time-to-visit (`lib/seasonality.ts`), tipping & etiquette
(`lib/tipping.ts`), power & connectivity (`lib/connectivity.ts`), a flight
carbon estimate (`lib/carbon.ts`), upcoming holidays/festivals
(`/api/content/holidays` — Nager.Date + `lib/holidays-fallback.ts` for the
countries Nager lacks, incl. India) and a currency cheat-sheet
(`/api/content/rates` — open.er-api.com, cached daily; `lib/country-meta.ts`
maps country→ISO2+currency), a jet-lag / time-difference helper (`JetLag`, reuses
`lib/emergency.ts` timezones) and a typical-costs snapshot (`lib/typical-costs.ts`,
USD prices × the live rate, shown in the guest's currency). All curated per
country/coords and hide gracefully when there's no data.

### Recommendations
Two homepage rails: `RecentlyViewed` ("Continue exploring", from localStorage)
and `Recommendations` ("Recommended for you") — the latter POSTs recently-viewed
refs to `/api/content/recommendations`, which derives taste (country + category)
and returns new same-destination-first properties. `lib/recently-viewed.ts`
tracks views via `RecordView` on detail pages. The coords-dependent cards need lat/lng; the country-only cards
(essentials, phrasebook) render whenever the country is known — never gate them
on coords. Coordinates resolve via `lib/place-coords.ts` `resolveCoords(city,
location)`: property lat/lng → curated hotel cities → the 550-airport city
dataset → a supplementary table of resort towns/islands/parks/renamed cities →
fuzzy substring match. Covers all 218 property cities. When adding a property in
a brand-new town, add it to the `EXTRA` map there so its Location shows.

### Nearest airport + transfer time
Shown on all property/companion pages. `lib/nearest-airport.ts` finds the
closest airport (haversine over CITY_COORDS in lib/geo.ts, names from CITIES).
`lib/routing.ts` gets the real drive time via OpenRouteService (ORS_API_KEY) or
Geoapify (GEOAPIFY_API_KEY), cached in RouteCache (only precise results cached;
estimates retried). ORS needs `Accept: application/json` and `radiuses:[-1,-1]`
(airport points sit off-road). `/api/route/transfer?lat=&lng=` + client
`components/products/NearestAirport.tsx`. Islands with no road route keep the
distance estimate.

### Other notable helpers
`lib/prisma.ts` (client singleton), `lib/push.ts` (web push), `lib/webauthn.ts`
+ `lib/passkey-client.ts` (passkeys), `lib/admin/audit.ts` (audit log),
`lib/admin/notifications.ts` (admin bell), `lib/currency.ts`, `lib/amadeus.ts`
(live flight search).

### Mobile / PWA features
Installable PWA: `app/manifest.ts` (name, icons, home-screen `shortcuts`),
`public/sw.js` (offline fallback + web-push handler), `InstallPrompt`,
`MobileTabBar` (bottom nav), `Haptics` + `lib/haptics.ts` (named vibration
patterns), `PullToRefresh` (standalone-mode reload).
- **Offline trip wallet**: `OfflineTripSync` (account page) caches trips via
  `/api/account/trips`; `OfflineTrips` renders them on `app/offline`.
- **Destination essentials**: `DestinationEssentials` + `lib/emergency.ts`
  (local time, emergency numbers, concierge) on stay pages.
- **Biometric app-lock**: `AppLock` + `AppLockToggle` (privacy gate over the
  account, reuses passkeys). Session cookie is still the real auth.
- **Near me**: `app/near-me` + `/api/content/near` (haversine over lat/lng).
- **Live flight status push**: `/api/cron/flight-status` + `lib/flight-status.ts`
  (ADS-B derived airborne/landed) → `Booking.flightStatus`; runs via daily fan-out.
- **Wallet pass**: `app/account/pass/[ref]` renders a QR pass (`qrcode`);
  `AddToWallet` → `/api/account/pass/[ref]/apple` (501 until Apple cert env set).
- **Passport scan**: `PassportScan` + `lib/mrz.ts` (tesseract.js, lazy) autofills
  the traveller name on the booking form. No passport data is stored.

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
