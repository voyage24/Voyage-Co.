// One-time admin bootstrap: creates (or updates) the single admin account
// from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD env vars. Run manually, once —
// never wired into the build process. Safe to re-run to rotate a lost
// password (upserts by email).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD before running this script.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
