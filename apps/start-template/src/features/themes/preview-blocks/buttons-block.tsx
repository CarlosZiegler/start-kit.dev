import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BellIcon,
	CopyIcon,
	MailIcon,
	SearchIcon,
} from "lucide-react";

import { PreviewBlock } from "./shared";

export function ButtonsBlock() {
	return (
		<PreviewBlock label="Buttons & Badges">
			<Card>
				<CardContent className="space-y-4 pt-6">
					<div className="flex flex-wrap gap-2">
						<Button>Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="destructive">Destructive</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</div>

					<div className="flex flex-wrap gap-2">
						<Button size="icon-sm" variant="outline">
							<CopyIcon className="size-4" />
						</Button>
						<Button size="icon-sm" variant="outline">
							<MailIcon className="size-4" />
						</Button>
						<Button size="icon-sm" variant="outline">
							<BellIcon className="size-4" />
						</Button>
						<Button size="icon-sm" variant="outline">
							<SearchIcon className="size-4" />
						</Button>
						<Button size="icon-sm" variant="outline">
							<ArrowLeftIcon className="size-4" />
						</Button>
						<Button size="icon-sm" variant="outline">
							<ArrowRightIcon className="size-4" />
						</Button>
					</div>

					<Separator />

					<div className="flex flex-wrap gap-2">
						<Badge>Active</Badge>
						<Badge variant="secondary">Draft</Badge>
						<Badge variant="outline">v2.1.0</Badge>
						<Badge variant="destructive">Failed</Badge>
					</div>

					<Separator />

					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Team Members</p>
						<div className="flex items-center gap-3">
							<div className="flex -space-x-2">
								<Avatar>
									<AvatarFallback>JD</AvatarFallback>
								</Avatar>
								<Avatar>
									<AvatarFallback>AB</AvatarFallback>
								</Avatar>
								<Avatar>
									<AvatarFallback>CZ</AvatarFallback>
								</Avatar>
							</div>
							<span className="text-muted-foreground text-xs">
								+5 more
							</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</PreviewBlock>
	);
}
