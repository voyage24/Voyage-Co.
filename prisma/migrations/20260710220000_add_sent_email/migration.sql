-- Sent folder for Voyages Mail (emails sent from the site)
CREATE TABLE "SentEmail" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "fromEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentEmail_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SentEmail_createdAt_idx" ON "SentEmail"("createdAt");
