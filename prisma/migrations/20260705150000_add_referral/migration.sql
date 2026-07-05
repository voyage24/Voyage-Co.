-- Refer-a-friend rewards program.
ALTER TABLE "Customer" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "Customer" ADD COLUMN "referredById" TEXT;
ALTER TABLE "Customer" ADD COLUMN "referralRewarded" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Customer_referralCode_key" ON "Customer"("referralCode");
