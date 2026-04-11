import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockReturning = vi.fn();
const mockValues = vi.fn(() => ({ returning: mockReturning }));
const mockInsert = vi.fn(() => ({ values: mockValues }));

// Select chain mocks for GET handler
const mockOrderBy = vi.fn();
const mockWhere = vi.fn(() => ({ orderBy: mockOrderBy }));
const mockItemsFrom = vi.fn();
const mockFrom = vi.fn(() => ({ where: mockWhere, orderBy: mockOrderBy }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

vi.mock("@/lib/telegram", () => ({
  sendOrderNotification: vi.fn(() => Promise.resolve()),
}));

import { POST, GET } from "../route";
import { sendOrderNotification } from "@/lib/telegram";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validBody = {
  customerName: "Nguyễn Văn A",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  phone: "0901234567",
  facebookLink: "https://facebook.com/test",
  items: [
    { productId: 1, productName: "Cơm cháy", productPrice: 50000, quantity: 2 },
    { productId: 2, productName: "Cơm cháy đặc biệt", productPrice: 70000, quantity: 1 },
  ],
};

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReturning.mockReset();
    mockValues.mockReset().mockImplementation(() => ({ returning: mockReturning }));
    mockInsert.mockReset().mockImplementation(() => ({ values: mockValues }));
  });

  it("returns 400 when customerName is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, customerName: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toContain("Tên khách hàng là bắt buộc");
  });

  it("returns 400 when address is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, address: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toContain("Địa chỉ là bắt buộc");
  });

  it("returns 400 when phone is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, phone: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toContain("Số điện thoại là bắt buộc");
  });

  it("returns 400 when phone is invalid", async () => {
    const res = await POST(makeRequest({ ...validBody, phone: "12345" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toContain("Số điện thoại không hợp lệ");
  });

  it("returns 400 when items is empty", async () => {
    const res = await POST(makeRequest({ ...validBody, items: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors).toContain("Danh sách sản phẩm không được trống");
  });

  it("returns 400 with multiple errors", async () => {
    const res = await POST(makeRequest({ items: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("returns 201 and creates order with correct totals", async () => {
    const createdOrder = {
      id: 1,
      customerName: "Nguyễn Văn A",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      phone: "0901234567",
      facebookLink: "https://facebook.com/test",
      subtotal: 170000, // 50000*2 + 70000*1
      shippingFee: 15000, // 3 bags → 15000
      total: 185000,
      status: "mới",
      createdAt: "2024-01-01",
    };

    // First insert (order) returns the order
    mockReturning.mockResolvedValueOnce([createdOrder]);
    // Second insert (order items) — no returning needed
    mockValues.mockImplementation(() => ({ returning: mockReturning }));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.id).toBe(1);
    expect(json.subtotal).toBe(170000);
    expect(json.shippingFee).toBe(15000);
    expect(json.total).toBe(185000);
    expect(json.items).toHaveLength(2);
    expect(json.items[0].lineTotal).toBe(100000);
    expect(json.items[1].lineTotal).toBe(70000);
  });

  it("sends Telegram notification after order creation", async () => {
    const createdOrder = {
      id: 2,
      customerName: "Test",
      address: "Test Address",
      phone: "0901234567",
      facebookLink: null,
      subtotal: 50000,
      shippingFee: 30000,
      total: 80000,
      status: "mới",
      createdAt: "2024-01-01",
    };

    mockReturning.mockResolvedValueOnce([createdOrder]);

    const body = {
      customerName: "Test",
      address: "Test Address",
      phone: "0901234567",
      items: [{ productId: 1, productName: "Cơm cháy", productPrice: 50000, quantity: 1 }],
    };

    await POST(makeRequest(body));

    expect(sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Test",
        phone: "0901234567",
        address: "Test Address",
      })
    );
  });

  it("returns 500 on DB error", async () => {
    mockReturning.mockRejectedValueOnce(new Error("DB connection lost"));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("handles facebookLink as optional", async () => {
    const createdOrder = {
      id: 3,
      customerName: "Test",
      address: "Test Address",
      phone: "0901234567",
      facebookLink: null,
      subtotal: 50000,
      shippingFee: 30000,
      total: 80000,
      status: "mới",
      createdAt: "2024-01-01",
    };

    mockReturning.mockResolvedValueOnce([createdOrder]);

    const body = {
      customerName: "Test",
      address: "Test Address",
      phone: "0901234567",
      items: [{ productId: 1, productName: "Cơm cháy", productPrice: 50000, quantity: 1 }],
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
  });
});

describe("GET /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderBy.mockReset();
    mockWhere.mockReset().mockImplementation(() => ({ orderBy: mockOrderBy }));
    mockItemsFrom.mockReset();
    let fromCallCount = 0;
    mockFrom.mockReset().mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount % 2 === 1) {
        // First call: orders query chain
        return { where: mockWhere, orderBy: mockOrderBy };
      }
      // Second call: order items query — return promise directly
      return mockItemsFrom();
    });
    mockSelect.mockReset().mockImplementation(() => ({ from: mockFrom }));
  });

  it("returns 200 with orders list (no filters)", async () => {
    const mockOrders = [
      { id: 2, customerName: "B", createdAt: "2024-01-02" },
      { id: 1, customerName: "A", createdAt: "2024-01-01" },
    ];
    mockOrderBy.mockResolvedValueOnce(mockOrders);
    mockItemsFrom.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/orders");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].id).toBe(2);
    expect(json[0].items).toEqual([]);
    expect(mockSelect).toHaveBeenCalled();
  });

  it("passes date filters when startDate and endDate provided", async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const req = new NextRequest(
      "http://localhost/api/orders?startDate=2024-01-01&endDate=2024-01-31"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockWhere).toHaveBeenCalled();
  });

  it("handles only startDate filter", async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/orders?startDate=2024-01-01");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockWhere).toHaveBeenCalled();
  });

  it("handles only endDate filter", async () => {
    mockOrderBy.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/orders?endDate=2024-01-31");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockWhere).toHaveBeenCalled();
  });

  it("returns 500 on DB error", async () => {
    mockOrderBy.mockRejectedValueOnce(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/orders");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
