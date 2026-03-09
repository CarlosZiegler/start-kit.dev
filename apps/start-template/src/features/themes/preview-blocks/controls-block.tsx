import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PreviewBlock } from "./shared";

export function ControlsBlock() {
	return (
		<PreviewBlock label="Controls">
			<Card>
				<CardContent className="space-y-6 pt-6">
					<div className="space-y-2">
						<Label>Framework</Label>
						<Tabs defaultValue="react">
							<TabsList>
								<TabsTrigger value="react">React</TabsTrigger>
								<TabsTrigger value="vue">Vue</TabsTrigger>
								<TabsTrigger value="svelte">Svelte</TabsTrigger>
							</TabsList>
							<TabsContent value="react">
								<p className="text-muted-foreground text-xs pt-2">
									React with TanStack Router and Tailwind CSS.
								</p>
							</TabsContent>
							<TabsContent value="vue">
								<p className="text-muted-foreground text-xs pt-2">
									Vue with Nuxt and UnoCSS.
								</p>
							</TabsContent>
							<TabsContent value="svelte">
								<p className="text-muted-foreground text-xs pt-2">
									SvelteKit with Tailwind CSS.
								</p>
							</TabsContent>
						</Tabs>
					</div>

					<div className="flex flex-wrap gap-x-6 gap-y-3">
						<div className="flex items-center gap-2">
							<Checkbox defaultChecked />
							<Label className="text-sm">TypeScript</Label>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox defaultChecked />
							<Label className="text-sm">ESLint</Label>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox />
							<Label className="text-sm">Tailwind</Label>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label className="text-sm">Private repository</Label>
								<p className="text-muted-foreground text-xs">
									Only you can see this repo
								</p>
							</div>
							<Switch defaultChecked />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label className="text-sm">Email notifications</Label>
								<p className="text-muted-foreground text-xs">
									Get notified on updates
								</p>
							</div>
							<Switch />
						</div>
					</div>

					<Separator />

					<div className="space-y-3">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Volume</span>
							<span className="text-foreground font-medium">64%</span>
						</div>
						<Slider defaultValue={[64]} max={100} />
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Deployment</span>
							<span className="text-foreground font-medium">68%</span>
						</div>
						<Progress value={68} />
					</div>
				</CardContent>
			</Card>
		</PreviewBlock>
	);
}
