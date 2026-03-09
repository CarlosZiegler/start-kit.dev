import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { PreviewBlock } from "./shared";

export function LoadingBlock() {
	return (
		<PreviewBlock label="Loading">
			<Card>
				<CardContent className="space-y-4 pt-6">
					<div className="flex items-center gap-3">
						<Skeleton className="size-10 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
					<Skeleton className="h-24 w-full rounded-lg" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-20 rounded-md" />
						<Skeleton className="h-9 w-20 rounded-md" />
					</div>
				</CardContent>
			</Card>
		</PreviewBlock>
	);
}
