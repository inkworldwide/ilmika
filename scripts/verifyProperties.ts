import { PrismaClient, PropertyStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const devSites = await prisma.property.findMany({
    where: { propertyType: 'DEVELOPER_SITE', status: PropertyStatus.ACTIVE }
  });
  const plots = await prisma.property.findMany({
    where: { propertyType: 'PLOT', status: PropertyStatus.ACTIVE }
  });
  const agri = await prisma.property.findMany({
    where: { propertyType: 'AGRICULTURE_LAND', status: PropertyStatus.ACTIVE }
  });
  const resort = await prisma.property.findMany({
    where: { propertyType: 'RESORT', status: PropertyStatus.ACTIVE }
  });
  const industrialSite = await prisma.property.findMany({
    where: { propertyType: 'INDUSTRIAL_SITE', status: PropertyStatus.ACTIVE }
  });
  const industrialBldg = await prisma.property.findMany({
    where: { propertyType: 'INDUSTRIAL_BUILDING', status: PropertyStatus.ACTIVE }
  });
  const hotel = await prisma.property.findMany({
    where: { propertyType: 'HOTEL', status: PropertyStatus.ACTIVE }
  });
  const complex = await prisma.property.findMany({
    where: { propertyType: 'COMMERCIAL_COMPLEX', status: PropertyStatus.ACTIVE }
  });
  const shop = await prisma.property.findMany({
    where: { propertyType: 'SHOP', status: PropertyStatus.ACTIVE }
  });

  console.log("=== Active Properties in DB per Mega Menu Category ===");
  console.log("Developer Sites:", devSites.length);
  console.log("Plots:", plots.length);
  console.log("Agriculture Land:", agri.length);
  console.log("Resort:", resort.length);
  console.log("Industrial Site:", industrialSite.length);
  console.log("Industrial Building:", industrialBldg.length);
  console.log("Hotel:", hotel.length);
  console.log("Complex:", complex.length);
  console.log("Shops:", shop.length);
}

main().finally(() => prisma.$disconnect());
