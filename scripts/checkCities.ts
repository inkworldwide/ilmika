import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cities = await prisma.city.findMany({
    include: {
      localities: true,
      _count: {
        select: { properties: true }
      }
    }
  });

  console.log("Cities in DB:", cities.map(c => ({ id: c.id, name: c.name, localitiesCount: c.localities.length, propertiesCount: c._count.properties })));
}

main().finally(() => prisma.$disconnect());
