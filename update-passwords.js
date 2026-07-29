const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      plainPassword: null
    }
  });

  const newPassword = 'password123';
  const newHash = await bcrypt.hash(newPassword, 10);

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plainPassword: newPassword,
        passwordHash: newHash
      }
    });
    console.log(`Updated user ${user.email} with default password.`);
  }

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
