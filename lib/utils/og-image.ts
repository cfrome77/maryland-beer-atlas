import { urlFor } from "@/sanity/lib/image";

export interface OgImageOptions {
  width?: number;
  height?: number;
  fit?: "crop" | "clip" | "fill" | "max" | "min" | "scale";
  quality?: number;
}

export const DEFAULT_OG_IMAGE =
  "https://marylandbeeratlas.com/images/brewery-placeholder.svg";

/**
 * Transforms a Sanity image asset reference, Sanity CDN URL, or standard HTTP image URL
 * into an optimized dynamic Open Graph social sharing image asset URL.
 */
export function formatSanityOgImageUrl(
  imageSource: unknown,
  options: OgImageOptions = {}
): string {
  if (!imageSource) {
    return DEFAULT_OG_IMAGE;
  }

  const { width = 1200, height = 630, fit = "crop", quality = 80 } = options;

  try {
    // If it's a string URL
    if (typeof imageSource === "string") {
      const trimmed = imageSource.trim();
      if (!trimmed) {
        return DEFAULT_OG_IMAGE;
      }
      if (trimmed.includes("cdn.sanity.io")) {
        return urlFor(trimmed)
          .width(width)
          .height(height)
          .fit(fit)
          .quality(quality)
          .auto("format")
          .url();
      }
      return trimmed;
    }

    // If it's a Sanity image object or asset reference
    if (typeof imageSource === "object" && imageSource !== null) {
      // Check if it has an asset or ref
      return urlFor(imageSource as Parameters<typeof urlFor>[0])
        .width(width)
        .height(height)
        .fit(fit)
        .quality(quality)
        .auto("format")
        .url();
    }
  } catch (error) {
    console.warn("[OgImage] Error generating Sanity OG image URL:", error);
  }

  return typeof imageSource === "string" ? imageSource : DEFAULT_OG_IMAGE;
}
