import { describe, it, expect } from "vitest";
import * as BreweryPageModule from "../breweries/[slug]/page";
import * as TrailPageModule from "../trails/[slug]/page";
import * as GuidePageModule from "../guides/[slug]/page";
import * as CategoryPageModule from "../breweries/category/[slug]/page";
import * as CountyPageModule from "../breweries/county/[slug]/page";

describe("ISR Configuration and Metadata Generation", () => {
  describe("ISR Revalidation Constants", () => {
    it("exports revalidate = 60 on dynamic brewery pages", () => {
      expect(BreweryPageModule.revalidate).toBe(60);
    });

    it("exports revalidate = 60 on dynamic trail pages", () => {
      expect(TrailPageModule.revalidate).toBe(60);
    });

    it("exports revalidate = 60 on dynamic guide pages", () => {
      expect(GuidePageModule.revalidate).toBe(60);
    });

    it("exports revalidate = 60 on dynamic category and county pages", () => {
      expect(CategoryPageModule.revalidate).toBe(60);
      expect(CountyPageModule.revalidate).toBe(60);
    });
  });

  describe("generateStaticParams Pre-rendering", () => {
    it("generates static parameters for brewery routes", async () => {
      const params = await BreweryPageModule.generateStaticParams();
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty("slug");
    });

    it("generates static parameters for trail routes", async () => {
      const params = await TrailPageModule.generateStaticParams();
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty("slug");
    });

    it("generates static parameters for guide routes", async () => {
      const params = await GuidePageModule.generateStaticParams();
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty("slug");
    });

    it("generates static parameters for category routes", async () => {
      const params = await CategoryPageModule.generateStaticParams();
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params.some((p) => p.slug === "dog-friendly")).toBe(true);
    });

    it("generates static parameters for county routes", async () => {
      const params = await CountyPageModule.generateStaticParams();
      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty("slug");
    });
  });

  describe("generateMetadata Dynamic OG Metadata", () => {
    it("generates Open Graph and Twitter metadata for brewery dynamic pages", async () => {
      const metadata = await BreweryPageModule.generateMetadata({
        params: Promise.resolve({ slug: "flying-dog-brewery" }),
      });

      expect(metadata.title).toContain("Flying Dog Brewery");
      expect(metadata.alternates?.canonical).toBe("/breweries/flying-dog-brewery");
      expect(metadata.openGraph?.images).toBeDefined();

      const ogImages = metadata.openGraph?.images as Array<{ url: string; width?: number; height?: number }>;
      expect(ogImages.length).toBeGreaterThan(0);
      expect(ogImages[0].width).toBe(1200);
      expect(ogImages[0].height).toBe(630);

      expect((metadata.twitter as { card?: string })?.card).toBe("summary_large_image");
    });

    it("generates Open Graph and Twitter metadata for trail dynamic pages", async () => {
      const metadata = await TrailPageModule.generateMetadata({
        params: Promise.resolve({ slug: "frederick-beer-adventure" }),
      });

      expect(metadata.title).toContain("Frederick");
      expect(metadata.alternates?.canonical).toBe("/trails/frederick-beer-adventure");
      expect(metadata.openGraph?.images).toBeDefined();

      const ogImages = metadata.openGraph?.images as Array<{ url: string; width?: number; height?: number }>;
      expect(ogImages.length).toBeGreaterThan(0);
      expect(ogImages[0].width).toBe(1200);
      expect(ogImages[0].height).toBe(630);
    });
  });
});
