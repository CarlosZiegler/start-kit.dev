import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, TerminalIcon, TriangleAlertIcon } from "lucide-react";

import { PreviewBlock } from "./shared";

export function AlertsBlock() {
	return (
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
	);
}
