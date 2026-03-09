import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from "lucide-react";

import { ColorSwatch, PreviewBlock } from "./shared";

export function ColorsBlock() {
	return (
		<PreviewBlock label="Colors">
			<Card>
				<CardContent className="space-y-4 pt-6">
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Chart Palette</p>
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="flex-1 rounded-md h-8"
									style={{ background: `var(--chart-${i})` }}
								/>
							))}
						</div>
					</div>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Theme Tokens</p>
						<div className="grid grid-cols-3 gap-2">
							<ColorSwatch label="Primary" token="primary" />
							<ColorSwatch label="Secondary" token="secondary" />
							<ColorSwatch label="Accent" token="accent" />
							<ColorSwatch label="Muted" token="muted" />
							<ColorSwatch label="Destructive" token="destructive" />
							<ColorSwatch label="Card" token="card" />
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Notification</p>
						<div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
							<div className="bg-primary rounded-full p-1.5">
								<CheckIcon className="size-3 text-primary-foreground" />
							</div>
							<div className="flex-1">
								<p className="text-foreground text-sm font-medium">
									Your order has been shipped.
								</p>
								<p className="text-muted-foreground text-xs mt-0.5">
									2 hours ago
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</PreviewBlock>
	);
}
