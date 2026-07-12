-- Encrypt document-vault files at rest: store mime + an encrypted flag
ALTER TABLE "MemberDocument" ADD COLUMN "mime" TEXT;
ALTER TABLE "MemberDocument" ADD COLUMN "encrypted" BOOLEAN NOT NULL DEFAULT false;
