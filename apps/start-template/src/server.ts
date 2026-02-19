// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler, { type ServerEntry } from "@tanstack/react-start/server-entry";

export default {
  async fetch(request: Request) {
    const response = await handler.fetch(request);

    return response;
  },
} satisfies ServerEntry;
