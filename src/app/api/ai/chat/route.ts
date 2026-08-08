import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ILMIKA_KNOWLEDGE_BASE = [
  {
    keywords: ["ilmika", "what is ilmika", "about ilmika", "eduverse", "project", "what is this site", "who built", "company"],
    answer: "🌐 **About ILMIKA Global Education:**\n\nILMIKA is an executive global education platform connecting prospective students with **12,000+ accredited universities** across **180+ countries**.\n\n• **For Students:** Discover degree courses, compare tuition fees, check entrance exam cut-offs, apply directly online, and book 1-on-1 expert counselling.\n• **For Institutions:** Register campuses, publish course offerings, specify scholarship waivers, and manage student applications in real time.",
    actionLink: "/colleges",
    actionLabel: "Explore Global Universities",
  },
  {
    keywords: ["scholarship", "financial aid", "fee waiver", "grant", "stipend", "free education", "discount", "bursary"],
    answer: "🎓 **Scholarships & Tuition Fee Waivers:**\n\nInstitutions on ILMIKA offer merit-based and need-based tuition waivers ranging from **25% to 100%**:\n\n• **Merit Scholarships:** Offered for top academic performance in qualifying exams (e.g. >90% in 10+2 or high entrance score).\n• **Need-Based Aid:** Financial support based on family income criteria.\n• **International Student Grants:** Stipends for study abroad candidates.\n\nFilter by **'Scholarship Available'** on college cards or check the Admissions tab on any college page.",
    actionLink: "/colleges?scholarship=true",
    actionLabel: "View Scholarship Colleges",
  },
  {
    keywords: ["entrance exam", "cutoff", "cut off", "jee", "neet", "cat", "sat", "ielts", "toefl", "gre", "gmat", "gate", "clat", "nata", "nift", "score", "percentile", "rank"],
    answer: "🎯 **Accepted Entrance Exams & Course Cutoffs:**\n\nQualifying score requirements for competitive admissions:\n\n• **Engineering (B.Tech):** JEE Main / JEE Advanced (AIR 1 - 2,500 for Tier-1; <15,000 for Tier-2).\n• **Medicine (MBBS):** NEET UG (650+ marks / 99+ percentile).\n• **Management (MBA):** CAT (95+ %ile), XAT, GMAT (700+ score).\n• **Study Abroad & Global:** SAT (1450+), IELTS (Band 6.5+), TOEFL (90+), GRE (320+).\n• **Law & Design:** CLAT (AIR < 2,500), NATA (100+ score).\n\nCheck the **Accepted Cutoffs** tag on individual course cards.",
    actionLink: "/colleges",
    actionLabel: "Filter by Cutoffs",
  },
  {
    keywords: ["apply", "application", "enquiry", "admissions", "enroll", "admission", "how to apply", "deadline"],
    answer: "📝 **How Direct Applications & Enquiries Work:**\n\n• **General Enquiry:** Anyone (guests or logged-in users) can click **'Send Enquiry'** to submit questions directly to college admissions desks.\n• **Direct Course Application:** Click **'Apply Directly'** or **'Apply for Course'** on any college page to fill out the official application.\n• **Application Tracking:** Registered students can track application status, updates, and messages in their **Student Dashboard** (`/dashboard/enquiries`).",
    actionLink: "/dashboard/enquiries",
    actionLabel: "My Applications Desk",
  },
  {
    keywords: ["counselling", "counselor", "advisor", "session", "guidance", "book", "talk to expert", "consultant"],
    answer: "👨‍💼 **1-on-1 Expert Counselling Sessions:**\n\nBook personalized sessions with certified education advisors and university desks:\n\n• **Services:** Guidance on course selection, career pathways, visa processing, and document verification.\n• **Formats:** Video call, voice call, or in-person campus visit.\n• **How to Book:** Log in and click **'Book Counselling Session'** on any college page or via your dashboard (`/dashboard/visits`).",
    actionLink: "/dashboard/visits",
    actionLabel: "Book Advisory Session",
  },
  {
    keywords: ["add college", "list college", "post college", "admin desk", "college admin", "register university", "my colleges", "manage courses"],
    answer: "🏛 **University Admins & Institution Portal:**\n\nCollege representatives can publish and manage their campus presence on ILMIKA:\n\n1. Access **My Colleges** in your Admin Desk (`/dashboard/colleges`).\n2. Click **'+ Add College Listing'** to enter campus details, rankings, and scholarship facilities.\n3. Use the **Manage Courses** tool to add degree offerings, set annual tuition fees, seat capacities, eligibility, and accepted entrance cutoffs.",
    actionLink: "/colleges/add",
    actionLabel: "List Your Institution",
  },
  {
    keywords: ["india", "indian colleges", "iit", "iim", "aiims", "delhi", "bangalore", "mumbai"],
    answer: "🇮🇳 **Top Universities in India:**\n\nILMIKA hosts leading Indian institutions including IITs, IIMs, AIIMS, NITs, and premier private universities.\n\n• **Engineering:** B.Tech, M.Tech (JEE Main/Adv cutoffs).\n• **Management:** MBA, PGDM (CAT/GMAT cutoffs).\n• **Medical:** MBBS, BDS (NEET UG cutoffs).\n• **Average Tuition:** ₹50,000 to ₹4,00,000 / year with scholarship options.",
    actionLink: "/colleges?country=India",
    actionLabel: "Explore Indian Colleges",
  },
  {
    keywords: ["usa", "united states", "america", "american universities", "harvard", "stanford", "mit"],
    answer: "🇺🇸 **Study in the USA:**\n\nDiscover top accredited US universities offering Bachelor's, Master's, and PhD programmes.\n\n• **Entrance Requirements:** SAT (1400+), GRE/GMAT, TOEFL / IELTS (Band 7.0+).\n• **Scholarships:** Up to 100% merit & need-based financial aid.\n• **Tuition Range:** $20,000 - $65,000 / year.",
    actionLink: "/colleges?country=USA",
    actionLabel: "Explore US Universities",
  },
  {
    keywords: ["uk", "united kingdom", "britain", "london", "oxford", "cambridge"],
    answer: "🇬🇧 **Study in the UK:**\n\nExplore top UK universities offering 3-year Bachelor's and 1-year Master's degrees.\n\n• **Entrance Requirements:** IELTS Academic (Band 6.5+), A-Levels / 10+2.\n• **Post-Study Visa:** 2-year Graduate Route visa available.\n• **Tuition Range:** £12,000 - £35,000 / year.",
    actionLink: "/colleges?country=UK",
    actionLabel: "Explore UK Universities",
  },
  {
    keywords: ["canada", "canadian universities", "toronto", "ubc", "mcgill"],
    answer: "🇨🇦 **Study in Canada:**\n\nTop Canadian institutions known for world-class research and Post-Graduation Work Permits (PGWP).\n\n• **Entrance Requirements:** IELTS (Band 6.5+), GPA 3.0+.\n• **Tuition Range:** CAD $15,000 - $45,000 / year.",
    actionLink: "/colleges?country=Canada",
    actionLabel: "Explore Canadian Universities",
  },
  {
    keywords: ["btech", "engineering", "computer science", "ai", "it", "b.tech", "mtech"],
    answer: "💻 **Engineering & Computer Science (B.Tech / M.Tech):**\n\n• **Popular Streams:** Computer Science, AI & ML, Electronics, Mechanical, Civil.\n• **Key Cutoffs:** JEE Main, JEE Advanced, GATE, SAT.\n• **Average Fees:** ₹1,00,000 - ₹5,00,000 / year.",
    actionLink: "/colleges?stream=Engineering",
    actionLabel: "Browse Engineering Colleges",
  },
  {
    keywords: ["mba", "management", "business", "bba", "pgdm", "finance", "marketing"],
    answer: "💼 **Management & Business (MBA / BBA):**\n\n• **Specialisations:** Marketing, Finance, HR, Business Analytics, Supply Chain.\n• **Key Cutoffs:** CAT (90+ %ile), XAT, GMAT (700+), MAT.\n• **Average Fees:** ₹2,50,000 - ₹25,00,000 / year.",
    actionLink: "/colleges?stream=Management",
    actionLabel: "Browse MBA Colleges",
  },
  {
    keywords: ["mbbs", "medicine", "medical", "doctor", "nursing", "bds", "pharmacy"],
    answer: "🩺 **Medicine & Healthcare (MBBS / BDS / Pharmacy):**\n\n• **Degree Levels:** Undergraduate MBBS, BDS, B.Pharm, BSc Nursing, Postgraduate MD/MS.\n• **Key Cutoffs:** NEET UG (650+ marks), NEET PG, MCAT.\n• **Scholarships:** Govt & private merit waivers.",
    actionLink: "/colleges?stream=Medicine",
    actionLabel: "Browse Medical Colleges",
  },
  {
    keywords: ["fee", "fees", "cost", "annual fee", "tuition", "price", "how much"],
    answer: "💰 **Tuition Fees & Cost Transparency:**\n\nILMIKA displays annual tuition fees directly on college cards and course breakdowns in local currencies (₹ INR, $ USD, £ GBP, € EUR).\n\n• Annual fees range from **₹40,000/yr** to **₹25,000,000/yr** depending on degree and location.\n• Financial aid, installment options, and scholarship waivers are explicitly listed under course details.",
    actionLink: "/colleges",
    actionLabel: "Compare College Fees",
  },
  {
    keywords: ["shortlist", "saved", "favorite", "bookmark", "heart"],
    answer: "❤️ **Shortlisting Colleges:**\n\nYou can click the **'Heart / Shortlist'** icon on any college page to save it to your comparison shortlist in your student dashboard (`/dashboard/saved`). *Note: Requires student log in.*",
    actionLink: "/dashboard/saved",
    actionLabel: "View My Shortlist",
  },
  {
    keywords: ["login", "log in", "signup", "sign up", "register", "account", "guest"],
    answer: "🔐 **Account & Login Rules on ILMIKA:**\n\n• **Guest Users (Not Logged In):** Can browse all colleges, view cutoffs & fees, and submit **Send Enquiry** forms.\n• **Registered Students (Logged In):** Can submit direct college applications (**Apply Directly**), book 1-on-1 counselling sessions, shortlist colleges, and track status.",
    actionLink: "/auth/login",
    actionLabel: "Log In to Account",
  },
  {
    keywords: ["contact", "support", "help", "email", "phone", "address"],
    answer: "📞 **ILMIKA Support & Contact Desk:**\n\nNeed assistance with your application or university portal?\n\n• **Email:** support@ilmika.com\n• **1-on-1 Advisory:** Book in `/dashboard/visits`\n• **Inbox Messages:** Connect directly with college desks in `/dashboard/messages`",
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

    // 1. Dynamic Database Search for Specific Colleges, Cities, or Countries
    try {
      const dbColleges = await prisma.college.findMany({
        where: {
          OR: [
            { name: { contains: lowerQuery, mode: "insensitive" } },
            { city: { name: { contains: lowerQuery, mode: "insensitive" } } },
            { country: { name: { contains: lowerQuery, mode: "insensitive" } } },
            { description: { contains: lowerQuery, mode: "insensitive" } },
            { affiliation: { contains: lowerQuery, mode: "insensitive" } },
          ],
          status: "ACTIVE",
        },
        include: {
          city: true,
          country: true,
          courses: { take: 4 },
        },
        take: 3,
      });

      if (dbColleges.length > 0) {
        const primaryCol = dbColleges[0];
        const feeInfo = primaryCol.courses.length > 0
          ? `Fees start at ₹${Number(primaryCol.courses[0].annualFees).toLocaleString()}/yr`
          : "Tuition fees on request";
        const rankInfo = primaryCol.nirfRanking ? ` (NIRF #${primaryCol.nirfRanking})` : "";
        const scholarshipText = primaryCol.hasScholarship ? "\n• **Scholarships:** Financial aid & tuition waivers available!" : "";
        const cutoffText = primaryCol.hasEntranceExam ? `\n• **Accepted Cutoffs:** ${primaryCol.entranceExamDetails || "Entrance test scores required"}` : "";
        const coursesList = primaryCol.courses.map((c: any) => `${c.name} (${c.degree})`).join(", ");
        const coursesText = coursesList ? `\n• **Popular Courses:** ${coursesList}` : "";

        return NextResponse.json({
          reply: `🏫 **${primaryCol.name}**${rankInfo}\n📍 ${primaryCol.city.name}, ${primaryCol.country.name}\n\n${primaryCol.description.slice(0, 200)}...\n\n• **Type:** ${primaryCol.collegeType}\n• **Tuition:** ${feeInfo}${scholarshipText}${cutoffText}${coursesText}\n\nClick below to explore full degree programmes, cut-off ranks, and apply directly!`,
          actionLink: `/colleges/${primaryCol.id}`,
          actionLabel: `Explore ${primaryCol.name}`,
        });
      }
    } catch (e) {
      console.error("DB Chatbot search error:", e);
    }

    // 2. Comprehensive Knowledge Base Intent Matching
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

    // 3. Smart Contextual Fallback Response
    return NextResponse.json({
      reply: `✨ **ILMIKA Education Assistant**\n\nI can answer questions regarding:\n\n• **University Search:** 12,000+ colleges across 180+ countries.\n• **Scholarships & Cutoffs:** Fee waivers, JEE, NEET, CAT, SAT, IELTS requirements.\n• **Applications & Counselling:** Applying online or booking 1-on-1 advisor sessions.\n• **College Admin Portal:** Listing campuses & managing course fees.\n\nTry asking: *"What are the JEE cutoffs for B.Tech?"*, *"How do I apply for scholarships?"*, or enter any college/city name!`,
      actionLink: "/colleges",
      actionLabel: "Browse Global Colleges",
    });
  } catch (error) {
    console.error("AI Chatbot error:", error);
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}
