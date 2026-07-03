-- CreateTable
CREATE TABLE "DailyVisit" (
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyVisit_pkey" PRIMARY KEY ("day")
);
