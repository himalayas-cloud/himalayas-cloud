import { Suspense } from "react";
import type { Metadata } from "next";
import { getCachedProperty } from "@/lib/properties-cache";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getCachedProperty(id).catch(() => null);

  if (!property) {
    return {
      title: "Property Listing | Rent Himalayas",
      description: "Verified direct owner rental listing on Rent Himalayas.",
    };
  }

  const title = `${property.title} in ${property.locality ? `${property.locality}, ` : ""}${property.city} | Rent Himalayas`;
  const description = `₹${property.monthlyRent?.toLocaleString("en-IN")}/mo • ${property.propertyType || "Room"} for rent in ${property.city}, ${property.district}, Himachal Pradesh. Direct owner contact: ${property.ownerName || "Owner"}. Zero brokerage.`;
  const canonical = `https://renthimalayas.com/property/${id}`;
  const imageUrl =
    property.coverThumb ||
    (property.photos && property.photos[0]) ||
    "https://renthimalayas.com/logo.png";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Rent Himalayas",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: imageUrl,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

async function PropertyDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialProperty = await getCachedProperty(id).catch(() => null);

  const propertySchema = initialProperty
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "@id": `https://renthimalayas.com/property/${id}#listing`,
        name: initialProperty.title,
        description: initialProperty.description,
        url: `https://renthimalayas.com/property/${id}`,
        image:
          initialProperty.coverThumb ||
          (initialProperty.photos && initialProperty.photos[0]) ||
          "https://renthimalayas.com/logo.png",
        offers: {
          "@type": "Offer",
          price: initialProperty.monthlyRent,
          priceCurrency: "INR",
        },
        about: {
          "@type": "Accommodation",
          name: initialProperty.title,
          address: {
            "@type": "PostalAddress",
            addressLocality: initialProperty.locality || initialProperty.city,
            addressRegion: initialProperty.district || "Himachal Pradesh",
            addressCountry: "IN",
          },
          geo: initialProperty.coordinates
            ? {
                "@type": "GeoCoordinates",
                latitude: initialProperty.coordinates[0],
                longitude: initialProperty.coordinates[1],
              }
            : undefined,
        },
      }
    : null;

  return (
    <>
      {propertySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }}
        />
      )}
      <PropertyDetailClient id={id} initialProperty={initialProperty} />
    </>
  );
}

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <PropertyDetailLoader params={params} />
    </Suspense>
  );
}
