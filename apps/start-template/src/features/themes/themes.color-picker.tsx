"use client";

import { XIcon } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { THEMES } from "./themes.registry";
import type { ThemeName } from "./themes.types";
import { oklchToHex } from "./themes.utils";

export function ColorPicker({
  value,
  themeName,
  onChange,
  onClear,
}: {
  value: string | undefined;
  themeName: ThemeName;
  onChange: (hex: string) => void;
  onClear: () => void;
}) {
  const currentHex = useMemo(() => {
    if (value) return value;

    const theme = THEMES.find((t) => t.name === themeName);
    const primaryOklch = theme?.cssVars.light.primary;
    if (!primaryOklch) return "#3b82f6";
    return oklchToHex(primaryOklch) ?? "#3b82f6";
  }, [value, themeName]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={currentHex}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 cursor-pointer rounded-lg border border-border p-0.5"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">
            {value ? `Custom: ${value}` : "Pick a custom primary color"}
          </Label>
        </div>
        {value && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClear}
          >
            <XIcon className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
