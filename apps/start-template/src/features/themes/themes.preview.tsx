"use client";

import "@fontsource-variable/geist";

import { MoonIcon, SunIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { AlertsBlock } from "./preview-blocks/alerts-block";
import { ButtonsBlock } from "./preview-blocks/buttons-block";
import { CardBlock } from "./preview-blocks/card-block";
import { ChartsBlock } from "./preview-blocks/charts-block";
import { ColorsBlock } from "./preview-blocks/colors-block";
import { ControlsBlock } from "./preview-blocks/controls-block";
import { FormBlock } from "./preview-blocks/form-block";
import { LoadingBlock } from "./preview-blocks/loading-block";
import { PaymentBlock } from "./preview-blocks/payment-block";
import { TableBlock } from "./preview-blocks/table-block";
import type { ThemeConfig } from "./themes.types";
import { generateInlineStyles } from "./themes.utils";

export function ThemePreview({
	config,
	previewMode,
	onPreviewModeChange,
}: {
	config: ThemeConfig;
	previewMode: "light" | "dark";
	onPreviewModeChange: (mode: "light" | "dark") => void;
}) {
	const inlineStyles = generateInlineStyles(config, previewMode);

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-2xl border font-sans",
				previewMode === "dark" ? "dark" : "",
			)}
			style={inlineStyles}
		>
			<div className="bg-background p-4 md:p-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<h3 className="text-foreground text-sm font-medium">Preview</h3>
					<div className="bg-muted flex items-center rounded-lg p-0.5">
						<button
							type="button"
							onClick={() => onPreviewModeChange("light")}
							className={cn(
								"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
								previewMode === "light"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<SunIcon className="size-3.5" />
							Light
						</button>
						<button
							type="button"
							onClick={() => onPreviewModeChange("dark")}
							className={cn(
								"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
								previewMode === "dark"
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<MoonIcon className="size-3.5" />
							Dark
						</button>
					</div>
				</div>

				{/* Grid layout */}
				<div className="grid gap-4 md:grid-cols-2">
					<ColorsBlock />
					<CardBlock />
					<FormBlock />
					<ChartsBlock />
					<PaymentBlock />
					<TableBlock />
					<ControlsBlock />
					<ButtonsBlock />
					<AlertsBlock />
					<LoadingBlock />
				</div>
			</div>
		</div>
	);
}
