-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "priceOnRequest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "priceOnRequest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "priceOnRequest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Cruise" ADD COLUMN     "priceOnRequest" BOOLEAN NOT NULL DEFAULT false;
