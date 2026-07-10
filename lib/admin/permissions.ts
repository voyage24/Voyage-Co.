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
