import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@carspotting.se";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, password: hashed, isAdmin: true },
  });

  console.log(`Created admin user: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log("\nChange the password after first login!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
