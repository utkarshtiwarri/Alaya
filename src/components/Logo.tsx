import React from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-12 h-12" }: LogoProps) {
  return (
    <svg
      id="alaya-logo"
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#glow-filter)">
        {/* Transparent backdrop layers representing the image custom shapes */}
        <path
          d="M256 90 L80 410 L160 410 L256 220 L352 410 L432 410 Z"
          fill="url(#alaya-grad-purple-blue)"
          opacity="0.85"
        />
        <path
          d="M230 260 L380 410 L280 410 L180 310 L200 290"
          fill="url(#alaya-grad-cyan-blue)"
          opacity="0.9"
        />
        {/* Soft rounded highlight overlapping inner branch */}
        <path
          d="M230 260 C245 245 270 245 285 260 L395 370 C410 385 410 410 395 425 C380 440 355 440 340 425 L230 315 C215 300 215 275 230 260 Z"
          fill="url(#alaya-grad-cyan)"
          opacity="0.95"
          style={{ mixBlendMode: "screen" }}
        />
      </g>
      <defs>
        <linearGradient id="alaya-grad-purple-blue" x1="80" y1="90" x2="432" y2="410" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="alaya-grad-cyan-blue" x1="180" y1="260" x2="380" y2="410" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="alaya-grad-cyan" x1="210" y1="240" x2="410" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
