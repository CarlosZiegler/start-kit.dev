import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";

import { PreviewBlock } from "./shared";

export function CardBlock() {
	return (
		<PreviewBlock label="Card">
			<Card>
				<CardHeader>
					<CardTitle>Create Project</CardTitle>
					<CardDescription>
						Deploy your new project in one click.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label>Project Name</Label>
						<Input placeholder="my-awesome-project" />
					</div>
					<div className="space-y-2">
						<Label>Framework</Label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder="Select a framework" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="react">React</SelectItem>
								<SelectItem value="vue">Vue</SelectItem>
								<SelectItem value="svelte">Svelte</SelectItem>
								<SelectItem value="angular">Angular</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex gap-2">
						<Button className="flex-1">
							Create
							<PlusIcon className="ml-1 size-4" />
						</Button>
						<Button variant="outline">Cancel</Button>
					</div>
				</CardContent>
			</Card>
		</PreviewBlock>
	);
}
