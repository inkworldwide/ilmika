import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ILMIKA_KNOWLEDGE_BASE = [
  {
    keywords: ["ilmika", "what is ilmika", "about ilmika", "eduverse", "project", "what is this site"],
    answer: "🌐 **About ILMIKA (EduVerse):**\n\nILMIKA is a world-class global higher education discovery and admissions platform. It connects prospective students with **12,000+ accredited universities** across **180+ countries**.\n\n• **For Students:** Search & compare colleges, check entrance cutoffs, apply directly online, and book 1-on-1 expert counselling.\n• **For Colleges:** List campus details, manage courses, track student applications, and publish fee structures & scholarships.",
    actionLink: "/colleges",
    actionLabel: "Explore ILMIKA Platform",
  },
  {
    keywords: ["scholarship", "financial aid", "fee waiver", "grant", "stipend", "free education", "discount"],
    answer: "🎓 **Scholarships & Financial Aid on ILMIKA:**\n\nMany of our 12,000+ listed colleges offer tuition fee waivers (up to 100%) and merit-cum-means scholarships for domestic and international students.\n\n• **How to check:** Visit any college page under Admissions or filter by **'Scholarship Available'**.\n• **Details asked:** When colleges list their campus on ILMIKA, they provide explicit waiver rules (e.g. *50% tuition waiver for >90% marks in 10+2*).\n• **Application:** Apply directly through ILMIKA or book a counselling session to verify scholarship eligibility.",
    actionLink: "/colleges?scholarship=true",
    actionLabel: "Explore Scholarship Colleges",
  },
  {
    keywords: ["entrance exam", "cutoff", "cut off", "jee", "neet", "cat", "sat", "ielts", "toefl", "gre", "gmat", "gate", "clat"],
    answer: "🎯 **Entrance Exams & Course Cutoffs:**\n\nAdmissions for competitive programmes depend on qualifying entrance scores:\n\n• **Engineering:** JEE Main / JEE Advanced cutoffs (e.g. AIR 1 - 2500).\n• **Medicine:** NEET UG / PG qualifying scores (e.g. 650+ marks).\n• **Management:** CAT (90+ percentile), XAT, GMAT.\n• **Study Abroad & Global:** SAT (1400+), IELTS (Band 6.5+), TOEFL (90+), GRE.\n\nDirect cutoffs are listed per course under **'Accepted Cutoffs'**.",
    actionLink: "/colleges",
    actionLabel: "Find Colleges by Cutoffs",
  },
  {
    keywords: ["apply", "application", "enquiry", "admissions", "enroll", "admission", "how to apply"],
    answer: "📝 **How to Apply & Track Applications:**\n\n1. **Search & Compare:** Find your desired college and course on ILMIKA.\n2. **Direct Application:** Click **'Apply Now'** on the college detail page.\n3. **Track Status:** Monitor your application progress, status updates, and responses directly in your **Student Dashboard** (`/dashboard/enquiries`).",
    actionLink: "/dashboard/enquiries",
    actionLabel: "Go to My Applications",
  },
  {
    keywords: ["counselling", "counselor", "advisor", "session", "guidance", "book", "talk to expert"],
    answer: "👨‍💼 **Expert Counselling Sessions:**\n\nSpeak 1-on-1 with certified education advisors and college desks on ILMIKA:\n\n• Get personalized guidance on course selection, visa processing, and document verification.\n• Book your online or in-person session in seconds from your dashboard (`/dashboard/visits`).",
    actionLink: "/dashboard/visits",
    actionLabel: "Book Counselling Session",
  },
  {
    keywords: ["add college", "list college", "post college", "admin desk", "college admin", "register university", "my colleges"],
    answer: "🏛 **For College Admins & Institutions:**\n\nInstitutions can list their campus, degree offerings, fee structures, and scholarship details on ILMIKA:\n\n1. Go to **My Colleges** in your Admin Desk (`/dashboard/colleges`).\n2. Click **'+ Add College Listing'**.\n3. Fill in campus details, location, rankings, and scholarship facilities.\n4. Manage degree offerings, annual fees, and accepted entrance cutoffs using the **Manage Courses** tool.",
    actionLink: "/colleges/add",
    actionLabel: "Post a College Listing",
  },
  {
    keywords: ["stream", "course", "degree", "btech", "mba", "mbbs", "bba", "bca", "mca", "law", "phd", "nursing", "pharmacy", "design"],
    answer: "📚 **Degrees & Streams Offered:**\n\nILMIKA hosts 50,000+ accredited programmes:\n\n• **Engineering & IT:** B.Tech, M.Tech, BCA, MCA, Computer Science & AI.\n• **Management:** MBA, BBA, Executive Finance & Analytics.\n• **Medicine & Health:** MBBS, BDS, Nursing, Pharmacy.\n• **Arts, Law & Design:** LLB, LLM, B.Des, BA, B.Com, BSc.",
    actionLink: "/colleges",
    actionLabel: "Browse All Programmes",
  },
  {
    keywords: ["fee", "fees", "cost", "annual fee", "tuition", "price", "how much"],
    answer: "💰 **Tuition Fees & Cost Transparency:**\n\nILMIKA displays annual tuition fees directly on college cards and course breakdowns in local currencies (₹ INR, $ USD, £ GBP, € EUR).\n\n• Annual fees typically range from **₹50,000/yr** to **₹25,000,000/yr** depending on stream and country.\n• Financial aid and installment plans are indicated under course details.",
    actionLink: "/colleges",
    actionLabel: "Compare College Fees",
  },
  {
    keywords: ["shortlist", "saved", "favorite", "bookmark"],
    answer: "❤️ **Shortlisting Colleges:**\n\nYou can click the **'Heart / Shortlist'** icon on any college page to save it to your comparison shortlist in your student dashboard (`/dashboard/saved`).",
    actionLink: "/dashboard/saved",
    actionLabel: "View My Shortlist",
  },
  {
    keywords: ["contact", "support", "help", "email", "phone"],
    answer: "📞 **ILMIKA Support & Desk Assistance:**\n\nNeed help with your application or profile?\n\n• **Email:** support@ilmika.com\n• **Counselling Desk:** Book a 1-on-1 session in `/dashboard/visits`\n• **Inbox:** Message college admins directly in `/dashboard/messages`",
    actionLink: "/dashboard/messages",
    actionLabel: "Open Inbox Messages",
  },
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lowerQuery = message.toLowerCase().trim();

    // 1. Dynamic Database Search for Colleges
    try {
      const dbColleges = await prisma.college.findMany({
        where: {
          OR: [
            { name: { contains: lowerQuery, mode: "insensitive" } },
            { city: { name: { contains: lowerQuery, mode: "insensitive" } } },
            { country: { name: { contains: lowerQuery, mode: "insensitive" } } },
            { description: { contains: lowerQuery, mode: "insensitive" } },
          ],
          status: "ACTIVE",
        },
        include: {
          city: true,
          country: true,
          courses: { take: 3 },
        },
        take: 3,
      });

      if (dbColleges.length > 0) {
        const primaryCol = dbColleges[0];
        const feeInfo = primaryCol.courses.length > 0
          ? `Fees start at ₹${Number(primaryCol.courses[0].annualFees).toLocaleString()}/yr`
          : "Fees on request";
        const rankInfo = primaryCol.nirfRanking ? ` (NIRF #${primaryCol.nirfRanking})` : "";
        const scholarshipText = primaryCol.hasScholarship ? "\n• **Scholarship:** Financial aid available!" : "";
        const cutoffText = primaryCol.hasEntranceExam ? `\n• **Cutoffs:** ${primaryCol.entranceExamDetails || "Entrance exam required"}` : "";

        return NextResponse.json({
          reply: `🏫 **${primaryCol.name}**${rankInfo}\n📍 ${primaryCol.city.name}, ${primaryCol.country.name}\n\n${primaryCol.description.slice(0, 180)}...\n\n• **Type:** ${primaryCol.collegeType}\n• **Tuition:** ${feeInfo}${scholarshipText}${cutoffText}\n\nClick below to view courses, cut-offs, and submit your application directly!`,
          actionLink: `/colleges/${primaryCol.id}`,
          actionLabel: `View ${primaryCol.name}`,
        });
      }
    } catch (e) {
      console.error("DB Chatbot search error:", e);
    }

    // 2. Knowledge Base Matching
    let matchedItem = ILMIKA_KNOWLEDGE_BASE.find(item =>
      item.keywords.some(kw => lowerQuery.includes(kw))
    );

    if (matchedItem) {
      return NextResponse.json({
        reply: matchedItem.answer,
        actionLink: matchedItem.actionLink,
        actionLabel: matchedItem.actionLabel,
      });
    }

    // 3. Smart Fallback Response
    return NextResponse.json({
      reply: `✨ **ILMIKA AI Assistant**\n\nI couldn't find an exact match for your question, but I can help you with:\n\n• **Searching Universities:** 12,000+ colleges across 180+ countries.\n• **Scholarships & Cutoffs:** Tuition waivers & entrance exam requirements (JEE, NEET, CAT, SAT, IELTS).\n• **Applications & Counselling:** Apply online or book 1-on-1 guidance.\n\nTry asking: *"Tell me about scholarships"*, *"How to apply for MBA?"*, or search by university name!`,
      actionLink: "/colleges",
      actionLabel: "Explore All Colleges",
    });
  } catch (error) {
    console.error("AI Chatbot error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
