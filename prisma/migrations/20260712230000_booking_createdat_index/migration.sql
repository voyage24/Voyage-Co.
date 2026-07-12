-- Speed up booking ordering (dashboard, lists, revenue) by createdAt
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");
