import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
  variant?: "default" | "muted" | "subtle";
}

export function Section({
  children,
  className,
  id,
  containerClassName,
  variant = "default",
}: SectionProps) {
  const variants = {
    default: "bg-background",
    muted: "bg-muted/30",
    subtle: "bg-accent/5",
  };

  return (
    <section
      className={cn(
        "overflow-hidden py-20 md:py-32",
        variants[variant],
        className
      )}
      id={id}
    >
      <div className={cn("container mx-auto px-4", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
