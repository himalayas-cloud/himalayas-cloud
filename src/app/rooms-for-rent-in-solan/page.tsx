import { Suspense } from "react";
import type { Metadata } from "next";
import MarketplaceView from "@/components/MarketplaceView";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

export const metadata: Metadata = {
  title: "Rooms for Rent in Solan, HP | Rent Himalayas",
  description:
    "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Solan across Solan Town, Chambaghat, Baddi, and Dharampur with direct owner contact and zero brokerage.",
  alternates: {
    canonical: "https://renthimalayas.com/rooms-for-rent-in-solan",
  },
  openGraph: {
    title: "Rooms for Rent in Solan, HP | Rent Himalayas",
    description:
      "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Solan across Chambaghat, Baddi, Dharampur with zero brokerage.",
    url: "https://renthimalayas.com/rooms-for-rent-in-solan",
    siteName: "Rent Himalayas",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rent Himalayas Solan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rooms for Rent in Solan, HP | Rent Himalayas",
    description:
      "Find verified rental homes, 1BHK/2BHK flats and rooms in Solan with direct owner contact and zero brokerage.",
    images: ["/logo.png"],
  },
};

const solanSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://renthimalayas.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Rooms for Rent in Solan",
          item: "https://renthimalayas.com/rooms-for-rent-in-solan",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": "https://renthimalayas.com/rooms-for-rent-in-solan#webpage",
      url: "https://renthimalayas.com/rooms-for-rent-in-solan",
      name: "Rooms and Flats for Rent in Solan District, Himachal Pradesh",
      description:
        "Verified direct owner rental rooms, flats, student accommodation and PGs in Solan across Chambaghat, Baddi, and Dharampur.",
      isPartOf: {
        "@id": "https://renthimalayas.com/#website",
      },
      about: {
        "@type": "Place",
        name: "Solan District, Himachal Pradesh",
      },
    },
  ],
};

async function SolanLoader() {
  const initialPage = await getCachedPropertiesPage(null, "Solan").catch(() => ({
    items: [],
    nextCursor: null,
  }));

  return (
    <MarketplaceView
      initialDistrict="Solan"
      defaultCity="Solan"
      pageTitle="Rooms for Rent in Solan, HP"
      initialPage={initialPage}
    />
  );
}

export default function RoomsForRentInSolanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(solanSchema) }}
      />
      <Suspense
        fallback={
          <MarketplaceView
            initialDistrict="Solan"
            defaultCity="Solan"
            pageTitle="Rooms for Rent in Solan, HP"
          />
        }
      >
        <SolanLoader />
      </Suspense>
    </>
  );
}
