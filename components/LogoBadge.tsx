"use client";

/**
 * SES monogram SVG — octagonal badge with elegant serif "SES" text.
 * Used as inline fallback when image embedding is unreliable.
 */
export function LogoBadgeSVG({
  size = 48,
  variant = "dark",
  className = "",
}: {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
}) {
  const bgColor = variant === "dark" ? "#1C1C2E" : "#FFFFFF";
  const textColor = variant === "dark" ? "#FFFFFF" : "#1C1C2E";
  const borderColor = variant === "dark" ? "#C9A84C" : "#1C1C2E";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Octagonal badge shape */}
      <polygon
        points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30"
        fill={bgColor}
        stroke={borderColor}
        strokeWidth="2"
      />
      {/* Inner border */}
      <polygon
        points="33,7 67,7 93,33 93,67 67,93 33,93 7,67 7,33"
        fill="none"
        stroke={borderColor}
        strokeWidth="0.5"
        opacity="0.5"
      />
      {/* SES text */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="28"
        fontWeight="600"
        letterSpacing="3"
        fill={textColor}
      >
        SES
      </text>
    </svg>
  );
}
