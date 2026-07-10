-- Honor the Reply-To header on incoming mail
ALTER TABLE "InboundEmail" ADD COLUMN "replyToEmail" TEXT;
