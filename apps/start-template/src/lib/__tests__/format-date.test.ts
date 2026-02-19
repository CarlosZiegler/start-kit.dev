import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateMedium,
  formatDateShort,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/format-date";

describe("formatDate", () => {
  it("formats Date object", () => {
    const date = new Date("2025-01-01");
    const result = formatDate(date, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(result).toBe("January 1, 2025");
  });

  it("formats string date", () => {
    const result = formatDate("2025-01-01", { year: "numeric" });
    expect(result).toBe("2025");
  });

  it("formats timestamp", () => {
    const result = formatDate(1_735_689_600_000, { year: "numeric" });
    expect(result).toBe("2025");
  });

  it("formats with locale", () => {
    const date = new Date("2025-01-01");
    const result = formatDate(date, { year: "numeric" }, "fr-FR");
    expect(result).toBe("2025");
  });
});

describe("formatDateShort", () => {
  it("formats date in short style", () => {
    const date = new Date("2025-01-15");
    const result = formatDateShort(date);
    expect(result).toContain("2025");
  });
});

describe("formatDateMedium", () => {
  it("formats date in medium style", () => {
    const date = new Date("2025-01-15");
    const result = formatDateMedium(date);
    expect(result).toContain("2025");
  });
});

describe("formatDateTime", () => {
  it("formats date and time", () => {
    const date = new Date("2025-01-15T12:00:00");
    const result = formatDateTime(date);
    expect(result).toContain("2025");
  });
});

describe("formatRelativeTime", () => {
  it("formats time in the past", () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 30);
    const result = formatRelativeTime(date);
    expect(result).toContain("30");
  });

  it("formats time in the future", () => {
    const date = new Date();
    date.setHours(date.getHours() + 2);
    const result = formatRelativeTime(date);
    expect(result).toContain("2");
  });

  it("formats old dates as short date", () => {
    const date = new Date("2020-01-01");
    const result = formatRelativeTime(date);
    expect(result).toContain("2020");
  });
});
