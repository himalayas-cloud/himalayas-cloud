import type { Metadata } from "next";
import MarketplaceView from "@/components/MarketplaceView";

export const metadata: Metadata = {
  title: "Rooms for Rent in Solan, HP | Rent Himalayas",
  description:
    "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Solan across Solan Town, Chambaghat, Baddi, and Dharampur with direct owner contact and zero brokerage.",
};

export default function RoomsForRentInSolanPage() {
  return (
    <MarketplaceView
      initialDistrict="Solan"
      defaultCity="Solan"
      pageTitle="Rooms for Rent in Solan, HP"
    />
  );
}
