import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const currentImages = [
    '/uploads/professional_home_1.jpg',
    '/uploads/professional_home_2.jpg',
    '/uploads/professional_home_3.jpg',
  ];

  const userImages = [
    '/uploads/professional_home_1.jpg',
    '/uploads/professional_home_2.jpg',
    '/uploads/professional_home_3.jpg',
    '/uploads/user_reference_48.png',
    '/uploads/user_reference_49.png',
    '/uploads/user_reference_50.png',
    '/uploads/user_reference_51.png',
    '/uploads/user_reference_52.png',
    '/uploads/user_reference_53.png',
    '/uploads/user_reference_54.png',
  ];

  const imagesToUpdate = await prisma.propertyImage.findMany({
    where: {
      url: { in: currentImages },
    },
  });

  let updated = 0;
  for (const img of imagesToUpdate) {
    const newUrl = userImages[Math.floor(Math.random() * userImages.length)];
    await prisma.propertyImage.update({
      where: { id: img.id },
      data: { url: newUrl },
    });
    updated++;
  }

  console.log('Successfully added user images to', updated, 'properties.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
