import { PrismaClient, TransactionType, PropertyType, AreaUnit, PossessionStatus, FurnishingStatus, OwnershipType, TenantPreference, PropertyStatus } from "@prisma/client";

const prisma = new PrismaClient();

const categoryImages: Record<string, string[]> = {
  DEVELOPER_SITE: [
    "/images/demo/lands/dev_site.jpg",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
  ],
  PLOT: [
    "/images/demo/lands/plot.jpg",
    "https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1200&q=80"
  ],
  AGRICULTURE_LAND: [
    "/images/demo/lands/agri.jpg",
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
  ],
  RESORT: [
    "/images/demo/lands/resort.jpg",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
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

const allPropertyTypes: PropertyType[] = [
  PropertyType.DEVELOPER_SITE,
  PropertyType.PLOT,
  PropertyType.AGRICULTURE_LAND,
  PropertyType.RESORT,
  PropertyType.INDUSTRIAL_SITE,
  PropertyType.INDUSTRIAL_BUILDING,
  PropertyType.HOTEL,
  PropertyType.COMMERCIAL_COMPLEX,
  PropertyType.SHOP,
  PropertyType.COMMERCIAL_LAND,
];

const transactionTypes: TransactionType[] = [
  TransactionType.RENT,
  TransactionType.SALE,
  TransactionType.LEASE
];

async function main() {
  console.log("Seeding RENT, SALE, and LEASE properties for ALL property types across ALL cities...");

  let owner = await prisma.user.findFirst({ where: { role: "ADMIN" } }) || await prisma.user.findFirst();
  if (!owner) throw new Error("No user found in DB");

  const cities = await prisma.city.findMany({ include: { localities: true } });

  let totalSeeded = 0;

  for (const city of cities) {
    let cityLocalities = city.localities;
    if (cityLocalities.length === 0) continue;

    for (const pType of allPropertyTypes) {
      for (const txType of transactionTypes) {
        // Check if there is at least 1 active property for this city + pType + txType
        const count = await prisma.property.count({
          where: {
            cityId: city.id,
            propertyType: pType,
            transactionType: txType,
            status: PropertyStatus.ACTIVE
          }
        });

        if (count === 0) {
          // Create 2 properties for this combination!
          for (let i = 0; i < 2; i++) {
            const loc = cityLocalities[i % cityLocalities.length];
            const timestamp = Date.now() + Math.floor(Math.random() * 10000);
            
            const typeLabel = pType.replace(/_/g, " ").toLowerCase();
            const txLabel = txType === TransactionType.RENT ? "for Rent" : txType === TransactionType.LEASE ? "for Lease" : "for Sale";
            
            const title = `Prime ${pType.replace(/_/g, " ")} ${txLabel} in ${loc.name}, ${city.name}`;
            const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${timestamp}-${i}`;

            const isRentOrLease = txType === TransactionType.RENT || txType === TransactionType.LEASE;
            const priceVal = isRentOrLease ? (txType === TransactionType.RENT ? 45000 + (i * 10000) : 150000 + (i * 25000)) : 8500000 + (i * 1500000);

            const imgList = categoryImages[pType] || categoryImages.PLOT;
            const imgUrl = imgList[i % imgList.length];

            const createdProp = await prisma.property.create({
              data: {
                title,
                slug,
                description: `Verified ${typeLabel} available ${txLabel} located in prime ${loc.name}, ${city.name}. Clear title, great road access, excellent connectivity, and ready for immediate possession.`,
                transactionType: txType,
                propertyType: pType,
                price: priceVal,
                monthlyRent: isRentOrLease ? priceVal : null,
                securityDeposit: isRentOrLease ? priceVal * 6 : null,
                carpetArea: pType === PropertyType.PLOT ? 2400 : pType === PropertyType.DEVELOPER_SITE ? 100000 : 1500,
                areaUnit: AreaUnit.SQFT,
                possessionStatus: PossessionStatus.READY_TO_MOVE,
                furnishingStatus: FurnishingStatus.UNFURNISHED,
                ownershipType: OwnershipType.FREEHOLD,
                tenantPreference: TenantPreference.ANY,
                fullAddress: `${loc.name}, ${city.name}, India`,
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
            console.log(`+ Seeded [${city.name}] -> ${createdProp.title}`);
          }
        }
      }
    }
  }

  console.log(`🎉 Done! Total new RENT/SALE/LEASE properties seeded: ${totalSeeded}`);
}

main()
  .catch(e => {
    console.error("Error seeding properties:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
