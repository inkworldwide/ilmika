import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding extra demo properties...');

  // 1. Get an Owner User
  let owner = await prisma.user.findFirst({
    where: { role: 'OWNER' },
  });
  if (!owner) {
    owner = await prisma.user.findFirst();
  }
  
  if (!owner) {
      console.log('No users found in database.');
      return;
  }

  // 2. Fetch all cities
  const cities = await prisma.city.findMany({
    include: { localities: true }
  });

  if (cities.length === 0) {
    console.log('No cities found in database.');
    return;
  }

  const newProperties: any[] = [];

  // Task 1: Ensure each city has +1 property (different images)
  console.log('Adding 1 extra property to each city to ensure at least 2 demo properties...');
  for (const city of cities) {
    if (city.localities.length === 0) continue;
    const locality = city.localities[0];

    const extraProperty = {
      title: `Luxurious Demo Villa in ${locality.name}, ${city.name}`,
      slug: `demo-res-${Math.random().toString(36).substr(2, 9)}`,
      description: "A spectacular property offering world-class amenities and breathtaking views. Perfect for families looking for a premium lifestyle.",
      price: Math.floor(Math.random() * (40000000 - 15000000) + 15000000), 
      transactionType: "SALE",
      propertyType: "VILLA",
      bhk: Math.floor(Math.random() * 3) + 3, // 3 to 5
      bathrooms: Math.floor(Math.random() * 2) + 3,
      carpetArea: Math.floor(Math.random() * (4000 - 1500) + 1500),
      areaUnit: "SQFT",
      furnishingStatus: "FULLY_FURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "NORTHEAST",
      ownershipType: "FREEHOLD",
      state: "Maharashtra",
      fullAddress: `${locality.name}, ${city.name}, Maharashtra`,
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
          { url: `https://images.unsplash.com/photo-${1510000000000 + Math.floor(Math.random() * 90000000000)}?w=800&q=80` }, // randomish unsplash
          { url: `https://images.unsplash.com/photo-${1610000000000 + Math.floor(Math.random() * 90000000000)}?w=800&q=80` }
        ]
      }
    };
    // Let's use some hardcoded realistic images for variety
    const realImages = [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
    ];
    extraProperty.images.create[0].url = realImages[Math.floor(Math.random() * realImages.length)];
    extraProperty.images.create[1].url = realImages[Math.floor(Math.random() * realImages.length)];

    newProperties.push(extraProperty);
  }

  // Task 2 & 3: Add 6 Land and 6 Industrial properties
  console.log('Adding 6 Land and 6 Industrial demo properties...');
  
  const landImages = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    "https://images.unsplash.com/photo-1413728639209-6467389a0364?w=800&q=80",
    "https://images.unsplash.com/photo-1596484552834-6a58f850c4df?w=800&q=80",
    "https://images.unsplash.com/photo-1500399859560-63ce4a719c23?w=800&q=80"
  ];
  
  const industrialImages = [
    "https://images.unsplash.com/photo-1586528116311-ad8ed7c50840?w=800&q=80",
    "https://images.unsplash.com/photo-1614030424754-24d0eebd4666?w=800&q=80",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
    "https://images.unsplash.com/photo-1565610222536-ce1278b5bc8a?w=800&q=80"
  ];

  for (let i = 0; i < 6; i++) {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    if (!randomCity || randomCity.localities.length === 0) continue;
    const locality = randomCity.localities[0];

    // Land
    newProperties.push({
      title: `Prime Commercial Plot ${i+1} in ${locality.name}, ${randomCity.name}`,
      slug: `land-prop-${Math.random().toString(36).substr(2, 9)}`,
      description: "Excellent investment opportunity. This prime piece of land is strategically located with great connectivity.",
      price: Math.floor(Math.random() * (50000000 - 10000000) + 10000000),
      transactionType: "SALE",
      propertyType: "COMMERCIAL_LAND",
      carpetArea: Math.floor(Math.random() * (10000 - 2000) + 2000),
      areaUnit: "SQFT",
      furnishingStatus: "UNFURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "EAST",
      ownershipType: "FREEHOLD",
      state: "Maharashtra",
      fullAddress: `${locality.name}, ${randomCity.name}, Maharashtra`,
      latitude: null,
      longitude: null,
      pincode: "110001",
      isVerified: true,
      isFeatured: Math.random() > 0.5,
      ownerId: owner.id,
      cityId: randomCity.id,
      localityId: locality.id,
      images: {
        create: [
          { url: landImages[i % landImages.length] },
          { url: landImages[(i+1) % landImages.length] }
        ]
      }
    });

    // Industrial
    newProperties.push({
      title: `Modern Industrial Facility ${i+1} in ${locality.name}, ${randomCity.name}`,
      slug: `ind-prop-${Math.random().toString(36).substr(2, 9)}`,
      description: "State-of-the-art industrial facility designed to optimize manufacturing and logistics operations.",
      price: Math.floor(Math.random() * (100000000 - 20000000) + 20000000),
      transactionType: "LEASE",
      propertyType: "INDUSTRIAL_PROPERTY",
      carpetArea: Math.floor(Math.random() * (50000 - 10000) + 10000),
      areaUnit: "SQFT",
      furnishingStatus: "SEMI_FURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "NORTH",
      ownershipType: "LEASEHOLD",
      state: "Maharashtra",
      fullAddress: `${locality.name}, ${randomCity.name}, Maharashtra`,
      latitude: null,
      longitude: null,
      pincode: "110020",
      isVerified: true,
      isFeatured: Math.random() > 0.5,
      ownerId: owner.id,
      cityId: randomCity.id,
      localityId: locality.id,
      images: {
        create: [
          { url: industrialImages[i % industrialImages.length] },
          { url: industrialImages[(i+1) % industrialImages.length] }
        ]
      }
    });
  }

  // Save to DB
  let count = 0;
  for (const property of newProperties) {
    if(!property.localityId) continue;
    try {
      await prisma.property.create({
        data: property,
      });
      count++;
    } catch(e: any) {
      console.log('Error creating property:', e.message);
    }
  }

  console.log(`Successfully seeded ${count} extra demo properties.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
