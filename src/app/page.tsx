import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { getCachedPropertiesPage } from "@/lib/properties-cache";

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
