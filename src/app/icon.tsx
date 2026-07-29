import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Favicon generation function
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 18,
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          borderRadius: "8px",
          border: "1.5px solid #D4AF37",
          fontWeight: "bold",
          fontFamily: "serif",
        }}
      >
        R
      </div>
    ),
    {
      ...size,
    }
  );
}
