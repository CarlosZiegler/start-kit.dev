import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth/auth";
import { toTextStream } from "@/lib/tanstack-ai/to-text-stream";

const componentList = [
  "Flex",
  "Stack",
  "Grid",
  "Card",
  "ScrollArea",
  "Dialog",
  "Sheet",
  "Popover",
  "Input",
  "Textarea",
  "Checkbox",
  "Switch",
  "Slider",
  "Select",
  "RadioGroup",
  "Text",
  "Button",
  "Badge",
  "Avatar",
  "Progress",
  "Separator",
  "Skeleton",
  "Alert",
  "Tabs",
  "Accordion",
  "Table",
  "DropdownMenu",
  "Tooltip",
];

const SYSTEM_PROMPT = `You are a UI component generator that outputs JSONL (JSON Lines) patches.

AVAILABLE COMPONENTS:
${componentList.join(", ")}

COMPONENT DETAILS:
- Flex: { direction?: "row"|"column", gap?: 1-6, align?: "start"|"center"|"end"|"stretch", justify?: "start"|"center"|"end"|"between" }
- Stack: { gap?: 1-6 } - Vertical flex layout
- Grid: { cols?: 1-12, gap?: 1-6 }
- Card: { title?: string, description?: string }
- ScrollArea: { height?: string }
- Dialog: { title?: string, description?: string, trigger: string }
- Sheet: { title?: string, trigger: string, side?: "top"|"right"|"bottom"|"left" }
- Popover: { trigger: string, side?: "top"|"right"|"bottom"|"left" }
- Input: { placeholder?: string, type?: "text"|"email"|"password"|"number" }
- Textarea: { placeholder?: string, rows?: number }
- Checkbox: { checked?: boolean, disabled?: boolean }
- Switch: { checked?: boolean, disabled?: boolean }
- Slider: { defaultValue?: number, min?: number, max?: number, step?: number }
- Select: { placeholder?: string, options: [{value: string, label: string}] }
- RadioGroup: { options: [{value: string, label: string}], defaultValue?: string }
- Text: { content: string, variant?: "default"|"muted"|"heading"|"subheading"|"label" }
- Button: { text: string, variant?: "default"|"outline"|"secondary"|"ghost"|"destructive", size?: "default"|"sm"|"lg" }
- Badge: { text: string, variant?: "default"|"secondary"|"destructive"|"outline" }
- Avatar: { src?: string, fallback: string }
- Progress: { value: number }
- Separator: { orientation?: "horizontal"|"vertical" }
- Skeleton: { width?: string, height?: string }
- Alert: { title?: string, description: string, variant?: "default"|"destructive" }
- Tabs: { tabs: [{value: string, label: string, content: string}], defaultValue?: string }
- Accordion: { items: [{value: string, title: string, content: string}] }
- Table: { headers: string[], rows: string[][] }
- DropdownMenu: { trigger: string, items: [{label: string}] }
- Tooltip: { content: string, side?: "top"|"right"|"bottom"|"left" }

SPACING (gap values map to Tailwind: gap-1=4px, gap-2=8px, gap-3=12px, gap-4=16px, gap-6=24px):
- gap=6: between sections/cards
- gap=4: between form fields
- gap=2: between label and input
- gap=3: between buttons

OUTPUT FORMAT:
Output JSONL where each line is a patch operation:
- {"op":"set","path":"/root","value":"main-key"} - Set root element key
- {"op":"add","path":"/elements/{key}","value":{...}} - Add element by key

ELEMENT STRUCTURE:
{ "key": "unique-key", "type": "ComponentType", "props": {...}, "children": ["child-key-1"] }

RULES:
1. First set /root to root element key
2. Add elements with unique keys via /elements/{key}
3. Parent elements list child keys in "children" array
4. Stream parent first, then children
5. Children array contains STRING KEYS only

EXAMPLE:
{"op":"set","path":"/root","value":"settings-card"}
{"op":"add","path":"/elements/settings-card","value":{"key":"settings-card","type":"Card","props":{"title":"Settings"},"children":["form"]}}
{"op":"add","path":"/elements/form","value":{"key":"form","type":"Stack","props":{"gap":4},"children":["name-field","save-btn"]}}
{"op":"add","path":"/elements/name-field","value":{"key":"name-field","type":"Stack","props":{"gap":2},"children":["name-label","name-input"]}}
{"op":"add","path":"/elements/name-label","value":{"key":"name-label","type":"Text","props":{"content":"Name","variant":"label"}}}
{"op":"add","path":"/elements/name-input","value":{"key":"name-input","type":"Input","props":{"placeholder":"Enter name"}}}
{"op":"add","path":"/elements/save-btn","value":{"key":"save-btn","type":"Button","props":{"text":"Save"}}}

Generate JSONL patches now:`;

export const Route = createFileRoute("/api/lab/block-generator/")({
  server: {
    handlers: {
      //       POST: async ({ request }: { request: Request }) => {
      //   try {
      //     const { prompt, currentTree } = await request.json();

      //     if (!prompt || typeof prompt !== "string") {
      //       return Response.json(
      //         { error: "Prompt is required" },
      //         { status: 400 }
      //       );
      //     }

      //     const contextPrompt = currentTree
      //       ? `\n\nCurrent UI state:\n${JSON.stringify(currentTree, null, 2)}`
      //       : "";

      //     const result = streamText({
      //       model: openai("gpt-4o-mini"),
      //       system: SYSTEM_PROMPT + contextPrompt,
      //       prompt,
      //     });

      //     return new Response(result.textStream, {
      //       headers: {
      //         "Content-Type": "text/plain; charset=utf-8",
      //         "Transfer-Encoding": "chunked",
      //       },
      //     });
      //   } catch (error: unknown) {
      //     console.error("Block generator error:", error);
      //     const message =
      //       error instanceof Error ? error.message : "Generation failed";
      //     return Response.json({ error: message }, { status: 500 });
      //   }
      // },

      POST: async ({ request }: { request: Request }) => {
        try {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
          }

          const { prompt, currentTree } = await request.json();
          const abortController = new AbortController();

          if (!prompt || typeof prompt !== "string") {
            return Response.json(
              { error: "Prompt is required" },
              { status: 400 }
            );
          }

          const contextPrompt = currentTree
            ? `\n\nCurrent UI state:\n${JSON.stringify(currentTree, null, 2)}`
            : "";

          const stream = chat({
            adapter: openaiText("gpt-4o-mini"),
            systemPrompts: [SYSTEM_PROMPT, contextPrompt],
            messages: [{ role: "user", content: prompt }],
          });

          const readableStream = toTextStream(
            stream as unknown as AsyncIterable<{
              type: string;
              delta?: string;
            }>,
            abortController
          );

          return new Response(readableStream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Transfer-Encoding": "chunked",
            },
          });
        } catch (error: unknown) {
          console.error("Block generator error:", error);
          const message =
            error instanceof Error ? error.message : "Generation failed";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
