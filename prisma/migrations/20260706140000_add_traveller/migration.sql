-- Saved traveller profiles (passport number stored encrypted at rest)
CREATE TABLE "Traveller" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TEXT,
    "nationality" TEXT,
    "sex" TEXT,
    "passportEnc" TEXT,
    "passportLast4" TEXT,
    "passportExpiry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Traveller_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Traveller_customerId_idx" ON "Traveller"("customerId");

ALTER TABLE "Traveller" ADD CONSTRAINT "Traveller_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
