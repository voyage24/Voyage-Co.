-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'new';

-- CreateIndex
CREATE INDEX "Enquiry_stage_idx" ON "Enquiry"("stage");
