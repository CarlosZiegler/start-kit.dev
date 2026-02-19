import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(
  document,
  import.meta.env.DEV ? (
    <StrictMode>
      <StartClient />
    </StrictMode>
  ) : (
    <StartClient />
  )
);
