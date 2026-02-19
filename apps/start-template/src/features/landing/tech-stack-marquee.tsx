import type { CSSProperties } from "react";
import type { SimpleIcon } from "simple-icons";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export type TechStackItem = {
  label: string;
  kind: "simple-icon" | "start-kit" | "fallback";
  simpleIcon?: SimpleIcon;
  fallbackText?: string;
};

type TechStackMarqueeProps = {
  items: TechStackItem[];
  className?: string;
  /**
   * Duration of one full loop in ms.
   * Set higher for slower scrolling.
   */
  durationMs?: number;
};

function TechIcon({ item }: { item: TechStackItem }) {
  if (item.kind === "start-kit") {
    return (
      <Logo
        aria-hidden="true"
        className="h-6 w-6 shrink-0"
        focusable="false"
        svgTitle="Start Kit"
      />
    );
  }

  if (item.kind === "simple-icon" && item.simpleIcon) {
    const { title, hex, path } = item.simpleIcon;

    return (
      <svg
        aria-hidden="true"
        className="h-6 w-6 shrink-0"
        focusable="false"
        viewBox="0 0 24 24"
      >
        <title>{title}</title>
        <path d={path} fill={`#${hex}`} />
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted font-bold text-[10px] text-muted-foreground"
    >
      {(item.fallbackText ?? item.label).slice(0, 4).toUpperCase()}
    </span>
  );
}

export function TechStackMarquee({
  items,
  className,
  durationMs = 40_000,
}: TechStackMarqueeProps) {
  type StyleWithVars = CSSProperties & Record<`--${string}`, string>;

  const style: StyleWithVars = {
    "--tech-marquee-duration": `${durationMs}ms`,
  };

  return (
    <div
      className={cn(
        "tech-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className
      )}
      data-tech-marquee="true"
      style={style}
    >
      <div className="tech-marquee__track flex w-max gap-[var(--tech-marquee-gap,2.5rem)]">
        <div className="tech-marquee__group flex shrink-0 items-center gap-4">
          {items.map((item) => (
            <div
              className="flex items-center gap-3 rounded-full border border-border/40 bg-background/40 px-5 py-3 text-foreground/70 backdrop-blur-sm transition-opacity hover:opacity-100"
              key={item.label}
            >
              <TechIcon item={item} />
              <span className="cursor-default font-bold text-base md:text-lg">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="tech-marquee__group flex shrink-0 items-center gap-4"
        >
          {items.map((item) => (
            <div
              className="flex items-center gap-3 rounded-full border border-border/40 bg-background/40 px-5 py-3 text-foreground/70 backdrop-blur-sm transition-opacity hover:opacity-100"
              key={`dup-${item.label}`}
            >
              <TechIcon item={item} />
              <span className="cursor-default font-bold text-base md:text-lg">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
