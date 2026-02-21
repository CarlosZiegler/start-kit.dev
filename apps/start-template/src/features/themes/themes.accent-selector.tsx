"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { ThemeName, BaseColorName } from "./themes.types";
import { BASE_COLORS, ACCENT_THEMES } from "./themes.registry";

export function AccentSelector({
  value,
  baseColor,
  onChange,
}: {
  value: ThemeName;
  baseColor: BaseColorName;
  onChange: (value: ThemeName) => void;
}) {
  const matchingBase = BASE_COLORS.find((b) => b.name === baseColor);

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {matchingBase && (
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "size-8 cursor-pointer rounded-full border-2 transition-all",
                      value === matchingBase.name
                        ? "ring-primary scale-110 ring-2 ring-offset-2"
                        : "border-border hover:scale-105"
                    )}
                    style={{
                      background: matchingBase.cssVars.light.primary,
                    }}
                    onClick={() =>
                      onChange(matchingBase.name as ThemeName)
                    }
                  />
                }
              />
              <TooltipContent>{matchingBase.title} (Base)</TooltipContent>
            </Tooltip>
          </div>
        )}

        <Separator />

        <div className="flex flex-wrap gap-2">
          {ACCENT_THEMES.map((theme) => (
            <Tooltip key={theme.name}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    className={cn(
                      "size-8 cursor-pointer rounded-full border-2 transition-all",
                      value === theme.name
                        ? "ring-primary scale-110 ring-2 ring-offset-2"
                        : "border-border hover:scale-105"
                    )}
                    style={{
                      background: theme.cssVars.light.primary,
                    }}
                    onClick={() => onChange(theme.name as ThemeName)}
                  />
                }
              />
              <TooltipContent>{theme.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
