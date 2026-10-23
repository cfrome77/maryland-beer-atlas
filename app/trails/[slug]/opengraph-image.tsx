import { ImageResponse } from "next/og";
import { contentService } from "@/lib/services/content.service";
import { safeValidateBeerTrail } from "@/lib/validations/schemas";

export const alt = "Maryland Beer Atlas - Curated Beer Trail Guide";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface TrailOgImageProps {
  params: Promise<{ slug: string }>;
}

export default async function TrailOgImage({ params }: TrailOgImageProps) {
  const { slug } = await params;
  const rawTrail = await contentService.trails.getBySlug(slug);

  if (!rawTrail) {
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
            Trail Not Found
          </h1>
          <p style={{ fontSize: "20px", color: "#a1a1aa" }}>
            The requested craft beer trail itinerary could not be located.
          </p>
        </div>
      ),
      { ...size }
    );
  }

  const validationResult = safeValidateBeerTrail(rawTrail);
  const trail = validationResult.success ? validationResult.data : rawTrail;

  const topStops = trail.breweries.slice(0, 4);

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
            "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15), transparent 40%), radial-gradient(circle at 10% 90%, rgba(59, 130, 246, 0.1), transparent 40%)",
        }}
      >
        {/* Header Bar */}
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
              • Curated Trail Itinerary
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#fbbf24",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "0.05em",
            }}
          >
            {trail.region} REGION
          </div>
        </div>

        {/* Main Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Key Metrics Chips */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#e4e4e7",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {trail.breweries.length} Brewery Stops
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#fbbf24",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {trail.distance}
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                color: "#a1a1aa",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {trail.duration}
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34d399",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {trail.difficulty}
            </div>
          </div>

          <h1
            style={{
              fontSize: "52px",
              fontWeight: 900,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {trail.name}
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#a1a1aa",
              margin: 0,
              display: "-webkit-box",
              lineClamp: 2,
              overflow: "hidden",
              lineHeight: 1.4,
              maxWidth: "1000px",
            }}
          >
            {trail.description}
          </p>
        </div>

        {/* Trail Stops Overview Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            borderTop: "1px solid #27272a",
            paddingTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#71717a",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Featured Trail Stops:
          </div>

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
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {topStops.map((brewery, index) => (
                <div
                  key={brewery.id || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      backgroundColor: "#f59e0b",
                      color: "#09090b",
                      fontSize: "12px",
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#f4f4f5",
                    }}
                  >
                    {brewery.name}
                  </span>
                </div>
              ))}
              {trail.breweries.length > topStops.length && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#a1a1aa",
                    fontWeight: 600,
                    padding: "8px",
                  }}
                >
                  +{trail.breweries.length - topStops.length} more stops
                </div>
              )}
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
      </div>
    ),
    { ...size }
  );
}
