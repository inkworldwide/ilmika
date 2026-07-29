import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Land and Industrial properties...');

  // 1. Get or create a generic Admin/Owner User
  let owner = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!owner) {
    owner = await prisma.user.findFirst();
  }
  
  if (!owner) {
      console.log('No users found in database to own the properties.');
      return;
  }

  // 2. Fetch popular cities (Bengaluru, Mumbai, Delhi, etc.)
  const cities = await prisma.city.findMany({
    take: 3,
  });

  if (cities.length === 0) {
    console.log('No cities found in database.');
    return;
  }

  // Demo property data
  const newProperties: any[] = [];

  for (const city of cities) {
    // Get localities for the city
    const localities = await prisma.locality.findMany({
      where: { cityId: city.id },
      take: 2,
    });

    if (localities.length === 0) continue;

    const locality = localities[0]; // Just use the first locality

    // 1. Add a Land property (Plots / Agricultural Land / Developer Sites)
    const landTitles = ["Premium Commercial Plot", "Prime Agricultural Land", "Developer Site for Township"];
    const landProperty = {
      title: `${landTitles[Math.floor(Math.random() * landTitles.length)]} in ${locality.name}, ${city.name}`,
      slug: `land-${Math.random().toString(36).substr(2, 9)}`,
      description: "Excellent investment opportunity. This prime piece of land is strategically located with great connectivity to major highways and upcoming infrastructure projects. Suitable for diverse development needs.",
      price: Math.floor(Math.random() * (50000000 - 10000000) + 10000000), // 1Cr to 5Cr
      transactionType: "SALE",
      propertyType: "COMMERCIAL_LAND",
      carpetArea: Math.floor(Math.random() * (10000 - 2000) + 2000),
      areaUnit: "SQFT",
      furnishingStatus: "UNFURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "EAST",
      ownershipType: "FREEHOLD",
      state: "Maharashtra",
      fullAddress: `${locality.name}, ${city.name}, Maharashtra`,
      latitude: null,
      longitude: null,
      pincode: "110001",
      isVerified: true,
      isFeatured: Math.random() > 0.5,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1413728639209-6467389a0364?w=800&q=80" }
        ]
      }
    };
    newProperties.push(landProperty);

    // 2. Add an Industrial property (Industrial Site / Industrial Building)
    const industrialTitles = ["Spacious Industrial Warehouse", "Modern Industrial Building", "Large Industrial Site"];
    const industrialProperty = {
      title: `${industrialTitles[Math.floor(Math.random() * industrialTitles.length)]} in ${locality.name}, ${city.name}`,
      slug: `industrial-${Math.random().toString(36).substr(2, 9)}`,
      description: "State-of-the-art industrial facility designed to optimize manufacturing and logistics operations. Features high ceilings, heavy-duty flooring, adequate power backup, and seamless transport connectivity.",
      price: Math.floor(Math.random() * (100000000 - 20000000) + 20000000), // 2Cr to 10Cr
      transactionType: "LEASE",
      propertyType: "INDUSTRIAL_PROPERTY",
      carpetArea: Math.floor(Math.random() * (50000 - 10000) + 10000),
      areaUnit: "SQFT",
      furnishingStatus: "SEMI_FURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "NORTH",
      ownershipType: "LEASEHOLD",
      state: "Maharashtra",
      fullAddress: `${locality.name}, ${city.name}, Maharashtra`,
      latitude: null,
      longitude: null,
      pincode: "110020",
      isVerified: true,
      isFeatured: Math.random() > 0.5,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      images: {
        create: [
          { url: "https://images.unsplash.com/photo-1586528116311-ad8ed7c50840?w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1614030424754-24d0eebd4666?w=800&q=80" }
        ]
      }
    };
    newProperties.push(industrialProperty);
  }

  for (const property of newProperties) {
    await prisma.property.create({
      data: property,
    });
  }

  console.log(`Successfully seeded ${newProperties.length} Land and Industrial properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
