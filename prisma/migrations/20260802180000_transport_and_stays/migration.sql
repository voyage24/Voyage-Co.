-- CreateTable
CREATE TABLE "AirportCab" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "includes" TEXT[],
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "availableUnits" INTEGER,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirportCab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutstationCab" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "tripType" TEXT NOT NULL,
    "distanceKm" INTEGER,
    "durationEstimate" TEXT,
    "includes" TEXT[],
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "availableUnits" INTEGER,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutstationCab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HourlyStay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "amenities" TEXT[],
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge" TEXT,
    "rating" DOUBLE PRECISION,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "availableUnits" INTEGER,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HourlyStay_pkey" PRIMARY KEY ("id")
);
