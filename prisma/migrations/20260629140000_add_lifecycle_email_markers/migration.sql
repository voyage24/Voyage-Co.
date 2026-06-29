-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "postTripSentAt" TIMESTAMP(3),
ADD COLUMN     "preTripSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "followupSentAt" TIMESTAMP(3);
