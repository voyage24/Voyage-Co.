import type { AdminRole } from "@/lib/admin/roles";

// Role-based access for the admin. Each rule maps a route prefix to the
// minimum role tier that may open it; the first matching prefix wins.
//
//   owner   — everything, incl. Team, Settings
//   manager — everything except Team & Settings
//   staff   — day-to-day content + sales + email (no analytics/audit/broadcast)
//   trainee — front-line operations only (bookings, enquiries, mail)

const TIER: Record<AdminRole, number> = { owner: 4, manager: 3, staff: 2, trainee: 1 };

const RULES: { prefix: string; min: AdminRole }[] = [
  // Owner-only: account/team management.
  { prefix: "/admin/settings", min: "owner" },
  { prefix: "/admin/team", min: "owner" },
  // Manager+: oversight & broadcast tools.
  { prefix: "/admin/activity", min: "manager" },
  { prefix: "/admin/analytics", min: "manager" },
  { prefix: "/admin/notifications", min: "manager" }, // push broadcasts
  { prefix: "/admin/giftcards", min: "manager" },
  { prefix: "/admin/offers", min: "manager" },
  { prefix: "/admin/newsletter", min: "manager" },
  { prefix: "/admin/mail/newsletter", min: "manager" },
  { prefix: "/admin/mail/templates", min: "staff" },
  { prefix: "/admin/emails", min: "staff" },
  // Trainee-reachable operations (explicit allows).
  { prefix: "/admin/bookings", min: "trainee" },
  { prefix: "/admin/enquiries", min: "trainee" },
  { prefix: "/admin/quotes", min: "trainee" },
  { prefix: "/admin/inbox", min: "trainee" },
  { prefix: "/admin/compose", min: "trainee" },
  { prefix: "/admin/mail", min: "trainee" },
];

// Everything not matched above (content, storefront, media, customers, …).
const DEFAULT_MIN: AdminRole = "staff";

export function minRoleFor(pathname: string): AdminRole {
  if (pathname === "/admin") return "trainee"; // dashboard home for everyone
  const rule = RULES.find(r => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  return rule?.min ?? DEFAULT_MIN;
}

export function canAccess(role: string, pathname: string): boolean {
  const tier = TIER[(role as AdminRole)] ?? 0;
  return tier >= TIER[minRoleFor(pathname)];
}

// ── API enforcement ──────────────────────────────────────────────────────────
// Most /api/admin/<section> routes mirror an /admin/<section> page, so they
// reuse the page rules. The overrides cover routes whose name doesn't match
// their page (e.g. /api/admin/settings is the site-appearance save used by
// staff, not the owner-only Settings page).
const API_OVERRIDES: { prefix: string; min: AdminRole }[] = [
  { prefix: "/api/admin/auth", min: "trainee" },           // logout
  { prefix: "/api/admin/account/admins", min: "owner" },   // admin management
  { prefix: "/api/admin/account", min: "trainee" },        // own password change
  { prefix: "/api/admin/email", min: "trainee" },          // compose send/draft
  { prefix: "/api/admin/search", min: "trainee" },         // topbar search
  { prefix: "/api/admin/settings", min: "staff" },         // site appearance save
  { prefix: "/api/admin/upload", min: "staff" },
  { prefix: "/api/admin/media", min: "staff" },
  { prefix: "/api/admin/page-content", min: "staff" },
  { prefix: "/api/admin/page-list", min: "staff" },
  { prefix: "/api/admin/push", min: "manager" },           // broadcast to all
  { prefix: "/api/admin/export", min: "manager" },         // CSV data export
  { prefix: "/api/admin/fix-mojibake", min: "owner" },     // maintenance
  // /api/admin/users is deliberately NOT listed: requireOwner gates it with the
  // owner-bootstrap waiver (a static map can't do that DB check).
  { prefix: "/api/admin/users", min: "trainee" },
];

export function canAccessApi(role: string, pathname: string): boolean {
  const tier = TIER[(role as AdminRole)] ?? 0;
  const override = API_OVERRIDES.find(r => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (override) return tier >= TIER[override.min];
  return canAccess(role, pathname.replace(/^\/api\/admin/, "/admin"));
}
