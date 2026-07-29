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

const propertyUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  transactionType: z.enum(["RENT", "SALE", "LEASE"]),
  propertyType: z.enum([
    "APARTMENT", "INDEPENDENT_HOUSE", "VILLA", "STUDIO_APARTMENT", "PENTHOUSE",
    "BUILDER_FLOOR", "RESIDENTIAL_PLOT", "FARM_HOUSE", "PG", "CO_LIVING",
    "SHARED_ROOM", "OFFICE_SPACE", "COWORKING_SPACE", "SHOP", "SHOWROOM",
    "WAREHOUSE", "INDUSTRIAL_PROPERTY", "COMMERCIAL_LAND"
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
  status: z.enum([
    "DRAFT", "PENDING_VERIFICATION", "ACTIVE", "REJECTED", "RENTED", "SOLD", "LEASED", "ARCHIVED"
  ]).optional(),
  images: z.array(z.object({
    url: z.string().min(1, "Image URL is required"),
    publicId: z.string().optional().nullable(),
    category: z.enum(["EXTERIOR", "INTERIOR", "BEDROOM", "BATHROOM", "KITCHEN", "PLAN"]).default("EXTERIOR"),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().default(0),
  })).min(1, "At least one image is required"),
  amenities: z.array(z.string()).default([]), // Array of Amenity IDs
});

// GET - Single Property details (Auth restricted for non-ACTIVE properties)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);

    const property = await prisma.property.findUnique({
      where: { id },
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
            email: true,
            phone: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Privacy Guard: If the property is NOT Active, only owner or admin can view it
    if (property.status !== PropertyStatus.ACTIVE) {
      const isOwner = user?.id === property.ownerId;
      const isAdmin = user?.role === "ADMIN";
      
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "Access denied. This property is currently non-public." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ property });
  } catch (error: any) {
    console.error("Get property detail error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred retrieving property details" },
      { status: 500 }
    );
  }
}

// PUT - Update Property (Auth + Owner/Admin check + Transaction)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Fetch existing property to verify ownership
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Server-side ownership authorization check
    const isOwner = existingProperty.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied. You do not own this listing." },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Check if it is a status-only update (e.g. submitting for verification or changing active status)
    const allowedStatuses = ["DRAFT", "PENDING_VERIFICATION", "ACTIVE", "REJECTED", "RENTED", "SOLD", "LEASED", "ARCHIVED"];
    if (Object.keys(body).length === 1 && body.status !== undefined && allowedStatuses.includes(body.status)) {
      const newStatus = body.status;
      const updated = await prisma.property.update({
        where: { id },
        data: {
          status: newStatus as PropertyStatus,
          isVerified: newStatus === "ACTIVE" ? true : newStatus === "PENDING_VERIFICATION" ? false : undefined,
        },
      });
      return NextResponse.json({
        message: "Property status updated successfully",
        property: updated,
      });
    }

    // Validate inputs
    const parsed = propertyUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Perform database updates inside an atomic transaction
    const updatedProperty = await prisma.$transaction(async (tx) => {
      // 1. Update main property details
      const prop = await tx.property.update({
        where: { id },
        data: {
          title: data.title,
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
          // Edited properties are immediately active and verified in dev/test to show on homepage
          status: data.status || existingProperty.status,
          isVerified: (data.status || existingProperty.status) === "ACTIVE" ? true : false,
        },
      });

      // 2. Refresh Images: Delete old ones and insert new ones
      await tx.propertyImage.deleteMany({
        where: { propertyId: id },
      });

      if (data.images && data.images.length > 0) {
        await tx.propertyImage.createMany({
          data: data.images.map((img) => ({
            propertyId: id,
            url: img.url,
            publicId: img.publicId,
            category: img.category as PropertyImageCategory,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
        });
      }

      // 3. Refresh Amenities: Delete old and create new
      await tx.propertyAmenity.deleteMany({
        where: { propertyId: id },
      });

      if (data.amenities && data.amenities.length > 0) {
        await tx.propertyAmenity.createMany({
          data: data.amenities.map((amenityId) => ({
            propertyId: id,
            amenityId,
          })),
        });
      }

      return prop;
    });

    return NextResponse.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error: any) {
    console.error("Update property error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred updating property details" },
      { status: 500 }
    );
  }
}

// DELETE - Remove Property (Auth + Owner/Admin check)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Fetch existing property to verify ownership
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Owner or Admin check
    const isOwner = property.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied. You do not own this listing." },
        { status: 403 }
      );
    }

    // Cascading deletes will handle images, amenities, and other relations automatically
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Property deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred deleting property" },
      { status: 500 }
    );
  }
}
