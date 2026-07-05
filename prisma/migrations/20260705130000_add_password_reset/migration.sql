-- Password reset for customer accounts.
ALTER TABLE "Customer" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "Customer" ADD COLUMN "resetExpiresAt" TIMESTAMP(3);

CREATE INDEX "Customer_resetTokenHash_idx" ON "Customer"("resetTokenHash");
