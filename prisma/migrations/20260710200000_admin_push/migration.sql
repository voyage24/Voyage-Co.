-- Admin new-mail alerts: mark push subscriptions that belong to an admin
ALTER TABLE "PushSubscription" ADD COLUMN "adminEmail" TEXT;
CREATE INDEX "PushSubscription_adminEmail_idx" ON "PushSubscription"("adminEmail");
