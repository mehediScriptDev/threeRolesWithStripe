import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const adminEmail = "admin@gearup.com";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Admin already exists:", adminEmail);
    return;
  }

  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "GearUp Admin",
      email: adminEmail,
      password,
      role: Role.ADMIN,
    },
  });

  console.log("Admin created:");
  console.log("email:", adminEmail);
  console.log("password: admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
