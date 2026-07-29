import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Specific Land Demo Properties...');

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

  // 2. Fetch all cities to distribute the properties
  const cities = await prisma.city.findMany();

  if (cities.length === 0) {
    console.log('No cities found in database.');
    return;
  }

  // Pre-defined specific land properties matching the requested images
  const landData = [
    {
      title: "Lush Green Agricultural Farm",
      desc: "Expansive green agricultural land lined with mature trees. Perfect for large scale farming or a countryside estate.",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", // Green field
      price: 25000000,
    },
    {
      title: "Mountain View Prime Land",
      desc: "Breathtaking mountain views with tall pine trees and glorious sunsets. Ideal for a luxury resort or private retreat.",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", // Mountain sunset
      price: 45000000,
    },
    {
      title: "Premium Residential Plot",
      desc: "Clearly demarcated premium residential plot in a rapidly developing area. Ready for immediate construction.",
      url: "https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&q=80", // Aerial plot vibe
      price: 15000000,
    },
    {
      title: "Expansive Valley Farm Estate",
      desc: "Massive estate nestled in a lush green valley. Features rolling hills and incredibly fertile soil for agriculture.",
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", // Green valley aerial
      price: 85000000,
    },
    {
      title: "Fertile Plowed Farmland",
      desc: "Freshly plowed, dark rich soil ready for planting. Comes with excellent irrigation access and clear skies.",
      url: "https://images.unsplash.com/photo-1586771107445-d3af9e15016a?w=800&q=80", // Plowed field
      price: 12000000,
    },
    {
      title: "Golden Wheat Field Estate",
      desc: "Beautiful golden fields at sunset. A highly productive agricultural property with a stunning landscape.",
      url: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800&q=80", // Golden wheat field
      price: 32000000,
    }
  ];

  let dataIndex = 0;

  for (const city of cities) {
    // Get localities for the city
    const localities = await prisma.locality.findMany({
      where: { cityId: city.id },
    });

    if (localities.length === 0) continue;

    // Distribute properties across cities
    const locality = localities[0];
    
    if (dataIndex >= landData.length) break;
    const propertyInfo = landData[dataIndex];
    dataIndex++;

    const property = {
      title: `${propertyInfo.title} in ${city.name}`,
      slug: `specific-land-${Math.random().toString(36).substr(2, 9)}`,
      description: propertyInfo.desc,
      price: propertyInfo.price,
      transactionType: "SALE",
      propertyType: "COMMERCIAL_LAND", // Or AGRICULTURAL_LAND if we had that enum
      carpetArea: Math.floor(Math.random() * (50000 - 10000) + 10000),
      areaUnit: "SQFT",
      furnishingStatus: "UNFURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "EAST",
      ownershipType: "FREEHOLD",
      state: "State",
      fullAddress: `${locality.name}, ${city.name}`,
      latitude: null,
      longitude: null,
      pincode: "100001",
      isVerified: true,
      isFeatured: true,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      images: {
        create: [
          { url: propertyInfo.url }
        ]
      }
    };

    await prisma.property.create({
      data: property,
    });
    console.log(`Created: ${property.title}`);
  }

  // If we have more landData than cities, put the rest in the last city
  const lastCity = cities[cities.length - 1];
  const lastLocalities = await prisma.locality.findMany({ where: { cityId: lastCity.id } });
  const lastLocality = lastLocalities[0];

  while(dataIndex < landData.length) {
    const propertyInfo = landData[dataIndex];
    dataIndex++;

    if(!lastLocality) break;

    const property = {
      title: `${propertyInfo.title} in ${lastCity.name}`,
      slug: `specific-land-${Math.random().toString(36).substr(2, 9)}`,
      description: propertyInfo.desc,
      price: propertyInfo.price,
      transactionType: "SALE",
      propertyType: "COMMERCIAL_LAND",
      carpetArea: Math.floor(Math.random() * (50000 - 10000) + 10000),
      areaUnit: "SQFT",
      furnishingStatus: "UNFURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "EAST",
      ownershipType: "FREEHOLD",
      state: "State",
      fullAddress: `${lastLocality.name}, ${lastCity.name}`,
      latitude: null,
      longitude: null,
      pincode: "100001",
      isVerified: true,
      isFeatured: true,
      ownerId: owner.id,
      cityId: lastCity.id,
      localityId: lastLocality.id,
      images: {
        create: [
          { url: propertyInfo.url }
        ]
      }
    };

    await prisma.property.create({
      data: property,
    });
    console.log(`Created: ${property.title}`);
  }

  console.log(`Successfully seeded requested land properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
