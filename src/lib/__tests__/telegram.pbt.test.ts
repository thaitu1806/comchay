import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatOrderMessage, TelegramOrder, OrderItem } from "@/lib/telegram";
import type { Region } from "@/lib/shipping";

/**
 * **Validates: Requirements 7.2**
 *
 * Property 10: Tin nhắn Telegram chứa đầy đủ thông tin đơn hàng
 * For any valid order, the formatted Telegram message must contain:
 * customer name, phone, address, all product names, subtotal, shipping fee, total.
 */
describe("TelegramNotifier — Property 10: Message contains all order details", () => {
  const orderItemArb = fc.record({
    productName: fc.string({ minLength: 1 }),
    quantity: fc.integer({ min: 1, max: 100 }),
    lineTotal: fc.integer({ min: 1000, max: 1000000 }),
  });

  const telegramOrderArb: fc.Arbitrary<TelegramOrder> = fc.record({
    customerName: fc.string({ minLength: 1 }),
    phone: fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 }).map((digits) => "0" + digits.join("")),
    address: fc.string({ minLength: 1 }),
    items: fc.array(orderItemArb, { minLength: 1 }),
    subtotal: fc.integer({ min: 0, max: 10000000 }),
    shippingFee: fc.integer({ min: 0, max: 10000000 }),
    total: fc.integer({ min: 0, max: 10000000 }),
  });

  it("should contain customer name, phone, address, all product names, subtotal, shipping fee, and total", () => {
    fc.assert(
      fc.property(telegramOrderArb, (order) => {
        const message = formatOrderMessage(order);

        expect(message).toContain(order.customerName);
        expect(message).toContain(order.phone);
        expect(message).toContain(order.address);

        for (const item of order.items) {
          expect(message).toContain(item.productName);
        }

        expect(message).toContain(order.subtotal.toLocaleString("vi-VN"));
        expect(message).toContain(order.shippingFee.toLocaleString("vi-VN"));
        expect(message).toContain(order.total.toLocaleString("vi-VN"));
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 11.2**
 *
 * Property 9: Tin nhắn Telegram V2 chứa đầy đủ thông tin
 * For any đơn hàng hợp lệ với khu vực và danh sách sản phẩm có thông tin biến thể,
 * tin nhắn Telegram được format phải chứa: tên khách hàng, số điện thoại, địa chỉ,
 * khu vực giao hàng, và cho mỗi sản phẩm: tên sản phẩm, mô tả biến thể (nếu có),
 * số lượng, thành tiền, cùng tổng tiền hàng, phí vận chuyển và tổng thanh toán.
 */
describe("TelegramNotifier — Property 9: Tin nhắn Telegram V2 chứa đầy đủ thông tin", () => {
  const regionArb: fc.Arbitrary<Region> = fc.constantFrom("HCM", "TINH_KHAC");

  const phoneArb = fc
    .array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
    .map((digits) => "0" + digits.join(""));

  // Arbitrary for variant labels — realistic descriptions like "Gạo Lứt - Cay vừa - 250g"
  const variantLabelArb = fc.constantFrom(
    "Gạo Thường - Cay nhiều - 250g",
    "Gạo Lứt - Cay vừa - 500g",
    "Gạo Thường - Không cay - 250g",
    "Gạo Lứt - Cay nhiều - 1000g"
  );

  // Order item WITH variant label
  const orderItemWithVariantArb: fc.Arbitrary<OrderItem> = fc.record({
    productName: fc.string({ minLength: 1 }),
    variantLabel: variantLabelArb,
    quantity: fc.integer({ min: 1, max: 100 }),
    lineTotal: fc.integer({ min: 1000, max: 10000000 }),
  });

  // Order item WITHOUT variant label (backward compatible)
  const orderItemWithoutVariantArb: fc.Arbitrary<OrderItem> = fc.record({
    productName: fc.string({ minLength: 1 }),
    quantity: fc.integer({ min: 1, max: 100 }),
    lineTotal: fc.integer({ min: 1000, max: 10000000 }),
  });

  // Mix of items with and without variant labels
  const orderItemArb: fc.Arbitrary<OrderItem> = fc.oneof(
    orderItemWithVariantArb,
    orderItemWithoutVariantArb
  );

  // Full V2 order arbitrary — always includes region
  const telegramOrderV2Arb: fc.Arbitrary<TelegramOrder> = fc.record({
    customerName: fc.string({ minLength: 1 }),
    phone: phoneArb,
    address: fc.string({ minLength: 1 }),
    region: regionArb,
    items: fc.array(orderItemArb, { minLength: 1, maxLength: 5 }),
    subtotal: fc.integer({ min: 0, max: 10000000 }),
    shippingFee: fc.integer({ min: 0, max: 10000000 }),
    total: fc.integer({ min: 0, max: 10000000 }),
  });

  it("should contain customer name, phone, address, region, product details (name, variant label if present, quantity, line total), subtotal, shipping fee, and total", () => {
    fc.assert(
      fc.property(telegramOrderV2Arb, (order) => {
        const message = formatOrderMessage(order);

        // Customer info
        expect(message).toContain(order.customerName);
        expect(message).toContain(order.phone);
        expect(message).toContain(order.address);

        // Region — must be present in message
        const regionLabel = order.region === "HCM" ? "HCM" : "Tỉnh khác";
        expect(message).toContain(regionLabel);

        // Per-item details
        for (const item of order.items) {
          // Product name
          expect(message).toContain(item.productName);

          // Variant label (only when present)
          if (item.variantLabel) {
            expect(message).toContain(item.variantLabel);
          }

          // Quantity
          expect(message).toContain(`x${item.quantity}`);

          // Line total
          expect(message).toContain(item.lineTotal.toLocaleString("vi-VN"));
        }

        // Totals
        expect(message).toContain(order.subtotal.toLocaleString("vi-VN"));
        expect(message).toContain(order.shippingFee.toLocaleString("vi-VN"));
        expect(message).toContain(order.total.toLocaleString("vi-VN"));
      }),
      { numRuns: 100 }
    );
  });
});
