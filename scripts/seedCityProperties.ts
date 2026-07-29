import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + generateUniqueId();
}

async function main() {
  const cities = await prisma.city.findMany({
    include: {
      _count: { select: { properties: true } },
      localities: true
    }
  });

  const allProperties = await prisma.property.findMany({
    where: { status: 'ACTIVE' },
    take: 50, // Just a pool to copy from
    include: { images: true }
  });

  if (allProperties.length === 0) {
    console.log("No existing properties to copy from!");
    return;
  }

  for (const city of cities) {
    const missing = 2 - city._count.properties;
    
    if (missing > 0) {
      console.log(`Adding ${missing} properties to ${city.name}...`);
      
      // Ensure we have a locality
      let locality = city.localities[0];
      if (!locality) {
        locality = await prisma.locality.create({
          data: {
            name: `${city.name} Central`,
            slug: slugify(`${city.name} Central`),
            cityId: city.id
          }
        });
      }

      for (let i = 0; i < missing; i++) {
        // Pick a random property to clone
        const template = allProperties[Math.floor(Math.random() * allProperties.length)];
        
        const newTitle = `${template.title.split(' in ')[0]} in ${city.name} ${generateUniqueId()}`;
        
        const { id, createdAt, updatedAt, ...restTemplate } = template;
        // Don't copy images object directly
        const { images, ...propertyData } = restTemplate as any;

        const newProperty = await prisma.property.create({
          data: {
            ...propertyData,
            title: newTitle,
            slug: slugify(newTitle),
            cityId: city.id,
            localityId: locality.id,
          }
        });

        // Copy images
        if (images && images.length > 0) {
          for (const img of images) {
            await prisma.propertyImage.create({
              data: {
                url: img.url,
                category: img.category,
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder,
                propertyId: newProperty.id,
                altText: img.altText,
              }
            });
          }
        }
      }
      
      console.log(`Successfully added to ${city.name}`);
    }
  }

  console.log("Finished ensuring all cities have at least 2 properties.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
