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

  // The 5 image files provided by the user for industrial
  const userImages = [
    'media__1785150808553.png',
    'media__1785150740782.png',
    'media__1785150737025.png',
    'media__1785150733133.png',
    'media__1785150730019.png'
  ];

  const copiedPaths: string[] = [];

  for (let i = 0; i < userImages.length; i++) {
    const src = path.join(sourceDir, userImages[i]);
    const destName = `user_industrial_${i + 1}.png`;
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

  console.log(`Copied ${copiedPaths.length} industrial images to public/uploads.`);

  // Get or create owner
  let owner = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!owner) owner = await prisma.user.findFirst();
  if (!owner) return console.log('No users found.');

  // Fetch all cities
  const cities = await prisma.city.findMany({
    include: { localities: { take: 1 } }
  });

  const industrialTitles = [
    "Premium Blue Warehouse Complex",
    "Under Construction Steel Frame Factory",
    "Heavy Machinery Assembly Plant",
    "High Capacity Storage Warehouse",
    "Mega Industrial Tech Park"
  ];

  let imgIndex = 0;

  for (const city of cities) {
    if (city.localities.length === 0) continue;
    const locality = city.localities[0];

    // Create 2 industrial properties per city
    for (let i = 0; i < 2; i++) {
      const imageUrl = copiedPaths[imgIndex % copiedPaths.length];
      const titleName = industrialTitles[imgIndex % industrialTitles.length];
      imgIndex++;

      const property = {
        title: `${titleName} in ${city.name}`,
        slug: `ind-${Math.random().toString(36).substr(2, 9)}`,
        description: "A state-of-the-art industrial facility tailored for large-scale operations. Features premium structural integrity, huge floor space, and great transport links.",
        price: Math.floor(Math.random() * (200000000 - 50000000) + 50000000), // 5Cr to 20Cr
        transactionType: "SALE",
        propertyType: "INDUSTRIAL_PROPERTY",
        carpetArea: Math.floor(Math.random() * (100000 - 20000) + 20000),
        areaUnit: "SQFT",
        furnishingStatus: "UNFURNISHED",
        possessionStatus: "READY_TO_MOVE",
        facing: "EAST",
        ownershipType: "FREEHOLD",
        state: "State", // Fallback, could be dynamic
        fullAddress: `${locality.name}, ${city.name}`,
        pincode: "100001",
        isVerified: true,
        isFeatured: true,
        status: "ACTIVE", // SET TO ACTIVE!
        ownerId: owner.id,
        cityId: city.id,
        localityId: locality.id,
        images: {
          create: [
            { url: imageUrl, isPrimary: true }
          ]
        }
      };

      await prisma.property.create({
        data: property,
      });
      console.log(`Created: ${property.title}`);
    }
  }

  // Also fix any existing INDUSTRIAL_PROPERTY missing images or set to DRAFT
  const existingIndustrial = await prisma.property.findMany({
    where: { propertyType: 'INDUSTRIAL_PROPERTY' },
    include: { images: true }
  });

  for (const prop of existingIndustrial) {
    let needsUpdate = false;
    const updateData: any = {};

    if (prop.status !== 'ACTIVE') {
      updateData.status = 'ACTIVE';
      needsUpdate = true;
    }

    if (prop.images.length === 0) {
      await prisma.propertyImage.create({
        data: {
          propertyId: prop.id,
          url: copiedPaths[0],
          isPrimary: true
        }
      });
      console.log(`Added missing image for existing property: ${prop.title}`);
    }

    if (needsUpdate) {
      await prisma.property.update({
        where: { id: prop.id },
        data: updateData
      });
      console.log(`Activated existing property: ${prop.title}`);
    }
  }

  console.log("Successfully seeded new industrial properties with uploaded images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
