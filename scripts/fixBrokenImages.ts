import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const homeImages = [
  '/uploads/0jqf17n-1784535200731.jpeg',
  '/uploads/3rivi9f-1784618864838.jpg',
  '/uploads/6t20v9e-1784538831996.jpeg',
  '/uploads/8n5j1u3-1784537504576.jpeg',
  '/uploads/9kktnul-1784535186222.jpeg',
  '/uploads/cqr60j7-1784625818615.jpg',
  '/uploads/m9913n5-1784539101729.jpeg',
  '/uploads/w06wjpo-1784547245584.jpeg',
];

const commercialImages = [
  '/uploads/user_commercial_1.png',
  '/uploads/user_commercial_2.png',
  '/uploads/user_commercial_3.png',
  '/uploads/user_commercial_4.png',
  '/uploads/user_commercial_extra_1.png',
  '/uploads/user_commercial_extra_2.png',
  '/uploads/user_commercial_extra_3.png',
];

const industrialImages = [
  '/uploads/user_industrial_1.png',
  '/uploads/user_industrial_2.png',
  '/uploads/user_industrial_3.png',
  '/uploads/user_industrial_4.png',
  '/uploads/user_industrial_5.png',
];

const landImages = [
  '/uploads/user_land_1.png',
  '/uploads/user_land_2.png',
  '/uploads/user_land_3.png',
  '/uploads/user_land_4.png',
  '/uploads/user_land_5.png',
  '/uploads/user_land_6.png',
  '/uploads/user_land_7.png',
];

function getRandomImage(type: string) {
  if (['OFFICE_SPACE', 'SHOWROOM', 'SHOP', 'COWORKING_SPACE'].includes(type)) {
    return commercialImages[Math.floor(Math.random() * commercialImages.length)];
  }
  if (['INDUSTRIAL_PROPERTY', 'WAREHOUSE'].includes(type)) {
    return industrialImages[Math.floor(Math.random() * industrialImages.length)];
  }
  if (['RESIDENTIAL_PLOT', 'COMMERCIAL_LAND', 'FARM_HOUSE'].includes(type)) {
    return landImages[Math.floor(Math.random() * landImages.length)];
  }
  return homeImages[Math.floor(Math.random() * homeImages.length)];
}

async function main() {
  const images = await prisma.propertyImage.findMany({
    where: { url: { contains: 'unsplash.com' } },
    include: { property: { select: { propertyType: true } } }
  });

  console.log(`Found ${images.length} broken unsplash images.`);

  let updated = 0;
  for (const img of images) {
    if (!img.property) continue;
    const newUrl = getRandomImage(img.property.propertyType);
    await prisma.propertyImage.update({
      where: { id: img.id },
      data: { url: newUrl }
    });
    updated++;
  }

  console.log(`Successfully fixed ${updated} broken images.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
