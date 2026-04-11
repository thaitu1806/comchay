import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockInsert = vi.fn();
const mockValues = vi.fn(() => Promise.resolve());

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => {
      mockInsert(...args);
      return { values: mockValues };
    },
  },
}));

import { POST } from "../route";

function makeRequest(body?: unknown): NextRequest {
  return new NextRequest("http://localhost/api/stats/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/stats/visit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValues.mockResolvedValue(undefined);
  });

  it("returns 201 and inserts with default pagePath when no body", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.message).toBeDefined();

    expect(mockValues).toHaveBeenCalledWith({ pagePath: "/" });
  });

  it("uses provided pagePath", async () => {
    const res = await POST(makeRequest({ pagePath: "/san-pham/com-chay" }));
    expect(res.status).toBe(201);

    expect(mockValues).toHaveBeenCalledWith({ pagePath: "/san-pham/com-chay" });
  });

  it("defaults to / when pagePath is empty string", async () => {
    const res = await POST(makeRequest({ pagePath: "  " }));
    expect(res.status).toBe(201);

    expect(mockValues).toHaveBeenCalledWith({ pagePath: "/" });
  });

  it("defaults to / when pagePath is not a string", async () => {
    const res = await POST(makeRequest({ pagePath: 123 }));
    expect(res.status).toBe(201);

    expect(mockValues).toHaveBeenCalledWith({ pagePath: "/" });
  });

  it("returns 500 on DB error", async () => {
    mockValues.mockRejectedValueOnce(new Error("DB failure"));

    const res = await POST(makeRequest({ pagePath: "/" }));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
