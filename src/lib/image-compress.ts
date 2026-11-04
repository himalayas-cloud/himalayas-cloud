type CompressOptions = { maxWidth: number; quality: number };

export const THUMB: CompressOptions = { maxWidth: 400, quality: 0.55 };
export const FULL: CompressOptions = { maxWidth: 1280, quality: 0.72 };
export const MAX_PHOTOS = 10;
export const MAX_THUMBS_BYTES = 150_000;
export const MAX_IMAGES_DOC_BYTES = 900_000;

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let url = "";
    if (typeof source === "string") {
      img.src = source;
    } else {
      url = URL.createObjectURL(source);
      img.src = url;
    }
    img.onload = () => {
      if (url) URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      if (url) URL.revokeObjectURL(url);
      reject(err);
    };
  });
}

export async function compressToBase64(
  source: File | string,
  { maxWidth, quality }: CompressOptions
): Promise<string> {
  if (typeof source === "string" && !source.startsWith("data:")) {
    return source;
  }
  const img = await loadImage(source);
  const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return typeof source === "string" ? source : "";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Approximate bytes a base64 string will occupy inside a Firestore document. */
export function base64Bytes(dataUrl: string) {
  return Math.ceil((dataUrl.length * 3) / 4);
}

export async function prepareListingImages(sources: (File | string)[]) {
  const capped = sources.slice(0, MAX_PHOTOS);
  const thumbs: string[] = [];
  const images: string[] = [];
  let thumbsTotalBytes = 0;
  let imagesTotalBytes = 0;
  let skipped = 0;

  for (const src of capped) {
    try {
      const thumb = await compressToBase64(src, THUMB);
      const full = await compressToBase64(src, FULL);
      const thumbSize = base64Bytes(thumb);
      const fullSize = base64Bytes(full);

      // Respect Firestore document limits
      if (
        thumbsTotalBytes + thumbSize > MAX_THUMBS_BYTES ||
        imagesTotalBytes + fullSize > MAX_IMAGES_DOC_BYTES
      ) {
        skipped++;
        continue;
      }

      thumbs.push(thumb);
      images.push(full);
      thumbsTotalBytes += thumbSize;
      imagesTotalBytes += fullSize;
    } catch (err) {
      console.warn("Failed to process photo:", err);
      skipped++;
    }
  }

  return {
    thumbs,
    images,
    coverThumb: thumbs[0] || "",
    skipped: skipped + Math.max(0, sources.length - MAX_PHOTOS),
  };
}
