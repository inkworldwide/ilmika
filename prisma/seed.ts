import { PrismaClient, Role, TransactionType, PropertyType, PropertyStatus, FurnishingStatus, PossessionStatus, OwnershipType, FacingDirection, AreaUnit, TenantPreference, PropertyImageCategory } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean Database in order of dependencies (or skip if not dropping)
  // Since we want this to be safe, we delete existing data from this project's tables if they exist
  await prisma.favourite.deleteMany({});
  await prisma.recentlyViewed.deleteMany({});
  await prisma.propertyReport.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.propertyAmenity.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.amenity.deleteMany({});
  await prisma.locality.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.agentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleaned existing project database tables.");

  // 2. Hash Default Passwords
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const ownerPassword = await bcrypt.hash("owner123", salt);
  const agentPassword = await bcrypt.hash("agent123", salt);
  const userPassword = await bcrypt.hash("user123", salt);

  // 3. Seed Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@rentahouse.in",
      passwordHash: adminPassword,
      name: "Rajesh Kumar",
      phone: "9876543210",
      role: Role.ADMIN,
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: "amit.sharma@gmail.com",
      passwordHash: ownerPassword,
      name: "Amit Sharma",
      phone: "9812345670",
      role: Role.OWNER,
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "priya.patel@gmail.com",
      passwordHash: ownerPassword,
      name: "Priya Patel",
      phone: "9823456789",
      role: Role.OWNER,
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    },
  });

  const agent1User = await prisma.user.create({
    data: {
      email: "vikram.singh@agent.com",
      passwordHash: agentPassword,
      name: "Vikram Singh",
      phone: "9834567890",
      role: Role.AGENT,
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80",
    },
  });

  const agent2User = await prisma.user.create({
    data: {
      email: "kavita.jain@agent.com",
      passwordHash: agentPassword,
      name: "Kavita Jain",
      phone: "9845678901",
      role: Role.AGENT,
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: "arjun.das@gmail.com",
      passwordHash: userPassword,
      name: "Arjun Das",
      phone: "9856789012",
      role: Role.USER,
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    },
  });

  // Seed Agent Profiles
  const agent1Profile = await prisma.agentProfile.create({
    data: {
      userId: agent1User.id,
      companyName: "Metro Realty Bengaluru",
      experienceYears: 8,
      licenseNumber: "PRM/KA/RERA/1251/310/AG/200615/000185",
      bio: "Specializing in luxury apartments and premium villas in Whitefield and Koramangala.",
      ratingAverage: 4.8,
    },
  });

  const agent2Profile = await prisma.agentProfile.create({
    data: {
      userId: agent2User.id,
      companyName: "Prime Space Advisors",
      experienceYears: 5,
      licenseNumber: "PRM/KA/RERA/1251/310/AG/210812/000240",
      bio: "Helping families and corporate clients find premium commercial offices and high-end residential flats.",
      ratingAverage: 4.5,
    },
  });

  console.log("Seeded users and agent profiles.");

  // 4. Seed Cities & Localities
  const citiesData = [
    { name: "Bengaluru", slug: "bengaluru" },
    { name: "Mumbai", slug: "mumbai" },
    { name: "Delhi", slug: "delhi" },
    { name: "Hyderabad", slug: "hyderabad" },
    { name: "Chennai", slug: "chennai" },
    { name: "Pune", slug: "pune" },
    { name: "Kolkata", slug: "kolkata" },
    { name: "Ahmedabad", slug: "ahmedabad" },
    { name: "Gurugram", slug: "gurugram" },
    { name: "Noida", slug: "noida" },
    { name: "Kochi", slug: "kochi" },
  ];

  const citiesMap: Record<string, string> = {};
  for (const c of citiesData) {
    const city = await prisma.city.create({ data: c });
    citiesMap[city.name] = city.id;
  }

  // Seed Localities for Bengaluru
  const bengaluruLocalities = [
    { name: "Whitefield", slug: "whitefield" },
    { name: "Koramangala", slug: "koramangala" },
    { name: "Indiranagar", slug: "indiranagar" },
    { name: "HSR Layout", slug: "hsr-layout" },
    { name: "Electronic City", slug: "electronic-city" },
    { name: "Hebbal", slug: "hebbal" },
    { name: "Yelahanka", slug: "yelahanka" },
    { name: "Jayanagar", slug: "jayanagar" },
    { name: "JP Nagar", slug: "jp-nagar" },
    { name: "BTM Layout", slug: "btm-layout" },
    { name: "Marathahalli", slug: "marathahalli" },
    { name: "Sarjapur Road", slug: "sarjapur-road" },
    { name: "Bellandur", slug: "bellandur" },
    { name: "Banashankari", slug: "banashankari" },
    { name: "Kengeri", slug: "kengeri" },
  ];

  const localitiesMap: Record<string, string> = {};
  for (const l of bengaluruLocalities) {
    const loc = await prisma.locality.create({
      data: {
        name: l.name,
        slug: l.slug,
        cityId: citiesMap["Bengaluru"],
      },
    });
    localitiesMap[loc.name] = loc.id;
  }

  // Seed Localities for all other cities
  const extraCities = [
    "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", 
    "Kolkata", "Ahmedabad", "Gurugram", "Noida", "Kochi"
  ];
  
  for (const cityName of extraCities) {
    const locs = [
      { name: `${cityName} Central`, slug: `${cityName.toLowerCase()}-central`, city: cityName },
      { name: `${cityName} South`, slug: `${cityName.toLowerCase()}-south`, city: cityName }
    ];
    for (const item of locs) {
      const loc = await prisma.locality.create({
        data: {
          name: item.name,
          slug: item.slug,
          cityId: citiesMap[item.city],
        },
      });
      localitiesMap[item.name] = loc.id;
    }
  }

  console.log("Seeded cities and localities.");

  // 5. Seed Amenities
  const amenitiesList = [
    { name: "Lift", icon: "arrow-up-down" },
    { name: "Power Backup", icon: "zap" },
    { name: "Security", icon: "shield" },
    { name: "CCTV", icon: "video" },
    { name: "Gated Community", icon: "fence" },
    { name: "Gym", icon: "dumbbell" },
    { name: "Swimming Pool", icon: "waves" },
    { name: "Club House", icon: "door-open" },
    { name: "Garden", icon: "flower2" },
    { name: "Children's Play Area", icon: "smile" },
    { name: "Visitor Parking", icon: "parking-circle" },
    { name: "Water Supply", icon: "droplet" },
    { name: "Gas Pipeline", icon: "flame" },
    { name: "Internet", icon: "wifi" },
    { name: "Air Conditioning", icon: "wind" },
    { name: "Pet Friendly", icon: "dog" },
    { name: "Wheelchair Access", icon: "accessibility" },
    { name: "Fire Safety", icon: "flame-kindling" },
    { name: "Rainwater Harvesting", icon: "cloud-rain" },
    { name: "Solar Power", icon: "sun" },
  ];

  const amenitiesMap: Record<string, string> = {};
  for (const a of amenitiesList) {
    const dbAmenity = await prisma.amenity.create({ data: a });
    amenitiesMap[a.name] = dbAmenity.id;
  }

  console.log("Seeded amenities.");

  // 6. Seed Properties (25 Properties)
  const propertiesData = [
    {
      title: "Elegant 2 BHK Apartment in Whitefield",
      slug: "elegant-2-bhk-apartment-whitefield-bengaluru",
      description: "A beautiful, well-ventilated 2 BHK flat located in the heart of Whitefield. Close to major IT parks (ITPB), malls, and metro stations. Complete with semi-furnished wardrobes, modular kitchen, and power backup.",
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      price: 32000.0,
      monthlyRent: 32000.0,
      securityDeposit: 150000.0,
      maintenanceCharges: 3500.0,
      bhk: 2,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      totalRooms: 4,
      carpetArea: 950,
      builtUpArea: 1100,
      superBuiltUpArea: 1250,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      facing: FacingDirection.EAST,
      furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
      coveredParking: 1,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      state: "Karnataka",
      cityId: citiesMap["Bengaluru"],
      localityId: localitiesMap["Whitefield"],
      fullAddress: "Flat 304, Prestige Shantiniketan, Whitefield Main Road",
      landmark: "Near ITPB",
      pincode: "560066",
      latitude: 12.9845,
      longitude: 77.7374,
      reraId: "PRM/KA/RERA/1251/446/PR/171015/000210",
      isReraApproved: true,
      isVerified: true,
      isFeatured: true,
      status: PropertyStatus.ACTIVE,
      ownerId: owner1.id,
      images: [
        { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.EXTERIOR },
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", isPrimary: false, category: PropertyImageCategory.INTERIOR },
      ],
      amenities: ["Power Backup", "Lift", "Security", "CCTV", "Gym", "Internet", "Water Supply"],
    },
    {
      title: "Luxurious 3 BHK Villa in Sarjapur Road",
      slug: "luxurious-3-bhk-villa-sarjapur-road-bengaluru",
      description: "Premium independent 3 BHK villa in a luxury gated community. Private garden, modular kitchen with chimney, spacious bedrooms with attached bathrooms, and wooden flooring in the master suite.",
      transactionType: TransactionType.SALE,
      propertyType: PropertyType.VILLA,
      price: 18000000.0, // 1.8 Crore
      bhk: 3,
      bedrooms: 3,
      bathrooms: 4,
      balconies: 2,
      totalRooms: 6,
      carpetArea: 2100,
      builtUpArea: 2400,
      superBuiltUpArea: 2800,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      facing: FacingDirection.NORTHEAST,
      furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
      coveredParking: 2,
      openParking: 1,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      state: "Karnataka",
      cityId: citiesMap["Bengaluru"],
      localityId: localitiesMap["Sarjapur Road"],
      fullAddress: "Villa 42, Sobha Royal Pavilion, Sarjapur Road",
      pincode: "560035",
      latitude: 12.9102,
      longitude: 77.6892,
      reraId: "PRM/KA/RERA/1251/446/PR/180601/001948",
      isReraApproved: true,
      isVerified: true,
      isFeatured: true,
      status: PropertyStatus.ACTIVE,
      ownerId: agent1User.id,
      images: [
        { url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.EXTERIOR },
        { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80", isPrimary: false, category: PropertyImageCategory.INTERIOR },
      ],
      amenities: ["Gated Community", "Security", "Swimming Pool", "Gym", "Club House", "Garden", "Solar Power", "Rainwater Harvesting"],
    },
    {
      title: "Cozy 1 BHK Flat near Koramangala",
      slug: "cozy-1-bhk-flat-koramangala-bengaluru",
      description: "Charming 1 BHK flat perfect for working professionals or couples. Located in a quiet lane just off the bustling Koramangala 80 Feet Road. Fully furnished with AC, TV, bed, and sofa.",
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.APARTMENT,
      price: 25000.0,
      monthlyRent: 25000.0,
      securityDeposit: 100000.0,
      maintenanceCharges: 2000.0,
      bhk: 1,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 1,
      totalRooms: 2,
      carpetArea: 550,
      builtUpArea: 620,
      superBuiltUpArea: 680,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      facing: FacingDirection.EAST,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      coveredParking: 0,
      openParking: 1,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.BACHELORS,
      state: "Karnataka",
      cityId: citiesMap["Bengaluru"],
      localityId: localitiesMap["Koramangala"],
      fullAddress: "Flat 102, Green Glen Heights, Koramangala 4th Block",
      landmark: "Near Maharaja Restaurant",
      pincode: "560034",
      latitude: 12.9348,
      longitude: 77.6189,
      isVerified: true,
      status: PropertyStatus.ACTIVE,
      ownerId: owner2.id,
      images: [
        { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.INTERIOR },
        { url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80", isPrimary: false, category: PropertyImageCategory.BEDROOM },
      ],
      amenities: ["Power Backup", "Security", "CCTV", "Internet", "Air Conditioning", "Water Supply"],
    },
    {
      title: "Premium Commercial Office in Hitech City",
      slug: "premium-commercial-office-hitech-city-hyderabad",
      description: "Fully-furnished dynamic coworking space/office floor in the core of Hyderabad's IT corridor. Features 50 workstations, 3 meeting rooms, high-speed fiber internet, and pantry facilities.",
      transactionType: TransactionType.LEASE,
      propertyType: PropertyType.OFFICE_SPACE,
      price: 150000.0, // 1.5 Lakh/month
      monthlyRent: 150000.0,
      securityDeposit: 600000.0,
      maintenanceCharges: 12000.0,
      bedrooms: 0,
      bathrooms: 4,
      totalRooms: 10,
      carpetArea: 3200,
      builtUpArea: 3500,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      facing: FacingDirection.WEST,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      coveredParking: 3,
      openParking: 2,
      ownershipType: OwnershipType.LEASEHOLD,
      tenantPreference: TenantPreference.COMPANY,
      state: "Telangana",
      cityId: citiesMap["Hyderabad"],
      localityId: localitiesMap["Hyderabad Central"], // Mock location mapping
      fullAddress: "Level 6, Cyber Towers, Hitech City, Madhapur",
      pincode: "500081",
      latitude: 17.4504,
      longitude: 78.3809,
      isVerified: true,
      isFeatured: true,
      status: PropertyStatus.ACTIVE,
      ownerId: agent2User.id,
      images: [
        { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.EXTERIOR },
      ],
      amenities: ["Lift", "Power Backup", "Security", "CCTV", "Internet", "Air Conditioning", "Fire Safety", "Water Supply"],
    },
    {
      title: "Co-Living PG Room in HSR Layout",
      slug: "co-living-pg-room-hsr-layout-bengaluru",
      description: "Premium single-sharing PG room in a modern co-living space. Rent includes 3 meals daily, weekly housekeeping, high-speed WiFi, laundry, and access to a common lounge.",
      transactionType: TransactionType.RENT,
      propertyType: PropertyType.CO_LIVING,
      price: 18000.0,
      monthlyRent: 18000.0,
      securityDeposit: 36000.0,
      maintenanceCharges: 0.0,
      bhk: 1,
      bedrooms: 1,
      bathrooms: 1,
      totalRooms: 1,
      carpetArea: 250,
      possessionStatus: PossessionStatus.READY_TO_MOVE,
      facing: FacingDirection.SOUTH,
      furnishingStatus: FurnishingStatus.FULLY_FURNISHED,
      openParking: 1,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.BACHELORS,
      state: "Karnataka",
      cityId: citiesMap["Bengaluru"],
      localityId: localitiesMap["HSR Layout"],
      fullAddress: "Building 128, Sector 3, HSR Layout",
      pincode: "560102",
      latitude: 12.9103,
      longitude: 77.6409,
      isVerified: true,
      status: PropertyStatus.ACTIVE,
      ownerId: owner1.id,
      images: [
        { url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.BEDROOM },
      ],
      amenities: ["Power Backup", "Security", "CCTV", "Internet", "Air Conditioning", "Water Supply"],
    },
  ];

  // Dynamically pad properties to reach 25 items
  const propertyTypes = [
    PropertyType.APARTMENT, PropertyType.INDEPENDENT_HOUSE, PropertyType.VILLA, PropertyType.STUDIO_APARTMENT,
    PropertyType.PENTHOUSE, PropertyType.BUILDER_FLOOR, PropertyType.PG, PropertyType.CO_LIVING, PropertyType.OFFICE_SPACE
  ];
  
  const transTypes = [TransactionType.RENT, TransactionType.SALE, TransactionType.LEASE];
  const localities = Object.keys(localitiesMap);
  const furnishStatuses = [FurnishingStatus.UNFURNISHED, FurnishingStatus.SEMI_FURNISHED, FurnishingStatus.FULLY_FURNISHED];
  const owners = [owner1.id, owner2.id, agent1User.id, agent2User.id];

  // Base list of 5 properties already made, add 20 more realistic ones
  for (let i = 1; i <= 20; i++) {
    const locName = localities[i % localities.length];
    const pType = propertyTypes[i % propertyTypes.length];
    const tType = transTypes[i % transTypes.length];
    const isRent = tType === TransactionType.RENT || tType === TransactionType.LEASE;
    const price = isRent ? (15000 + (i * 3500)) : (4500000 + (i * 900000));
    const bhk = pType === PropertyType.OFFICE_SPACE ? null : (1 + (i % 4));
    
    propertiesData.push({
      title: `${bhk ? `${bhk} BHK ` : ""}${pType.replace("_", " ")} in ${locName}`,
      slug: `${bhk ? `${bhk}-bhk-` : ""}${pType.toLowerCase().replace("_", "-")}-${locName.toLowerCase().replace(" ", "-")}-${i}`,
      description: `A prime real estate option offering convenient access to local conveniences, highly suitable for modern urban lifestyles. Premium amenities, complete ventilation, and solid structure.`,
      transactionType: tType,
      propertyType: pType,
      price: price,
      monthlyRent: isRent ? price : null,
      securityDeposit: isRent ? (price * 3) : null,
      maintenanceCharges: 2000 + (i * 200),
      bhk: bhk,
      bedrooms: bhk || 0,
      bathrooms: bhk ? (bhk + (i % 2 === 0 ? 0 : 1)) : 2,
      balconies: bhk ? (1 + (i % 2)) : 0,
      totalRooms: bhk ? (bhk + 2) : 5,
      carpetArea: 500 + (i * 90),
      builtUpArea: 600 + (i * 100),
      superBuiltUpArea: 750 + (i * 120),
      possessionStatus: i % 3 === 0 ? PossessionStatus.UNDER_CONSTRUCTION : PossessionStatus.READY_TO_MOVE,
      facing: FacingDirection.EAST,
      furnishingStatus: furnishStatuses[i % furnishStatuses.length],
      coveredParking: i % 2,
      ownershipType: OwnershipType.FREEHOLD,
      tenantPreference: TenantPreference.ANY,
      state: "Karnataka",
      cityId: citiesMap["Bengaluru"],
      localityId: localitiesMap[locName],
      fullAddress: `No. ${i * 14}, ${locName} Main Road, Bengaluru`,
      pincode: `5600${10 + i}`,
      latitude: 12.92 + (i * 0.005),
      longitude: 77.62 + (i * 0.006),
      isVerified: i % 2 === 0,
      isFeatured: i % 5 === 0,
      status: PropertyStatus.ACTIVE,
      ownerId: owners[i % owners.length],
      images: [
        { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.EXTERIOR },
        { url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80", isPrimary: false, category: PropertyImageCategory.INTERIOR },
      ],
      amenities: ["Power Backup", "Security", "CCTV", "Visitor Parking", "Water Supply"],
    });
  }

  // Add 2 properties for each extra city
  for (const cityName of extraCities) {
    for (let i = 1; i <= 2; i++) {
      const locName = i === 1 ? `${cityName} Central` : `${cityName} South`;
      const pType = propertyTypes[i % propertyTypes.length];
      const tType = transTypes[i % transTypes.length];
      const isRent = tType === TransactionType.RENT || tType === TransactionType.LEASE;
      const price = isRent ? (20000 + (i * 5000)) : (5000000 + (i * 1000000));
      const bhk = 2;

      const cityCenters: Record<string, [number, number]> = {
        bengaluru: [12.9716, 77.5946],
        mumbai: [19.0760, 72.8777],
        delhi: [28.6139, 77.2090],
        hyderabad: [17.3850, 78.4867],
        chennai: [13.0827, 80.2707],
        pune: [18.5204, 73.8567],
        kolkata: [22.5726, 88.3639],
        ahmedabad: [23.0225, 72.5714],
        gurugram: [28.4595, 77.0266],
        noida: [28.5355, 77.3910],
        kochi: [9.9312, 76.2673],
      };
      
      const center = cityCenters[cityName.toLowerCase()] || [19.0760, 72.8777];

      propertiesData.push({
        title: `${bhk} BHK ${pType.replace("_", " ")} in ${locName}`,
        slug: `${bhk}-bhk-${pType.toLowerCase().replace("_", "-")}-${locName.toLowerCase().replace(" ", "-")}-${cityName.toLowerCase()}-${i}-${Date.now()}`,
        description: `A prime real estate option offering convenient access to local conveniences in ${cityName}. Premium amenities, complete ventilation, and solid structure.`,
        transactionType: tType,
        propertyType: pType,
        price: price,
        monthlyRent: isRent ? price : null,
        securityDeposit: isRent ? (price * 3) : null,
        maintenanceCharges: 2500,
        bhk: bhk,
        bedrooms: bhk,
        bathrooms: 2,
        balconies: 1,
        totalRooms: 4,
        carpetArea: 800,
        builtUpArea: 1000,
        superBuiltUpArea: 1200,
        possessionStatus: PossessionStatus.READY_TO_MOVE,
        facing: FacingDirection.NORTH,
        furnishingStatus: FurnishingStatus.SEMI_FURNISHED,
        coveredParking: 1,
        ownershipType: OwnershipType.FREEHOLD,
        tenantPreference: TenantPreference.ANY,
        state: cityName,
        cityId: citiesMap[cityName],
        localityId: localitiesMap[locName],
        fullAddress: `No. ${i * 10}, ${locName} Main Road, ${cityName}`,
        pincode: `${(cityName.length % 9 + 1)}0000${i}`,
        latitude: center[0] + (i * 0.01),
        longitude: center[1] + (i * 0.01),
        isVerified: true,
        isFeatured: false,
        status: PropertyStatus.ACTIVE,
        ownerId: owners[i % owners.length],
        images: [
          { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80", isPrimary: true, category: PropertyImageCategory.EXTERIOR },
          { url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80", isPrimary: false, category: PropertyImageCategory.INTERIOR },
        ],
        amenities: ["Power Backup", "Security", "CCTV", "Visitor Parking", "Water Supply"],
      });
    }
  }

  // Create Properties with Images and Amenities linked
  for (const prop of propertiesData) {
    const createdProp = await prisma.property.create({
      data: {
        title: prop.title,
        slug: prop.slug,
        description: prop.description,
        transactionType: prop.transactionType,
        propertyType: prop.propertyType,
        price: prop.price,
        monthlyRent: prop.monthlyRent,
        securityDeposit: prop.securityDeposit,
        maintenanceCharges: prop.maintenanceCharges,
        bhk: prop.bhk,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        balconies: prop.balconies,
        totalRooms: prop.totalRooms,
        carpetArea: prop.carpetArea,
        builtUpArea: prop.builtUpArea,
        superBuiltUpArea: prop.superBuiltUpArea,
        possessionStatus: prop.possessionStatus,
        facing: prop.facing,
        furnishingStatus: prop.furnishingStatus,
        coveredParking: prop.coveredParking,
        ownershipType: prop.ownershipType,
        tenantPreference: prop.tenantPreference,
        state: prop.state,
        cityId: prop.cityId,
        localityId: prop.localityId,
        fullAddress: prop.fullAddress,
        landmark: prop.landmark,
        pincode: prop.pincode,
        latitude: prop.latitude,
        longitude: prop.longitude,
        reraId: prop.reraId,
        isReraApproved: prop.isReraApproved,
        isVerified: prop.isVerified,
        isFeatured: prop.isFeatured,
        status: prop.status,
        ownerId: prop.ownerId,
        images: {
          create: prop.images.map((img) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            category: img.category,
          })),
        },
      },
    });

    // Create PropertyAmenity relations
    for (const amName of prop.amenities) {
      if (amenitiesMap[amName]) {
        await prisma.propertyAmenity.create({
          data: {
            propertyId: createdProp.id,
            amenityId: amenitiesMap[amName],
          },
        });
      }
    }
  }

  console.log(`Successfully seeded ${propertiesData.length} properties!`);
  console.log("Database seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
