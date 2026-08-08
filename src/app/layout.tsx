import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalChatBot from "@/components/chat/GlobalChatBot";

export const metadata: Metadata = {
  title: {
    default: "Ilmika — Find Colleges & Courses Worldwide",
    template: "%s | Ilmika",
  },
  description: "Search and compare 12,000+ colleges and 50,000+ courses across 180+ countries. Find Bachelor's, Master's, PhD, and online programmes. Apply directly, book counselling, and discover scholarships on Ilmika.",
  metadataBase: new URL("https://ilmika.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ilmika — Your Gateway to Global Education.",
    description: "The world's premier platform for discovering and comparing colleges & courses across every country. Search, shortlist, apply, and get counselled.",
    url: "https://ilmika.com",
    siteName: "Ilmika",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
    <html lang="en" className="font-sans h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-secondary text-primary" suppressHydrationWarning>
        {children}
        <GlobalChatBot />
      </body>
    </html>
  );
}
