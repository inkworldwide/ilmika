export interface StreamConfig {
  id: string;
  name: string;
  streamParam: string;
  degreeType: "UNDERGRADUATE" | "POSTGRADUATE" | "PHD" | "DIPLOMA" | "ONLINE" | "ALL";
  iconName: string;
  description: string;
  isVisible: boolean;
  isFeaturedHome: boolean;
  isDeleted?: boolean;
  branchesCount: number;
  branches: string[];
}

export let INITIAL_STREAMS: StreamConfig[] = [
  // ── UNDERGRADUATE STREAMS ──
  {
    id: "eng-ug",
    name: "Engineering & Technology",
    streamParam: "ENGINEERING",
    degreeType: "UNDERGRADUATE",
    iconName: "Cpu",
    description: "Computer Science, AI & Data Science, Robotics, ECE, Mechanical",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 6,
    branches: ["Computer Science & Engg", "AI & Data Science", "Electronics & Comm (ECE)", "Electrical & Electronics (EEE)", "Mechanical Engineering", "Civil Engineering"]
  },
  {
    id: "med-ug",
    name: "Medical & Health Sciences",
    streamParam: "MEDICAL",
    degreeType: "UNDERGRADUATE",
    iconName: "Stethoscope",
    description: "MBBS, BDS Dental, Nursing, Physiotherapy, Pharmacy",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 6,
    branches: ["MBBS Medicine", "BDS Dental Surgery", "B.Pharm Pharmacy", "Physiotherapy (BPT)", "B.Sc Nursing", "Biotechnology"]
  },
  {
    id: "biz-ug",
    name: "Business & Management",
    streamParam: "MANAGEMENT",
    degreeType: "UNDERGRADUATE",
    iconName: "Briefcase",
    description: "BBA, BBM, Business Analytics, Finance, Marketing",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 6,
    branches: ["BBA General", "Finance & Banking", "Marketing & HR", "International Business", "Digital Marketing", "Supply Chain"]
  },
  {
    id: "law-ug",
    name: "Law & Legal Studies",
    streamParam: "LAW",
    degreeType: "UNDERGRADUATE",
    iconName: "Scale",
    description: "BA LLB, BBA LLB, Corporate Law, Cyber Law, Criminal Law",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 5,
    branches: ["BA LLB (Hons)", "BBA LLB (Hons)", "Corporate Law", "Cyber & Tech Law", "Intellectual Property"]
  },
  {
    id: "arts-ug",
    name: "Arts & Humanities",
    streamParam: "ARTS",
    degreeType: "UNDERGRADUATE",
    iconName: "BookOpen",
    description: "Psychology, Political Science, Journalism, Literature, History",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 5,
    branches: ["Psychology", "Political Science", "Journalism & Mass Comm", "English Literature", "Economics"]
  },
  {
    id: "comm-ug",
    name: "Commerce & Finance",
    streamParam: "COMMERCE",
    degreeType: "UNDERGRADUATE",
    iconName: "TrendingUp",
    description: "B.Com, Chartered Accountancy, Financial Analysis, Taxation",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 5,
    branches: ["B.Com General", "Accounting & Finance", "Banking & Insurance", "Financial Markets", "Taxation & Audit"]
  },
  {
    id: "sci-ug",
    name: "Science & Research",
    streamParam: "SCIENCE",
    degreeType: "UNDERGRADUATE",
    iconName: "FlaskConical",
    description: "Physics, Chemistry, Biotechnology, Data Analytics, Math",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 5,
    branches: ["Biotechnology", "Data Analytics", "Physics & Astronomy", "Chemistry", "Mathematics & Statistics"]
  },
  {
    id: "des-ug",
    name: "Design & Architecture",
    streamParam: "DESIGN",
    degreeType: "UNDERGRADUATE",
    iconName: "Palette",
    description: "UI/UX Design, Fashion Design, Interior Design, B.Arch",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 4,
    branches: ["UI/UX Product Design", "B.Arch Architecture", "Fashion & Textile Design", "Interior & Spatial Design"]
  },
  {
    id: "it-ug",
    name: "Information Technology",
    streamParam: "INFORMATION_TECHNOLOGY",
    degreeType: "UNDERGRADUATE",
    iconName: "Laptop",
    description: "BCA, Cloud Computing, Cyber Security, Web Dev",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 4,
    branches: ["BCA Computer Applications", "Cyber Security", "Cloud Computing & DevOps", "Software Engineering"]
  },
  {
    id: "pharm-ug",
    name: "Pharmacy",
    streamParam: "PHARMACY",
    degreeType: "UNDERGRADUATE",
    iconName: "Pill",
    description: "B.Pharm, Pharm.D, Pharmaceutical Chemistry",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["B.Pharm 4-Year", "Pharm.D Doctorate", "Pharmaceutical Chemistry", "Pharmacology"]
  },
  {
    id: "agri-ug",
    name: "Agriculture Sciences",
    streamParam: "AGRICULTURE",
    degreeType: "UNDERGRADUATE",
    iconName: "Sprout",
    description: "B.Sc Agriculture, Agronomy, Horticulture, Food Tech",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["Agronomy & Soil Science", "Horticulture", "Food Technology", "Agricultural Engineering"]
  },
  {
    id: "hotel-ug",
    name: "Hotel & Hospitality Management",
    streamParam: "HOTEL_MANAGEMENT",
    degreeType: "UNDERGRADUATE",
    iconName: "Hotel",
    description: "BHM, Culinary Arts, Tourism & Travel Management",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["Hotel Management (BHM)", "Culinary Arts", "Travel & Tourism", "Event Management"]
  },

  // ── POSTGRADUATE STREAMS ──
  {
    id: "eng-pg",
    name: "Engineering & M.Tech",
    streamParam: "ENGINEERING",
    degreeType: "POSTGRADUATE",
    iconName: "Cpu",
    description: "M.Tech Computer Science, VLSI, AI Robotics, Thermal Engg",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 5,
    branches: ["M.Tech Computer Science", "Data Science & AI", "VLSI Systems", "Structural Engineering", "Robotics"]
  },
  {
    id: "biz-pg",
    name: "MBA / Business Management",
    streamParam: "MANAGEMENT",
    degreeType: "POSTGRADUATE",
    iconName: "Briefcase",
    description: "MBA Finance, Marketing, HR, Business Analytics, Executive MBA",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 6,
    branches: ["MBA Finance", "MBA Marketing", "Executive MBA", "Business Analytics", "HR Management", "International Business"]
  },
  {
    id: "med-pg",
    name: "Medical & MD Clinical",
    streamParam: "MEDICAL",
    degreeType: "POSTGRADUATE",
    iconName: "Stethoscope",
    description: "MD Internal Medicine, MS Surgery, MDS Dental Masters, M.Pharm",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 5,
    branches: ["MD General Medicine", "MS General Surgery", "MDS Dental", "M.Pharm Pharmacology", "M.Sc Medical Biotech"]
  },
  {
    id: "law-pg",
    name: "LLM Law Masters",
    streamParam: "LAW",
    degreeType: "POSTGRADUATE",
    iconName: "Scale",
    description: "LLM Corporate Law, Constitutional Law, International Trade Law",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["LLM Corporate Law", "Constitutional Law", "International Law", "Intellectual Property Rights"]
  },
  {
    id: "arts-pg",
    name: "MA / Arts Masters",
    streamParam: "ARTS",
    degreeType: "POSTGRADUATE",
    iconName: "BookOpen",
    description: "MA Clinical Psychology, International Relations, Mass Comm",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["MA Clinical Psychology", "MA Economics", "MA International Relations", "MA Mass Communication"]
  },
  {
    id: "comm-pg",
    name: "M.Com & Financial Studies",
    streamParam: "COMMERCE",
    degreeType: "POSTGRADUATE",
    iconName: "TrendingUp",
    description: "M.Com Finance, Banking Management, Actuarial Science",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 3,
    branches: ["M.Com Accounting & Finance", "Banking & Risk Management", "Actuarial Science"]
  },
  {
    id: "sci-pg",
    name: "M.Sc Science Research",
    streamParam: "SCIENCE",
    degreeType: "POSTGRADUATE",
    iconName: "FlaskConical",
    description: "M.Sc Physics, Organic Chemistry, Molecular Biology, Math",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["M.Sc Organic Chemistry", "M.Sc Biotechnology", "M.Sc Physics", "M.Sc Mathematics"]
  },
  {
    id: "it-pg",
    name: "MCA / IT Masters",
    streamParam: "INFORMATION_TECHNOLOGY",
    degreeType: "POSTGRADUATE",
    iconName: "Laptop",
    description: "MCA Master of Computer Applications, M.Sc Data Science",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 3,
    branches: ["MCA Computer Applications", "M.Sc Data Science & AI", "M.Sc Cybersecurity"]
  },
  {
    id: "agri-pg",
    name: "M.Sc Agriculture Sciences",
    streamParam: "AGRICULTURE",
    degreeType: "POSTGRADUATE",
    iconName: "Sprout",
    description: "M.Sc Agronomy, Plant Pathology, Agricultural Economics",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 3,
    branches: ["M.Sc Agronomy", "Plant Breeding & Genetics", "Agricultural Economics"]
  },

  // ── PHD STREAMS ──
  {
    id: "eng-phd",
    name: "Engineering Doctoral Research",
    streamParam: "ENGINEERING",
    degreeType: "PHD",
    iconName: "Cpu",
    description: "PhD Computer Science, Nanotechnology, Renewable Energy",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 3,
    branches: ["PhD Computer Science", "PhD Nanotechnology", "PhD Renewable Energy"]
  },
  {
    id: "biz-phd",
    name: "Management Research (PhD)",
    streamParam: "MANAGEMENT",
    degreeType: "PHD",
    iconName: "Briefcase",
    description: "PhD Business Policy, Financial Markets, Organizational Behavior",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 3,
    branches: ["PhD Finance & Banking", "PhD Strategic Management", "PhD Marketing Strategy"]
  },
  {
    id: "med-phd",
    name: "Medical & Biomedical PhD",
    streamParam: "MEDICAL",
    degreeType: "PHD",
    iconName: "Stethoscope",
    description: "PhD Oncology Research, Epidemiology, Genetics & Genomics",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 3,
    branches: ["PhD Biomedical Sciences", "PhD Cancer Research", "PhD Human Genetics"]
  },

  // ── DIPLOMA STREAMS ──
  {
    id: "eng-dip",
    name: "Polytechnic Engineering Diploma",
    streamParam: "ENGINEERING",
    degreeType: "DIPLOMA",
    iconName: "Cpu",
    description: "3-Year Diploma in CS, Civil, Mechanical, Automobile",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 4,
    branches: ["Diploma Computer Engg", "Diploma Mechanical Engg", "Diploma Civil Engg", "Diploma Electrical"]
  },
  {
    id: "pharm-dip",
    name: "D.Pharm Pharmacy Diploma",
    streamParam: "PHARMACY",
    degreeType: "DIPLOMA",
    iconName: "Pill",
    description: "2-Year Diploma in Pharmacy (D.Pharm)",
    isVisible: true,
    isFeaturedHome: false,
    isDeleted: false,
    branchesCount: 2,
    branches: ["D.Pharm Pharmacy", "Diploma Clinical Pharmacy"]
  },

  // ── ONLINE STREAMS ──
  {
    id: "online-mba",
    name: "Online Business & MBA",
    streamParam: "MANAGEMENT",
    degreeType: "ONLINE",
    iconName: "Briefcase",
    description: "100% Online Accredited MBA & Executive Management",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 4,
    branches: ["Online MBA General", "Online BBA Degree", "Distance Finance Certification", "Online Business Analytics"]
  },
  {
    id: "online-it",
    name: "Online MCA & Computer Studies",
    streamParam: "INFORMATION_TECHNOLOGY",
    degreeType: "ONLINE",
    iconName: "Laptop",
    description: "Online BCA, MCA, Full-Stack Software Engineering",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: 3,
    branches: ["Online MCA Degree", "Online BCA Degree", "Full-Stack Dev Bootcamp"]
  }
];

export function getStreamsConfig(): StreamConfig[] {
  return INITIAL_STREAMS;
}

export function updateStreamVisibility(id: string, isVisible: boolean, isFeaturedHome?: boolean): StreamConfig | null {
  const stream = INITIAL_STREAMS.find((s) => s.id === id);
  if (stream) {
    stream.isVisible = isVisible;
    if (typeof isFeaturedHome === "boolean") {
      stream.isFeaturedHome = isFeaturedHome;
    }
    return stream;
  }
  return null;
}

export function deleteStreamConfig(id: string): boolean {
  const index = INITIAL_STREAMS.findIndex((s) => s.id === id);
  if (index !== -1) {
    INITIAL_STREAMS[index].isDeleted = true;
    INITIAL_STREAMS[index].isVisible = false;
    return true;
  }
  return false;
}

export function restoreStreamConfig(id: string): boolean {
  const index = INITIAL_STREAMS.findIndex((s) => s.id === id);
  if (index !== -1) {
    INITIAL_STREAMS[index].isDeleted = false;
    INITIAL_STREAMS[index].isVisible = true;
    return true;
  }
  return false;
}

export function permanentDeleteStreamConfig(id: string): boolean {
  const index = INITIAL_STREAMS.findIndex((s) => s.id === id);
  if (index !== -1) {
    INITIAL_STREAMS.splice(index, 1);
    return true;
  }
  return false;
}

export function addStreamConfig(newStream: Partial<StreamConfig>): StreamConfig {
  const created: StreamConfig = {
    id: `stream-${Date.now()}`,
    name: newStream.name || "Custom Stream",
    streamParam: (newStream.streamParam || newStream.name || "CUSTOM").toUpperCase().replace(/\s+/g, "_"),
    degreeType: (newStream.degreeType as any) || "UNDERGRADUATE",
    iconName: newStream.iconName || "BookOpen",
    description: newStream.description || "Custom stream description",
    isVisible: true,
    isFeaturedHome: true,
    isDeleted: false,
    branchesCount: newStream.branches?.length || 1,
    branches: newStream.branches || ["General Studies"],
  };
  INITIAL_STREAMS.unshift(created);
  return created;
}

export function addBranchToStreamConfig(id: string, branchName: string): StreamConfig | null {
  const stream = INITIAL_STREAMS.find((s) => s.id === id);
  if (stream) {
    if (!stream.branches.includes(branchName.trim())) {
      stream.branches.push(branchName.trim());
      stream.branchesCount = stream.branches.length;
    }
    return stream;
  }
  return null;
}

export function deleteBranchFromStreamConfig(id: string, branchName: string): StreamConfig | null {
  const stream = INITIAL_STREAMS.find((s) => s.id === id);
  if (stream) {
    stream.branches = stream.branches.filter((b) => b !== branchName);
    stream.branchesCount = stream.branches.length;
    return stream;
  }
  return null;
}
