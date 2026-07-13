-- CreateTable
CREATE TABLE "GroupTrip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT,
    "ownerId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupShortlistItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "href" TEXT NOT NULL,
    "price" INTEGER,
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupShortlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupVote" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupExpense" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidById" TEXT NOT NULL,
    "splitAmong" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMessage" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPhoto" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupTrip_shareToken_key" ON "GroupTrip"("shareToken");
CREATE INDEX "GroupTrip_ownerId_idx" ON "GroupTrip"("ownerId");
CREATE INDEX "GroupMember_customerId_idx" ON "GroupMember"("customerId");
CREATE UNIQUE INDEX "GroupMember_groupId_customerId_key" ON "GroupMember"("groupId", "customerId");
CREATE INDEX "GroupShortlistItem_groupId_idx" ON "GroupShortlistItem"("groupId");
CREATE INDEX "GroupVote_itemId_idx" ON "GroupVote"("itemId");
CREATE UNIQUE INDEX "GroupVote_itemId_customerId_key" ON "GroupVote"("itemId", "customerId");
CREATE INDEX "GroupExpense_groupId_idx" ON "GroupExpense"("groupId");
CREATE INDEX "GroupMessage_groupId_idx" ON "GroupMessage"("groupId");
CREATE INDEX "GroupPhoto_groupId_idx" ON "GroupPhoto"("groupId");

-- AddForeignKey
ALTER TABLE "GroupTrip" ADD CONSTRAINT "GroupTrip_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupShortlistItem" ADD CONSTRAINT "GroupShortlistItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupVote" ADD CONSTRAINT "GroupVote_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "GroupShortlistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupExpense" ADD CONSTRAINT "GroupExpense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupPhoto" ADD CONSTRAINT "GroupPhoto_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
