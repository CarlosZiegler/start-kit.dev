"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FontOption } from "./themes.types";
import { FONT_OPTIONS } from "./themes.registry";

export function FontSelector({
  value,
  onChange,
}: {
  value: FontOption;
  onChange: (value: FontOption) => void;
}) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as FontOption)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent>
        {FONT_OPTIONS.map((font) => (
          <SelectItem key={font.value} value={font.value}>
            {font.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
