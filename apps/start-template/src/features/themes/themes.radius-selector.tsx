"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RADIUS_PRESETS, RADIUS_VALUES } from "./themes.registry";
import type { RadiusPreset } from "./themes.types";

export function RadiusSelector({
	value,
	onChange,
}: {
	value: RadiusPreset;
	onChange: (value: RadiusPreset) => void;
}) {
	return (
		<ToggleGroup
			value={value ? [value] : []}
			onValueChange={(values) => {
				if (values.length > 0) {
					onChange(values[0] as RadiusPreset);
				}
			}}
			spacing={1}
			variant="outline"
		>
			{RADIUS_PRESETS.map((preset) => (
				<ToggleGroupItem
					key={preset.value}
					value={preset.value}
					size="sm"
					className="gap-1.5 px-2"
				>
					<div
						className="size-4 border-2 border-current"
						style={{
							borderRadius: RADIUS_VALUES[preset.value],
						}}
					/>
					<span className="text-xs">{preset.label}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
