import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

export const metadata: Metadata = {
  title: "Rent Himalayas | Rooms & Flats for Rent in Himachal",
  description:
    "Find verified rooms, 1BHK/2BHK flats, and student PGs across Himachal with direct owner contact and zero brokerage.",
  alternates: {
    canonical: "https://renthimalayas.com",
    languages: {
      en: "https://renthimalayas.com",
      "x-default": "https://renthimalayas.com",
    },
  },
  openGraph: {
    title: "Rent Himalayas | Rooms & Flats for Rent in Himachal",
    description:
      "Find verified rooms, 1BHK/2BHK flats, and student PGs across Himachal with direct owner contact and zero brokerage.",
    url: "https://renthimalayas.com",
    siteName: "Rent Himalayas",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rent Himalayas" }],
  },
};

export default async function Page() {
  const initialPage = await getCachedPropertiesPage(null).catch(() => ({
    items: [],
    nextCursor: null,
  }));
  return <HomeClient initialPage={initialPage} />;
}
