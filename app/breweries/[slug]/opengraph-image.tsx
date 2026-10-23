import { ImageResponse } from "next/og";
import { contentService } from "@/lib/services/content.service";
import { safeValidateBrewery } from "@/lib/validations/schemas";
import { isBreweryOpenNow } from "@/lib/utils/hours";

export const alt = "Maryland Beer Atlas - Brewery Details";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface BreweryOgImageProps {
  params: Promise<{ slug: string }>;
}

export default async function BreweryOgImage({ params }: BreweryOgImageProps) {
  const { slug } = await params;
  const rawBrewery = await contentService.breweries.getBySlug(slug);

  if (!rawBrewery) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "#f59e0b",
              color: "#09090b",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            MARYLAND BEER ATLAS
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
            Brewery Not Found
          </h1>
          <p style={{ fontSize: "20px", color: "#a1a1aa" }}>
            The requested craft brewery could not be located.
          </p>
        </div>
      ),
      { ...size }
    );
  }

  const validationResult = safeValidateBrewery(rawBrewery);
  const brewery = validationResult.success ? validationResult.data : rawBrewery;

  const openStatus = isBreweryOpenNow(brewery);

  let statusBadgeText = "HOURS UNVERIFIED";
  let statusBg = "#4b5563"; // gray-600

  if (openStatus.isOpen) {
    statusBadgeText = "OPEN NOW";
    statusBg = "#059669"; // emerald-600
  } else if (openStatus.category === "permanently_closed") {
    statusBadgeText = "PERMANENTLY CLOSED";
    statusBg = "#9f1239"; // rose-800
  } else if (openStatus.category === "temporarily_closed") {
    statusBadgeText = "TEMPORARILY CLOSED";
    statusBg = "#d97706"; // amber-600
  } else if (openStatus.category === "open") {
    // Open category but currently closed at target time
    statusBadgeText = "CLOSED NOW";
    statusBg = "#dc2626"; // red-600
  }

  const featuredStyles = brewery.beerStyles?.slice(0, 4) || [];
  const amenitiesList = brewery.amenities?.slice(0, 3) || [];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          color: "#ffffff",
          padding: "60px",
          fontFamily: "sans-serif",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15), transparent 40%), radial-gradient(circle at 10% 90%, rgba(16, 185, 129, 0.1), transparent 40%)",
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f59e0b",
                color: "#09090b",
                padding: "8px 16px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: 900,
                letterSpacing: "0.05em",
              }}
            >
              MARYLAND BEER ATLAS
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#a1a1aa",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              • Craft Brewery Card
            </div>
          </div>

          {/* Open/Closed Status Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: statusBg,
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "0.05em",
            }}
          >
            {statusBadgeText}
          </div>
        </div>

        {/* Main Content Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#fbbf24",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {brewery.type || "Craft Brewery"}
            </span>
            <span
              style={{
                color: "#71717a",
                fontSize: "18px",
              }}
            >
              •
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#e4e4e7",
                fontWeight: 600,
              }}
            >
              {brewery.city}, MD
            </span>
            <span
              style={{
                color: "#71717a",
                fontSize: "18px",
              }}
            >
              •
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#34d399",
                fontWeight: 600,
              }}
            >
              {brewery.county} County
            </span>
          </div>

          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {brewery.name}
          </h1>

          <p
            style={{
              fontSize: "20px",
              color: "#a1a1aa",
              margin: 0,
              display: "-webkit-box",
              lineClamp: 2,
              overflow: "hidden",
              lineHeight: 1.4,
              maxWidth: "1000px",
            }}
          >
            {brewery.description ||
              `Discover craft beer, taproom details, hours, and direction routes for ${brewery.name} in ${brewery.city}, Maryland.`}
          </p>
        </div>

        {/* Bottom Details Footer Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
          }}
        >
          {/* Featured Styles or Amenities */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#71717a",
                fontWeight: 700,
                textTransform: "uppercase",
                marginRight: "4px",
              }}
            >
              Featured Styles:
            </span>
            {featuredStyles.length > 0 ? (
              featuredStyles.map((style, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    color: "#f4f4f5",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {style}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  color: "#a1a1aa",
                  fontSize: "14px",
                }}
              >
                Maryland Craft Beer
              </div>
            )}

            {amenitiesList.map((amenity, i) => (
              <div
                key={`amenity-${i}`}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {amenity}
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#fbbf24",
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            marylandbeeratlas.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
