import type { UITree } from "@json-render/core";

import { z } from "zod";

// Schema for individual UI elements (matches @json-render/core UIElement)
export const UIElementSchema = z.object({
  key: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
  children: z.array(z.string()).optional(),
  parentKey: z.string().nullable().optional(),
});

// Schema for the full UI tree
export const UITreeSchema = z.object({
  root: z.string(),
  elements: z.record(z.string(), UIElementSchema),
});

export type UITreeOutput = z.infer<typeof UITreeSchema>;

// Type guard to ensure compatibility with @json-render/core
export function isValidUITree(tree: unknown): tree is UITree {
  const result = UITreeSchema.safeParse(tree);
  return result.success;
}
