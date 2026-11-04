import { Suspense } from "react";
import type { Metadata } from "next";
import MarketplaceView from "@/components/MarketplaceView";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

export const metadata: Metadata = {
  title: "Rooms for Rent in Shimla, HP | Rent Himalayas",
  description:
    "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Shimla across Sanjauli, The Ridge, Kasumpti, and Mall Road with direct owner contact and zero brokerage.",
  alternates: {
    canonical: "https://renthimalayas.com/rooms-for-rent-in-shimla",
  },
  openGraph: {
    title: "Rooms for Rent in Shimla, HP | Rent Himalayas",
    description:
      "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Shimla across Sanjauli, Kasumpti, Mall Road with zero brokerage.",
    url: "https://renthimalayas.com/rooms-for-rent-in-shimla",
    siteName: "Rent Himalayas",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rent Himalayas Shimla" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rooms for Rent in Shimla, HP | Rent Himalayas",
    description:
      "Find verified rental homes, 1BHK/2BHK flats and rooms in Shimla with direct owner contact and zero brokerage.",
    images: ["/logo.png"],
  },
};

const shimlaSchema = {
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
          name: "Rooms for Rent in Shimla",
          item: "https://renthimalayas.com/rooms-for-rent-in-shimla",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": "https://renthimalayas.com/rooms-for-rent-in-shimla#webpage",
      url: "https://renthimalayas.com/rooms-for-rent-in-shimla",
      name: "Rooms and Flats for Rent in Shimla District, Himachal Pradesh",
      description:
        "Verified direct owner rental rooms, flats, student accommodation and PGs in Shimla across Sanjauli, Kasumpti, and Mall Road.",
      isPartOf: {
        "@id": "https://renthimalayas.com/#website",
      },
      about: {
        "@type": "Place",
        name: "Shimla District, Himachal Pradesh",
      },
    },
  ],
};

async function ShimlaLoader() {
  const initialPage = await getCachedPropertiesPage(null, "Shimla").catch(() => ({
    items: [],
    nextCursor: null,
  }));

  return (
    <MarketplaceView
      initialDistrict="Shimla"
      defaultCity="Shimla"
      pageTitle="Rooms for Rent in Shimla, HP"
      initialPage={initialPage}
    />
  );
}

export default function RoomsForRentInShimlaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shimlaSchema) }}
      />
      <Suspense
        fallback={
          <MarketplaceView
            initialDistrict="Shimla"
            defaultCity="Shimla"
            pageTitle="Rooms for Rent in Shimla, HP"
          />
        }
      >
        <ShimlaLoader />
      </Suspense>
    </>
  );
}
