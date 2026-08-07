import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    const body = await req.json();

    const {
      name,
      description,
      collegeType,
      countryId,
      cityName,
      address,
      website,
      email,
      phone,
      establishedYear,
      totalStudents,
      campusArea,
      gender,
      nirfRanking,
      qsRanking,
      imageUrl,
      hasScholarship,
      scholarshipDetails,
      hasEntranceExam,
      entranceExamDetails,
    } = body;

    if (!name || !description || !cityName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create country & city
    let targetCountryId = countryId;
    if (!targetCountryId) {
      const defaultCountry = await prisma.country.findFirst();
      targetCountryId = defaultCountry?.id;
    }

    const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    let city = await prisma.city.findFirst({
      where: { name: { equals: cityName, mode: "insensitive" } },
    });

    if (!city && targetCountryId) {
      city = await prisma.city.create({
        data: {
          name: cityName,
          slug: citySlug,
          countryId: targetCountryId,
        },
      });
    }

    if (!city || !targetCountryId) {
      return NextResponse.json({ error: "Country or City invalid" }, { status: 400 });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const college = await prisma.college.create({
      data: {
        name,
        slug,
        description,
        collegeType: collegeType || "PRIVATE",
        countryId: targetCountryId,
        cityId: city.id,
        address: address || cityName,
        website: website || null,
        email: email || null,
        phone: phone || null,
        establishedYear: establishedYear || null,
        totalStudents: totalStudents || null,
        campusArea: campusArea || null,
        gender: gender || "CO_ED",
        nirfRanking: nirfRanking || null,
        qsRanking: qsRanking || null,
        hasScholarship: Boolean(hasScholarship),
        scholarshipDetails: scholarshipDetails || null,
        hasEntranceExam: Boolean(hasEntranceExam),
        entranceExamDetails: entranceExamDetails || null,
        status: "ACTIVE", // auto-activate for demo
        isVerified: true,
        ownerId: user?.id || "demo-admin-id",
        images: imageUrl ? {
          create: [{ url: imageUrl, isPrimary: true }]
        } : undefined,
      },
    });

    return NextResponse.json({ success: true, college });
  } catch (error) {
    console.error("Error creating college:", error);
    return NextResponse.json({ error: "Failed to create college" }, { status: 500 });
  }
}
