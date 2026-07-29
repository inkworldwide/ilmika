import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany({
    include: { images: true }
  });

  let fixed = 0;
  for (const prop of properties) {
    if (prop.images.length > 0) {
      const hasPrimary = prop.images.some(img => img.isPrimary);
      if (!hasPrimary) {
        // Set the first image as primary
        await prisma.propertyImage.update({
          where: { id: prop.images[0].id },
          data: { isPrimary: true }
        });
        fixed++;
      }
    } else {
      // It has NO images at all. Let's add a random one.
      const fallbackUrl = '/uploads/professional_home_1.jpg';
      await prisma.propertyImage.create({
        data: {
          url: fallbackUrl,
          propertyId: prop.id,
          isPrimary: true,
          sortOrder: 0,
        }
      });
      fixed++;
    }
  }

  console.log(`Successfully fixed images for ${fixed} properties.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
