-- Live flight tracking: gate / terminal / baggage / delay
ALTER TABLE "Booking" ADD COLUMN "flightGate" TEXT;
ALTER TABLE "Booking" ADD COLUMN "flightTerminal" TEXT;
ALTER TABLE "Booking" ADD COLUMN "flightBaggage" TEXT;
ALTER TABLE "Booking" ADD COLUMN "flightDelayMin" INTEGER;
