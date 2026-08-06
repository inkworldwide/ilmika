import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ink EduVerse — Find Colleges & Courses Worldwide",
    template: "%s | Ink EduVerse",
  },
  description: "Search and compare 12,000+ colleges and 50,000+ courses across 180+ countries. Find Bachelor's, Master's, PhD, and online programmes. Apply directly, book counselling, and discover scholarships on Ink EduVerse.",
  metadataBase: new URL("https://inkedulverse.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ink EduVerse — One Universe. All Knowledge.",
    description: "The world's premier platform for discovering and comparing colleges & courses across every country. Search, shortlist, apply, and get counselled.",
    url: "https://inkedulverse.com",
    siteName: "Ink EduVerse",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "college search", "university search", "courses abroad", "study abroad",
    "scholarships", "entrance exams", "JEE", "NEET", "CAT", "IELTS",
    "bachelor degree", "master degree", "MBA", "PhD", "online courses",
    "engineering colleges", "medical colleges", "law colleges",
    "colleges in India", "universities in USA", "universities in UK",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-secondary text-primary">
        {children}
      </body>
    </html>
  );
}
