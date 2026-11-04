import type { Metadata } from "next";
import MarketplaceView from "@/components/MarketplaceView";

export const metadata: Metadata = {
  title: "Rooms for Rent in Sirmaur, HP | Rent Himalayas",
  description:
    "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Sirmaur across Nahan, Paonta Sahib, Kala Amb, and Shillai with direct owner contact and zero brokerage.",
};

export default function RoomsForRentInSirmaurPage() {
  return (
    <MarketplaceView
      initialDistrict="Sirmaur"
      defaultCity="Sirmaur"
      pageTitle="Rooms for Rent in Sirmaur, HP"
    />
  );
}
