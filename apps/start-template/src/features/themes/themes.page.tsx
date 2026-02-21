"use client";

import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { AccentSelector } from "./themes.accent-selector";
import { ThemeActions } from "./themes.actions";
import { BaseColorSelector } from "./themes.base-color-selector";
import { ColorPicker } from "./themes.color-picker";
import { FontSelector } from "./themes.font-selector";
import { ThemePreview } from "./themes.preview";
import { RadiusSelector } from "./themes.radius-selector";
import type { ThemeConfig } from "./themes.types";

export function ThemesPage({
	config,
	onConfigChange,
}: {
	config: ThemeConfig;
	onConfigChange: (config: ThemeConfig) => void;
}) {
	const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto max-w-7xl">
					<div className="mb-8 space-y-4">
						<Link
							to="/"
							className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
						>
							<ArrowLeftIcon className="size-4" />
							<Logo className="h-5" />
						</Link>
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight">
								Theme Customizer
							</h1>
							<p className="text-muted-foreground text-lg">
								Pick colors, radius, and font. Preview your theme, then copy
								the CSS or share via URL.
							</p>
						</div>
					</div>

					<div className="grid gap-8 lg:grid-cols-[320px_1fr]">
						<div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
							<section className="space-y-3">
								<h2 className="text-sm font-medium">Base Color</h2>
								<BaseColorSelector
									value={config.baseColor}
									onChange={(baseColor) =>
										onConfigChange({ ...config, baseColor, theme: baseColor })
									}
								/>
							</section>

							<Separator />

							<section className="space-y-3">
								<h2 className="text-sm font-medium">Accent Color</h2>
								<AccentSelector
									value={config.theme}
									baseColor={config.baseColor}
									onChange={(theme) =>
										onConfigChange({
											...config,
											theme,
											customColor: undefined,
										})
									}
								/>
							</section>

							<Separator />

							<section className="space-y-3">
								<h2 className="text-sm font-medium">Custom Primary</h2>
								<ColorPicker
									value={config.customColor}
									themeName={config.theme}
									onChange={(customColor) =>
										onConfigChange({ ...config, customColor })
									}
									onClear={() =>
										onConfigChange({
											...config,
											customColor: undefined,
										})
									}
								/>
							</section>

							<Separator />

							<section className="space-y-1">
								<h2 className="text-sm font-medium">Radius</h2>
								<RadiusSelector
									value={config.radius}
									onChange={(radius) => onConfigChange({ ...config, radius })}
								/>
							</section>

							<Separator />

							<section className="space-y-3">
								<h2 className="text-sm font-medium">Font</h2>
								<FontSelector
									value={config.font}
									onChange={(font) => onConfigChange({ ...config, font })}
								/>
							</section>

							<Separator />

							<section className="space-y-3">
								<h2 className="text-sm font-medium">Actions</h2>
								<ThemeActions config={config} />
							</section>
						</div>

						<div>
							<ThemePreview
								config={config}
								previewMode={previewMode}
								onPreviewModeChange={setPreviewMode}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
