-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "entryRequirements" TEXT,
ADD COLUMN     "faqs" JSONB;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "entryRequirements" TEXT,
ADD COLUMN     "faqs" JSONB;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "entryRequirements" TEXT,
ADD COLUMN     "faqs" JSONB;

-- AlterTable
ALTER TABLE "Cruise" ADD COLUMN     "entryRequirements" TEXT,
ADD COLUMN     "faqs" JSONB;
