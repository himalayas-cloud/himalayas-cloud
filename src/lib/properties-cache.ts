import "server-only";
import { unstable_cache } from "next/cache";
import {
  fetchPublishedPage,
  fetchPublishedProperties,
  fetchPropertyWithImages,
  PropertiesPageResult,
} from "./properties";

export const PAGE_SIZE = 8;

export function getCachedPropertiesPage(
  cursor: string | null = null,
  district: string | null = null
): Promise<PropertiesPageResult> {
  const cacheKey = ["properties-page-v3", district || "all", cursor || "initial"];
  return unstable_cache(
    () => fetchPublishedPage(cursor, PAGE_SIZE, district),
    cacheKey,
    {
      tags: district ? ["properties", `district:${district}`] : ["properties"],
      revalidate: 600,
    }
  )();
}

export function getCachedAllProperties(district: string | null = null) {
  const cacheKey = ["properties-all-v3", district || "all"];
  return unstable_cache(
    () => fetchPublishedProperties(district, 100),
    cacheKey,
    {
      tags: district ? ["properties", `district:${district}`] : ["properties"],
      revalidate: 600,
    }
  )();
}

export const getCachedProperties = unstable_cache(
  () => fetchPublishedProperties(null, 100),
  ["published-properties"],
  { tags: ["properties"], revalidate: 600 }
);

export function getCachedProperty(id: string) {
  return unstable_cache(
    () => fetchPropertyWithImages(id),
    ["property", id],
    {
      tags: ["properties", `property:${id}`],
      revalidate: 600,
    }
  )();
}
