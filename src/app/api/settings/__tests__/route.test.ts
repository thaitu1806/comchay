import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mock DB ─────────────────────────────────────────────────────────────────

let mockRows: { key: string; value: string }[] = [];

const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();

// select().from() → resolves to mockRows
const mockFrom = vi.fn(() => ({
  where: (...args: unknown[]) => {
    mockWhere(...args);
    return {
      limit: (...lArgs: unknown[]) => {
        mockLimit(...lArgs);
        return Promise.resolve(
          mockRows.filter(() => true) // filtered in test setup
        );
      },
    };
  },
  then: (res: any, rej?: any) => Promise.resolve(mockRows).then(res, rej),
}));

const mockSelect = vi.fn(() => ({ from: mockFrom }));

// insert().values().returning() chain — not used by settings but keep for completeness
const mockInsertValues = vi.fn(() => ({
  returning: mockReturning.mockReturnValue(Promise.resolve([])),
}));
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

// update().set().where() chain
const mockUpdateWhere = vi.fn(() => Promise.resolve());
const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

import { GET, PUT } from "../route";

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeGetRequest(): NextRequest {
  return new NextRequest("http://localhost/api/settings");
}

function makePutRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/settings", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("GET /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRows = [];
  });

  it("returns default empty strings when no settings exist", async () => {
    mockRows = [];
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({
      hotline: "",
      zalo_url: "",
      shopee_url: "",
      promo_banner: "",
      promo_banner_active: "",
    });
  });

  it("returns stored settings values", async () => {
    mockRows = [
      { key: "hotline", value: "0909123456" },
      { key: "zalo_url", value: "https://zalo.me/shop" },
      { key: "promo_banner_active", value: "true" },
    ];

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.hotline).toBe("0909123456");
    expect(json.zalo_url).toBe("https://zalo.me/shop");
    expect(json.shopee_url).toBe("");
    expect(json.promo_banner).toBe("");
    expect(json.promo_banner_active).toBe("true");
  });

  it("returns 500 on DB error", async () => {
    mockSelect.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    const res = await GET();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});

describe("PUT /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRows = [];

    // Default: existing row lookup returns empty (new key)
    mockFrom.mockImplementation(() => ({
      where: (...args: unknown[]) => {
        mockWhere(...args);
        return {
          limit: () => Promise.resolve([]),
        };
      },
      then: (res: any, rej?: any) => Promise.resolve(mockRows).then(res, rej),
    }));
  });

  it("rejects empty hotline", async () => {
    const res = await PUT(makePutRequest({ hotline: "" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("hotline");
  });

  it("rejects whitespace-only hotline", async () => {
    const res = await PUT(makePutRequest({ hotline: "   " }));
    expect(res.status).toBe(400);
  });

  it("accepts valid hotline and calls insert for new keys", async () => {
    const res = await PUT(makePutRequest({ hotline: "0909123456" }));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalled();
  });

  it("calls update for existing keys", async () => {
    // Make the lookup return an existing row
    mockFrom.mockImplementation(() => ({
      where: (...args: unknown[]) => {
        mockWhere(...args);
        return {
          limit: () => Promise.resolve([{ id: 1, key: "hotline", value: "old" }]),
        };
      },
      then: (res: any, rej?: any) => Promise.resolve(mockRows).then(res, rej),
    }));

    const res = await PUT(makePutRequest({ hotline: "0909999999" }));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("ignores unknown keys", async () => {
    const res = await PUT(makePutRequest({ unknown_key: "value" }));
    expect(res.status).toBe(200);
    // No insert or update should be called for unknown keys
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns 500 on DB error during upsert", async () => {
    mockFrom.mockImplementation(() => ({
      where: () => ({
        limit: () => {
          throw new Error("DB error");
        },
      }),
      then: (res: any, rej?: any) => Promise.resolve(mockRows).then(res, rej),
    }));

    const res = await PUT(makePutRequest({ hotline: "0909123456" }));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
