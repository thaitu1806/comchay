import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));
const mockInsert = vi.fn(() => ({ values: mockValues }));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock("@/lib/slug", () => ({
  generateSlug: vi.fn((name: string) =>
    name.toLowerCase().replace(/\s+/g, "-")
  ),
}));

import { POST } from "../route";
import { generateSlug } from "@/lib/slug";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/products", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/products", () => {
  beforeEach(() => {
    mockReturning.mockReset();
    mockValues.mockReset().mockImplementation(() => ({ returning: mockReturning }));
    mockInsert.mockReset().mockImplementation(() => ({ values: mockValues }));
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makeRequest({ price: 50000 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when price is missing", async () => {
    const res = await POST(makeRequest({ name: "Cơm cháy" }));
    expect(res.status).toBe(400);
  });

  it("returns 201 and creates product with provided slug", async () => {
    const product = { id: 1, name: "Cơm cháy", slug: "com-chay", price: 50000 };
    mockReturning.mockResolvedValueOnce([product]);

    const res = await POST(
      makeRequest({ name: "Cơm cháy", price: 50000, slug: "com-chay" })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe(1);
    expect(json.slug).toBe("com-chay");
  });

  it("auto-generates slug from name when slug is not provided", async () => {
    const product = { id: 2, name: "Cơm cháy đặc biệt", slug: "com-chay-dac-biet", price: 60000 };
    mockReturning.mockResolvedValueOnce([product]);

    await POST(makeRequest({ name: "Cơm cháy đặc biệt", price: 60000 }));

    expect(generateSlug).toHaveBeenCalledWith("Cơm cháy đặc biệt");
  });

  it("inserts media when media array is provided", async () => {
    const product = { id: 3, name: "Test", slug: "test", price: 10000 };
    // First insert (product) returns the product
    mockReturning.mockResolvedValueOnce([product]);

    const media = [
      { url: "https://example.com/img.jpg", type: "image" },
      { url: "https://example.com/vid.mp4", type: "video" },
    ];

    const res = await POST(
      makeRequest({ name: "Test", price: 10000, slug: "test", media })
    );

    expect(res.status).toBe(201);
    // db.insert should be called twice: once for product, once for media
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it("returns 409 when slug already exists", async () => {
    mockReturning.mockRejectedValueOnce(
      new Error("UNIQUE constraint failed: products.slug")
    );

    const res = await POST(
      makeRequest({ name: "Cơm cháy", price: 50000, slug: "existing-slug" })
    );

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("Slug");
  });

  it("returns 500 on unexpected errors", async () => {
    mockReturning.mockRejectedValueOnce(new Error("DB connection lost"));

    const res = await POST(
      makeRequest({ name: "Cơm cháy", price: 50000 })
    );

    expect(res.status).toBe(500);
  });
});
