import type React from "react";

export function PreviewBlock({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-2">
			<p className="text-muted-foreground text-xs font-medium">{label}</p>
			{children}
		</div>
	);
}

export function ColorSwatch({
	label,
	token,
}: { label: string; token: string }) {
	return (
		<div className="flex items-center gap-2">
			<div
				className="size-4 rounded-full border border-border"
				style={{ background: `var(--${token})` }}
			/>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}
