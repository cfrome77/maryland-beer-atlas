import { describe, it, expect } from "vitest";
import { formatSanityOgImageUrl, DEFAULT_OG_IMAGE } from "../og-image";

describe("formatSanityOgImageUrl Utility", () => {
  it("returns default fallback image URL when image source is null or undefined", () => {
    expect(formatSanityOgImageUrl(null)).toBe(DEFAULT_OG_IMAGE);
    expect(formatSanityOgImageUrl(undefined)).toBe(DEFAULT_OG_IMAGE);
    expect(formatSanityOgImageUrl("")).toBe(DEFAULT_OG_IMAGE);
    expect(formatSanityOgImageUrl("   ")).toBe(DEFAULT_OG_IMAGE);
  });

  it("preserves standard external HTTP image URLs", () => {
    const externalUrl = "https://images.unsplash.com/photo-1550345332-09e3ac987658";
    expect(formatSanityOgImageUrl(externalUrl)).toBe(externalUrl);
  });

  it("formats Sanity CDN URLs with custom width, height, fit, and quality parameters", () => {
    const sanityCdnUrl =
      "https://cdn.sanity.io/images/placeholder-project-id/development/1234567890-1200x800.jpg";
    const formatted = formatSanityOgImageUrl(sanityCdnUrl);

    expect(formatted).toContain("w=1200");
    expect(formatted).toContain("h=630");
    expect(formatted).toContain("fit=crop");
    expect(formatted).toContain("q=80");
    expect(formatted).toContain("auto=format");
  });

  it("supports custom dimension and crop options", () => {
    const sanityCdnUrl =
      "https://cdn.sanity.io/images/placeholder-project-id/development/1234567890-1200x800.jpg";
    const formatted = formatSanityOgImageUrl(sanityCdnUrl, {
      width: 800,
      height: 400,
      fit: "fill",
      quality: 90,
    });

    expect(formatted).toContain("w=800");
    expect(formatted).toContain("h=400");
    expect(formatted).toContain("fit=fill");
    expect(formatted).toContain("q=90");
  });

  it("formats Sanity image asset reference objects", () => {
    const sanityAssetObject = {
      _type: "image",
      asset: {
        _ref: "image-1234567890-1200x800-jpg",
        _type: "reference",
      },
    };

    const formatted = formatSanityOgImageUrl(sanityAssetObject);
    expect(formatted).toContain("w=1200");
    expect(formatted).toContain("h=630");
    expect(formatted).toContain("fit=crop");
  });
});
