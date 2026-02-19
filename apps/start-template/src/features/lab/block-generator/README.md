# Block Generator: TanStack AI + JSON Render Integration

Real-time UI generation using TanStack AI for streaming LLM responses and `@json-render/react` for live preview rendering.

## Architecture Overview

```
User Prompt
    ↓
API Route (TanStack AI + OpenAI)
    ↓ JSONL stream
toTextStream adapter
    ↓ text/plain stream
useUIStream hook (@json-render/react)
    ↓ parsed UITree
Renderer → Live Preview
    ↓
generateReactCode → Exportable Code
```

## Key Files

| File | Purpose |
|------|---------|
| `index.ts` (API route) | Server endpoint using TanStack AI |
| `block-generator.page.tsx` | Main page with `useUIStream` |
| `block-generator.preview.tsx` | Live preview using `Renderer` |
| `block-generator.registry.tsx` | Component registry mapping |
| `block-generator.codegen.ts` | UITree → React code converter |
| `to-text-stream.ts` | TanStack AI → text stream adapter |

## Server-Side: TanStack AI Setup

### API Route

```typescript
import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { toTextStream } from "@/lib/tanstack-ai/to-text-stream";

POST: async ({ request }: { request: Request }) => {
  const { prompt, currentTree } = await request.json();
  const abortController = new AbortController();

  const stream = chat({
    adapter: openaiText("gpt-4o-mini"),
    systemPrompts: [SYSTEM_PROMPT],
    messages: [{ role: "user", content: prompt }],
  });

  const readableStream = toTextStream(stream, abortController);

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
```

### TanStack AI → Text Stream Adapter

TanStack AI emits `{ type: "content", delta: "..." }` chunks. The adapter extracts raw text:

```typescript
// src/lib/tanstack-ai/to-text-stream.ts
export function toTextStream(
  stream: AsyncIterable<{ type: string; delta?: string }>,
  abortController?: AbortController
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (abortController?.signal.aborted) break;
        if (chunk.type === "content" && chunk.delta) {
          controller.enqueue(encoder.encode(chunk.delta));
        }
      }
      controller.close();
    },
    cancel() {
      abortController?.abort();
    },
  });
}
```

## Client-Side: useUIStream Hook

### Basic Usage

```tsx
import { useUIStream } from "@json-render/react";

function BlockGeneratorPage() {
  const { tree, isStreaming, error, send, clear } = useUIStream({
    api: "/api/lab/block-generator",
  });

  const handleGenerate = (prompt: string) => {
    clear();
    send(prompt);
  };

  return (
    <JSONUIProvider registry={blockRegistry}>
      <Renderer registry={blockRegistry} tree={tree} />
    </JSONUIProvider>
  );
}
```

### Hook Return Values

| Value | Type | Description |
|-------|------|-------------|
| `tree` | `UITree \| null` | Parsed UI structure |
| `isStreaming` | `boolean` | Active stream status |
| `error` | `Error \| null` | Stream error if any |
| `send(prompt)` | `function` | Start generation |
| `clear()` | `function` | Reset tree state |

## JSONL Patch Format

The LLM outputs JSONL where each line is a patch operation:

```jsonl
{"op":"set","path":"/root","value":"settings-page"}
{"op":"add","path":"/elements/settings-page","value":{"key":"settings-page","type":"Stack","props":{"gap":6},"children":["profile-section"]}}
{"op":"add","path":"/elements/profile-section","value":{"key":"profile-section","type":"Card","props":{"title":"Profile"},"children":["profile-form"]}}
```

### Operations

| Operation | Path | Description |
|-----------|------|-------------|
| `set` | `/root` | Set root element key |
| `add` | `/elements/{key}` | Add element by unique key |

### Element Structure

```typescript
interface Element {
  key: string;           // Unique identifier
  type: string;          // Component type (Card, Button, etc.)
  props: Record<string, unknown>;
  children?: string[];   // Child element keys (containers only)
}
```

## Component Registry

Map component types to React implementations:

```tsx
// block-generator.registry.tsx
export const blockRegistry: ComponentRegistry = {
  Card: ({ element, children }) => {
    const { title, description, className } = element.props;
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    );
  },

  Stack: ({ element, children }) => {
    const { gap, className } = element.props;
    return (
      <div className={cn("flex flex-col", gap && `gap-${gap}`, className)}>
        {children}
      </div>
    );
  },

  Button: ({ element }) => {
    const { text, variant, size, disabled } = element.props;
    return (
      <Button variant={variant} size={size} disabled={disabled} type="button">
        {text}
      </Button>
    );
  },
  // ... more components
};
```

## System Prompt Design

### Available Components

```
Flex, Stack, Grid, Card, Button, Badge, Input, Text,
Separator, Avatar, Progress, Alert
```

### Spacing Rules (Critical for Good Output)

```
- Page/section containers: gap=6 or gap=8
- Cards within a page: gap=6
- Form groups (label + input): gap=2
- Multiple inputs in a form: gap=4
- Buttons in a row: gap=3
- NEVER use gap=1
- ALWAYS wrap label + input in Stack with gap=2
```

### Spacing Hierarchy Pattern

```
Stack (gap=6)              ← page sections
  └─ Card
       └─ Stack (gap=4)    ← form fields
            └─ Stack (gap=2) ← label + input
```

### Example Prompt Output

```jsonl
{"op":"set","path":"/root","value":"settings-page"}
{"op":"add","path":"/elements/settings-page","value":{"key":"settings-page","type":"Stack","props":{"gap":6},"children":["profile-section","password-section"]}}
{"op":"add","path":"/elements/profile-section","value":{"key":"profile-section","type":"Card","props":{"title":"Profile"},"children":["profile-form"]}}
{"op":"add","path":"/elements/profile-form","value":{"key":"profile-form","type":"Stack","props":{"gap":4},"children":["name-field","email-field"]}}
{"op":"add","path":"/elements/name-field","value":{"key":"name-field","type":"Stack","props":{"gap":2},"children":["name-label","name-input"]}}
{"op":"add","path":"/elements/name-label","value":{"key":"name-label","type":"Text","props":{"content":"Name","variant":"label"}}}
{"op":"add","path":"/elements/name-input","value":{"key":"name-input","type":"Input","props":{"placeholder":"Enter name"}}}
```

## Code Generation

Convert UITree back to React code:

```typescript
import { generateReactCode } from "./block-generator.codegen";

const code = generateReactCode(tree);
// Output:
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
//
// export function SettingsPage() {
//   return (
//     <div className="flex flex-col gap-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Profile</CardTitle>
//         </CardHeader>
//         <CardContent>
//           ...
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
```

## Dependencies

```json
{
  "@tanstack/ai": "^0.x",
  "@tanstack/ai-openai": "^0.x",
  "@json-render/core": "^0.x",
  "@json-render/react": "^0.x"
}
```

## Adding New Components

1. Add to `COMPONENT_DETAILS` in system prompt
2. Add to `COMPONENT_IMPORTS` in `block-generator.codegen.ts`
3. Add renderer in `block-generator.registry.tsx`
4. Add code generator case in `generateElementCode()`

## Troubleshooting

### Stream Not Updating

Check that `toTextStream` correctly filters `chunk.type === "content"`.

### Components Not Rendering

Verify the component type exists in `blockRegistry`.

### Poor Spacing

Ensure system prompt includes explicit spacing rules with concrete gap values.
