import { PrismaClient, TransactionType, PropertyType, AreaUnit, PossessionStatus, FurnishingStatus, OwnershipType, TenantPreference } from "@prisma/client";

const prisma = new PrismaClient();

const categoryImages: Record<string, string[]> = {
  DEVELOPER_SITE: [
    "/images/demo/lands/dev_site.jpg",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1200&q=80"
  ],
  PLOT: [
    "/images/demo/lands/plot.jpg",
    "https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
  ],
  AGRICULTURE_LAND: [
    "/images/demo/lands/agri.jpg",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80"
  ],
  RESORT: [
    "/images/demo/lands/resort.jpg",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
  ],
  INDUSTRIAL_SITE: [
    "/images/demo/industrial_bldg.jpg",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  ],
  INDUSTRIAL_BUILDING: [
    "/images/demo/industrial_bldg.jpg",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
  ],
  HOTEL: [
    "/images/demo/commercial_hotel.jpg",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  ],
  COMMERCIAL_COMPLEX: [
    "/images/demo/commercial_hotel.jpg",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  ],
  SHOP: [
    "/images/demo/commercial_shop.jpg",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
  ],
  COMMERCIAL_LAND: [
    "/images/demo/lands/dev_site.jpg",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  ]
};

const cityLocalityPresets: Record<string, string[]> = {
  Mumbai: ["Bandra West", "Andheri East", "Powai", "Lower Parel", "Navi Mumbai", "Thane West"],
  Bengaluru: ["Whitefield", "Indiranagar", "Koramangala", "HSR Layout", "Devanahalli", "Electronic City"],
  Delhi: ["Connaught Place", "Vasant Kunj", "South Extension", "Dwarka", "Okhla Industrial Area"],
  Gurugram: ["Cyber City", "Golf Course Road", "Sector 57", "Sohna Road", "Manesar Industrial Belt"],
  Noida: ["Sector 62", "Noida Expressway", "Sector 18", "Greater Noida West", "Ecotech Park"],
  Hyderabad: ["Gachibowli", "HITEC City", "Jubilee Hills", "Banjara Hills", "Kukatpally", "Shamshabad"],
  Pune: ["Hinjawadi", "Viman Nagar", "Koregaon Park", "Baner", "Hadapsar Industrial Zone"],
  Chennai: ["OMR IT Corridor", "Anna Nagar", "T. Nagar", "Velachery", "Guindy Industrial Estate"],
  Kolkata: ["Salt Lake Sector V", "New Town", "Park Street", "Rajarhat", "Howrah Industrial Belt"],
  Ahmedabad: ["SG Highway", "Bodakdev", "Prahlad Nagar", "GIFT City", "Sanand Industrial Estate"],
  Kochi: ["Marine Drive", "Kakkanad InfoPark", "Edappally", "Fort Kochi", "Kalamassery Industrial Zone"]
};

const targetTypes: Array<{ type: PropertyType; titlePrefix: string; unitSqft: number; basePrice: number; transType: TransactionType }> = [
  // Lands
  { type: PropertyType.DEVELOPER_SITE, titlePrefix: "Grand Developer Layout Site", unitSqft: 200000, basePrice: 85000000, transType: TransactionType.SALE },
  { type: PropertyType.PLOT, titlePrefix: "Premium Residential Villa Plot", unitSqft: 2400, basePrice: 12000000, transType: TransactionType.SALE },
  { type: PropertyType.AGRICULTURE_LAND, titlePrefix: "Fertile Agriculture Farmland Estate", unitSqft: 87120, basePrice: 4500000, transType: TransactionType.SALE },
  { type: PropertyType.RESORT, titlePrefix: "Eco-Luxury Hillside Nature Resort", unitSqft: 130680, basePrice: 55000000, transType: TransactionType.SALE },

  // Industrial
  { type: PropertyType.INDUSTRIAL_SITE, titlePrefix: "High-Tech Industrial Site & Logistics Plot", unitSqft: 45000, basePrice: 25000000, transType: TransactionType.SALE },
  { type: PropertyType.INDUSTRIAL_BUILDING, titlePrefix: "Modern Grade-A Industrial Factory Building", unitSqft: 18000, basePrice: 180000, transType: TransactionType.RENT },

  // Commercial
  { type: PropertyType.HOTEL, titlePrefix: "Boutique Commercial Hotel & Business Suites", unitSqft: 25000, basePrice: 38000000, transType: TransactionType.SALE },
  { type: PropertyType.COMMERCIAL_COMPLEX, titlePrefix: "Multi-Storey Commercial Glass Complex", unitSqft: 35000, basePrice: 65000000, transType: TransactionType.SALE },
  { type: PropertyType.SHOP, titlePrefix: "Prime Main Road High-Street Retail Shop", unitSqft: 1200, basePrice: 75000, transType: TransactionType.RENT },
  { type: PropertyType.COMMERCIAL_LAND, titlePrefix: "Prime Commercial Corner Land Plot", unitSqft: 15000, basePrice: 28000000, transType: TransactionType.SALE },
];

async function main() {
  console.log("Ensuring each city has at least 2 properties for ALL 10 section categories...");

  let owner = await prisma.user.findFirst({ where: { role: "ADMIN" } }) || await prisma.user.findFirst();
  if (!owner) throw new Error("No user found in DB");

  const cities = await prisma.city.findMany({ include: { localities: true } });

  let totalSeeded = 0;

  for (const city of cities) {
    const localityNames = cityLocalityPresets[city.name] || ["Central Hub", "North Zone", "South Avenue", "East Park", "West Sector"];

    // Ensure city has localities created
    let cityLocalities = city.localities;
    if (cityLocalities.length < 2) {
      for (const locName of localityNames) {
        let existingLoc = cityLocalities.find(l => l.name === locName);
        if (!existingLoc) {
          try {
            existingLoc = await prisma.locality.create({
              data: { name: locName, cityId: city.id }
            });
            cityLocalities.push(existingLoc);
          } catch (err) {
            // Ignore unique constraint error if any
          }
        }
      }
    }

    for (const item of targetTypes) {
      // Check existing count for this city and propertyType
      const existingCount = await prisma.property.count({
        where: {
          cityId: city.id,
          propertyType: item.type
        }
      });

      const needed = Math.max(0, 2 - existingCount);

      for (let i = 0; i < needed; i++) {
        const locIndex = i % cityLocalities.length;
        const loc = cityLocalities[locIndex] || cityLocalities[0];
        const timestamp = Date.now() + Math.floor(Math.random() * 10000);
        const locName = loc ? loc.name : localityNames[i % localityNames.length];

        const imgList = categoryImages[item.type] || categoryImages.PLOT;
        const imgUrl = imgList[i % imgList.length];

        const title = `${item.titlePrefix} in ${locName}, ${city.name}`;
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${timestamp}-${i}`;

        const isRent = item.transType === TransactionType.RENT;

        const createdProp = await prisma.property.create({
          data: {
            title,
            slug,
            description: `Premium verified ${item.type.replace(/_/g, " ")} located in prime ${locName}, ${city.name}. Excellent road connectivity, clear legal title, high appreciation potential, and immediate possession availability.`,
            transactionType: item.transType,
            propertyType: item.type,
            price: item.basePrice + (i * 500000),
            monthlyRent: isRent ? item.basePrice : null,
            securityDeposit: isRent ? item.basePrice * 6 : null,
            carpetArea: item.unitSqft,
            areaUnit: AreaUnit.SQFT,
            possessionStatus: PossessionStatus.READY_TO_MOVE,
            furnishingStatus: FurnishingStatus.UNFURNISHED,
            ownershipType: OwnershipType.FREEHOLD,
            tenantPreference: TenantPreference.ANY,
            fullAddress: `${locName}, ${city.name}, India`,
            state: "India",
            pincode: "560001",
            latitude: 12.971 + (Math.random() * 0.1),
            longitude: 77.594 + (Math.random() * 0.1),
            ownerId: owner.id,
            cityId: city.id,
            localityId: loc.id,
            isVerified: true,
            isFeatured: true,
            status: PropertyStatus.ACTIVE
          }
        });

        await prisma.propertyImage.create({
          data: {
            propertyId: createdProp.id,
            url: imgUrl,
            sortOrder: 0,
            isPrimary: true
          }
        });

        totalSeeded++;
        console.log(`+ Seeded [${city.name}] -> ${createdProp.title} (${item.type})`);
      }
    }
  }

  console.log(`🎉 Done! Total new properties seeded: ${totalSeeded}`);
}

main()
  .catch(e => {
    console.error("Error seeding properties:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
