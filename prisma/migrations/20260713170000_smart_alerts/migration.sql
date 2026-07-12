-- Smart notifications: check-in reminder, rain-tomorrow, currency-improved dedupe/baseline
ALTER TABLE "Booking" ADD COLUMN "checkinRemindedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "weatherRemindedOn" TEXT;
ALTER TABLE "Booking" ADD COLUMN "fxBaseRate" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN "fxRemindedAt" TIMESTAMP(3);
