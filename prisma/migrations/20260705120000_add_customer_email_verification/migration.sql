-- Email verification for customer accounts.
ALTER TABLE "Customer" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN "verifyTokenHash" TEXT;
ALTER TABLE "Customer" ADD COLUMN "verifyExpiresAt" TIMESTAMP(3);

-- Existing accounts predate verification — treat them as already verified so
-- nobody is locked out by this change.
UPDATE "Customer" SET "emailVerified" = "createdAt" WHERE "emailVerified" IS NULL;

CREATE INDEX "Customer_verifyTokenHash_idx" ON "Customer"("verifyTokenHash");
