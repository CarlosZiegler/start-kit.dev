import { type SVGProps, useId } from "react";

export function Logo({
  className,
  svgTitle = "Start Kit",
  ...props
}: SVGProps<SVGSVGElement> & { svgTitle?: string }) {
  const gradientId = useId();

  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{svgTitle}</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ff4154" />
          <stop offset="100%" stopColor="#ffba00" />
        </linearGradient>
      </defs>
      <rect fill={`url(#${gradientId})`} height="100" rx="24" width="100" />
      <path
        d="M30 35C30 32.2386 32.2386 30 35 30H65C67.7614 30 70 32.2386 70 35V45C70 47.7614 67.7614 50 65 50H45C42.2386 50 40 52.2386 40 55V65C40 67.7614 42.2386 70 45 70H65C67.7614 70 70 67.7614 70 65"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="10"
      />
      <path
        d="M30 45L40 45"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="10"
      />
      <path
        d="M60 55L70 55"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="10"
      />
    </svg>
  );
}
