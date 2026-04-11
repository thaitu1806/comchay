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
});
