"use client";

import "@fontsource-variable/geist";

import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BellIcon,
	CheckIcon,
	CopyIcon,
	InfoIcon,
	MailIcon,
	MoonIcon,
	PlusIcon,
	SearchIcon,
	SunIcon,
	TerminalIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import type { ThemeConfig } from "./themes.types";
import { generateInlineStyles } from "./themes.utils";

const lineChartData = [
	{ month: "Jan", desktop: 186, mobile: 80 },
	{ month: "Feb", desktop: 305, mobile: 200 },
	{ month: "Mar", desktop: 237, mobile: 120 },
	{ month: "Apr", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "Jun", desktop: 214, mobile: 140 },
];

const barChartData = [
	{ month: "Jan", desktop: 186, mobile: 80 },
	{ month: "Feb", desktop: 305, mobile: 200 },
	{ month: "Mar", desktop: 237, mobile: 120 },
	{ month: "Apr", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "Jun", desktop: 214, mobile: 140 },
];

const chartConfig = {
	desktop: { label: "Desktop", color: "var(--chart-1)" },
	mobile: { label: "Mobile", color: "var(--chart-2)" },
};

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
					{/* Chart Colors */}
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
					{/* Card Block */}
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

					{/* Form Block */}
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

					{/* Charts Block */}
					<PreviewBlock label="Charts">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Line Chart</CardTitle>
								<CardDescription>
									Visitors over the last 6 months
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer
									config={chartConfig}
									className="h-[160px] w-full"
								>
									<LineChart data={lineChartData} accessibilityLayer>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="month"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Line
											dataKey="desktop"
											type="monotone"
											stroke="var(--color-desktop)"
											strokeWidth={2}
											dot={false}
										/>
										<Line
											dataKey="mobile"
											type="monotone"
											stroke="var(--color-mobile)"
											strokeWidth={2}
											dot={false}
										/>
									</LineChart>
								</ChartContainer>
							</CardContent>
						</Card>
					</PreviewBlock>

					{/* Bar Chart Block */}
					<PreviewBlock label="Bar Chart">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Revenue</CardTitle>
								<CardDescription>Monthly revenue breakdown</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer
									config={chartConfig}
									className="h-[160px] w-full"
								>
									<BarChart data={barChartData} accessibilityLayer>
										<CartesianGrid vertical={false} />
										<XAxis
											dataKey="month"
											tickLine={false}
											axisLine={false}
											tickMargin={8}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar
											dataKey="desktop"
											fill="var(--color-desktop)"
											radius={4}
										/>
										<Bar
											dataKey="mobile"
											fill="var(--color-mobile)"
											radius={4}
										/>
									</BarChart>
								</ChartContainer>
							</CardContent>
						</Card>
					</PreviewBlock>

					{/* Payment Form Block */}
					<PreviewBlock label="Payment">
						<Card>
							<CardHeader>
								<CardTitle>Payment Method</CardTitle>
								<CardDescription>
									All transactions are secure and encrypted
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Name on Card</Label>
									<Input placeholder="John Doe" />
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div className="col-span-2 space-y-2">
										<Label>Card Number</Label>
										<Input placeholder="1234 5678 9012 3456" />
									</div>
									<div className="space-y-2">
										<Label>CVV</Label>
										<Input placeholder="123" />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Month</Label>
										<Select>
											<SelectTrigger>
												<SelectValue placeholder="MM" />
											</SelectTrigger>
											<SelectContent>
												{Array.from({ length: 12 }, (_, i) => {
													const month = String(i + 1).padStart(2, "0");
													return (
														<SelectItem key={month} value={month}>
															{month}
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label>Year</Label>
										<Select>
											<SelectTrigger>
												<SelectValue placeholder="YYYY" />
											</SelectTrigger>
											<SelectContent>
												{[2025, 2026, 2027, 2028, 2029].map((y) => (
													<SelectItem key={y} value={String(y)}>
														{y}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<Button className="w-full">Pay Now</Button>
							</CardContent>
						</Card>
					</PreviewBlock>

					{/* Table Block */}
					<PreviewBlock label="Table">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Recent Orders</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Invoice</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Amount</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell className="font-medium">INV-001</TableCell>
											<TableCell>
												<Badge variant="default">Paid</Badge>
											</TableCell>
											<TableCell className="text-right">$250.00</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">INV-002</TableCell>
											<TableCell>
												<Badge variant="secondary">Pending</Badge>
											</TableCell>
											<TableCell className="text-right">$150.00</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">INV-003</TableCell>
											<TableCell>
												<Badge variant="outline">Draft</Badge>
											</TableCell>
											<TableCell className="text-right">$350.00</TableCell>
										</TableRow>
										<TableRow>
											<TableCell className="font-medium">INV-004</TableCell>
											<TableCell>
												<Badge variant="destructive">Failed</Badge>
											</TableCell>
											<TableCell className="text-right">$450.00</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</PreviewBlock>

					{/* Controls Block */}
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

					{/* Buttons & Badges Block */}
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

					{/* Alerts Block */}
					<PreviewBlock label="Alerts">
						<div className="space-y-3">
							<Alert>
								<InfoIcon className="size-4" />
								<AlertTitle>Heads up!</AlertTitle>
								<AlertDescription>
									You can add components to your app using the CLI.
								</AlertDescription>
							</Alert>
							<Alert variant="destructive">
								<TriangleAlertIcon className="size-4" />
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>
									Your session has expired. Please log in again.
								</AlertDescription>
							</Alert>
							<Alert>
								<TerminalIcon className="size-4" />
								<AlertTitle>Terminal</AlertTitle>
								<AlertDescription>
									<code className="text-xs">bunx create-start-kit-dev</code>
								</AlertDescription>
							</Alert>
						</div>
					</PreviewBlock>

					{/* Skeleton Loading Block */}
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
				</div>
			</div>
		</div>
	);
}

function PreviewBlock({
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

function ColorSwatch({ label, token }: { label: string; token: string }) {
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
