import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for 'agara' or 'agra' cities...");
  const cities = await prisma.city.findMany({
    where: {
      OR: [
        { name: { equals: "agara", mode: "insensitive" } },
        { name: { equals: "agra", mode: "insensitive" } },
      ],
    },
  });

  console.log("Found cities to delete:", cities);

  for (const city of cities) {
    // Delete related entities to prevent foreign key violations
    console.log(`Deleting dependencies for city: ${city.name}`);
    
    // 1. Delete property associations (favourite, recentlyViewed, etc. for properties in this city)
    const propertiesInCity = await prisma.property.findMany({
      where: { cityId: city.id },
      select: { id: true },
    });

    const propertyIds = propertiesInCity.map((p) => p.id);

    if (propertyIds.length > 0) {
      await prisma.favourite.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.recentlyViewed.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.propertyReport.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.visit.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.enquiry.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.propertyAmenity.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.propertyImage.deleteMany({ where: { propertyId: { in: propertyIds } } });
      await prisma.property.deleteMany({ where: { cityId: city.id } });
    }

    // 2. Delete localities
    await prisma.locality.deleteMany({ where: { cityId: city.id } });

    // 3. Delete the city
    await prisma.city.delete({ where: { id: city.id } });
    console.log(`Successfully deleted city ${city.name}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
