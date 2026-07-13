-- AlterTable
ALTER TABLE "GroupTrip" ADD COLUMN "dailyBudget" INTEGER;

-- CreateTable
CREATE TABLE "PersonalExpense" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bookingRef" TEXT,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "spentOn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalExpense_customerId_idx" ON "PersonalExpense"("customerId");

-- AddForeignKey
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
