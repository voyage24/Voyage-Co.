-- Cached airport transfer times (precise road routing), self-populating on view
CREATE TABLE "RouteCache" (
    "key" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "minutes" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'precise',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RouteCache_pkey" PRIMARY KEY ("key")
);
