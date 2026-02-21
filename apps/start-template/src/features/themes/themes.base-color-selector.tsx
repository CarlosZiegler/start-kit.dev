"use client";

import { cn } from "@/lib/utils";
import type { BaseColorName } from "./themes.types";
import { BASE_COLORS } from "./themes.registry";

export function BaseColorSelector({
  value,
  onChange,
}: {
  value: BaseColorName;
  onChange: (value: BaseColorName) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {BASE_COLORS.map((base) => (
        <button
          key={base.name}
          type="button"
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-colors",
            value === base.name
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onClick={() => onChange(base.name as BaseColorName)}
        >
          <div
            className="size-6 rounded-full border"
            style={{
              background: base.cssVars.light.primary,
            }}
          />
          <span className="text-xs font-medium capitalize">{base.title}</span>
        </button>
      ))}
    </div>
  );
}
