-- Personalized member home: price-drop baseline + document expiry reminders
ALTER TABLE "SavedItem" ADD COLUMN "priceAtSave" INTEGER;
ALTER TABLE "MemberDocument" ADD COLUMN "expiry" TEXT;
