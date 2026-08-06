import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://inkeduverse.com";

  // Fetch active colleges
  const activeColleges = await prisma.college.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
  });

  // Fetch college advisors
  const advisors = await prisma.user.findMany({
    where: { role: { in: ["COLLEGE_ADMIN", "AGENT"] }, isApproved: true, isSuspended: false },
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
      url: `${baseUrl}/colleges`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/scholarships`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/inquire`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
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

  // Dynamic College URLs
  const collegeUrls = activeColleges.map((col) => ({
    url: `${baseUrl}/colleges/${col.id}`,
    lastModified: col.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic Advisor URLs
  const advisorUrls = advisors.map((advisor) => ({
    url: `${baseUrl}/agent/${advisor.id}`,
    lastModified: advisor.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticUrls, ...collegeUrls, ...advisorUrls];
}
