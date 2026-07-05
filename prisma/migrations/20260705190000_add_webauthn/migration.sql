-- Passkeys (WebAuthn credentials) for passwordless member login.
CREATE TABLE "WebauthnCredential" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "deviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebauthnCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebauthnCredential_credentialId_key" ON "WebauthnCredential"("credentialId");
CREATE INDEX "WebauthnCredential_customerId_idx" ON "WebauthnCredential"("customerId");

ALTER TABLE "WebauthnCredential" ADD CONSTRAINT "WebauthnCredential_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
