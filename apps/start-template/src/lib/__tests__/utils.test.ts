import { describe, expect, it } from "vitest";

import { cn, nanoid, uuid } from "@/lib/utils";

const NANO_ID_REGEX = /^[a-z0-9]+$/;
const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false, "baz")).toBe("foo baz");
  });

  it("handles Tailwind merge conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("nanoid utility", () => {
  it("generates unique IDs", () => {
    const id1 = nanoid();
    const id2 = nanoid();
    expect(id1).not.toBe(id2);
  });

  it("generates IDs with default length", () => {
    const id = nanoid();
    expect(id).toHaveLength(21);
  });

  it("generates IDs with custom length", () => {
    const id = nanoid(10);
    expect(id).toHaveLength(10);
  });

  it("generates IDs containing only allowed characters", () => {
    const id = nanoid();
    expect(id).toMatch(NANO_ID_REGEX);
  });
});

describe("uuid utility", () => {
  it("generates unique UUIDs", () => {
    const uuid1 = uuid();
    const uuid2 = uuid();
    expect(uuid1).not.toBe(uuid2);
  });

  it("generates UUID v7 format", () => {
    const id = uuid();
    expect(id).toMatch(UUID_V7_REGEX);
  });
});
