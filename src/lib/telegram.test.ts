import { describe, it, expect } from "vitest";
import { formatOrderMessage, TelegramOrder } from "./telegram";

describe("formatOrderMessage", () => {
  it("includes all required order details", () => {
    const order: TelegramOrder = {
      customerName: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      items: [
        { productName: "Cơm cháy truyền thống", quantity: 2, lineTotal: 100000 },
        { productName: "Cơm cháy chà bông", quantity: 1, lineTotal: 60000 },
      ],
      subtotal: 160000,
      shippingFee: 20000,
      total: 180000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("Nguyễn Văn A");
    expect(message).toContain("0901234567");
    expect(message).toContain("123 Đường ABC, Quận 1, TP.HCM");
    expect(message).toContain("Cơm cháy truyền thống");
    expect(message).toContain("x2");
    expect(message).toContain("Cơm cháy chà bông");
    expect(message).toContain("x1");
    expect(message).toContain("160.000đ");
    expect(message).toContain("20.000đ");
    expect(message).toContain("180.000đ");
  });

  it("includes facebook link when provided", () => {
    const order: TelegramOrder = {
      customerName: "Trần B",
      phone: "0912345678",
      address: "456 Đường XYZ",
      facebookLink: "https://facebook.com/tranb",
      items: [{ productName: "Cơm cháy", quantity: 1, lineTotal: 50000 }],
      subtotal: 50000,
      shippingFee: 30000,
      total: 80000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("https://facebook.com/tranb");
    expect(message).toContain("Facebook");
  });

  it("omits facebook link when not provided", () => {
    const order: TelegramOrder = {
      customerName: "Lê C",
      phone: "0923456789",
      address: "789 Đường DEF",
      items: [{ productName: "Cơm cháy", quantity: 1, lineTotal: 50000 }],
      subtotal: 50000,
      shippingFee: 30000,
      total: 80000,
    };

    const message = formatOrderMessage(order);

    expect(message).not.toContain("Facebook");
  });

  it("includes region HCM when provided", () => {
    const order: TelegramOrder = {
      customerName: "Nguyễn D",
      phone: "0934567890",
      address: "100 Đường GHI",
      region: "HCM",
      items: [{ productName: "Cơm cháy", quantity: 1, lineTotal: 50000 }],
      subtotal: 50000,
      shippingFee: 0,
      total: 50000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("Khu vực");
    expect(message).toContain("HCM");
  });

  it("includes region TINH_KHAC with label 'Tỉnh khác' when provided", () => {
    const order: TelegramOrder = {
      customerName: "Phạm E",
      phone: "0945678901",
      address: "200 Đường JKL",
      region: "TINH_KHAC",
      items: [{ productName: "Cơm cháy", quantity: 1, lineTotal: 50000 }],
      subtotal: 50000,
      shippingFee: 30000,
      total: 80000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("Khu vực");
    expect(message).toContain("Tỉnh khác");
  });

  it("omits region line when region is not provided", () => {
    const order: TelegramOrder = {
      customerName: "Lê F",
      phone: "0956789012",
      address: "300 Đường MNO",
      items: [{ productName: "Cơm cháy", quantity: 1, lineTotal: 50000 }],
      subtotal: 50000,
      shippingFee: 30000,
      total: 80000,
    };

    const message = formatOrderMessage(order);

    expect(message).not.toContain("Khu vực");
  });

  it("includes variant label when provided", () => {
    const order: TelegramOrder = {
      customerName: "Trần G",
      phone: "0967890123",
      address: "400 Đường PQR",
      region: "HCM",
      items: [
        {
          productName: "Cơm cháy chà bông",
          variantLabel: "Gạo Lứt - Cay vừa - 250g",
          quantity: 2,
          lineTotal: 138000,
        },
      ],
      subtotal: 138000,
      shippingFee: 30000,
      total: 168000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("Gạo Lứt - Cay vừa - 250g");
  });

  it("omits variant label line when variantLabel is undefined", () => {
    const order: TelegramOrder = {
      customerName: "Hoàng H",
      phone: "0978901234",
      address: "500 Đường STU",
      region: "HCM",
      items: [
        {
          productName: "Cơm cháy truyền thống",
          quantity: 1,
          lineTotal: 69000,
        },
      ],
      subtotal: 69000,
      shippingFee: 30000,
      total: 99000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("Cơm cháy truyền thống");
    expect(message).not.toContain("📋");
  });

  it("handles mixed items with and without variant labels", () => {
    const order: TelegramOrder = {
      customerName: "Vũ I",
      phone: "0989012345",
      address: "600 Đường VWX",
      region: "TINH_KHAC",
      items: [
        {
          productName: "Cơm cháy chà bông",
          variantLabel: "Gạo Thường - Cay nhiều - 500g",
          quantity: 1,
          lineTotal: 138000,
        },
        {
          productName: "Tép hành phi",
          quantity: 2,
          lineTotal: 100000,
        },
      ],
      subtotal: 238000,
      shippingFee: 20000,
      total: 258000,
    };

    const message = formatOrderMessage(order);

    expect(message).toContain("Cơm cháy chà bông");
    expect(message).toContain("Gạo Thường - Cay nhiều - 500g");
    expect(message).toContain("Tép hành phi");
    expect(message).toContain("Tỉnh khác");
    // Only one variant label line (📋) for the first item
    const variantLines = message.split("\n").filter((l) => l.includes("📋"));
    expect(variantLines).toHaveLength(1);
  });
});
