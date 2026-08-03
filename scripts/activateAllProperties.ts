import { PrismaClient, PropertyStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.property.updateMany({
    data: {
      status: PropertyStatus.ACTIVE
    }
  });

  console.log(`Successfully activated ${result.count} properties in the database!`);
}

main().finally(() => prisma.$disconnect());
