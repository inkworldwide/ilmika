import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyDetailClient from "@/components/property/PropertyDetailClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate SEO Dynamic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { city: true, locality: true },
  });

  if (!property) {
    return {
      title: "Property Not Found | Re One Stop Page",
    };
  }

  const bhkPrefix = property.bhk ? `${property.bhk} BHK ` : "";
  const typeName = property.propertyType.replace("_", " ").toLowerCase();
  const locationName = `${property.locality.name}, ${property.city.name}`;
  const purposeWord = property.transactionType.toLowerCase();

  const title = `${bhkPrefix}${property.propertyType.replace("_", " ")} for ${property.transactionType} in ${locationName} | Re One Stop Page`;
  const description = `Browse this verified ${bhkPrefix}${typeName} available for ${purposeWord} in ${locationName}. Details: Carpet Area ${property.carpetArea} sqft, Furnishing ${property.furnishingStatus.replace("_", " ")}, Price ₹${parseFloat(property.price.toString()).toLocaleString("en-IN")}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://rentahouse.in/properties/${id}`,
      type: "website",
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Retrieve property with all related models
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
          customId: true,
          agentProfile: {
            include: {
              reviews: {
                orderBy: { createdAt: "desc" },
                include: {
                  reviewer: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!property) {
    return notFound();
  }

  // Fetch similar properties in the same city for recommendation carousel
  const similarProperties = await prisma.property.findMany({
    where: {
      cityId: property.cityId,
      transactionType: property.transactionType,
      id: { not: property.id },
      status: "ACTIVE",
    },
    take: 4,
    include: {
      city: true,
      locality: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // Convert Decimals to serializable numbers for React props
  const serializableProperty = {
    ...property,
    price: parseFloat(property.price.toString()),
    monthlyRent: property.monthlyRent ? parseFloat(property.monthlyRent.toString()) : null,
    securityDeposit: property.securityDeposit ? parseFloat(property.securityDeposit.toString()) : null,
    maintenanceCharges: property.maintenanceCharges ? parseFloat(property.maintenanceCharges.toString()) : null,
  };

  const serializableSimilar = similarProperties.map(p => ({
    ...p,
    price: parseFloat(p.price.toString()),
    monthlyRent: p.monthlyRent ? parseFloat(p.monthlyRent.toString()) : null,
    securityDeposit: p.securityDeposit ? parseFloat(p.securityDeposit.toString()) : null,
    maintenanceCharges: p.maintenanceCharges ? parseFloat(p.maintenanceCharges.toString()) : null,
  }));

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    "name": property.title,
    "description": property.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.locality.name,
      "addressRegion": property.state,
      "addressCountry": "IN",
      "postalCode": property.pincode,
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude,
    } : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Navbar />
      
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        <PropertyDetailClient 
          property={serializableProperty} 
          similarProperties={serializableSimilar} 
        />
      </main>

      <Footer />
    </div>
  );
}
