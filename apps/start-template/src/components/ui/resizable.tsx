import type * as React from "react";

import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  direction,
  ...props
}: React.ComponentProps<typeof Group> & {
  direction?: "horizontal" | "vertical";
}) {
  return (
    <Group
      className={cn(
        "flex h-full w-full data-[orientation=vertical]:flex-col",
        className
      )}
      data-slot="resizable-panel-group"
      orientation={direction}
      {...props}
    />
  );
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-1 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:after:-translate-y-1/2 [&[data-orientation=vertical]>div]:rotate-90",
        className
      )}
      data-slot="resizable-handle"
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
