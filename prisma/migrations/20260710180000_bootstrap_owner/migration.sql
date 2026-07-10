-- Bootstrap: every install needs at least one owner. Promote the oldest admin
-- account to owner, but only when no owner exists yet (no-op otherwise).
UPDATE "AdminUser" SET "role" = 'owner'
WHERE "id" = (SELECT "id" FROM "AdminUser" ORDER BY "createdAt" ASC LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM "AdminUser" WHERE "role" = 'owner');
