import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

vi.mock("i18next", () => ({
  default: {
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: "en",
    init: vi.fn(),
  },
}));
