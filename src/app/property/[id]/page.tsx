import { Suspense } from "react";
import { getCachedProperty } from "@/lib/properties-cache";
import PropertyDetailClient from "@/components/PropertyDetailClient";

async function PropertyDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialProperty = await getCachedProperty(id).catch(() => null);
  return <PropertyDetailClient id={id} initialProperty={initialProperty} />;
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <PropertyDetailLoader params={params} />
    </Suspense>
  );
}
