-- Link push subscriptions to a member, so targeted event pushes are possible.
ALTER TABLE "PushSubscription" ADD COLUMN "customerId" TEXT;
CREATE INDEX "PushSubscription_customerId_idx" ON "PushSubscription"("customerId");
