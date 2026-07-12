-- Member document vault (passport, visa, insurance, tickets…)
CREATE TABLE "MemberDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MemberDocument_customerId_idx" ON "MemberDocument"("customerId");
ALTER TABLE "MemberDocument" ADD CONSTRAINT "MemberDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
