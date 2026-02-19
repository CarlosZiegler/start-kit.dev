import { createCatalog, generateCatalogPrompt } from "@json-render/core";
import { BLOCK_COMPONENTS } from "./block-generator.components";
import { createCatalogComponentsFromConfigs } from "./block-generator.config";

export const blockCatalog = createCatalog({
  name: "BlockGenerator",
  components: createCatalogComponentsFromConfigs(BLOCK_COMPONENTS),
  actions: {},
  validation: "warn",
});

export const catalogPrompt = generateCatalogPrompt(blockCatalog);

export type BlockCatalog = typeof blockCatalog;
