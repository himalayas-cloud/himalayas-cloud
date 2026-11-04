import "server-only";
import { unstable_cache } from "next/cache";
import {
  fetchPublishedPage,
  fetchPublishedProperties,
  fetchPropertyWithImages,
  PropertiesPageResult,
} from "./properties";

export const PAGE_SIZE = 8;

export function getCachedPropertiesPage(cursor: string | null = null): Promise<PropertiesPageResult> {
  const cacheKey = ["properties-page", cursor || "initial"];
  return unstable_cache(
    () => fetchPublishedPage(cursor, PAGE_SIZE),
    cacheKey,
    {
      tags: ["properties"],
      revalidate: 600,
    }
  )();
}

export const getCachedProperties = unstable_cache(
  fetchPublishedProperties,
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
