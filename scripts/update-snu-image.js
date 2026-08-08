const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating Seoul National University images in database...");

  // Find Seoul National University
  const colleges = await prisma.college.findMany({
    where: {
      OR: [
        { name: { contains: "Seoul", mode: "insensitive" } },
        { name: { contains: "SNU", mode: "insensitive" } },
      ],
    },
    include: { images: true },
  });

  console.log(`Found ${colleges.length} matching college(s):`, colleges.map(c => c.name));

  for (const college of colleges) {
    // Delete existing broken images
    await prisma.collegeImage.deleteMany({
      where: { collegeId: college.id },
    });

    // Add generated high quality campus image
    await prisma.collegeImage.create({
      data: {
        collegeId: college.id,
        url: "/uploads/seoul_national_university.jpg",
        altText: `${college.name} Main Campus`,
        isPrimary: true,
        category: "EXTERIOR",
      },
    });

    // Add secondary campus images
    await prisma.collegeImage.createMany({
      data: [
        {
          collegeId: college.id,
          url: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
          altText: `${college.name} Library & Grounds`,
          isPrimary: false,
          category: "LIBRARY",
        },
        {
          collegeId: college.id,
          url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
          altText: `${college.name} Auditorium`,
          isPrimary: false,
          category: "AUDITORIUM",
        },
      ],
    });

    console.log(`Successfully updated images for ${college.name} (${college.id})`);
  }

  // Also check all other colleges in DB and give them fallback images if they have 0 images
  const allColleges = await prisma.college.findMany({
    include: { images: true },
  });

  const defaultCampusImages = [
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
  ];

  for (const c of allColleges) {
    if (c.images.length === 0) {
      await prisma.collegeImage.create({
        data: {
          collegeId: c.id,
          url: defaultCampusImages[Math.floor(Math.random() * defaultCampusImages.length)],
          altText: `${c.name} Campus`,
          isPrimary: true,
          category: "EXTERIOR",
        },
      });
      console.log(`Added fallback image for ${c.name}`);
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
