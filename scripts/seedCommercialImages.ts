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

  // The 4 image files provided by the user for commercial
  const userImages = [
    'media__1785151175493.png',
    'media__1785151169877.png',
    'media__1785151167536.png',
    'media__1785151164739.png'
  ];

  const copiedPaths: string[] = [];

  for (let i = 0; i < userImages.length; i++) {
    const src = path.join(sourceDir, userImages[i]);
    const destName = `user_commercial_${i + 1}.png`;
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
    "Premium Glass Office Complex",
    "Modern Coworking Space Hub",
    "Corporate HQ Commercial Building",
    "Luxury IT Park Office Space"
  ];

  let imgIndex = 0;

  for (const city of cities) {
    if (city.localities.length === 0) continue;
    const locality = city.localities[0];

    // Create 1 or 2 commercial properties per city (let's do 2 to be consistent and plentiful)
    for (let i = 0; i < 2; i++) {
      const imageUrl = copiedPaths[imgIndex % copiedPaths.length];
      const titleName = commercialTitles[imgIndex % commercialTitles.length];
      imgIndex++;

      const property = {
        title: `${titleName} in ${city.name}`,
        slug: `com-${Math.random().toString(36).substr(2, 9)}`,
        description: "A premium commercial office space in the heart of the business district. Features open-plan layout, high-speed elevators, 24/7 security, and ample parking.",
        price: Math.floor(Math.random() * (150000000 - 30000000) + 30000000), // 3Cr to 15Cr
        transactionType: "SALE",
        propertyType: "OFFICE_SPACE", // Commercial property type
        carpetArea: Math.floor(Math.random() * (50000 - 5000) + 5000),
        areaUnit: "SQFT",
        furnishingStatus: "SEMI_FURNISHED",
        possessionStatus: "READY_TO_MOVE",
        facing: "EAST",
        ownershipType: "FREEHOLD",
        state: "State",
        fullAddress: `${locality.name}, ${city.name}`,
        pincode: "100001",
        isVerified: true,
        isFeatured: true,
        status: "ACTIVE", // Make sure it's active!
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

  console.log("Successfully seeded new commercial properties with uploaded images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
