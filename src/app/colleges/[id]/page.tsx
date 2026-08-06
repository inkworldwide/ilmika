import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollegeDetailClient from "@/components/property/CollegeDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const college = await prisma.college.findUnique({
    where: { id },
    select: { name: true, description: true, city: { select: { name: true } }, country: { select: { name: true } } },
  });

  if (!college) {
    return { title: "College Not Found | Ink EduVerse" };
  }

  return {
    title: `${college.name}, ${college.city.name} - Courses, Fees & Admission`,
    description: college.description.slice(0, 160),
  };
}

export default async function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const college = await prisma.college.findUnique({
    where: { id },
    include: {
      city: true,
      country: true,
      images: { orderBy: { sortOrder: "asc" } },
      accreditations: true,
      facilities: true,
      courses: { where: { isActive: true }, orderBy: { annualFees: "asc" } },
      reviews: { include: { reviewer: { select: { name: true, avatar: true } } }, orderBy: { createdAt: "desc" } },
      owner: { select: { id: true, name: true, email: true, phone: true, avatar: true, collegeProfile: true } },
    },
  });

  if (!college) {
    notFound();
  }

  // Increment view count asynchronously
  await prisma.college.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  const serializedCollege = {
    ...college,
    courses: college.courses.map((c) => ({
      ...c,
      annualFees: c.annualFees ? Number(c.annualFees) : 0,
      avgSalary: c.avgSalary ? Number(c.avgSalary) : null,
      highestSalary: c.highestSalary ? Number(c.highestSalary) : null,
      applicationDeadline: c.applicationDeadline ? c.applicationDeadline.toISOString() : null,
      startDate: c.startDate ? c.startDate.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    createdAt: college.createdAt.toISOString(),
    updatedAt: college.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Navbar />
      <CollegeDetailClient college={serializedCollege} />
      <Footer />
    </div>
  );
}
