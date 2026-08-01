-- Track last activity per session so idle sessions can be auto-expired
-- independent of the long-lived absolute expiresAt.
ALTER TABLE "CustomerSession" ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AdminSession" ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
