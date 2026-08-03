import { PrismaClient, TransactionType, PropertyType, AreaUnit, PossessionStatus, FurnishingStatus, OwnershipType, TenantPreference } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const sourceImages = {
  agriLand: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\agri_land_demo_1785742917521.jpg",
  industrialBldg: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\industrial_bldg_demo_1785742931494.jpg",
  commercialHotel: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\commercial_hotel_demo_1785742945536.jpg",
  commercialShop: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\commercial_shop_demo_1785742962046.jpg",
};

async function main() {
  console.log("Seeding 4 demo properties with generated images...");

  // Ensure public/images/demo directory exists
  const targetDir = path.join(process.cwd(), "public", "images", "demo");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy images
  const agriPath = "/images/demo/agri_land.jpg";
  const industrialPath = "/images/demo/industrial_bldg.jpg";
  const hotelPath = "/images/demo/commercial_hotel.jpg";
  const shopPath = "/images/demo/commercial_shop.jpg";

  fs.copyFileSync(sourceImages.agriLand, path.join(targetDir, "agri_land.jpg"));
  fs.copyFileSync(sourceImages.industrialBldg, path.join(targetDir, "industrial_bldg.jpg"));
  fs.copyFileSync(sourceImages.commercialHotel, path.join(targetDir, "commercial_hotel.jpg"));
  fs.copyFileSync(sourceImages.commercialShop, path.join(targetDir, "commercial_shop.jpg"));

  // Find admin/user owner
  let owner = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!owner) {
    owner = await prisma.user.findFirst();
  }

  if (!owner) {
    throw new Error("No user found in database to assign as property owner.");
  }

  // Find or create city (Bangalore / Bengaluru)
  let city = await prisma.city.findFirst({
    where: {
      OR: [
        { name: { contains: "Bangalore", mode: "insensitive" } },
        { name: { contains: "Bengaluru", mode: "insensitive" } }
      ]
    }
  });

  if (!city) {
    city = await prisma.city.findFirst();
  }

  if (!city) {
    city = await prisma.city.create({
      data: {
        name: "Bengaluru",
        slug: "bengaluru-demo"
      }
    });
  }

  // Find or create locality
  let locality = await prisma.locality.findFirst({ where: { cityId: city.id } });
  if (!locality) {
    locality = await prisma.locality.create({
      data: {
        name: "Central Business District",
        cityId: city.id
      }
    });
  }

  const demoProps = [
    {
      title: "Lush Green Organic Agriculture Farmland & Resort Plot",
      slug: "lush-green-organic-agriculture-farmland-resort-plot-" + Date.now(),
      description: "Scenic 5-acre fertile agricultural land plot suitable for resort development, organic farming, or farm house retreat. Surrounded by serene hills with clear road connectivity and electricity access.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.AGRICULTURE_LAND,
      price: 7500000, // 75 Lacs
      carpetArea: 217800, // 5 acres in sqft
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Highway Hill Road, Devanahalli, Bengaluru, Karnataka - 562110",
      state: "Karnataka",
      pincode: "562110",
      latitude: 13.245,
      longitude: 77.712,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      images: [agriPath]
    },
    {
      title: "Prime Logistics Industrial Warehouse & Factory Building",
      slug: "prime-logistics-industrial-warehouse-factory-building-" + Date.now(),
      description: "Modern Grade-A industrial warehouse and factory building equipped with 4 loading docks, heavy-duty industrial flooring, 3-phase power supply, fire safety system, and dedicated office section.",
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.INDUSTRIAL_BUILDING,
      price: 150000,
      monthlyRent: 150000,
      securityDeposit: 900000,
      carpetArea: 18500,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.COMPANY,
      fullAddress: "Peenya Industrial Area Phase 2, Bengaluru, Karnataka - 560058",
      state: "Karnataka",
      pincode: "560058",
      latitude: 13.028,
      longitude: 77.519,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      images: [industrialPath]
    },
    {
      title: "Grand Horizon Luxury Commercial Hotel & Business Complex",
      slug: "grand-horizon-luxury-commercial-hotel-business-complex-" + Date.now(),
      description: "State-of-the-art 50-room boutique commercial hotel and multi-storey business complex with glass curtain wall architecture, rooftop banquet, underground parking, and high footfall location.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.HOTEL,
      price: 45000000, // 4.5 Cr
      carpetArea: 32000,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "MG Road Commercial Corridor, Bengaluru, Karnataka - 560001",
      state: "Karnataka",
      pincode: "560001",
      latitude: 12.975,
      longitude: 77.608,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      images: [hotelPath]
    },
    {
      title: "High-Street Retail Shop & Commercial Showroom Complex",
      slug: "high-street-retail-shop-commercial-showroom-complex-" + Date.now(),
      description: "Premium ground floor high-street commercial shop and retail showroom with 40-foot main road glass frontage, high ceiling, central air conditioning, and heavy daily pedestrian traffic.",
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.SHOP,
      price: 85000,
      monthlyRent: 85000,
      securityDeposit: 510000,
      carpetArea: 1450,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Indiranagar 100ft Road, Bengaluru, Karnataka - 560038",
      state: "Karnataka",
      pincode: "560038",
      latitude: 12.978,
      longitude: 77.641,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      images: [shopPath]
    }
  ];

  for (const prop of demoProps) {
    const { images, ...propData } = prop;
    const createdProp = await prisma.property.create({
      data: propData
    });

    for (let i = 0; i < images.length; i++) {
      await prisma.propertyImage.create({
        data: {
          propertyId: createdProp.id,
          url: images[i],
          sortOrder: i,
          isPrimary: i === 0
        }
      });
    }

    console.log(`Created property: ${createdProp.title} (${createdProp.propertyType})`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding demo properties:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
