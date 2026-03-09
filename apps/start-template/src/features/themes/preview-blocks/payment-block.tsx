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

import { PreviewBlock } from "./shared";

export function PaymentBlock() {
	return (
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
	);
}
