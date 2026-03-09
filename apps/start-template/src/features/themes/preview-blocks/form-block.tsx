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
import { Textarea } from "@/components/ui/textarea";

import { PreviewBlock } from "./shared";

export function FormBlock() {
	return (
		<PreviewBlock label="Form">
			<Card>
				<CardHeader>
					<CardTitle>User Information</CardTitle>
					<CardDescription>
						Please fill in your details below
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Name</Label>
							<Input placeholder="Enter your name" />
						</div>
						<div className="space-y-2">
							<Label>Email</Label>
							<Input type="email" placeholder="you@example.com" />
						</div>
					</div>
					<div className="space-y-2">
						<Label>Comments</Label>
						<Textarea
							placeholder="Add any additional comments"
							rows={3}
						/>
					</div>
					<div className="flex gap-2">
						<Button>Submit</Button>
						<Button variant="outline">Cancel</Button>
					</div>
				</CardContent>
			</Card>
		</PreviewBlock>
	);
}
