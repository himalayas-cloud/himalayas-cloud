import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F26A1B",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://renthimalayas.com"),
  title: {
    default: "Rent Himalayas | Verified Rooms, Flats & PGs for Rent in Himachal",
    template: "%s | Rent Himalayas",
  },
  description:
    "Find verified rental homes, 1BHK/2BHK flats, rooms for rent, and student PGs in Himachal Pradesh across Nahan, Paonta Sahib, Solan, and Shimla with direct owner contact and zero brokerage.",
  applicationName: "Rent Himalayas",
  keywords: [
    "rooms for rent in Himachal Pradesh",
    "rooms for rent in Sirmaur",
    "rooms for rent in Nahan",
    "flats for rent in Nahan",
    "PG in Solan",
    "rooms for rent in Solan",
    "rooms for rent in Shimla",
    "flats for rent in Paonta Sahib",
    "1BHK in Nahan",
    "2BHK in Nahan",
    "student accommodation Himachal",
    "roommate finder Himachal Pradesh",
    "direct owner rental Himachal",
    "zero brokerage rooms Himachal",
  ],
  authors: [{ name: "Rent Himalayas Team", url: "https://renthimalayas.com" }],
  creator: "Rent Himalayas",
  publisher: "Rent Himalayas",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rent Himalayas | Verified Rooms, Flats & PGs in Himachal",
    description:
      "Direct owner rental marketplace for Himachal Pradesh. Find verified rooms, flats, and student PGs in Sirmaur, Solan, and Shimla with zero brokerage.",
    url: "https://renthimalayas.com",
    siteName: "Rent Himalayas",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Rent Himalayas Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent Himalayas | Verified Rooms, Flats & PGs in Himachal",
    description:
      "Direct owner rental marketplace for Himachal Pradesh. Find verified rooms, flats, and student PGs with zero brokerage.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  other: {
    "geo.region": "IN-HP",
    "geo.placename": "Himachal Pradesh, India",
    "geo.position": "30.5599;77.2955",
    ICBM: "30.5599, 77.2955",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://renthimalayas.com/#organization",
      name: "Rent Himalayas",
      url: "https://renthimalayas.com",
      logo: {
        "@type": "ImageObject",
        url: "https://renthimalayas.com/logo.png",
      },
      description:
        "Direct-to-owner rental housing marketplace for Himachal Pradesh, India, offering zero brokerage rooms, flats, and PGs.",
      areaServed: {
        "@type": "State",
        name: "Himachal Pradesh",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://renthimalayas.com/#website",
      url: "https://renthimalayas.com",
      name: "Rent Himalayas",
      publisher: {
        "@id": "https://renthimalayas.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://renthimalayas.com/rooms-for-rent-in-sirmaur?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="6cad8032-aa4a-4078-85dd-a4985db54790"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
