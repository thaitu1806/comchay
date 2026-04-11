import { describe, it, expect } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("converts Vietnamese name to ASCII slug", () => {
    expect(generateSlug("Cơm cháy truyền thống")).toBe("com-chay-truyen-thong");
  });

  it("handles all Vietnamese vowel groups", () => {
    expect(generateSlug("ăắằẳẵặ")).toBe("aaaaaa");
    expect(generateSlug("âấầẩẫậ")).toBe("aaaaaa");
    expect(generateSlug("êếềểễệ")).toBe("eeeeee");
    expect(generateSlug("ôốồổỗộ")).toBe("oooooo");
    expect(generateSlug("ơớờởỡợ")).toBe("oooooo");
    expect(generateSlug("ưứừửữự")).toBe("uuuuuu");
  });

  it("converts đ to d", () => {
    expect(generateSlug("đặc biệt")).toBe("dac-biet");
  });

  it("returns empty string for empty or whitespace input", () => {
    expect(generateSlug("")).toBe("");
    expect(generateSlug("   ")).toBe("");
    expect(generateSlug("\t\n")).toBe("");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("  hello world  ")).toBe("hello-world");
    expect(generateSlug("---test---")).toBe("test");
  });

  it("collapses consecutive hyphens", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
    expect(generateSlug("a---b")).toBe("a-b");
  });

  it("strips non-alphanumeric characters", () => {
    expect(generateSlug("hello@world!")).toBe("hello-world");
    expect(generateSlug("price: 50,000đ")).toBe("price-50-000d");
  });

  it("preserves digits", () => {
    expect(generateSlug("combo 3 túi")).toBe("combo-3-tui");
  });

  it("converts uppercase to lowercase", () => {
    expect(generateSlug("CƠM CHÁY")).toBe("com-chay");
  });
});
