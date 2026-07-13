-- AlterTable
ALTER TABLE "GroupExpense" ADD COLUMN "origCurrency" TEXT;
ALTER TABLE "GroupExpense" ADD COLUMN "origAmount" INTEGER;

-- AlterTable
ALTER TABLE "PersonalExpense" ADD COLUMN "origCurrency" TEXT;
ALTER TABLE "PersonalExpense" ADD COLUMN "origAmount" INTEGER;
