import { PrismaClient, TransactionType, PropertyType, AreaUnit, PossessionStatus, FurnishingStatus, OwnershipType, TenantPreference } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const sourceImages = {
  devSite: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\developer_site_demo_1785744340488.jpg",
  plot: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\residential_plot_demo_1785744356157.jpg",
  agri: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\agriculture_farmland_demo_1785744371098.jpg",
  resort: "C:\\Users\\naush\\.gemini\\antigravity\\brain\\f9938964-1f5b-4047-a118-1dd152b21c42\\luxury_resort_demo_1785744387774.jpg",
};

async function main() {
  console.log("Seeding 12 demo properties for Lands sub-categories...");

  // Ensure target folder exists
  const targetDir = path.join(process.cwd(), "public", "images", "demo", "lands");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy images
  fs.copyFileSync(sourceImages.devSite, path.join(targetDir, "dev_site.jpg"));
  fs.copyFileSync(sourceImages.plot, path.join(targetDir, "plot.jpg"));
  fs.copyFileSync(sourceImages.agri, path.join(targetDir, "agri.jpg"));
  fs.copyFileSync(sourceImages.resort, path.join(targetDir, "resort.jpg"));

  const devSiteUrl = "/images/demo/lands/dev_site.jpg";
  const plotUrl = "/images/demo/lands/plot.jpg";
  const agriUrl = "/images/demo/lands/agri.jpg";
  const resortUrl = "/images/demo/lands/resort.jpg";

  // Find owner & city
  let owner = await prisma.user.findFirst({ where: { role: "ADMIN" } }) || await prisma.user.findFirst();
  if (!owner) throw new Error("No user found");

  let city = await prisma.city.findFirst({ where: { name: { contains: "Bengaluru", mode: "insensitive" } } }) || await prisma.city.findFirst();
  if (!city) throw new Error("No city found");

  let locality = await prisma.locality.findFirst({ where: { cityId: city.id } });
  if (!locality) {
    locality = await prisma.locality.create({
      data: { name: "Green Park Zone", cityId: city.id }
    });
  }

  const timestamp = Date.now();

  const landProperties = [
    // 1. DEVELOPER SITES (3 Properties)
    {
      title: "Royal Crest Gated Township Developer Layout Site",
      slug: `royal-crest-gated-township-developer-layout-site-${timestamp}-1`,
      description: "Approved 10-acre developer layout site ready for villa township construction. Features asphalt main roads, sewage treatment plant, underground power grid, and storm water drains.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.DEVELOPER_SITE,
      price: 125000000, // 12.5 Cr
      carpetArea: 435600, // 10 acres
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Devanahalli Highway Corridor, Bengaluru, Karnataka - 562110",
      state: "Karnataka",
      pincode: "562110",
      latitude: 13.231,
      longitude: 77.701,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: devSiteUrl
    },
    {
      title: "Greenfield Mega Commercial & Residential Developer Layout",
      slug: `greenfield-mega-commercial-residential-developer-layout-${timestamp}-2`,
      description: "Prime 15-acre RERA-approved mixed-use developer layout site with BDA sanction. Ideal for gated apartment complexes and retail commercial plazas.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.DEVELOPER_SITE,
      price: 180000000, // 18 Cr
      carpetArea: 653400,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Outer Ring Road Extension, Bengaluru, Karnataka - 560087",
      state: "Karnataka",
      pincode: "560087",
      latitude: 12.915,
      longitude: 77.682,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: devSiteUrl
    },
    {
      title: "Prestige Horizon Integrated Smart City Developer Site",
      slug: `prestige-horizon-integrated-smart-city-developer-site-${timestamp}-3`,
      description: "High-potential 8-acre developer site situated near IT hub with clear title deeds, 80ft frontage road, and high appreciation value.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.DEVELOPER_SITE,
      price: 95000000, // 9.5 Cr
      carpetArea: 348480,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Sarjapur IT Corridor, Bengaluru, Karnataka - 562125",
      state: "Karnataka",
      pincode: "562125",
      latitude: 12.864,
      longitude: 77.785,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: devSiteUrl
    },

    // 2. PLOTS (3 Properties)
    {
      title: "Corner Premium East-Facing Residential Plot in Gated Community",
      slug: `corner-premium-east-facing-residential-plot-${timestamp}-1`,
      description: "Exclusive 2400 sqft East-facing corner plot inside luxury gated enclave. Features 40ft wide asphalt road, 24/7 security, club house access, and green park view.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.PLOT,
      price: 14400000, // 1.44 Cr
      carpetArea: 2400,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "HSR Layout Sector 3, Bengaluru, Karnataka - 560102",
      state: "Karnataka",
      pincode: "560102",
      latitude: 12.912,
      longitude: 77.644,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: plotUrl
    },
    {
      title: "Grand Boulevard Villa Plot with Underground Cabling",
      slug: `grand-boulevard-villa-plot-underground-cabling-${timestamp}-2`,
      description: "Spacious 3000 sqft villa plot in prime residential layout. Clear A-Katha title, underground water & electric lines, ready for immediate house construction.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.PLOT,
      price: 18000000, // 1.8 Cr
      carpetArea: 3000,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Yelahanka New Town, Bengaluru, Karnataka - 560064",
      state: "Karnataka",
      pincode: "560064",
      latitude: 13.098,
      longitude: 77.596,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: plotUrl
    },
    {
      title: "Emerald Heights Park View Residential Plot",
      slug: `emerald-heights-park-view-residential-plot-${timestamp}-3`,
      description: "North-facing 1500 sqft residential plot right opposite lush children's park. Gated community with security check-post, street lighting, and tree-lined avenues.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.PLOT,
      price: 9000000, // 90 Lacs
      carpetArea: 1500,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "JP Nagar 7th Phase, Bengaluru, Karnataka - 560078",
      state: "Karnataka",
      pincode: "560078",
      latitude: 12.891,
      longitude: 77.585,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: plotUrl
    },

    // 3. AGRICULTURE LAND (3 Properties)
    {
      title: "Lush Organic Fertile Farmland & Farmhouse Estate",
      slug: `lush-organic-fertile-farmland-farmhouse-estate-${timestamp}-1`,
      description: "Scenic 3-acre fertile farmland with rich red soil, drip irrigation system, borewell water supply, and 200 fruit-bearing coconut trees. Perfect for organic farming or Weekend Farmhouse.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.AGRICULTURE_LAND,
      price: 4500000, // 45 Lacs
      carpetArea: 130680, // 3 acres
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Nandi Hills Road, Chikkaballapur, Karnataka - 562101",
      state: "Karnataka",
      pincode: "562101",
      latitude: 13.378,
      longitude: 77.683,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: agriUrl
    },
    {
      title: "Valley View Hydroponics Agriculture Land Plot",
      slug: `valley-view-hydroponics-agriculture-land-plot-${timestamp}-2`,
      description: "2-acre agricultural land plot equipped with polyhouse structures, solar water pump, fencing, and 30ft metalled access road. Ready for modern greenhouse farming.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.AGRICULTURE_LAND,
      price: 3200000, // 32 Lacs
      carpetArea: 87120, // 2 acres
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Kanakapura Road Countryside, Bengaluru Rural, Karnataka - 562117",
      state: "Karnataka",
      pincode: "562117",
      latitude: 12.545,
      longitude: 77.421,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: agriUrl
    },
    {
      title: "Green Meadows High-Yield Coconut & Fruit Orchard Land",
      slug: `green-meadows-high-yield-coconut-fruit-orchard-${timestamp}-3`,
      description: "5-acre lush agricultural orchard featuring mango, guava, and coconut plantations with natural pond, electricity connection, and mountain views.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.AGRICULTURE_LAND,
      price: 7000000, // 70 Lacs
      carpetArea: 217800, // 5 acres
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.UNFURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Bannerghatta Jungle Border Road, Bengaluru, Karnataka - 560083",
      state: "Karnataka",
      pincode: "560083",
      latitude: 12.801,
      longitude: 77.575,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: agriUrl
    },

    // 4. RESORT (3 Properties)
    {
      title: "Serene Eco-Luxury Hillside Wellness Resort Land",
      slug: `serene-eco-luxury-hillside-wellness-resort-${timestamp}-1`,
      description: "4-acre luxury resort property equipped with infinity swimming pool, 12 operational wooden cottages, landscaped gardens, spa facility, and outdoor bonfire lounge.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.RESORT,
      price: 65000000, // 6.5 Cr
      carpetArea: 174240, // 4 acres
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Coorg Hill Resort Zone, Madikeri, Karnataka - 571201",
      state: "Karnataka",
      pincode: "571201",
      latitude: 12.424,
      longitude: 75.738,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: resortUrl
    },
    {
      title: "Palm Haven Lakefront Boutique Resort Property",
      slug: `palm-haven-lakefront-boutique-resort-property-${timestamp}-2`,
      description: "Scenic 3-acre lakefront boutique resort featuring 15 AC guest suites, open-air restaurant, swimming pool, boating deck, and commercial tourism permit.",
      transactionType: TransactionType.LEASE,
      propertyType: PropertyType.RESORT,
      price: 350000, // 3.5 Lacs / month lease
      monthlyRent: 350000,
      carpetArea: 130680,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      ownershipType: OwnershipType.LEASEHOLD,
      tenantPreference: TenantPreference.COMPANY,
      fullAddress: "Hebbal Lake View Road, Bengaluru, Karnataka - 560024",
      state: "Karnataka",
      pincode: "560024",
      latitude: 13.038,
      longitude: 77.592,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: resortUrl
    },
    {
      title: "Pine Valley Mountain View Eco Resort Estate",
      slug: `pine-valley-mountain-view-eco-resort-estate-${timestamp}-3`,
      description: "6-acre sprawling eco-resort property surrounded by pine hills. Includes 20 private luxury villas, multi-cuisine dining hall, conference room, and adventure activity arena.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.RESORT,
      price: 98000000, // 9.8 Cr
      carpetArea: 261360,
      areaUnit: AreaUnit.SQFT,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      fullAddress: "Chikmagalur Peak Road, Chikmagalur, Karnataka - 577101",
      state: "Karnataka",
      pincode: "577101",
      latitude: 13.315,
      longitude: 75.775,
      ownerId: owner.id,
      cityId: city.id,
      localityId: locality.id,
      isVerified: true,
      isFeatured: true,
      imageUrl: resortUrl
    }
  ];

  for (const item of landProperties) {
    const { imageUrl, ...data } = item;
    const created = await prisma.property.create({ data });
    await prisma.propertyImage.create({
      data: {
        propertyId: created.id,
        url: imageUrl,
        sortOrder: 0,
        isPrimary: true
      }
    });
    console.log(`✓ Seeded property: ${created.title} (${created.propertyType})`);
  }

  console.log("Successfully seeded 12 demo properties for all Lands categories!");
}

main()
  .catch(e => {
    console.error("Error seeding Lands properties:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
