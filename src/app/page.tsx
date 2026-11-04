import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

export const metadata: Metadata = {
  title: "Rent Himalayas | Verified Rooms, Flats & PGs for Rent in Himachal Pradesh",
  description:
    "Find verified 1BHK, 2BHK flats, rooms to rent, and student PGs across Himachal Pradesh including Nahan, Solan, and Shimla. Zero brokerage, 100% direct owner contact.",
  alternates: {
    canonical: "https://renthimalayas.com",
  },
  openGraph: {
    title: "Rent Himalayas | Rooms & Flats for Rent in Himachal Pradesh",
    description:
      "Find verified rooms, 1BHK/2BHK flats and PGs in Himachal Pradesh with direct owner contact and zero brokerage.",
    url: "https://renthimalayas.com",
    siteName: "Rent Himalayas",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rent Himalayas" }],
  },
};

async function HomeDataLoader() {
  const initialPage = await getCachedPropertiesPage(null).catch(() => ({
    items: [],
    nextCursor: null,
  }));
  return <HomeClient initialPage={initialPage} />;
}

export default function Page() {
  return (
    <Suspense fallback={<HomeClient />}>
      <HomeDataLoader />
    </Suspense>
  );
}
