import type { MetadataRoute } from "next";
import { fetchPublishedProperties } from "@/lib/properties";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://renthimalayas.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rooms-for-rent-in-sirmaur`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rooms-for-rent-in-solan`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rooms-for-rent-in-shimla`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const properties = await fetchPublishedProperties(null, 100);
    const propertyRoutes: MetadataRoute.Sitemap = properties.map((prop) => ({
      url: `${baseUrl}/property/${prop.id}`,
      lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...propertyRoutes];
  } catch (err) {
    console.warn("Sitemap dynamic property fetch warning:", err);
    return staticRoutes;
  }
}

