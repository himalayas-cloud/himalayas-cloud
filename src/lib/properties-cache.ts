import "server-only";
import { unstable_cache } from "next/cache";
import sharp from "sharp";
import {
  fetchPublishedPage,
  fetchPublishedProperties,
  fetchPropertyWithImages,
  PropertiesPageResult,
} from "./properties";

export const PAGE_SIZE = 60;

async function compressServerThumb(base64Str: string): Promise<string> {
  if (!base64Str || !base64Str.startsWith("data:image") || base64Str.length < 15_000) {
    return base64Str;
  }
  try {
    const commaIdx = base64Str.indexOf(",");
    const raw = commaIdx !== -1 ? base64Str.slice(commaIdx + 1) : base64Str;
    const inputBuffer = Buffer.from(raw, "base64");
    // High-definition 720px thumbnail with mozjpeg compression for crisp Retina clarity
    const thumbBuffer = await sharp(inputBuffer)
      .resize({ width: 720, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
  } catch {
    return base64Str;
  }
}

async function sanitizePageResult(page: PropertiesPageResult): Promise<PropertiesPageResult> {
  const sanitizedItems = await Promise.all(
    page.items.map(async (item) => {
      const allCandidatePhotos: string[] =
        (Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : null) ||
        (Array.isArray(item.thumbs) && item.thumbs.length > 0 ? item.thumbs : null) ||
        (item.coverThumb ? [item.coverThumb] : []);

      const compressedPhotos = await Promise.all(
        allCandidatePhotos.map((p) =>
          typeof p === "string" && p.startsWith("data:image") && p.length > 15_000
            ? compressServerThumb(p)
            : Promise.resolve(p)
        )
      );

      const coverThumb = compressedPhotos[0] || item.coverThumb || "";

      const { photos: _p, images: _i, ...rest } = item as any;

      return {
        ...rest,
        coverThumb,
        thumbs: coverThumb ? [coverThumb] : [],
        photos: compressedPhotos,
      };
    })
  );
  return { ...page, items: sanitizedItems };
}

export function getCachedPropertiesPage(
  cursor: string | null = null,
  district: string | null = null
): Promise<PropertiesPageResult> {
  const cacheKey = ["properties-page-v9", district || "all", cursor || "initial"];
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
  const cacheKey = ["properties-all-v8", district || "all"];
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
