import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Re One Stop Page — Premium Real Estate Platform in India",
    template: "%s | Re One Stop Page",
  },
  description: "Browse verified residential apartments, independent villas, builder floors, PGs, and commercial workspaces in India. Lease, buy, or rent with zero brokerage hassles.",
  metadataBase: new URL("https://rentahouse.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Re One Stop Page — Premium Indian Real Estate Platform",
    description: "Browse verified apartments, PGs, villas, and workspaces in India. Experience seamless digital leasing and direct landlord messaging.",
    url: "https://rentahouse.in",
    siteName: "Re One Stop Page",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
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
