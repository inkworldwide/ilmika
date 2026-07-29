import { PrismaClient, PropertyStatus, TransactionType, FurnishingStatus, PossessionStatus, OwnershipType, PropertyType } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Developer Sites', type: PropertyType.DEVELOPER_SITE, price: 15000000 },
  { name: 'Plots', type: PropertyType.PLOT, price: 5000000 },
  { name: 'Agriculture Land', type: PropertyType.AGRICULTURE_LAND, price: 3000000 },
  { name: 'Resort', type: PropertyType.RESORT, price: 25000000 },
  { name: 'Industrial Site', type: PropertyType.INDUSTRIAL_SITE, price: 12000000 },
  { name: 'Industrial Building', type: PropertyType.INDUSTRIAL_BUILDING, price: 20000000 },
  { name: 'Hotel', type: PropertyType.HOTEL, price: 40000000 },
  { name: 'Complex', type: PropertyType.COMMERCIAL_COMPLEX, price: 35000000 },
  { name: 'Shops', type: PropertyType.SHOP, price: 8000000 },
  { name: 'Commercial Land', type: PropertyType.COMMERCIAL_LAND, price: 22000000 },
];

const homeImages = [
  '/uploads/0jqf17n-1784535200731.jpeg',
  '/uploads/3rivi9f-1784618864838.jpg',
  '/uploads/6t20v9e-1784538831996.jpeg',
];

const commercialImages = [
  '/uploads/user_commercial_1.png',
  '/uploads/user_commercial_2.png',
  '/uploads/user_commercial_extra_1.png',
];

const industrialImages = [
  '/uploads/user_industrial_1.png',
  '/uploads/user_industrial_2.png',
  '/uploads/user_industrial_3.png',
];

const landImages = [
  '/uploads/user_land_1.png',
  '/uploads/user_land_2.png',
  '/uploads/user_land_3.png',
];

function getRandomImage(type: PropertyType) {
  if ([PropertyType.HOTEL, PropertyType.COMMERCIAL_COMPLEX, PropertyType.SHOP].includes(type)) {
    return commercialImages[Math.floor(Math.random() * commercialImages.length)];
  }
  if ([PropertyType.INDUSTRIAL_SITE, PropertyType.INDUSTRIAL_BUILDING].includes(type)) {
    return industrialImages[Math.floor(Math.random() * industrialImages.length)];
  }
  if ([PropertyType.DEVELOPER_SITE, PropertyType.PLOT, PropertyType.AGRICULTURE_LAND, PropertyType.COMMERCIAL_LAND].includes(type)) {
    return landImages[Math.floor(Math.random() * landImages.length)];
  }
  return homeImages[Math.floor(Math.random() * homeImages.length)];
}

async function main() {
  const cities = await prisma.city.findMany({ include: { localities: true } });
  if (cities.length === 0) {
    console.error("No cities found. Run seed script first.");
    return;
  }

  // Use the first admin user or create a fake one if none
  let owner = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!owner) {
    owner = await prisma.user.findFirst();
  }

  let createdCount = 0;

  for (const city of cities) {
    if (!city.localities || city.localities.length === 0) continue;
    for (const cat of categories) {
      // 2 properties per city
      for (let i = 1; i <= 2; i++) {
        const locality = city.localities[Math.floor(Math.random() * city.localities.length)];
        
        const slug = `${cat.name.toLowerCase().replace(/\s+/g, '-')}-${i}-${city.name.toLowerCase()}-${Math.random().toString(36).substring(2,7)}`;
        const title = `Premium ${cat.name} ${i} in ${locality.name}, ${city.name}`;
        
        await prisma.property.create({
          data: {
            title,
            slug,
            description: `This is a highly sought-after ${cat.name} located in the prime area of ${locality.name}, ${city.name}. Excellent connectivity and investment potential.`,
            transactionType: TransactionType.SALE,
            propertyType: cat.type,
            price: cat.price + (Math.random() * 5000000),
            carpetArea: 1000 + Math.floor(Math.random() * 5000),
            areaUnit: 'SQFT',
            possessionStatus: PossessionStatus.READY_TO_MOVE,
            furnishingStatus: FurnishingStatus.UNFURNISHED,
            ownershipType: OwnershipType.FREEHOLD,
            status: PropertyStatus.ACTIVE,
            isVerified: true,
            isFeatured: i === 1,
            state: city.name === 'Mumbai' ? 'Maharashtra' : city.name === 'Delhi' ? 'Delhi' : 'Karnataka',
            cityId: city.id,
            localityId: locality.id,
            fullAddress: `${Math.floor(Math.random() * 100)}, ${cat.name} Avenue, ${locality.name}, ${city.name}`,
            pincode: '400001',
            ownerId: owner!.id,
            images: {
              create: [
                {
                  url: getRandomImage(cat.type),
                  isPrimary: true,
                  category: 'EXTERIOR'
                }
              ]
            }
          }
        });
        createdCount++;
      }
    }
  }

  console.log(`Successfully created ${createdCount} properties.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
