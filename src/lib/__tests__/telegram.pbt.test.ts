import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatOrderMessage, TelegramOrder } from "@/lib/telegram";

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
