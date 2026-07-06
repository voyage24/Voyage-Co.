-- In-app notification inbox for members
CREATE TABLE "MemberNotification" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MemberNotification_customerId_idx" ON "MemberNotification"("customerId");

ALTER TABLE "MemberNotification" ADD CONSTRAINT "MemberNotification_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
