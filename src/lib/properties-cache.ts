import "server-only";
import { unstable_cache } from "next/cache";
import sharp from "sharp";
import {
  fetchPublishedPage,
  fetchPublishedProperties,
  fetchPropertyWithImages,
  PropertiesPageResult,
} from "./properties";

export const PAGE_SIZE = 8;

async function compressServerThumb(base64Str: string): Promise<string> {
  if (!base64Str || !base64Str.startsWith("data:image") || base64Str.length < 35_000) {
    return base64Str;
  }
  try {
    const match = base64Str.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
    const data = match ? match[1] : base64Str;
    const inputBuffer = Buffer.from(data, "base64");
    const thumbBuffer = await sharp(inputBuffer)
      .resize({ width: 720, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
  } catch {
    return base64Str;
  }
}

async function sanitizePageResult(page: PropertiesPageResult): Promise<PropertiesPageResult> {
  const sanitizedItems = await Promise.all(
    page.items.map(async (item) => {
      let coverThumb = item.coverThumb || "";
      if (coverThumb.startsWith("data:image") && coverThumb.length > 35_000) {
        coverThumb = await compressServerThumb(coverThumb);
      }
      const thumbs = await Promise.all(
        (item.thumbs || []).map((t) =>
          t.startsWith("data:image") && t.length > 35_000 ? compressServerThumb(t) : Promise.resolve(t)
        )
      );
      return {
        ...item,
        coverThumb,
        thumbs,
        photos: thumbs,
      };
    })
  );
  return { ...page, items: sanitizedItems };
}

export function getCachedPropertiesPage(
  cursor: string | null = null,
  district: string | null = null
): Promise<PropertiesPageResult> {
  const cacheKey = ["properties-page-v8", district || "all", cursor || "initial"];
  return unstable_cache(
    async () => {
      const page = await fetchPublishedPage(cursor, PAGE_SIZE, district);
      return sanitizePageResult(page);
    },
    cacheKey,
    {
      tags: district ? ["properties", `district:${district}`] : ["properties"],
      revalidate: 600,
    }
  )();
}

export function getCachedAllProperties(district: string | null = null) {
  const cacheKey = ["properties-all-v7", district || "all"];
  return unstable_cache(
    async () => {
      const items = await fetchPublishedProperties(district, 100);
      const res = await sanitizePageResult({ items, nextCursor: null });
      return res.items;
    },
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
