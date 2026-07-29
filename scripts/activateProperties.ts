import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.property.updateMany({
    where: {
      status: 'DRAFT',
      propertyType: 'COMMERCIAL_LAND'
    },
    data: {
      status: 'ACTIVE'
    }
  });

  console.log(`Activated ${result.count} land properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
