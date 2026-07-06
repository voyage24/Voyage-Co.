-- Live flight status tracking for push notifications
ALTER TABLE "Booking" ADD COLUMN "flightStatus" TEXT;
ALTER TABLE "Booking" ADD COLUMN "flightStatusAt" TIMESTAMP(3);
