import {
  siBetterauth,
  siBun,
  siDrizzle,
  siReact,
  siResend,
  siShadcnui,
  siTailwindcss,
  siTanstack,
  siVitest,
} from "simple-icons";

import type { TechStackItem } from "@/features/landing/tech-stack-marquee";

export const TECH_STACK: TechStackItem[] = [
  { label: "Start Kit", kind: "start-kit" },
  { label: "React 19", kind: "simple-icon", simpleIcon: siReact },
  { label: "Tailwind v4", kind: "simple-icon", simpleIcon: siTailwindcss },
  { label: "shadcn/ui", kind: "simple-icon", simpleIcon: siShadcnui },
  { label: "Base-UI", kind: "fallback", fallbackText: "BASE" },
  { label: "TanStack AI", kind: "simple-icon", simpleIcon: siTanstack },
  { label: "AI Elements", kind: "fallback", fallbackText: "AI" },
  { label: "Better Auth", kind: "simple-icon", simpleIcon: siBetterauth },
  { label: "Resend", kind: "simple-icon", simpleIcon: siResend },
  { label: "Drizzle ORM", kind: "simple-icon", simpleIcon: siDrizzle },
  { label: "oRPC", kind: "fallback", fallbackText: "RPC" },
  { label: "Vitest", kind: "simple-icon", simpleIcon: siVitest },
  { label: "Ultracite", kind: "fallback", fallbackText: "ULTRA" },
  { label: "Bun", kind: "simple-icon", simpleIcon: siBun },
];
