const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating University of Melbourne & all database colleges with high-res images...");

  // 1. Find University of Melbourne
  const melbourneColleges = await prisma.college.findMany({
    where: {
      OR: [
        { name: { contains: "Melbourne", mode: "insensitive" } },
      ],
    },
  });

  for (const college of melbourneColleges) {
    await prisma.collegeImage.deleteMany({ where: { collegeId: college.id } });

    await prisma.collegeImage.create({
      data: {
        collegeId: college.id,
        url: "/uploads/university_of_melbourne.jpg",
        altText: `${college.name} Historic Quadrangle`,
        isPrimary: true,
        category: "EXTERIOR",
      },
    });

    await prisma.collegeImage.createMany({
      data: [
        {
          collegeId: college.id,
          url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
          altText: `${college.name} Library`,
          isPrimary: false,
          category: "LIBRARY",
        },
        {
          collegeId: college.id,
          url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
          altText: `${college.name} Main Hall`,
          isPrimary: false,
          category: "AUDITORIUM",
        },
      ],
    });

    console.log(`Updated images for ${college.name} (${college.id})`);
  }

  // 2. Scan ALL colleges in database and fix any broken/empty image sets
  const defaultHighResImages = [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
  ];

  const allColleges = await prisma.college.findMany({
    include: { images: true },
  });

  for (const c of allColleges) {
    if (c.images.length < 2) {
      // Add backup images so gallery is full
      const existingUrls = c.images.map(img => img.url);
      for (let i = 0; i < 3 - c.images.length; i++) {
        const urlToAdd = defaultHighResImages[i % defaultHighResImages.length];
        if (!existingUrls.includes(urlToAdd)) {
          await prisma.collegeImage.create({
            data: {
              collegeId: c.id,
              url: urlToAdd,
              altText: `${c.name} Campus View ${i + 1}`,
              isPrimary: c.images.length === 0 && i === 0,
              category: i === 0 ? "EXTERIOR" : "CAMPUS",
            },
          });
        }
      }
      console.log(`Ensured 3+ images for ${c.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
