import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { PreviewBlock } from "./shared";

export function TableBlock() {
	return (
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
	);
}
