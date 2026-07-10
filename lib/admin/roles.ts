// Admin team roles. Currently descriptive labels shown across the admin —
// "owner" is protected (the last owner can't be demoted or removed).
export const ADMIN_ROLES = ["owner", "manager", "staff", "trainee"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(v: unknown): v is AdminRole {
  return typeof v === "string" && (ADMIN_ROLES as readonly string[]).includes(v);
}
