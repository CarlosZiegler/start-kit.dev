import type { ComponentRegistry } from "@json-render/react";
import type { z } from "zod";

// Component configuration type - single source of truth
export type ComponentConfig = {
  name: string;
  render: ComponentRegistry[string];
  schema: z.ZodObject<z.ZodRawShape>;
  imports: { from: string; named: string[] };
  hasChildren: boolean;
  description: string;
};

// Helper to create typed component configs
export function defineComponent<T extends z.ZodRawShape>(
  config: Omit<ComponentConfig, "schema"> & { schema: z.ZodObject<T> }
): ComponentConfig {
  return config as ComponentConfig;
}

// Derive registry from configs
export function createRegistryFromConfigs(
  configs: ComponentConfig[]
): ComponentRegistry {
  return Object.fromEntries(configs.map((c) => [c.name, c.render]));
}

// Derive catalog components from configs
export function createCatalogComponentsFromConfigs(configs: ComponentConfig[]) {
  return Object.fromEntries(
    configs.map((c) => [
      c.name,
      {
        props: c.schema,
        hasChildren: c.hasChildren,
        description: c.description,
      },
    ])
  );
}

// Derive imports from configs
export function createImportsFromConfigs(
  configs: ComponentConfig[]
): Record<string, { from: string; named: string[] }> {
  return Object.fromEntries(configs.map((c) => [c.name, c.imports]));
}
