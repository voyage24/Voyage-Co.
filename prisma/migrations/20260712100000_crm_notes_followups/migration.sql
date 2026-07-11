-- Concierge CRM: staff notes on a client + follow-up tasks
CREATE TABLE "CustomerNote" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomerNote_email_idx" ON "CustomerNote"("email");

CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "enquiryId" TEXT,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "author" TEXT,
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FollowUp_email_idx" ON "FollowUp"("email");
CREATE INDEX "FollowUp_done_dueAt_idx" ON "FollowUp"("done", "dueAt");
