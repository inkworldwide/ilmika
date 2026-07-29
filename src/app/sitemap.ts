import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rentahouse.in";

  // Fetch all active property listings
  const activeProperties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
  });

  // Fetch all active agent user IDs
  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    select: { id: true, updatedAt: true },
  });

  // Static URLs
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Dynamic Property URLs
  const propertyUrls = activeProperties.map((prop) => ({
    url: `${baseUrl}/properties/${prop.id}`,
    lastModified: prop.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic Agent Profile URLs
  const agentUrls = agents.map((agent) => ({
    url: `${baseUrl}/agent/${agent.id}`,
    lastModified: agent.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticUrls, ...propertyUrls, ...agentUrls];
}
