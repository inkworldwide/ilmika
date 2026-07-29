import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sourceDir = 'C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\.user_uploaded';
  const targetDir = path.join(process.cwd(), 'public', 'uploads');
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // The 7 image files provided by the user
  const userImages = [
    'media__1785149944609.png',
    'media__1785149938200.png',
    'media__1785149876790.png',
    'media__1785149871897.png',
    'media__1785149868848.png',
    'media__1785149867072.png',
    'media__1785149802077.png'
  ];

  const copiedPaths: string[] = [];

  for (let i = 0; i < userImages.length; i++) {
    const src = path.join(sourceDir, userImages[i]);
    const destName = `user_land_${i + 1}.png`;
    const dest = path.join(targetDir, destName);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      copiedPaths.push(`/uploads/${destName}`);
    }
  }

  if (copiedPaths.length === 0) {
    console.log("No images found to copy.");
    return;
  }

  console.log(`Copied ${copiedPaths.length} images to public/uploads.`);

  // Find all COMMERCIAL_LAND properties
  const landProperties = await prisma.property.findMany({
    where: {
      propertyType: 'COMMERCIAL_LAND'
    },
    include: {
      images: true
    }
  });

  console.log(`Found ${landProperties.length} land properties to fix.`);

  let imgIndex = 0;
  
  for (const property of landProperties) {
    const imageUrl = copiedPaths[imgIndex % copiedPaths.length];
    imgIndex++;
    
    if (property.images.length === 0) {
      // Create new image if it doesn't exist
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: imageUrl,
          isPrimary: true
        }
      });
      console.log(`Created image for property ${property.title}`);
    } else {
      // Update existing images
      for (const img of property.images) {
        await prisma.propertyImage.update({
          where: { id: img.id },
          data: { url: imageUrl }
        });
      }
      console.log(`Updated images for property ${property.title}`);
    }
    
    // Also make sure they are active
    if (property.status !== 'ACTIVE') {
      await prisma.property.update({
        where: { id: property.id },
        data: { status: 'ACTIVE' }
      });
    }
  }
  
  // Now ensure ALL properties have at least one image.
  // We'll give a fallback image to any property that is missing one.
  const fallbackImage = copiedPaths[0]; // Just use the first one as a fallback for non-land if they are missing
  
  const propertiesWithoutImages = await prisma.property.findMany({
    where: {
      images: {
        none: {}
      }
    }
  });
  
  for (const prop of propertiesWithoutImages) {
    await prisma.propertyImage.create({
      data: {
        propertyId: prop.id,
        url: fallbackImage,
        isPrimary: true
      }
    });
    console.log(`Fixed missing image for ${prop.title}`);
  }

  console.log("Finished fixing property images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
