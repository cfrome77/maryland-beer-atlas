import { describe, it, expect } from "vitest";
import BreweryOgImage from "../breweries/[slug]/opengraph-image";
import TrailOgImage from "../trails/[slug]/opengraph-image";

describe("Dynamic Open Graph Image Generation", () => {
  describe("Brewery Open Graph Image Route", () => {
    it("generates an ImageResponse for a valid brewery slug", async () => {
      const response = await BreweryOgImage({
        params: Promise.resolve({ slug: "heavy-seas-beer" }),
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
    });

    it("generates a fallback Not Found ImageResponse for an invalid brewery slug", async () => {
      const response = await BreweryOgImage({
        params: Promise.resolve({ slug: "non-existent-brewery-slug" }),
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
    });
  });

  describe("Trail Open Graph Image Route", () => {
    it("generates an ImageResponse for a valid trail slug", async () => {
      const response = await TrailOgImage({
        params: Promise.resolve({ slug: "baltimore-inner-harbor-trail" }),
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
    });

    it("generates a fallback Not Found ImageResponse for an invalid trail slug", async () => {
      const response = await TrailOgImage({
        params: Promise.resolve({ slug: "non-existent-trail-slug" }),
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("image/png");
    });
  });
});
