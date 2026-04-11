import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Each db.select() call produces a chain: select() -> from() -> where() -> resolves
// The route destructures the result as an array, so the final resolved value must be an array.
const mockResults: unknown[][] = [];
let selectCallIndex = 0;

function createSelectChain(index: number) {
  const result = () => Promise.resolve(mockResults[index] ?? [{ total: 0 }]);
  // where() returns a thenable (the promise)
  const where = vi.fn(result);
  // from() returns { where } but is also thenable itself (for queries without .where())
  const fromResult = { where, then: (res: any, rej?: any) => result().then(res, rej) };
  const from = vi.fn(() => fromResult);
  return { from };
}

const mockSelect = vi.fn(() => {
  const idx = selectCallIndex++;
  return createSelectChain(idx);
});

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import { GET } from "../route";

function makeRequest(url = "http://localhost/api/stats"): NextRequest {
  return new NextRequest(url);
}

describe("GET /api/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectCallIndex = 0;
    mockResults.length = 0;
  });

  it("returns 200 with stats object (no date range)", async () => {
    // 4 queries: totalVisits, ordersToday, ordersThisWeek, ordersThisMonth
    mockResults.push(
      [{ total: 150 }],
      [{ total: 5 }],
      [{ total: 20 }],
      [{ total: 80 }],
    );

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.totalVisits).toBe(150);
    expect(json.ordersToday).toBe(5);
    expect(json.ordersThisWeek).toBe(20);
    expect(json.ordersThisMonth).toBe(80);
    expect(json.ordersInRange).toBeUndefined();
  });

  it("includes ordersInRange when startDate and endDate provided", async () => {
    // 5 queries: totalVisits, ordersToday, ordersThisWeek, ordersThisMonth, ordersInRange
    mockResults.push(
      [{ total: 100 }],
      [{ total: 3 }],
      [{ total: 10 }],
      [{ total: 40 }],
      [{ total: 15 }],
    );

    const res = await GET(
      makeRequest("http://localhost/api/stats?startDate=2024-01-01&endDate=2024-01-31")
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.totalVisits).toBe(100);
    expect(json.ordersToday).toBe(3);
    expect(json.ordersThisWeek).toBe(10);
    expect(json.ordersThisMonth).toBe(40);
    expect(json.ordersInRange).toBe(15);
  });

  it("does not include ordersInRange when only startDate provided", async () => {
    mockResults.push(
      [{ total: 50 }],
      [{ total: 1 }],
      [{ total: 5 }],
      [{ total: 20 }],
    );

    const res = await GET(
      makeRequest("http://localhost/api/stats?startDate=2024-01-01")
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ordersInRange).toBeUndefined();
    expect(json.totalVisits).toBe(50);
  });

  it("does not include ordersInRange when only endDate provided", async () => {
    mockResults.push(
      [{ total: 50 }],
      [{ total: 1 }],
      [{ total: 5 }],
      [{ total: 20 }],
    );

    const res = await GET(
      makeRequest("http://localhost/api/stats?endDate=2024-01-31")
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ordersInRange).toBeUndefined();
  });

  it("returns 500 on DB error", async () => {
    mockSelect.mockImplementationOnce(() => {
      throw new Error("DB connection lost");
    });

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("defaults to 0 when results are empty", async () => {
    mockResults.push(
      [{ total: 0 }],
      [{ total: 0 }],
      [{ total: 0 }],
      [{ total: 0 }],
    );

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.totalVisits).toBe(0);
    expect(json.ordersToday).toBe(0);
    expect(json.ordersThisWeek).toBe(0);
    expect(json.ordersThisMonth).toBe(0);
  });
});
