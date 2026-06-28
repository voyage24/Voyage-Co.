-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT 'member';

-- CreateIndex
CREATE UNIQUE INDEX "Customer_shareToken_key" ON "Customer"("shareToken");
