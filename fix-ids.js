const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { customId: null }
  });

  console.log(`Found ${users.length} users without customId`);

  for (const user of users) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const customId = `RE${randomDigits}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { customId }
    });
    console.log(`Updated user ${user.email} with customId ${customId}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  });
