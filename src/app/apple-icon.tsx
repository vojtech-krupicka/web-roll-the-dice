import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0e1e",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <polygon points="32,5 54.5,18.5 54.5,45.5 32,59 9.5,45.5 9.5,18.5" fill="url(#g)" />
          <g fill="none" stroke="#0d0e1e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <polygon points="32,18 46,42 18,42" />
            <path d="M32 18V5M46 42l8.5 3.5M18 42l-8.5 3.5" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
