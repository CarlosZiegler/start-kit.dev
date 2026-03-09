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
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { PreviewBlock } from "./shared";

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

export function ChartsBlock() {
	return (
		<>
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
		</>
	);
}
