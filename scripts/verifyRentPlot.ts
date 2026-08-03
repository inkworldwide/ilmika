import { PrismaClient, PropertyStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plotsForRent = await prisma.property.findMany({
    where: {
      propertyType: 'PLOT',
      transactionType: 'RENT',
      status: PropertyStatus.ACTIVE
    }
  });

  const devSitesForRent = await prisma.property.findMany({
    where: {
      propertyType: 'DEVELOPER_SITE',
      transactionType: 'RENT',
      status: PropertyStatus.ACTIVE
    }
  });

  console.log("=== Active Properties in DB for RENT ===");
  console.log("PLOTS for Rent count:", plotsForRent.length);
  console.log("DEVELOPER_SITES for Rent count:", devSitesForRent.length);
}

main().finally(() => prisma.$disconnect());
