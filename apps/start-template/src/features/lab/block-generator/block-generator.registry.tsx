import { BLOCK_COMPONENTS } from "./block-generator.components";
import { createRegistryFromConfigs } from "./block-generator.config";

export const blockRegistry = createRegistryFromConfigs(BLOCK_COMPONENTS);
