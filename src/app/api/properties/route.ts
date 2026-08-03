import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { 
  TransactionType, 
  PropertyType, 
  PropertyStatus, 
  FurnishingStatus, 
  PossessionStatus, 
  OwnershipType, 
  FacingDirection, 
  AreaUnit, 
  TenantPreference, 
  PropertyImageCategory 
} from "@prisma/client";

// Input validation schema for property creation
const propertyCreateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  transactionType: z.enum(["RENT", "SALE", "LEASE"]),
  propertyType: z.enum([
    "APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "STUDIO_APARTMENT", "PENTHOUSE",
    "BUILDER_FLOOR", "RESIDENTIAL_PLOT", "FARM_HOUSE", "PG", "CO_LIVING",
    "SHARED_ROOM", "OFFICE_SPACE", "COWORKING_SPACE", "SHOP", "SHOWROOM",
    "WAREHOUSE", "INDUSTRIAL_PROPERTY", "COMMERCIAL_LAND",
    "DEVELOPER_SITE", "PLOT", "AGRICULTURE_LAND", "RESORT",
    "INDUSTRIAL_SITE", "INDUSTRIAL_BUILDING", "HOTEL", "COMMERCIAL_COMPLEX"
  ]),
  price: z.number().positive("Price must be a positive number"),
  monthlyRent: z.number().nonnegative().optional().nullable(),
  securityDeposit: z.number().nonnegative().optional().nullable(),
  maintenanceCharges: z.number().nonnegative().optional().nullable(),
  leaseDuration: z.number().int().positive().optional().nullable(),
  priceNegotiable: z.boolean().default(false),
  bhk: z.number().int().nonnegative().optional().nullable(),
  bedrooms: z.number().int().nonnegative().optional().nullable(),
  bathrooms: z.number().int().nonnegative().optional().nullable(),
  balconies: z.number().int().nonnegative().optional().nullable(),
  totalRooms: z.number().int().nonnegative().optional().nullable(),
  carpetArea: z.number().positive("Carpet area must be a positive number"),
  builtUpArea: z.number().positive().optional().nullable(),
  superBuiltUpArea: z.number().positive().optional().nullable(),
  plotArea: z.number().positive().optional().nullable(),
  areaUnit: z.enum(["SQFT", "SQYRD", "ACRE"]).default("SQFT"),
  possessionStatus: z.enum(["UNDER_CONSTRUCTION", "READY_TO_MOVE"]),
  facing: z.enum(["EAST", "WEST", "NORTH", "SOUTH", "NORTHEAST", "NORTHWEST", "SOUTHEAST", "SOUTHWEST"]).optional().nullable(),
  furnishingStatus: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"]),
  coveredParking: z.number().int().nonnegative().default(0),
  openParking: z.number().int().nonnegative().default(0),
  ownershipType: z.enum(["FREEHOLD", "LEASEHOLD", "CO_OPERATIVE", "POWER_OF_ATTORNEY"]),
  tenantPreference: z.enum(["ANY", "BACHELORS", "FAMILY", "COMPANY", "VEG", "NON_VEG"]).default("ANY"),
  listedBy: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  saleType: z.string().optional().nullable(),
  state: z.string().min(2, "State is required"),
  cityId: z.string().min(1, "City is required"),
  localityId: z.string().min(1, "Locality is required"),
  fullAddress: z.string().min(5, "Full address is required"),
  landmark: z.string().optional().nullable(),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  reraId: z.string().optional().nullable(),
  isReraApproved: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string().min(1, "Image URL is required"),
    publicId: z.string().optional().nullable(),
    category: z.enum(["EXTERIOR", "INTERIOR", "BEDROOM", "BATHROOM", "KITCHEN", "PLAN"]).default("EXTERIOR"),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0),
  })).min(1, "At least one image is required"),
  amenities: z.array(z.string()).default([]), // Array of Amenity IDs
});

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// GET - Search Properties (Paginated)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    // Build filter query object
    const where: any = {};

    // Standard rule: Public search only returns ACTIVE properties
    // Owners, Agents and Admins can see their own draft/pending properties via dashboard routes.
    where.status = PropertyStatus.ACTIVE;

    // Filters
    let transactionType = searchParams.get("transactionType");
    if (transactionType === "PURCHASE") {
      transactionType = "SALE";
    }
    if (transactionType) {
      where.transactionType = transactionType as TransactionType;
    }

    const cityId = searchParams.get("cityId");
    if (cityId && cityId !== "others") {
      where.cityId = cityId;
    }

    const citySearch = searchParams.get("citySearch");
    if (citySearch) {
      const cityFilter = {
        OR: [
          { city: { name: { contains: citySearch, mode: "insensitive" } } },
          { state: { contains: citySearch, mode: "insensitive" } },
          { fullAddress: { contains: citySearch, mode: "insensitive" } }
        ]
      };
      
      if (where.AND) {
        where.AND.push(cityFilter);
      } else {
        where.AND = [cityFilter];
      }
    }

    const localityId = searchParams.get("localityId");
    if (localityId) {
      where.localityId = localityId;
    }

    const propertyType = searchParams.get("propertyType");
    const category = searchParams.get("category");

    if (propertyType) {
      where.propertyType = propertyType as PropertyType;
    } else if (category) {
      if (category === "homes") {
        where.propertyType = { in: ["APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "BUILDER_FLOOR", "STUDIO_APARTMENT", "PENTHOUSE", "FARM_HOUSE"] };
      } else if (category === "land") {
        where.propertyType = { in: ["RESIDENTIAL_PLOT", "COMMERCIAL_LAND", "DEVELOPER_SITE", "PLOT", "AGRICULTURE_LAND", "RESORT"] };
      } else if (category === "commercial") {
        where.propertyType = { in: ["OFFICE_SPACE", "COWORKING_SPACE", "SHOP", "SHOWROOM", "HOTEL", "COMMERCIAL_COMPLEX"] };
      } else if (category === "industry") {
        where.propertyType = { in: ["WAREHOUSE", "INDUSTRIAL_PROPERTY", "INDUSTRIAL_SITE", "INDUSTRIAL_BUILDING"] };
      }
    }

    // Price ranges
    const minPrice = parseFloat(searchParams.get("minPrice") || "");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "");
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      where.price = {};
      if (!isNaN(minPrice)) where.price.gte = minPrice;
      if (!isNaN(maxPrice)) where.price.lte = maxPrice;
    }

    // BHK / Bedrooms & Types
    const bhkParam = searchParams.get("bhk");
    if (bhkParam === "studio") {
      where.propertyType = PropertyType.STUDIO_APARTMENT;
    } else if (bhkParam === "apartment") {
      where.propertyType = PropertyType.APARTMENT;
    } else if (bhkParam && !isNaN(parseInt(bhkParam))) {
      const bhkVal = parseInt(bhkParam);
      if (bhkVal >= 4) {
        where.bhk = { gte: 4 };
      } else {
        where.bhk = bhkVal;
      }
    }

    const facing = searchParams.get("facing");
    if (facing) {
      where.facing = facing as FacingDirection;
    }

    const furnishingStatus = searchParams.get("furnishingStatus");
    if (furnishingStatus) {
      where.furnishingStatus = furnishingStatus as FurnishingStatus;
    }

    const possessionStatus = searchParams.get("possessionStatus");
    if (possessionStatus) {
      where.possessionStatus = possessionStatus as PossessionStatus;
    }

    const isVerified = searchParams.get("isVerified");
    if (isVerified === "true") {
      where.isVerified = true;
    }

    // Advanced search filters
    const bedrooms = parseInt(searchParams.get("bedrooms") || "");
    if (!isNaN(bedrooms)) {
      where.bedrooms = bedrooms;
    }

    const bathrooms = parseInt(searchParams.get("bathrooms") || "");
    if (!isNaN(bathrooms)) {
      where.bathrooms = bathrooms;
    }

    const minArea = parseFloat(searchParams.get("minArea") || "");
    const maxArea = parseFloat(searchParams.get("maxArea") || "");
    if (!isNaN(minArea) || !isNaN(maxArea)) {
      where.carpetArea = {};
      if (!isNaN(minArea)) where.carpetArea.gte = minArea;
      if (!isNaN(maxArea)) where.carpetArea.lte = maxArea;
    }

    const propertyAge = parseInt(searchParams.get("propertyAge") || "");
    if (!isNaN(propertyAge)) {
      where.propertyAge = { lte: propertyAge };
    }

    const ownerOnly = searchParams.get("ownerOnly");
    if (ownerOnly === "true") {
      where.owner = { role: "OWNER" };
    }

    const parking = searchParams.get("parking");
    if (parking === "true") {
      where.OR = [
        { coveredParking: { gt: 0 } },
        { openParking: { gt: 0 } }
      ];
    }

    const petFriendly = searchParams.get("petFriendly");
    if (petFriendly === "true") {
      where.amenities = {
        some: {
          amenity: {
            name: {
              contains: "Pet Friendly",
              mode: "insensitive"
            }
          }
        }
      };
    }

    const ownershipType = searchParams.get("ownershipType");
    if (ownershipType) {
      where.ownershipType = ownershipType as OwnershipType;
    }

    const tenantPreference = searchParams.get("tenantPreference");
    if (tenantPreference) {
      where.tenantPreference = tenantPreference as TenantPreference;
    }

    const availableFrom = searchParams.get("availableFrom");
    if (availableFrom) {
      const dateVal = new Date(availableFrom);
      if (!isNaN(dateVal.getTime())) {
        where.availableFrom = { lte: dateVal };
      }
    }

    const amenitiesParam = searchParams.get("amenities");
    if (amenitiesParam) {
      const amenityIds = amenitiesParam.split(",").filter(Boolean);
      if (amenityIds.length > 0) {
        where.amenities = {
          some: {
            amenityId: { in: amenityIds }
          }
        };
      }
    }

    // Sorting
    const sortBy = searchParams.get("sortBy") || "newest";
    let orderBy: any = { createdAt: "desc" };

    if (sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sortBy === "area_desc") {
      orderBy = { carpetArea: "desc" };
    }

    // Execute queries in parallel to avoid sequential waits
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          city: true,
          locality: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              role: true,
              agentProfile: {
                select: {
                  isFeatured: true
                }
              }
            }
          }
        },
      }),
      prisma.property.count({ where }),
    ]);

    // Sort properties so that properties from Featured Agents and Owners appear first
    const sortedProperties = [...properties].sort((a: any, b: any) => {
      const aIsFeatured = (a.isFeatured ?? false) || (a.owner?.agentProfile?.isFeatured ?? false);
      const bIsFeatured = (b.isFeatured ?? false) || (b.owner?.agentProfile?.isFeatured ?? false);
      if (aIsFeatured && !bIsFeatured) return -1;
      if (!aIsFeatured && bIsFeatured) return 1;
      return 0;
    });

    return NextResponse.json({
      properties: sortedProperties,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Fetch properties error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred retrieving properties" },
      { status: 500 }
    );
  }
}

// POST - Create Property (Atomic Database Transaction)
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Only Owners, Agents, and Admins can create listings
    if (user.role === "USER") {
      return NextResponse.json(
        { error: "Access denied. Only owners or agents can list properties." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const parsed = propertyCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch city and locality details to generate the slug
    const [city, locality] = await Promise.all([
      prisma.city.findUnique({ where: { id: data.cityId } }),
      prisma.locality.findUnique({ where: { id: data.localityId } }),
    ]);

    if (!city || !locality) {
      return NextResponse.json(
        { error: "Invalid city or locality selected." },
        { status: 400 }
      );
    }

    // Generate unique slug
    const cleanTitle = slugify(data.title);
    const cleanLocality = slugify(locality.name);
    const cleanCity = slugify(city.name);
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const slug = `${cleanTitle}-${cleanLocality}-${cleanCity}-${uniqueId}`;

    // Perform database operations inside an atomic transaction
    const property = await prisma.$transaction(async (tx) => {
      // 1. Create property record
      const prop = await tx.property.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          transactionType: data.transactionType as TransactionType,
          propertyType: data.propertyType as PropertyType,
          price: data.price,
          monthlyRent: data.monthlyRent,
          securityDeposit: data.securityDeposit,
          maintenanceCharges: data.maintenanceCharges,
          leaseDuration: data.leaseDuration,
          priceNegotiable: data.priceNegotiable,
          bhk: data.bhk,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          balconies: data.balconies,
          totalRooms: data.totalRooms,
          carpetArea: data.carpetArea,
          builtUpArea: data.builtUpArea,
          superBuiltUpArea: data.superBuiltUpArea,
          plotArea: data.plotArea,
          areaUnit: data.areaUnit as AreaUnit,
          possessionStatus: data.possessionStatus as PossessionStatus,
          facing: data.facing as FacingDirection | null,
          furnishingStatus: data.furnishingStatus as FurnishingStatus,
          coveredParking: data.coveredParking,
          openParking: data.openParking,
          ownershipType: data.ownershipType as OwnershipType,
          tenantPreference: data.tenantPreference as TenantPreference,
          listedBy: data.listedBy,
          videoUrl: data.videoUrl,
          saleType: data.saleType,
          state: data.state,
          cityId: data.cityId,
          localityId: data.localityId,
          fullAddress: data.fullAddress,
          landmark: data.landmark,
          pincode: data.pincode,
          latitude: data.latitude,
          longitude: data.longitude,
          reraId: data.reraId,
          isReraApproved: data.isReraApproved,
          status: PropertyStatus.PENDING_VERIFICATION,
          ownerId: user.id,
        },
      });

      // 2. Create PropertyImages
      if (data.images && data.images.length > 0) {
        await tx.propertyImage.createMany({
          data: data.images.map((img) => ({
            propertyId: prop.id,
            url: img.url,
            publicId: img.publicId,
            category: img.category as PropertyImageCategory,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
        });
      }

      // 3. Create PropertyAmenities
      if (data.amenities && data.amenities.length > 0) {
        await tx.propertyAmenity.createMany({
          data: data.amenities.map((amenityId) => ({
            propertyId: prop.id,
            amenityId,
          })),
        });
      }

      return prop;
    });

    return NextResponse.json(
      {
        message: "Property created successfully as DRAFT. You can now submit it for verification.",
        property,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred listing property." },
      { status: 500 }
    );
  }
}
