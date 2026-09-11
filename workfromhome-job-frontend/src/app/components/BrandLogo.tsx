import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  className = "",
}: BrandLogoProps) {
  const iconDimensions = {
    sm: { w: 28, h: 28, radius: 8, font: "0.95rem", tagFont: "0.65rem" },
    md: { w: 34, h: 34, radius: 10, font: "1.15rem", tagFont: "0.7rem" },
    lg: { w: 42, h: 42, radius: 12, font: "1.4rem", tagFont: "0.75rem" },
  }[size];

  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.65rem",
        userSelect: "none",
      }}
    >
      {/* Sleek Gradient Emblem SVG */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: "drop-shadow(0 3px 6px rgba(37,99,235,0.28))",
          borderRadius: `${iconDimensions.radius}px`,
        }}
      >
        <defs>
          <linearGradient id={`bgGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="55%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={`brandGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
          <linearGradient id={`accentGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        <rect width="64" height="64" rx="16" fill={`url(#bgGrad-${size})`} />
        <rect x="1" y="1" width="62" height="62" rx="15" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

        {/* Left Pillar */}
        <rect x="16" y="15" width="7" height="34" rx="3.5" fill={`url(#brandGrad-${size})`} />

        {/* Top Rounded Loop */}
        <path d="M19 15H33C39.0751 15 44 19.4772 44 25C44 30.5228 39.0751 35 33 35H19V15Z" fill={`url(#brandGrad-${size})`} />
        <path d="M23 21H32C34.7614 21 37 22.7909 37 25C37 27.2091 34.7614 29 32 29H23V21Z" fill="#1d4ed8" />

        {/* Dynamic Kick / Upward Desk Leg */}
        <path d="M30 32L42.8 47.4C43.5 48.3 44.8 49 46 49H47C48.6 49 49.6 47.2 48.6 45.9L36.8 32H30Z" fill={`url(#accentGrad-${size})`} />

        {/* Glowing Live Remote Status Indicator Dot */}
        <circle cx="48" cy="16" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="48" cy="16" r="2" fill="#ffffff" />
      </svg>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: iconDimensions.font,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Remote<span style={{ color: "#2563eb" }}>Job</span>Desk
          </span>
          {showTagline && (
            <span
              style={{
                fontSize: iconDimensions.tagFont,
                fontWeight: 700,
                color: "#64748b",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Remote Work Portal
            </span>
          )}
        </div>
      )}
    </div>
  );
}
