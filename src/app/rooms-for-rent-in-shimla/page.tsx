import type { Metadata } from "next";
import MarketplaceView from "@/components/MarketplaceView";

export const metadata: Metadata = {
  title: "Rooms for Rent in Shimla, HP | Rent Himalayas",
  description:
    "Find verified 1BHK/2BHK flats, rooms for rent, and student PGs in Shimla across Sanjauli, The Ridge, Kasumpti, and Mall Road with direct owner contact and zero brokerage.",
};

export default function RoomsForRentInShimlaPage() {
  return (
    <MarketplaceView
      initialDistrict="Shimla"
      defaultCity="Shimla"
      pageTitle="Rooms for Rent in Shimla, HP"
    />
  );
}
