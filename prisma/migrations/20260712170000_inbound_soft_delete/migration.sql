-- Soft-delete inbound emails so deleting doesn't let the next IMAP poll re-import them
ALTER TABLE "InboundEmail" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;
