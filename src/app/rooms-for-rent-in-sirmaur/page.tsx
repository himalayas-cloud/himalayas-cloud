import type { Metadata } from "next";
import MarketplaceView from "@/components/MarketplaceView";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

export const metadata: Metadata = {
  title: "Rooms for Rent in Sirmaur, HP | Rent Himalayas",
  description:
    "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Sirmaur across Nahan, Paonta Sahib, Kala Amb, and Shillai with direct owner contact and zero brokerage.",
  alternates: {
    canonical: "https://renthimalayas.com/rooms-for-rent-in-sirmaur",
  },
  openGraph: {
    title: "Rooms for Rent in Sirmaur, HP | Rent Himalayas",
    description:
      "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Sirmaur across Nahan, Paonta Sahib, Kala Amb with direct owner contact and zero brokerage.",
    url: "https://renthimalayas.com/rooms-for-rent-in-sirmaur",
    siteName: "Rent Himalayas",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rent Himalayas Sirmaur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rooms for Rent in Sirmaur, HP | Rent Himalayas",
    description:
      "Find verified rental homes, 1BHK/2BHK flats and rooms in Sirmaur with direct owner contact and zero brokerage.",
    images: ["/logo.png"],
  },
};

const sirmaurSchema = {
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
          name: "Rooms for Rent in Sirmaur",
          item: "https://renthimalayas.com/rooms-for-rent-in-sirmaur",
        },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": "https://renthimalayas.com/rooms-for-rent-in-sirmaur#webpage",
      url: "https://renthimalayas.com/rooms-for-rent-in-sirmaur",
      name: "Rooms and Flats for Rent in Sirmaur District, Himachal Pradesh",
      description:
        "Verified direct owner rental rooms, flats, student accommodation and PGs in Sirmaur across Nahan, Paonta Sahib, and Kala Amb.",
      isPartOf: {
        "@id": "https://renthimalayas.com/#website",
      },
      about: {
        "@type": "Place",
        name: "Sirmaur District, Himachal Pradesh",
      },
    },
  ],
};

export default async function RoomsForRentInSirmaurPage() {
  const initialPage = await getCachedPropertiesPage(null, "Sirmaur").catch(() => ({
    items: [],
    nextCursor: null,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sirmaurSchema) }}
      />
      <MarketplaceView
        initialDistrict="Sirmaur"
        defaultCity="Sirmaur"
        pageTitle="Rooms for Rent in Sirmaur, HP"
        initialPage={initialPage}
      />
    </>
  );
}
