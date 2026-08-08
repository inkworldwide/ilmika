const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Adds Buzz banner advertisements into PostgreSQL database...");

  const existing = await prisma.advertisement.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} ad banners.`);
    return;
  }

  const adsToSeed = [
    {
      name: "NITTE Deemed University - Admissions Open 2026",
      imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://apply.nitte.edu.in",
      placement: "BOTH",
      format: "FULL_WIDTH",
      displayOrder: 1,
      isActive: true,
    },
    {
      name: "PARADISE PROPERTIES - Premier Real Estate",
      imageUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://paradiseproperties.in",
      placement: "BOTH",
      format: "FULL_WIDTH",
      displayOrder: 2,
      isActive: true,
    },
    {
      name: "YAMUNA HOMES AND DESIGN PVT. LTD.",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://yamunahomes.com",
      placement: "BOTH",
      format: "FULL_WIDTH",
      displayOrder: 3,
      isActive: true,
    },
    {
      name: "St. Joseph Engineering College - Admissions 2026-27",
      imageUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://sjec.ac.in",
      placement: "HOME_ONLY",
      format: "FULL_WIDTH",
      displayOrder: 4,
      isActive: true,
    },
    {
      name: "Manipal Academy of Higher Education - 2026 Intake",
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://manipal.edu",
      placement: "INNER_ONLY",
      format: "HALF_WIDTH",
      displayOrder: 5,
      isActive: true,
    },
  ];

  for (const adData of adsToSeed) {
    await prisma.advertisement.create({ data: adData });
  }

  console.log(`Successfully seeded ${adsToSeed.length} ad banners!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
