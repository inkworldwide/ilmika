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

  // The 3 extra image files provided by the user
  const userImages = [
    'media__1785151306172.png',
    'media__1785151302189.png',
    'media__1785151298887.png'
  ];

  const copiedPaths: string[] = [];

  for (let i = 0; i < userImages.length; i++) {
    const src = path.join(sourceDir, userImages[i]);
    const destName = `user_commercial_extra_${i + 1}.png`;
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

  console.log(`Copied ${copiedPaths.length} commercial images to public/uploads.`);

  // Get or create owner
  let owner = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!owner) owner = await prisma.user.findFirst();
  if (!owner) return console.log('No users found.');

  // Fetch all cities
  const cities = await prisma.city.findMany({
    include: { localities: { take: 1 } }
  });

  const commercialTitles = [
    "Luxury High-Rise Office",
    "Modern Glass Skyscraper",
    "Premium Corporate Lobby"
  ];

  let imgIndex = 0;

  for (const city of cities) {
    if (city.localities.length === 0) continue;
    const locality = city.localities[0];

    // Create 1 more commercial property per city
    const imageUrl = copiedPaths[imgIndex % copiedPaths.length];
    const titleName = commercialTitles[imgIndex % commercialTitles.length];
    imgIndex++;

    const property = {
      title: `${titleName} in ${city.name}`,
      slug: `com-ext-${Math.random().toString(36).substr(2, 9)}`,
      description: "An ultra-modern commercial skyscraper with beautiful lobbies and vast office spaces.",
      price: Math.floor(Math.random() * (200000000 - 80000000) + 80000000), // 8Cr to 20Cr
      transactionType: "SALE",
      propertyType: "OFFICE_SPACE",
      carpetArea: Math.floor(Math.random() * (80000 - 10000) + 10000),
      areaUnit: "SQFT",
      furnishingStatus: "SEMI_FURNISHED",
      possessionStatus: "READY_TO_MOVE",
      facing: "NORTH",
      ownershipType: "FREEHOLD",
      state: "State",
      fullAddress: `${locality.name}, ${city.name}`,
      pincode: "100001",
      isVerified: true,
      isFeatured: true,
      status: "ACTIVE", // Active
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

  console.log("Successfully seeded extra commercial properties with new images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
